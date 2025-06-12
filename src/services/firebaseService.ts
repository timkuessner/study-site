import { User } from 'firebase/auth';
import { onValue, ref, set, update, get, DataSnapshot, Unsubscribe, push } from 'firebase/database';
import { db } from '@/lib/firebase';
import { getFirstName } from '@/utils/userHelpers';

export interface UserData {
  uid?: string;
  name: string;
  isStudying: boolean;
  lastUpdated: number;
}

export interface StudySession {
  uid: string;
  userName: string;
  startTime: number;
  endTime?: number;
  duration: number; // in minutes
}

export interface UserRanking {
  uid: string;
  name: string;
  totalMinutes: number;
  sessionsCount: number;
  lastStudySession?: number;
}

export class FirebaseService {
  static async initializeUserData(user: User): Promise<void> {
    const userRef = ref(db, `users/${user.uid}`);
    const firstName = getFirstName(user);

    console.log('Initializing user data for:', firstName);

    const userData: UserData = {
      name: firstName,
      isStudying: false,
      lastUpdated: Date.now()
    };

    await set(userRef, userData);
    console.log('User data initialized successfully');
  }

  static async getCurrentUserData(user: User): Promise<UserData | null> {
    const userRef = ref(db, `users/${user.uid}`);

    try {
      const snapshot = await get(userRef);
      const data = snapshot.val() as UserData | null;
      console.log('Current user data fetched:', data);
      return data;
    } catch (error) {
      console.error('Error getting current user data:', error);
      throw error;
    }
  }

  static async updateStudyingState(user: User, isStudying: boolean): Promise<void> {
    const firstName = getFirstName(user);

    if (isStudying) {
      const sessionRef = push(ref(db, 'studySessions'));
      const session: StudySession = {
        uid: user.uid,
        userName: firstName,
        startTime: Date.now(),
        duration: 0
      };

      await Promise.all([
        set(sessionRef, session),
        update(ref(db), {
          [`users/${user.uid}/isStudying`]: true,
          [`users/${user.uid}/lastUpdated`]: Date.now(),
          [`users/${user.uid}/currentSessionId`]: sessionRef.key,
          [`activeUsers/${user.uid}`]: true
        })
      ]);
    } else {
      const userRef = ref(db, `users/${user.uid}`);
      const userData = await get(userRef);
      const currentSessionId = userData.val()?.currentSessionId;

      if (currentSessionId) {
        const sessionRef = ref(db, `studySessions/${currentSessionId}`);
        const sessionData = await get(sessionRef);
        const session = sessionData.val() as StudySession;

        if (session) {
          const endTime = Date.now();
          const durationMs = endTime - session.startTime;
          const duration = Math.round(durationMs / (1000 * 60)); // Convert to minutes

          if (duration === 0) {
            await update(ref(db), {
              [`studySessions/${currentSessionId}`]: null
            });
          } else {
            await update(sessionRef, {
              endTime,
              duration
            });
          }
        }
      }

      await update(ref(db), {
        [`users/${user.uid}/isStudying`]: false,
        [`users/${user.uid}/lastUpdated`]: Date.now(),
        [`users/${user.uid}/currentSessionId`]: null,
        [`activeUsers/${user.uid}`]: null
      });
    }
  }

  static subscribeToUserData(
    user: User,
    onData: (data: UserData | null) => void,
    onError: (error: Error) => void
  ): Unsubscribe {
    const userRef = ref(db, `users/${user.uid}`);

    console.log('Setting up Firebase listener for user:', user.uid);

    return onValue(
      userRef,
      (snapshot: DataSnapshot) => {
        console.log('Firebase data received:', snapshot.val());
        const data = snapshot.val() as UserData | null;
        onData(data);
      },
      (error) => {
        console.error('Error listening to user data:', error);
        onError(error);
      }
    );
  }

  static subscribeToActiveUsers(
    onData: (users: (UserData & { uid: string })[]) => void,
    onError: (error: Error) => void
  ): Unsubscribe {
    const activeUsersRef = ref(db, 'activeUsers');

    return onValue(
      activeUsersRef,
      async (snapshot: DataSnapshot) => {
        const activeUserIds = snapshot.val();

        if (!activeUserIds) {
          onData([]);
          return;
        }

        const userDataPromises = Object.keys(activeUserIds).map(async (uid) => {
          const userRef = ref(db, `users/${uid}`);
          return new Promise<(UserData & { uid: string }) | null>((resolve) => {
            onValue(userRef, (userSnapshot) => {
              const userData = userSnapshot.val() as UserData | null;
              if (userData && userData.isStudying) {
                resolve({ ...userData, uid });
              } else {
                resolve(null);
              }
            }, { onlyOnce: true });
          });
        });

        try {
          const userData = await Promise.all(userDataPromises);
          const validUsers = userData.filter((user): user is (UserData & { uid: string }) =>
            user !== null
          );
          onData(validUsers);
        } catch (error) {
          console.error('Error fetching active users:', error);
          onError(error as Error);
        }
      },
      (error) => {
        console.error('Error listening to active users:', error);
        onError(error);
      }
    );
  }

  static async getUserRankings(timeFilter: 'week' | 'month' | 'allTime'): Promise<UserRanking[]> {
    try {
      const sessionsRef = ref(db, 'studySessions');
      const snapshot = await get(sessionsRef);
      const sessions = snapshot.val() as { [key: string]: StudySession } | null;

      if (!sessions) {
        return [];
      }

      const now = Date.now();
      let startTime = 0;

      if (timeFilter === 'week') {
        startTime = now - (7 * 24 * 60 * 60 * 1000);
      } else if (timeFilter === 'month') {
        startTime = now - (30 * 24 * 60 * 60 * 1000);
      }

      const userStats = new Map<string, UserRanking>();

      Object.values(sessions).forEach(session => {
        if (startTime > 0 && session.startTime < startTime) {
          return;
        }

        if (!session.duration || session.duration <= 0) {
          return;
        }

        const uid = session.uid;

        if (!userStats.has(uid)) {
          userStats.set(uid, {
            uid,
            name: session.userName,
            totalMinutes: 0,
            sessionsCount: 0,
            lastStudySession: session.startTime
          });
        }

        const stats = userStats.get(uid)!;
        stats.totalMinutes += session.duration;
        stats.sessionsCount += 1;

        if (session.startTime > (stats.lastStudySession || 0)) {
          stats.lastStudySession = session.startTime;
        }
      });

      return Array.from(userStats.values())
        .sort((a, b) => b.totalMinutes - a.totalMinutes)
        .slice(0, 50);
    } catch (error) {
      console.error('Error fetching user rankings:', error);
      throw error;
    }
  }

  static getUserRef(user: User) {
    return ref(db, `users/${user.uid}`);
  }

  static async cleanupOldSessions(daysOld: number = 90): Promise<void> {
    const cutoffTime = Date.now() - (daysOld * 24 * 60 * 60 * 1000);
    const sessionsRef = ref(db, 'studySessions');
    const snapshot = await get(sessionsRef);
    const sessions = snapshot.val() as { [key: string]: StudySession } | null;

    if (!sessions) return;

    const updates: { [key: string]: null } = {};

    Object.entries(sessions).forEach(([sessionId, session]) => {
      if (session.startTime < cutoffTime) {
        updates[`studySessions/${sessionId}`] = null;
      }
    });

    if (Object.keys(updates).length > 0) {
      await update(ref(db), updates);
      console.log(`Cleaned up ${Object.keys(updates).length} old sessions`);
    }
  }
}

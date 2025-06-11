import { User } from 'firebase/auth';
import { onValue, ref, set, update, DataSnapshot, Unsubscribe } from 'firebase/database';
import { db } from '@/lib/firebase';
import { getFirstName } from '@/utils/userHelpers';

export interface UserData {
  uid?: string;
  name: string;
  isStudying: boolean;
  lastUpdated: number;
}

export class FirebaseService {
  /**
   * Initialize user data in Firebase when they first sign in
   */
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

  /**
   * Update studying state in Firebase
   */
  static async updateStudyingState(user: User, isStudying: boolean): Promise<void> {
    await update(ref(db), {
      [`users/${user.uid}/isStudying`]: isStudying,
      [`users/${user.uid}/lastUpdated`]: Date.now(),
      [`activeUsers/${user.uid}`]: isStudying ? true : null
    });
  }

  /**
   * Listen to Firebase data changes for a user
   */
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
  
        // Get user data for all active users
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

  /**
   * Get user reference for a specific user
   */
  static getUserRef(user: User) {
    return ref(db, `users/${user.uid}`);
  }
}
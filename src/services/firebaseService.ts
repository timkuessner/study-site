import { User } from 'firebase/auth';
import { ref, set, update, get, onValue, DataSnapshot, Unsubscribe, runTransaction, remove } from 'firebase/database';
import { db } from '@/lib/firebase';
import { getFirstName } from '@/utils/userHelpers';

export interface UserData {
  uid: string;
  tag: string;
  name?: string;
  isStudying: boolean;
  lastUpdated: number;
}

export interface UserStats {
  totalMinutes: number;
  lastStudySession: number;
  sessionsCount: number;
  isStudying: boolean;
  daysActive?: number;
  tag?: string; // Tag is now stored in stats
  name?: string; // Display name stored in stats
}

export interface UserRanking {
  uid: string;
  tag: string;
  name?: string;
  totalMinutes: number;
  lastStudySession: number;
  daysActive: number;
  sessionsCount?: number;
}

export class FirebaseService {
  // Generate a valid tag according to Firebase rules
  static generateValidTag(baseName: string): string {
    // Convert to lowercase and replace invalid characters
    let tag = baseName.toLowerCase().replace(/[^a-z.]/g, '');
    
    // Ensure it doesn't start or end with dots
    tag = tag.replace(/^\.+|\.+$/g, '');
    
    // Replace multiple consecutive dots with single dot
    tag = tag.replace(/\.{2,}/g, '.');
    
    // Ensure minimum length
    if (tag.length < 2) {
      tag = tag.padEnd(2, 'a');
    }
    
    // Ensure maximum length
    if (tag.length > 30) {
      tag = tag.substring(0, 30);
    }
    
    // Final cleanup in case truncation created trailing dots
    tag = tag.replace(/\.+$/, '');
    
    return tag || 'user'; // Fallback if all characters were invalid
  }

  // Check if user is verified
  static async isUserVerified(user: User): Promise<boolean> {
    try {
      const verifiedRef = ref(db, `verifiedUsers/${user.uid}`);
      const snapshot = await get(verifiedRef);
      return snapshot.val() === true;
    } catch (error) {
      console.error('Error checking user verification:', error);
      return false;
    }
  }

  // Find an available tag for the user
  static async findAvailableTag(user: User, baseName: string): Promise<string> {
    const baseTag = this.generateValidTag(baseName);
    
    // Check if base tag is available
    const baseTagRef = ref(db, `tags/${baseTag}`);
    const baseSnapshot = await get(baseTagRef);
    
    if (!baseSnapshot.exists()) {
      return baseTag;
    }
    
    // If base tag is taken by current user, return it
    if (baseSnapshot.val() === user.uid) {
      return baseTag;
    }
    
    // Generate numbered alternatives
    for (let i = 1; i <= 99; i++) {
      const numberedTag = `${baseTag}.${i}`;
      
      // Ensure it doesn't exceed length limit
      if (numberedTag.length > 30) {
        // Truncate base tag to make room for number
        const maxBaseLength = 30 - `.${i}`.length;
        const truncatedBase = baseTag.substring(0, maxBaseLength);
        const finalTag = `${truncatedBase}.${i}`;
        
        const tagRef = ref(db, `tags/${finalTag}`);
        const snapshot = await get(tagRef);
        
        if (!snapshot.exists() || snapshot.val() === user.uid) {
          return finalTag;
        }
      } else {
        const tagRef = ref(db, `tags/${numberedTag}`);
        const snapshot = await get(tagRef);
        
        if (!snapshot.exists() || snapshot.val() === user.uid) {
          return numberedTag;
        }
      }
    }
    
    // Fallback to user ID based tag
    const fallbackTag = this.generateValidTag(`user.${user.uid.slice(0, 8)}`);
    return fallbackTag;
  }

  // Initialize user data on first login
  static async initializeUserData(user: User): Promise<void> {
    const firstName = getFirstName(user);
    const displayName = user.displayName || firstName;
    
    console.log('Initializing user data for:', user.uid, 'with base name:', firstName);
    
    try {
      const isVerified = await this.isUserVerified(user);
      
      // Store email in users collection (only writable by user)
      const userEmailRef = ref(db, `users/${user.uid}/email`);
      
      console.log('Writing to Firebase...');
      
      if (isVerified) {
        // Verified users can write to stats and claim tags
        
        // First, find an available tag
        const availableTag = await this.findAvailableTag(user, firstName);
        console.log('Found available tag:', availableTag);
        
        // Create tag mapping first
        const tagRef = ref(db, `tags/${availableTag}`);
        await set(tagRef, user.uid);
        
        // Then create user stats with the valid tag
        const userStatsRef = ref(db, `userData/${user.uid}/stats`);
        await set(userStatsRef, {
          tag: availableTag,
          name: displayName,
          totalMinutes: 0,
          lastStudySession: Date.now(),
          sessionsCount: 0,
          isStudying: false
        });
        
        // Finally set email
        await set(userEmailRef, user.email);
        
        console.log(`Successfully initialized verified user with tag: ${availableTag}`);
      } else {
        // Unverified users can only set email - no tag claiming allowed by rules
        await set(userEmailRef, user.email);
        console.log('Successfully initialized unverified user (email only)');
      }
      
    } catch (error) {
      console.error('Error initializing user data:', error);
      throw error;
    }
  }

  // Assign tag to newly verified user
  static async assignTagToVerifiedUser(user: User): Promise<{ success: boolean; tag?: string; error?: string }> {
    const isVerified = await this.isUserVerified(user);
    
    if (!isVerified) {
      return { success: false, error: 'User is not verified' };
    }

    try {
      const firstName = getFirstName(user);
      const displayName = user.displayName || firstName;
      
      // Check if user already has stats/tag
      const userStatsRef = ref(db, `userData/${user.uid}/stats`);
      const statsSnapshot = await get(userStatsRef);
      
      if (statsSnapshot.exists() && statsSnapshot.val()?.tag) {
        return { success: true, tag: statsSnapshot.val().tag };
      }

      // Find available tag
      const availableTag = await this.findAvailableTag(user, firstName);
      
      // Create tag mapping first
      const tagRef = ref(db, `tags/${availableTag}`);
      await set(tagRef, user.uid);
      
      // Initialize stats with tag
      await set(userStatsRef, {
        tag: availableTag,
        name: displayName,
        totalMinutes: 0,
        lastStudySession: Date.now(),
        sessionsCount: 0,
        isStudying: false
      });
      
      return { success: true, tag: availableTag };
    } catch (error) {
      console.error('Error assigning tag to verified user:', error);
      return { success: false, error: 'Failed to assign tag' };
    }
  }

  // Update user tag (with uniqueness check) - only for verified users
  static async updateUserTag(user: User, newTag: string): Promise<{ success: boolean; error?: string }> {
    const isVerified = await this.isUserVerified(user);
    
    if (!isVerified) {
      return { success: false, error: 'User must be verified to change tag' };
    }

    // Validate tag format
    const validTag = this.generateValidTag(newTag);
    if (validTag !== newTag.toLowerCase()) {
      return { success: false, error: 'Tag contains invalid characters. Use only lowercase letters and dots.' };
    }

    try {
      // Check if tag is already taken
      const tagsMappingRef = ref(db, `tags/${newTag}`);
      const existingTagSnapshot = await get(tagsMappingRef);
      const existingOwner = existingTagSnapshot.val();
      
      if (existingOwner && existingOwner !== user.uid) {
        return { success: false, error: 'Tag is already taken' };
      }

      // Get current tag to clean up old mapping
      const currentStatsRef = ref(db, `userData/${user.uid}/stats`);
      const currentStatsSnapshot = await get(currentStatsRef);
      const currentStats = currentStatsSnapshot.val();
      const currentTag = currentStats?.tag;

      // Create new tag mapping first
      await set(ref(db, `tags/${newTag}`), user.uid);
      
      // Update user's tag in stats
      await update(ref(db, `userData/${user.uid}/stats`), { tag: newTag });
      
      // Remove old tag mapping if it exists and is different
      if (currentTag && currentTag !== newTag) {
        await remove(ref(db, `tags/${currentTag}`));
      }

      return { success: true };
    } catch (error) {
      console.error('Error updating user tag:', error);
      return { success: false, error: 'Failed to update tag' };
    }
  }

  // Update user name - only for verified users
  static async updateUserName(user: User, newName: string): Promise<{ success: boolean; error?: string }> {
    const isVerified = await this.isUserVerified(user);
    
    if (!isVerified) {
      return { success: false, error: 'User must be verified to change name' };
    }

    try {
      const userStatsRef = ref(db, `userData/${user.uid}/stats/name`);
      await set(userStatsRef, newName);
      
      return { success: true };
    } catch (error) {
      console.error('Error updating user name:', error);
      return { success: false, error: 'Failed to update name' };
    }
  }

  // Get user data (combining stats and user info)
  static async getCurrentUserData(user: User): Promise<UserData | null> {
    try {
      const userStatsRef = ref(db, `userData/${user.uid}/stats`);
      const activeUsersRef = ref(db, `activeUsers/${user.uid}`);
      
      const [statsSnapshot, activeSnapshot] = await Promise.all([
        get(userStatsRef),
        get(activeUsersRef)
      ]);
      
      const stats = statsSnapshot.val();
      const isActive = activeSnapshot.val() === true;
      
      return {
        uid: user.uid,
        tag: stats?.tag || this.generateValidTag(getFirstName(user)),
        name: stats?.name || user.displayName || getFirstName(user),
        isStudying: isActive,
        lastUpdated: stats?.lastStudySession || Date.now()
      };
    } catch (error) {
      console.error('Error getting current user data:', error);
      return null;
    }
  }

  // Update studying state: start or stop - only for verified users
  static async updateStudyingState(user: User, isStudying: boolean): Promise<void> {
    const isVerified = await this.isUserVerified(user);
    
    if (!isVerified) {
      throw new Error('User must be verified to update studying state');
    }
    
    const activeUsersRef = ref(db, `activeUsers/${user.uid}`);
    
    if (isStudying) {
      // Start studying: add to activeUsers and update stats
      await set(activeUsersRef, true);
      
      const userStatsRef = ref(db, `userData/${user.uid}/stats`);
      await runTransaction(userStatsRef, (currentStats) => {
        if (currentStats === null) {
          const validTag = this.generateValidTag(getFirstName(user));
          return {
            tag: validTag,
            name: user.displayName || getFirstName(user),
            totalMinutes: 0,
            lastStudySession: Date.now(),
            sessionsCount: 0,
            isStudying: true,
            studyStartTime: Date.now() // Track session start
          };
        } else {
          return {
            ...currentStats,
            isStudying: true,
            studyStartTime: Date.now() // Track session start
          };
        }
      });
    } else {
      // Stop studying: remove from activeUsers and calculate session
      await remove(activeUsersRef);
      
      const userStatsRef = ref(db, `userData/${user.uid}/stats`);
      const todayDate = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
      const statsByDateRef = ref(db, `userData/${user.uid}/statsByDate/${todayDate}`);
      
      // Get current stats to calculate session duration
      const statsSnapshot = await get(userStatsRef);
      const currentStats = statsSnapshot.val();
      
      if (currentStats && currentStats.studyStartTime) {
        const endTime = Date.now();
        const durationMs = endTime - currentStats.studyStartTime;
        const durationMins = Math.max(0, Math.round(durationMs / (1000 * 60)));
        
        if (durationMins > 0) {
          // Update daily stats
          await runTransaction(statsByDateRef, (currentMinutes) => {
            return (currentMinutes || 0) + durationMins;
          });
          
          // Update total stats
          await runTransaction(userStatsRef, (stats) => {
            if (stats === null) {
              const validTag = this.generateValidTag(getFirstName(user));
              return {
                tag: validTag,
                name: user.displayName || getFirstName(user),
                totalMinutes: durationMins,
                lastStudySession: endTime,
                sessionsCount: 1,
                isStudying: false
              };
            } else {
              return {
                ...stats,
                totalMinutes: (stats.totalMinutes || 0) + durationMins,
                lastStudySession: endTime,
                sessionsCount: (stats.sessionsCount || 0) + 1,
                isStudying: false,
                studyStartTime: null // Clear start time
              };
            }
          });
        } else {
          // Just update studying state without adding session
          await update(userStatsRef, {
            isStudying: false,
            studyStartTime: null
          });
        }
      }
    }
  }

  // Listen to user data changes
  static subscribeToUserData(
    user: User,
    onData: (data: UserData | null) => void,
    onError: (error: Error) => void
  ): Unsubscribe {
    const userStatsRef = ref(db, `userData/${user.uid}/stats`);
    const activeUsersRef = ref(db, `activeUsers/${user.uid}`);
    
    let statsValue: UserStats | null = null; // Fixed type annotation
    let isStudying = false;
    let updateCount = 0;
    
    const updateUserData = () => {
      updateCount++;
      if (updateCount >= 2) { // Wait for both values
        const userData: UserData = {
          uid: user.uid,
          tag: statsValue?.tag || this.generateValidTag(getFirstName(user)),
          name: statsValue?.name || user.displayName || getFirstName(user),
          isStudying: isStudying,
          lastUpdated: statsValue?.lastStudySession || Date.now()
        };
        onData(userData);
      }
    };

    const statsUnsubscribe = onValue(
      userStatsRef,
      (snapshot: DataSnapshot) => {
        statsValue = snapshot.val();
        updateUserData();
      },
      (error) => onError(error)
    );

    const activeUnsubscribe = onValue(
      activeUsersRef,
      (snapshot: DataSnapshot) => {
        isStudying = snapshot.val() === true;
        updateUserData();
      },
      (error) => onError(error)
    );

    // Return combined unsubscribe function
    return () => {
      statsUnsubscribe();
      activeUnsubscribe();
    };
  }

  // Listen to active users (studying users)
  static subscribeToActiveUsers(
    onData: (users: UserData[]) => void,
    onError: (error: Error) => void
  ): Unsubscribe {
    const activeUsersRef = ref(db, 'activeUsers');

    return onValue(
      activeUsersRef,
      async (snapshot: DataSnapshot) => {
        const activeUsersData = snapshot.val();
        if (!activeUsersData) {
          onData([]);
          return;
        }

        try {
          // Remove unused activeUsers declaration
          // Before: const activeUsers: UserData[] = [];
          const activeUids = Object.keys(activeUsersData);

          // Get user stats (including tags) for all active users
          const userDataPromises = activeUids.map(async (uid) => {
            try {
              const userStatsRef = ref(db, `userData/${uid}/stats`);
              const statsSnapshot = await get(userStatsRef);
              const stats = statsSnapshot.val();

              return {
                uid,
                tag: stats?.tag || `user.${uid.slice(0, 8)}`,
                name: stats?.name || `User-${uid.slice(0, 8)}`,
                isStudying: true,
                lastUpdated: stats?.lastStudySession || Date.now()
              };
            } catch (error) {
              console.error(`Error getting stats for user ${uid}:`, error);
              return null;
            }
          });

          const userData = await Promise.all(userDataPromises);
          const validUsers = userData.filter((user): user is NonNullable<typeof user> => user !== null);
          
          onData(validUsers);
        } catch (error) {
          onError(error as Error);
        }
      },
      (error) => {
        onError(error);
      }
    );
  }

  // Fetch user rankings by time period
  static async getUserRankings(timeFilter: 'week' | 'month' | 'allTime' = 'week'): Promise<UserRanking[]> {
    try {
      const userDataRef = ref(db, 'userData');
      const snapshot = await get(userDataRef);
      const allUserData = snapshot.val();
      
      if (!allUserData) return [];

      const rankings: UserRanking[] = [];
      
      for (const [uid, userData] of Object.entries(allUserData) as [string, UserData][]) {
        let totalMinutes = 0;
        let lastStudySession = 0;
        let daysActive = 0;
        let sessionsCount = 0;
        let tag = '';
        let name = '';

        if (timeFilter === 'allTime') {
          // Use total stats
          if ('stats' in userData && userData.stats) {
            totalMinutes = (userData.stats as UserStats)?.totalMinutes || 0;
            lastStudySession = (userData.stats as UserStats)?.lastStudySession || 0;
            sessionsCount = (userData.stats as UserStats)?.sessionsCount || 0;
            tag = (userData.stats as UserStats)?.tag || `user.${uid.slice(0, 8)}`;
            name = (userData.stats as UserStats)?.name || `User-${uid.slice(0, 8)}`;
          }
          
          // Count active days from statsByDate
          if ('statsByDate' in userData && userData.statsByDate) {
            daysActive = Object.keys(userData.statsByDate).length;
          }
        } else {
          // Calculate from daily stats
          if ('statsByDate' in userData && userData.statsByDate) {
            const cutoffDate = new Date();
            if (timeFilter === 'week') {
              cutoffDate.setDate(cutoffDate.getDate() - 7);
            } else if (timeFilter === 'month') {
              cutoffDate.setMonth(cutoffDate.getMonth() - 1);
            }

            Object.entries(userData.statsByDate).forEach(([dateStr, dayMinutes]) => {
              const date = new Date(dateStr);
              if (date >= cutoffDate) {
                const minutes = typeof dayMinutes === 'number' ? dayMinutes : 0;
                totalMinutes += minutes;
                daysActive += 1;
                lastStudySession = Math.max(lastStudySession, date.getTime());
              }
            });
            
            // For filtered periods, approximate sessions as days active
            sessionsCount = daysActive;
          }
          
          // Get tag from stats
          if ('stats' in userData && userData.stats) {
            tag = (userData.stats as UserStats)?.tag || `user.${uid.slice(0, 8)}`;
            name = (userData.stats as UserStats)?.name || `User-${uid.slice(0, 8)}`;
          }
        }

        if (totalMinutes > 0) {
          rankings.push({
            uid,
            tag,
            name,
            totalMinutes,
            lastStudySession,
            daysActive,
            sessionsCount
          });
        }
      }

      return rankings
        .sort((a, b) => b.totalMinutes - a.totalMinutes)
        .slice(0, 50);
    } catch (error) {
      console.error('Error fetching user rankings:', error);
      return [];
    }
  }
}
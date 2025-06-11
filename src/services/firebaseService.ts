import { User } from 'firebase/auth';
import { onValue, ref, set, update, DataSnapshot, Unsubscribe } from 'firebase/database';
import { db } from '@/lib/firebase';
import { getFirstName } from '@/utils/userHelpers';

export interface UserData {
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
    const userRef = ref(db, `users/${user.uid}`);
    
    await update(userRef, {
      isStudying,
      lastUpdated: Date.now()
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

  /**
   * Get user reference for a specific user
   */
  static getUserRef(user: User) {
    return ref(db, `users/${user.uid}`);
  }
}
import { useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { FirebaseService, UserData } from '@/services/firebaseService';

export function useStudyState(user: User | null) {
  const [isStudying, setIsStudying] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);

  // Initialize user data in Firebase when they first sign in
  const initializeUserData = async () => {
    if (!user) return;
    
    try {
      await FirebaseService.initializeUserData(user);
      setIsStudying(false);
      setDataLoading(false);
    } catch (error) {
      console.error('Error initializing user data:', error);
      alert('Error initializing user data: ' + (error instanceof Error ? error.message : 'Unknown error'));
      setDataLoading(false);
      setIsStudying(false);
    }
  };

  // Update studying state in Firebase
  const updateStudyingState = async (newStudyingState: boolean) => {
    if (!user) return;
    
    try {
      await FirebaseService.updateStudyingState(user, newStudyingState);
    } catch (error) {
      console.error('Error updating studying state:', error);
      // Revert local state if Firebase update fails
      setIsStudying(!newStudyingState);
    }
  };

  // Handle study button toggle
  const handleStudyToggle = () => {
    const newStudyingState = !isStudying;
    
    // Optimistically update local state first for immediate UI feedback
    setIsStudying(newStudyingState);
    
    // Then update Firebase
    updateStudyingState(newStudyingState);
  };

  // Listen to Firebase data changes
  useEffect(() => {
    if (!user) return;

    setDataLoading(true);
    
    const unsubscribe = FirebaseService.subscribeToUserData(
      user,
      (data: UserData | null) => {
        if (data) {
          // Sync local state with Firebase data
          setIsStudying(data.isStudying || false);
          console.log('User data loaded, isStudying:', data.isStudying);
        } else {
          // User data doesn't exist, initialize it
          console.log('No user data found, initializing...');
          initializeUserData();
        }
        setDataLoading(false);
      },
      (error: Error) => {
        alert('Firebase Error: ' + error.message);
        // Don't get stuck in loading state
        setDataLoading(false);
        setIsStudying(false);
      }
    );

    // Add timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      console.log('Firebase timeout - setting dataLoading to false');
      setDataLoading(false);
      setIsStudying(false);
    }, 10000); // 10 second timeout

    // Cleanup subscription on unmount
    return () => {
      unsubscribe();
      clearTimeout(timeout);
    };
  }, [user]);

  // Reset state when user signs out
  useEffect(() => {
    if (!user) {
      setIsStudying(false);
      setDataLoading(false);
    }
  }, [user]);

  return {
    isStudying,
    dataLoading,
    handleStudyToggle
  };
}
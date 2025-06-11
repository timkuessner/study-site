import { useEffect, useState, useRef } from 'react';
import { User } from 'firebase/auth';
import { FirebaseService, UserData } from '@/services/firebaseService';

export function useStudyState(user: User | null) {
  const [isStudying, setIsStudying] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
  const hasInitialized = useRef(false);

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

  // Fetch current state from Firebase (for tab reopening)
  const fetchCurrentState = async () => {
    if (!user) return;
    
    try {
      setDataLoading(true);
      const currentData = await FirebaseService.getCurrentUserData(user);
      if (currentData) {
        setIsStudying(currentData.isStudying || false);
        console.log('Current state fetched, isStudying:', currentData.isStudying);
      } else {
        console.log('No user data found, initializing...');
        await initializeUserData();
      }
    } catch (error) {
      console.error('Error fetching current state:', error);
      setIsStudying(false);
    } finally {
      setDataLoading(false);
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

  // Handle tab visibility changes (when tab becomes visible again)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user && hasInitialized.current) {
        console.log('Tab became visible, fetching current state...');
        fetchCurrentState();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user]);

  // Handle page focus (when user returns to tab)
  useEffect(() => {
    const handleFocus = () => {
      if (user && hasInitialized.current) {
        console.log('Window focused, fetching current state...');
        fetchCurrentState();
      }
    };

    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [user]);

  // Listen to Firebase data changes
  useEffect(() => {
    if (!user) {
      hasInitialized.current = false;
      return;
    }

    setDataLoading(true);
    
    // First, fetch current state immediately
    fetchCurrentState().then(() => {
      hasInitialized.current = true;
    });
    
    // Then set up the real-time listener
    const unsubscribe = FirebaseService.subscribeToUserData(
      user,
      (data: UserData | null) => {
        if (data) {
          // Sync local state with Firebase data
          setIsStudying(data.isStudying || false);
          console.log('User data updated via listener, isStudying:', data.isStudying);
        } else if (hasInitialized.current) {
          // Only initialize if we haven't done the initial fetch yet
          console.log('No user data found in listener, initializing...');
          initializeUserData();
        }
        setDataLoading(false);
      },
      (error: Error) => {
        alert('Firebase Error: ' + error.message);
        setDataLoading(false);
        setIsStudying(false);
      }
    );

    // Add timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      console.log('Firebase timeout - setting dataLoading to false');
      setDataLoading(false);
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
      hasInitialized.current = false;
    }
  }, [user]);

  return {
    isStudying,
    dataLoading,
    handleStudyToggle
  };
}
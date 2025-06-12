import { useEffect, useState, useRef, useCallback } from 'react';
import { User } from 'firebase/auth';
import { FirebaseService, UserData } from '@/services/firebaseService';

export function useStudyState(user: User | null) {
  const [isStudying, setIsStudying] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
  const hasInitialized = useRef(false);

  // Initialize user data in Firebase when they first sign in
  const initializeUserData = useCallback(async () => {
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
  }, [user]);

  // Fetch current state from Firebase (for tab reopening)
  const fetchCurrentState = useCallback(async () => {
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
  }, [user, initializeUserData]);

  // Update studying state in Firebase
  const updateStudyingState = useCallback(async (newStudyingState: boolean) => {
    if (!user) return;

    try {
      await FirebaseService.updateStudyingState(user, newStudyingState);
    } catch (error) {
      console.error('Error updating studying state:', error);
      setIsStudying(!newStudyingState); // revert
    }
  }, [user]);

  const handleStudyToggle = () => {
    const newStudyingState = !isStudying;
    setIsStudying(newStudyingState);
    updateStudyingState(newStudyingState);
  };

  // Handle tab visibility changes
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
  }, [user, fetchCurrentState]);

  // Handle page focus
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
  }, [user, fetchCurrentState]);

  // Listen to Firebase data changes
  useEffect(() => {
    if (!user) {
      hasInitialized.current = false;
      return;
    }

    setDataLoading(true);

    fetchCurrentState().then(() => {
      hasInitialized.current = true;
    });

    const unsubscribe = FirebaseService.subscribeToUserData(
      user,
      (data: UserData | null) => {
        if (data) {
          setIsStudying(data.isStudying || false);
          console.log('User data updated via listener, isStudying:', data.isStudying);
        } else if (hasInitialized.current) {
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

    const timeout = setTimeout(() => {
      console.log('Firebase timeout - setting dataLoading to false');
      setDataLoading(false);
    }, 10000);

    return () => {
      unsubscribe();
      clearTimeout(timeout);
    };
  }, [user, fetchCurrentState, initializeUserData]);

  // Reset state on sign-out
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
    handleStudyToggle,
  };
}
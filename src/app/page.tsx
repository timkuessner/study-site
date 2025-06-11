'use client';

import { useAuth } from '@/lib/authContext';
import { useStudyState } from '@/hooks/useStudyState';
import { getFirstName } from '@/utils/userHelpers';
import { LoadingScreen } from '@/components/LoadingScreen';
import { SignInForm } from '@/components/SignInForm';
import { UserProfile } from '@/components/UserProfile';
import { StudyButton } from '@/components/StudyButton';
import { StudyStatus } from '@/components/StudyStatus';
import { BackgroundEffects } from '@/components/BackgroundEffects';
import { ActiveUsers } from '@/components/ActiveUsers';

export default function Home() {
  const { user, loading, signInWithGoogle, signOut } = useAuth();
  const { isStudying, dataLoading, handleStudyToggle } = useStudyState(user);

  if (loading || dataLoading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <SignInForm onSignIn={signInWithGoogle} />;
  }

  const firstName = getFirstName(user);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background gradient effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900 opacity-50"></div>
      
      {/* User profile and sign out */}
      <UserProfile user={user} onSignOut={signOut} />
      
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center space-y-12 w-full max-w-sm">
        {/* Title */}
        <div className="text-center">
          <h1 className="text-4xl font-light tracking-wide mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            {firstName}
          </h1>
          <div className="h-px w-32 bg-gradient-to-r from-transparent via-blue-400 to-transparent mx-auto"></div>
        </div>

        {/* Study Button */}
        <StudyButton 
          isStudying={isStudying}
          onToggle={handleStudyToggle}
          disabled={dataLoading}
        />

        {/* Status */}
        <StudyStatus isStudying={isStudying} />

        {/* Active Users Counter */}
        <ActiveUsers currentUserUid={user.uid} />
      </div>

      {/* Background Effects */}
      <BackgroundEffects isStudying={isStudying} />
    </div>
  );
}
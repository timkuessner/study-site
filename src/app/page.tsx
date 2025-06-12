'use client';

import { useState } from 'react';
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
import { RankingList } from '@/components/RankingList';

type TabType = 'study' | 'users' | 'ranking';

export default function Home() {
  const { user, loading, signInWithGoogle, signOut } = useAuth();
  const { isStudying, dataLoading, handleStudyToggle } = useStudyState(user);
  const [activeTab, setActiveTab] = useState<TabType>('study');

  if (loading || dataLoading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <SignInForm onSignIn={signInWithGoogle} />;
  }

  const firstName = getFirstName(user);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col relative overflow-hidden">
      {/* Background gradient effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900 opacity-50"></div>
      
      {/* User profile and sign out */}
      <UserProfile user={user} onSignOut={signOut} />
      
      {/* Main content area */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 relative z-10">
        <div className="flex flex-col items-center space-y-12 w-full max-w-sm">
          {/* Title */}
          <div className="text-center">
            <h1 className="text-4xl font-light tracking-wide mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              {firstName}
            </h1>
            <div className="h-px w-32 bg-gradient-to-r from-transparent via-blue-400 to-transparent mx-auto"></div>
          </div>

          {/* Tab Content */}
          <div className="w-full min-h-[300px] flex flex-col items-center justify-center">
            {activeTab === 'study' && (
              <>
                <StudyButton 
                  isStudying={isStudying}
                  onToggle={handleStudyToggle}
                  disabled={dataLoading}
                />
                <div className="mt-8">
                  <StudyStatus isStudying={isStudying} />
                </div>
              </>
            )}

            {activeTab === 'users' && (
              <ActiveUsers currentUserUid={user.uid} showAsList={true} />
            )}

            {activeTab === 'ranking' && (
              <RankingList currentUserUid={user.uid} />
            )}
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-sm border-t border-gray-700/50 z-20">
        <div className="flex justify-center items-center px-6 py-3">
          <div className="flex space-x-1 bg-gray-800/50 rounded-xl p-1">
            <button
              onClick={() => setActiveTab('study')}
              className={`
                flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200
                ${activeTab === 'study' 
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-400/30' 
                  : 'text-gray-400 hover:text-gray-300'
                }
              `}
            >
              <div className="w-5 h-5 flex items-center justify-center">
                📚
              </div>
              <span className="text-sm font-medium">Study</span>
            </button>

            <button
              onClick={() => setActiveTab('users')}
              className={`
                flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200
                ${activeTab === 'users' 
                  ? 'bg-green-500/20 text-green-400 border border-green-400/30' 
                  : 'text-gray-400 hover:text-gray-300'
                }
              `}
            >
              <div className="w-5 h-5 flex items-center justify-center">
                👥
              </div>
              <span className="text-sm font-medium">Online</span>
            </button>

            <button
              onClick={() => setActiveTab('ranking')}
              className={`
                flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200
                ${activeTab === 'ranking' 
                  ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-400/30' 
                  : 'text-gray-400 hover:text-gray-300'
                }
              `}
            >
              <div className="w-5 h-5 flex items-center justify-center">
                🏆
              </div>
              <span className="text-sm font-medium">Ranking</span>
            </button>
          </div>
        </div>
      </div>

      {/* Add bottom padding to account for fixed navigation */}
      <div className="h-20"></div>

      {/* Background Effects */}
      <BackgroundEffects isStudying={isStudying} />
    </div>
  );
}
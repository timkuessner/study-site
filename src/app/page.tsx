'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/authContext';
import { useStudyState } from '@/hooks/useStudyState';
import { getFirstName } from '@/utils/userHelpers';
import { LoadingScreen } from '@/components/layout/LoadingScreen';
import { SignInForm } from '@/components/auth/SignInForm';
import { StudyButton } from '@/components/study/StudyButton';
import { StudyStatus } from '@/components/study/StudyStatus';
import { BackgroundEffects } from '@/components/layout/BackgroundEffects';
import { ActiveUsers } from '@/components/users/ActiveUsers';
import { RankingList } from '@/components/ranking/RankingList';
import { UserSettings } from '@/components/settings/UserSettings';

type TabType = 'study' | 'users' | 'ranking' | 'settings';

interface TabConfig {
  id: TabType;
  icon: string;
  label: string;
  gradient: string;
  glowClass: string;
  textClass: string;
}

const TAB_CONFIGS: TabConfig[] = [
  {
    id: 'study',
    icon: '📚',
    label: 'Study',
    gradient: 'bg-study-gradient',
    glowClass: 'glow-study',
    textClass: 'gradient-text-study'
  },
  {
    id: 'users',
    icon: '👥',
    label: 'Users',
    gradient: 'bg-users-gradient',
    glowClass: 'glow-users',
    textClass: 'gradient-text-users'
  },
  {
    id: 'ranking',
    icon: '🏆',
    label: 'Ranking',
    gradient: 'bg-ranking-gradient',
    glowClass: 'glow-ranking',
    textClass: 'gradient-text-ranking'
  },
  {
    id: 'settings',
    icon: '⚙️',
    label: 'Settings',
    gradient: 'bg-settings-gradient',
    glowClass: 'glow-settings',
    textClass: 'gradient-text-settings'
  }
];

export default function HomePage() {
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
  const activeTabConfig = TAB_CONFIGS.find(tab => tab.id === activeTab);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 animated-gradient-bg"></div>
      
      {/* Background Effects */}
      <BackgroundEffects isStudying={isStudying} />
      
      {/* Main Content Container */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 relative z-10">
        <div className="flex flex-col items-center space-y-8 w-full max-w-md">
          
          {/* Dynamic Header */}
          <div className="text-center space-y-4">
            {activeTab !== 'settings' ? (
              <>
                <h1 className="text-5xl font-light tracking-wider mb-3 gradient-text-study">
                  {firstName}
                </h1>
                <div className="flex items-center justify-center space-x-3">
                  <div className={`h-px flex-1 bg-gradient-to-r from-transparent via-current to-transparent ${activeTabConfig?.textClass || 'text-blue-400'}`}></div>
                  <span className={`text-sm font-medium tracking-widest uppercase ${activeTabConfig?.textClass || 'gradient-text-study'}`}>
                    {activeTabConfig?.label || 'Study'}
                  </span>
                  <div className={`h-px flex-1 bg-gradient-to-r from-transparent via-current to-transparent ${activeTabConfig?.textClass || 'text-blue-400'}`}></div>
                </div>
              </>
            ) : (
              <>
                <h1 className="text-4xl font-light tracking-wider mb-3 gradient-text-settings">
                  Settings
                </h1>
                <div className="flex items-center justify-center space-x-3">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-500 to-transparent"></div>
                  <span className="text-sm font-medium tracking-widest uppercase gradient-text-settings">
                    Configure
                  </span>
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-500 to-transparent"></div>
                </div>
              </>
            )}
          </div>

          {/* Tab Content */}
          <div className="w-full min-h-[400px] flex flex-col items-center justify-center">
            {activeTab === 'study' && (
              <div className="flex flex-col items-center space-y-8">
                <StudyButton 
                  isStudying={isStudying}
                  onToggle={handleStudyToggle}
                  disabled={dataLoading}
                />
                <StudyStatus isStudying={isStudying} />
              </div>
            )}

            {activeTab === 'users' && (
              <div className="w-full glass-card p-6">
                <ActiveUsers currentUserUid={user.uid} showAsList={true} />
              </div>
            )}

            {activeTab === 'ranking' && (
              <div className="w-full glass-card p-6">
                <RankingList currentUserUid={user.uid} />
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="w-full glass-card p-6">
                <UserSettings user={user} onSignOut={signOut} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-20">
        <div className="mx-4 mb-4">
          <div className="glass-card p-2">
            <div className="flex justify-center items-center gap-2">
              {TAB_CONFIGS.map((tabConfig) => {
                const isActive = activeTab === tabConfig.id;
                
                return (
                  <button
                    key={tabConfig.id}
                    onClick={() => setActiveTab(tabConfig.id)}
                    aria-label={`Switch to ${tabConfig.label} tab`}
                    className={`
                      group relative flex flex-col items-center justify-center
                      w-16 h-16 rounded-xl transition-all duration-300 ease-out
                      ${isActive 
                        ? `${tabConfig.gradient} ${tabConfig.glowClass} shadow-lg scale-110` 
                        : 'glass-button hover:scale-105'
                      }
                    `}
                  >
                    {/* Icon */}
                    <span className="text-xl mb-1 transition-transform duration-300 group-hover:scale-110">
                      {tabConfig.icon}
                    </span>
                    
                    {/* Label */}
                    <span className={`
                      text-xs font-medium tracking-wide transition-all duration-300
                      ${isActive 
                        ? 'text-white opacity-100' 
                        : `${tabConfig.textClass} opacity-70 group-hover:opacity-100`
                      }
                    `}>
                      {tabConfig.label}
                    </span>

                    {/* Active Indicator */}
                    {isActive && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full animate-pulse"></div>
                    )}

                    {/* Hover Glow Effect */}
                    {!isActive && (
                      <div className={`
                        absolute inset-0 rounded-xl opacity-0 group-hover:opacity-30 
                        transition-opacity duration-300 ${tabConfig.gradient}
                      `}></div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Padding for Navigation */}
      <div className="h-24"></div>
    </div>
  );
}
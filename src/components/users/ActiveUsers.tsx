import { useState, useEffect } from 'react';
import { FirebaseService, UserData } from '@/services/firebaseService';

interface ActiveUsersProps {
  currentUserUid?: string;
  showAsList?: boolean;
}

export function ActiveUsers({ currentUserUid, showAsList = false }: ActiveUsersProps) {
  const [activeUsers, setActiveUsers] = useState<UserData[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = FirebaseService.subscribeToActiveUsers(
      (users) => {
        setActiveUsers(users);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching active users:', error);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  const totalStudying = activeUsers.length;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm text-gray-400">Loading users...</span>
        </div>
      </div>
    );
  }

  // List view for the users tab
  if (showAsList) {
    return (
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-light text-white mb-2">Currently Online</h2>
          <div className="h-px w-24 bg-gradient-to-r from-transparent via-blue-400 to-transparent mx-auto"></div>
        </div>
        
        {totalStudying === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-gray-800/50 rounded-full">
              <span className="text-2xl opacity-50">👥</span>
            </div>
            <p className="text-gray-400">No one is studying right now</p>
            <p className="text-gray-500 text-sm mt-1">Be the first to start!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activeUsers.map((user, index) => (
              <div 
                key={index} 
                className="bg-gray-900/60 backdrop-blur-sm border border-gray-700/50 rounded-lg p-4 flex items-center space-x-3"
              >
                <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse flex-shrink-0"></div>
                <div className="flex-1">
                  <p className="text-white font-medium">{user.tag}</p>
                  <p className="text-gray-400 text-xs">Currently studying</p>
                </div>
                {user.uid === currentUserUid && (
                  <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full">
                    You
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
        
        <div className="mt-6 text-center">
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-500/10 border border-blue-400/20 rounded-full">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-300">
              {totalStudying === 0 
                ? 'No active users' 
                : totalStudying === 1 
                  ? '1 person studying'
                  : `${totalStudying} people studying`
              }
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Original compact view for the study tab
  return (
    <div className="mt-8 flex flex-col items-center">
      {/* Expandable user list */}
      {isExpanded && activeUsers.length > 0 && (
        <div className="mb-4 bg-gray-900/90 backdrop-blur-sm border border-gray-700 rounded-lg p-4 min-w-48 max-w-64">
          <h3 className="text-sm font-medium text-gray-300 mb-3 text-center">Currently studying:</h3>
          <div className="space-y-2">
            {activeUsers.map((user, index) => (
              <div key={index} className="flex items-center justify-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-200">{user.tag}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Counter button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        disabled={totalStudying === 0}
        className={`
          bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-lg px-4 py-2
          transition-all duration-200 hover:bg-gray-800/60 hover:border-gray-600/50
          disabled:opacity-50 disabled:cursor-not-allowed
          ${isExpanded ? 'bg-gray-800/60 border-gray-600/50' : ''}
        `}
      >
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 flex items-center justify-center text-gray-400">
            👥
          </div>
          <span className="text-sm text-gray-300">
            {totalStudying === 0 
              ? 'No one studying' 
              : totalStudying === 1 
                ? '1 person studying'
                : `${totalStudying} people studying`
            }
          </span>
          {totalStudying > 0 && (
            <div className="ml-1 text-gray-400 text-xs">
              {isExpanded ? '▼' : '▲'}
            </div>
          )}
        </div>
      </button>
    </div>
  );
}
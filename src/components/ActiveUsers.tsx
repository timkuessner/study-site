import { useState, useEffect } from 'react';
import { FirebaseService, UserData } from '@/services/firebaseService';

interface ActiveUsersProps {
  currentUserUid?: string;
}

export function ActiveUsers({ currentUserUid }: ActiveUsersProps) {
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

  // Create display list with current user if studying
  const displayUsers = activeUsers.map(user => ({
    ...user,
    displayName: user.uid === currentUserUid ? 'You' : user.name
  }));

  const totalStudying = activeUsers.length;

  if (loading) {
    return (
      <div className="mt-8">
        <div className="text-center">
          <div className="inline-flex items-center space-x-2 text-gray-400">
            <div className="w-4 h-4 flex items-center justify-center">
              👥
            </div>
            <span className="text-sm">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 flex flex-col items-center">
      {/* Expandable user list */}
      {isExpanded && displayUsers.length > 0 && (
        <div className="mb-4 bg-gray-900/90 backdrop-blur-sm border border-gray-700 rounded-lg p-4 min-w-48 max-w-64">
          <h3 className="text-sm font-medium text-gray-300 mb-3 text-center">Currently studying:</h3>
          <div className="space-y-2">
            {displayUsers.map((user, index) => (
              <div key={index} className="flex items-center justify-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-200">{user.displayName}</span>
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
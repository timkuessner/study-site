import { useState, useEffect } from 'react';
import { FirebaseService, UserRanking } from '@/services/firebaseService';

interface RankingListProps {
  currentUserUid?: string;
}

export function RankingList({ currentUserUid }: RankingListProps) {
  const [rankings, setRankings] = useState<UserRanking[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState<'week' | 'month' | 'allTime'>('week');

  useEffect(() => {
    const fetchRankings = async () => {
      setLoading(true);
      try {
        // You'll need to implement this method in your FirebaseService
        const rankingData = await FirebaseService.getUserRankings(timeFilter);
        setRankings(rankingData);
      } catch (error) {
        console.error('Error fetching rankings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRankings();
  }, [timeFilter]);

  const getRankIcon = (position: number) => {
    switch (position) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${position}`;
    }
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm text-gray-400">Loading rankings...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-light text-white mb-2">Study Rankings</h2>
        <div className="h-px w-24 bg-gradient-to-r from-transparent via-yellow-400 to-transparent mx-auto"></div>
      </div>

      {/* Time Filter */}
      <div className="flex justify-center mb-6">
        <div className="flex space-x-1 bg-gray-800/50 rounded-lg p-1">
          {[
            { key: 'week', label: 'Week' },
            { key: 'month', label: 'Month' },
            { key: 'allTime', label: 'All Time' }
          ].map((filter) => (
            <button
              key={filter.key}
              onClick={() => setTimeFilter(filter.key as any)}
              className={`
                px-3 py-1 rounded-md text-xs font-medium transition-all duration-200
                ${timeFilter === filter.key
                  ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-400/30'
                  : 'text-gray-400 hover:text-gray-300'
                }
              `}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Rankings List */}
      {rankings.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-gray-800/50 rounded-full">
            <span className="text-2xl opacity-50">🏆</span>
          </div>
          <p className="text-gray-400">No study data yet</p>
          <p className="text-gray-500 text-sm mt-1">Start studying to see rankings!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {rankings.map((ranking, index) => {
            const position = index + 1;
            const isCurrentUser = ranking.uid === currentUserUid;
            
            return (
              <div 
                key={ranking.uid}
                className={`
                  p-4 rounded-lg border transition-all duration-200
                  ${isCurrentUser 
                    ? 'bg-blue-500/10 border-blue-400/30 shadow-lg' 
                    : 'bg-gray-900/60 border-gray-700/50'
                  }
                  ${position <= 3 ? 'bg-gradient-to-r from-yellow-500/5 to-transparent' : ''}
                `}
              >
                <div className="flex items-center space-x-4">
                  {/* Rank */}
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center font-bold
                    ${position <= 3 
                      ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-black' 
                      : 'bg-gray-700 text-gray-300'
                    }
                  `}>
                    {position <= 3 ? getRankIcon(position) : position}
                  </div>

                  {/* User Info */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <p className={`font-medium ${isCurrentUser ? 'text-blue-400' : 'text-white'}`}>
                        {isCurrentUser ? 'You' : ranking.name}
                      </p>
                      {isCurrentUser && (
                        <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full">
                          You
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-4 mt-1">
                      <p className="text-gray-400 text-sm">
                        {formatTime(ranking.totalMinutes)}
                      </p>
                      <p className="text-gray-500 text-xs">
                        {ranking.sessionsCount} sessions
                      </p>
                    </div>
                  </div>

                  {/* Study Time Bar */}
                  <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ${
                        position === 1 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                        position === 2 ? 'bg-gradient-to-r from-gray-300 to-gray-500' :
                        position === 3 ? 'bg-gradient-to-r from-orange-400 to-orange-600' :
                        'bg-gradient-to-r from-blue-400 to-purple-500'
                      }`}
                      style={{
                        width: `${Math.min((ranking.totalMinutes / (rankings[0]?.totalMinutes || 1)) * 100, 100)}%`
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Your Rank (if not in top rankings) */}
      {currentUserUid && rankings.length > 0 && !rankings.some(r => r.uid === currentUserUid) && (
        <div className="mt-6 pt-4 border-t border-gray-700/50">
          <div className="bg-blue-500/10 border border-blue-400/30 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-400 font-medium">Your Rank</p>
                <p className="text-gray-400 text-sm">Keep studying to climb the rankings!</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-500">#-</p>
                <p className="text-gray-500 text-xs">Not ranked yet</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
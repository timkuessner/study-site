import Image from 'next/image';
import { User } from 'firebase/auth';

interface UserProfileProps {
  user: User;
  onSignOut: () => Promise<void>;
}

export function UserProfile({ user, onSignOut }: UserProfileProps) {
  const handleSignOut = async () => {
    try {
      await onSignOut();
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };

  return (
    <div className="absolute top-6 right-6 z-20 flex items-center space-x-4">
      <div className="flex items-center space-x-2">
        {user.photoURL && (
          <Image
            src={user.photoURL}
            alt="Profile"
            width={32}
            height={32}
            className="rounded-full"
          />
        )}
        <span className="text-sm text-gray-300">
          {user.displayName || user.email}
        </span>
      </div>
      <button
        onClick={handleSignOut}
        className="text-xs px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded-full transition-colors"
      >
        Sign Out
      </button>
    </div>
  );
}
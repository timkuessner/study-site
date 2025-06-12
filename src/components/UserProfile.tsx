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
        <span className="text-sm font-light bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          {user.displayName || user.email}
        </span>
      </div>
      <button
        onClick={handleSignOut}
        className="text-xs px-3 py-1 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-400/30 rounded-full transition-all duration-200 hover:shadow-[0_0_10px_rgba(96,165,250,0.3)]"
      >
        Sign Out
      </button>
    </div>
  );
}
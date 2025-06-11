import Image from 'next/image';
import { useState } from 'react';

interface SignInFormProps {
  onSignIn: () => Promise<void>;
}

export function SignInForm({ onSignIn }: SignInFormProps) {
  const [authLoading, setAuthLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setAuthLoading(true);
    try {
      await onSignIn();
    } catch (error) {
      console.error('Failed to sign in with Google:', error);
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background gradient effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900 opacity-50"></div>
      
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center space-y-8 w-full max-w-sm">
        
        {/* Title */}
        <div className="text-center">
          <h1 className="text-4xl font-light tracking-wide mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Study
          </h1>
          <div className="h-px w-32 bg-gradient-to-r from-transparent via-blue-400 to-transparent mx-auto"></div>
          <p className="text-gray-400 mt-4 text-sm">Sign in to start studying</p>
        </div>

        {/* Auth Buttons */}
        <div className="space-y-4 w-full">
          <button
            onClick={handleGoogleSignIn}
            disabled={authLoading}
            className="w-full flex items-center justify-center space-x-3 px-6 py-3 bg-white hover:bg-gray-100 text-black rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Image
              src="/icons/google-logo.svg"
              alt="Google"
              width={20}
              height={20}
            />
            <span>{authLoading ? 'Signing in...' : 'Continue with Google'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
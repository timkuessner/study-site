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
    <div className="min-h-screen bg-gradient-dark text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-animated opacity-30"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(59,130,246,0.1),transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(139,92,246,0.1),transparent_50%)]"></div>
      
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center space-y-8 w-full max-w-sm">
        
        {/* Title */}
        <div className="text-center">
          <h1 className="text-5xl font-light tracking-wide mb-4 gradient-text-study animate-pulse-subtle">
            Study
          </h1>
          <div className="h-px w-32 bg-study-gradient mx-auto rounded-full glow-study"></div>
          <p className="text-gray-300 mt-6 text-sm font-light">Sign in to start your study journey</p>
        </div>

        {/* Auth Buttons */}
        <div className="space-y-4 w-full">
          <button
            onClick={handleGoogleSignIn}
            disabled={authLoading}
            className="glass-button w-full flex items-center justify-center space-x-3 px-6 py-4 text-gray-900 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 hover:shadow-xl"
          >
            <Image
              src="/icons/google-logo.svg"
              alt="Google"
              width={20}
              height={20}
            />
            <span className="font-medium">
              {authLoading ? 'Signing in...' : 'Continue with Google'}
            </span>
          </button>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-400 text-xs mt-8">
          <p>Join the study community</p>
        </div>
      </div>
    </div>
  );
}
'use client';

import Image from 'next/image';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '../../lib/authContext';

export default function StudyPage() {
  const params = useParams();
  const { user, loading, signInWithGoogle, signInWithApple, signOut } = useAuth();
  const rawName = params.name;
  const name = (() => {
    const nameStr = Array.isArray(rawName) ? rawName[0] : rawName;
    return nameStr ? nameStr.charAt(0).toUpperCase() + nameStr.slice(1) : '';
  })();
  const [isStudying, setIsStudying] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setAuthLoading(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Failed to sign in with Google:', error);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    setAuthLoading(true);
    try {
      await signInWithApple();
    } catch (error) {
      console.error('Failed to sign in with Apple:', error);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-pulse text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
        {/* Background gradient effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900 opacity-50"></div>
        
        {/* Content */}
        <div className="relative z-10 flex flex-col items-center space-y-8 w-full max-w-sm">
          
          {/* Title */}
          <div className="text-center">
            <h1 className="text-4xl font-light tracking-wide mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              {name}
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

            <button
              onClick={handleAppleSignIn}
              disabled={authLoading}
              className="w-full flex items-center justify-center space-x-3 px-6 py-3 bg-black hover:bg-gray-900 text-white border border-gray-600 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Image 
                src="/icons/apple-logo.svg" 
                alt="Apple"
                width={20}
                height={20}
              />
              <span>{authLoading ? 'Signing in...' : 'Continue with Apple'}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background gradient effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900 opacity-50"></div>
      
      {/* User info and sign out */}
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
      
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center space-y-12 w-full max-w-sm">
        
        {/* Title */}
        <div className="text-center">
          <h1 className="text-4xl font-light tracking-wide mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            {name}
          </h1>
          <div className="h-px w-32 bg-gradient-to-r from-transparent via-blue-400 to-transparent mx-auto"></div>
        </div>

        {/* Study Button */}
        <div className="relative">
          <button
            onClick={() => setIsStudying(!isStudying)}
            className={`
              w-32 h-32 rounded-full border-2 transition-all duration-500 ease-in-out
              flex items-center justify-center relative overflow-hidden
              ${isStudying 
                ? 'border-blue-400 shadow-[0_0_40px_rgba(96,165,250,0.6)] bg-gradient-to-br from-blue-500/20 to-purple-600/20' 
                : 'border-gray-600 hover:border-gray-500 bg-gray-900/50'
              }
            `}
          >
            {/* Animated gradient ring when studying */}
            {isStudying && (
              <div className="absolute inset-0 rounded-full opacity-75">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 via-purple-500 to-blue-400 animate-spin" 
                     style={{
                       background: 'conic-gradient(from 0deg, #60a5fa, #8b5cf6, #a855f7, #c084fc, #e879f9, #60a5fa)',
                       animation: 'spin 3s linear infinite'
                     }}>
                </div>
                <div className="absolute inset-1 rounded-full bg-black"></div>
              </div>
            )}
            
            {/* Inner circle */}
            <div className={`
              relative z-10 w-28 h-28 rounded-full flex items-center justify-center
              transition-all duration-300
              ${isStudying 
                ? 'bg-gradient-to-br from-blue-400/30 to-purple-600/30 shadow-inner' 
                : 'bg-gray-800/80'
              }
            `}>
              {/* Pulse effect when studying */}
              {isStudying && (
                <div className="absolute inset-0 rounded-full bg-blue-400/20 animate-pulse"></div>
              )}
            </div>
          </button>
        </div>

        {/* Status */}
        <div className="text-center space-y-4">
          <div className={`
            inline-flex items-center space-x-2 px-6 py-3 rounded-full
            ${isStudying 
              ? 'bg-gradient-to-r from-blue-500/15 to-purple-500/15 border border-blue-400/30' 
              : 'bg-gray-800/50 border border-gray-600/30'
            }
          `}>
            <div className={`
              w-2 h-2 rounded-full
              ${isStudying 
                ? 'bg-blue-400 animate-pulse shadow-[0_0_6px_rgba(96,165,250,0.8)]' 
                : 'bg-gray-500'
              }
            `}></div>
            <span className="text-sm font-light tracking-wider text-white">
              {isStudying ? 'STUDYING' : 'READY'}
            </span>
          </div>
          
          <p className="text-xs text-gray-400 animate-pulse h-4">
            {isStudying ? 'Focus mode activated' : ''}
          </p>
        </div>
      </div>

      {/* Background stars - only when studying */}
      {isStudying && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full opacity-30"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
              }}
            ></div>
          ))}
        </div>
      )}

      {/* Ambient particles effect when studying */}
      {isStudying && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-blue-400 rounded-full opacity-60 animate-bounce"
              style={{
                left: `${15 + i * 10}%`,
                top: `${25 + (i % 3) * 20}%`,
                animationDelay: `${i * 0.4}s`,
                animationDuration: `${2 + i * 0.2}s`
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
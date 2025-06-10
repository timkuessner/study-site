'use client';

import { useState } from 'react';

export default function StudyPage() {
  // Since we can't use useParams, we'll use a default name or get it from URL
  const name = 'Study';
  const [isStudying, setIsStudying] = useState(false);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background gradient effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900 opacity-50"></div>
      
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
                ? 'border-cyan-400 shadow-[0_0_40px_rgba(34,211,238,0.6)] bg-gradient-to-br from-cyan-500/20 to-blue-600/20' 
                : 'border-gray-600 hover:border-gray-500 bg-gray-900/50'
              }
            `}
          >
            {/* Animated gradient ring when studying */}
            {isStudying && (
              <div className="absolute inset-0 rounded-full opacity-75">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 animate-spin" 
                     style={{
                       background: 'conic-gradient(from 0deg, #00f5ff, #0080ff, #8000ff, #ff0080, #ff8000, #ffff00, #00ff80, #00f5ff)',
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
                ? 'bg-gradient-to-br from-cyan-400/30 to-blue-600/30 shadow-inner' 
                : 'bg-gray-800/80'
              }
            `}>
              {/* Pulse effect when studying */}
              {isStudying && (
                <div className="absolute inset-0 rounded-full bg-cyan-400/20 animate-pulse"></div>
              )}
              

            </div>
          </button>
        </div>

        {/* Status */}
        <div className="text-center space-y-4">
          <div className={`
            inline-flex items-center space-x-2 px-6 py-3 rounded-full
            ${isStudying 
              ? 'bg-cyan-500/20 border border-cyan-400/30' 
              : 'bg-gray-800/50 border border-gray-600/30'
            }
          `}>
            <div className={`
              w-2 h-2 rounded-full
              ${isStudying 
                ? 'bg-cyan-400 animate-pulse shadow-[0_0_6px_rgba(34,211,238,0.8)]' 
                : 'bg-gray-500'
              }
            `}></div>
            <span className="text-sm font-light tracking-wider">
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
              className="absolute w-1 h-1 bg-cyan-400 rounded-full opacity-60 animate-bounce"
              style={{
                left: `${15 + i * 10}%`,
                top: `${25 + (i % 3) * 20}%`,
                animationDelay: `${i * 0.4}s`,
                animationDuration: `${2 + i * 0.2}s`
              }}
            ></div>
          ))}
        </div>
      )}
    </div>
  );
}
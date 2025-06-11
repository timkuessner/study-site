interface StudyButtonProps {
    isStudying: boolean;
    onToggle: () => void;
    disabled?: boolean;
  }
  
  export function StudyButton({ isStudying, onToggle, disabled = false }: StudyButtonProps) {
    return (
      <div className="relative">
        <button
          onClick={onToggle}
          disabled={disabled}
          className={`
            w-32 h-32 rounded-full border-2 transition-all duration-500 ease-in-out
            flex items-center justify-center relative overflow-hidden
            disabled:opacity-50 disabled:cursor-not-allowed
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
    );
  }
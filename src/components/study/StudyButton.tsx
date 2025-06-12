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
          w-40 h-40 rounded-full border-2 transition-all duration-700 ease-in-out
          flex items-center justify-center relative overflow-hidden
          disabled:opacity-50 disabled:cursor-not-allowed
          hover:scale-105 active:scale-95
          ${isStudying 
            ? 'border-study-light shadow-[0_0_60px_rgba(96,165,250,0.8)] bg-study-gradient glow-study pulse-study' 
            : 'border-gray-600 hover:border-gray-500 bg-surface-elevated hover:bg-surface-hover glass-card'
          }
        `}
      >
        {/* Animated gradient ring when studying */}
        {isStudying && (
          <>
            <div className="absolute inset-0 rounded-full opacity-80">
              <div className="absolute inset-0 rounded-full bg-gradient-conic animate-spin-slow"></div>
              <div className="absolute inset-1 rounded-full bg-black"></div>
            </div>
            
            {/* Pulsing inner ring */}
            <div className="absolute inset-3 rounded-full bg-study-gradient opacity-30 animate-pulse"></div>
          </>
        )}
        
        {/* Inner circle */}
        <div className={`
          relative z-10 w-36 h-36 rounded-full flex items-center justify-center
          transition-all duration-500
          ${isStudying 
            ? 'bg-gradient-radial-study shadow-inner' 
            : 'bg-surface hover:bg-surface-hover glass-card'
          }
        `}>
          {/* Center icon/text */}
          <div className="text-center">
            <div className={`
              w-16 h-16 rounded-full flex items-center justify-center mb-2
              ${isStudying 
                ? 'bg-study-gradient glow-study animate-pulse' 
                : 'bg-gray-700 border border-gray-600'
              }
            `}>
              <span className={`
                text-2xl font-light
                ${isStudying ? 'text-white' : 'text-gray-400'}
              `}>
                {isStudying ? '⏸' : '▶'}
              </span>
            </div>
            <p className={`
              text-xs font-light tracking-widest uppercase
              ${isStudying ? 'gradient-text-study' : 'text-gray-400'}
            `}>
              {isStudying ? 'Stop' : 'Start'}
            </p>
          </div>
          
          {/* Pulse effect when studying */}
          {isStudying && (
            <div className="absolute inset-0 rounded-full bg-study-light/10 animate-ping"></div>
          )}
        </div>
      </button>
    </div>
  );
}
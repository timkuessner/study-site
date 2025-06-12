interface StudyStatusProps {
  isStudying: boolean;
}

export function StudyStatus({ isStudying }: StudyStatusProps) {
  return (
    <div className="text-center space-y-6">
      {/* Main Status Indicator */}
      <div className={`
        inline-flex items-center space-x-3 px-8 py-4 rounded-2xl backdrop-blur-md
        transition-all duration-500
        ${isStudying 
          ? 'bg-study-gradient border border-study-light/30 glow-study shadow-xl' 
          : 'glass-card border border-gray-600/30'
        }
      `}>
        <div className={`
          w-3 h-3 rounded-full relative
          ${isStudying 
            ? 'bg-white glow-white animate-pulse' 
            : 'bg-gray-500'
          }
        `}>
          {isStudying && (
            <div className="absolute inset-0 w-3 h-3 rounded-full bg-white animate-ping"></div>
          )}
        </div>
        
        <span className={`
          text-lg font-light tracking-[0.2em] uppercase
          ${isStudying ? 'text-white font-medium' : 'text-gray-400'}
        `}>
          {isStudying ? 'Studying' : 'Ready'}
        </span>
        
        {isStudying && (
          <div className="flex space-x-1">
            <div className="w-1 h-1 bg-white/60 rounded-full animate-bounce"></div>
            <div className="w-1 h-1 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-1 h-1 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        )}
      </div>
      
      {/* Status Message */}
      <div className="space-y-2">
        <p className={`
          text-sm font-light transition-all duration-500
          ${isStudying ? 'text-study-light animate-pulse-subtle' : 'text-gray-500'}
        `}>
          {isStudying ? 'Focus mode activated' : 'Click the button to begin'}
        </p>
        
        {isStudying && (
          <div className="flex items-center justify-center space-x-2 text-xs text-gray-400">
            <div className="w-1 h-1 bg-study-light rounded-full animate-pulse"></div>
            <span className="animate-pulse-subtle">Deep work in progress</span>
            <div className="w-1 h-1 bg-study-light rounded-full animate-pulse"></div>
          </div>
        )}
      </div>
      
      {/* Ambient Effect */}
      {isStudying && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-study-gradient opacity-5 rounded-full blur-3xl animate-pulse-slow"></div>
        </div>
      )}
    </div>
  );
}
interface StudyStatusProps {
    isStudying: boolean;
  }
  
  export function StudyStatus({ isStudying }: StudyStatusProps) {
    return (
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
    );
  }
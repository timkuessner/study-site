interface BackgroundEffectsProps {
    isStudying: boolean;
  }
  
  export function BackgroundEffects({ isStudying }: BackgroundEffectsProps) {
    if (!isStudying) return null;
  
    return (
      <>
        {/* Background stars */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(50)].map((_, i) => (
            <div
              key={`star-${i}`}
              className="absolute w-1 h-1 bg-white rounded-full opacity-30"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
              }}
            />
          ))}
        </div>
  
        {/* Ambient particles effect */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <div
              key={`particle-${i}`}
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
      </>
    );
  }
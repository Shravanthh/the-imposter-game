import { ReactNode } from 'react';
import BackgroundEffects from './BackgroundEffects';

interface GameLayoutProps {
  children: ReactNode;
  showBackButton?: boolean;
  onBackClick?: () => void;
  className?: string;
}

export default function GameLayout({ 
  children, 
  showBackButton = false, 
  onBackClick,
  className = ""
}: GameLayoutProps) {
  return (
    <div className="relative min-h-screen bg-background flex flex-col">
      <BackgroundEffects />
      
      {showBackButton && (
        <div className="absolute top-4 left-4 z-20">
          <button
            onClick={onBackClick}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface/80 backdrop-blur-sm border border-border-color text-text-muted hover:text-text-light transition-colors"
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            <span className="text-sm font-medium">Back</span>
          </button>
        </div>
      )}
      
      <div className={`relative z-10 flex-1 flex ${className}`}>
        {children}
      </div>
    </div>
  );
}
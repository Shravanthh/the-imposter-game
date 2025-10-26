import { ReactNode } from 'react';

interface GameCardProps {
  children: ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export default function GameCard({ children, className = "", size = 'md' }: GameCardProps) {
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-7xl'
  };

  return (
    <div className={`w-full ${sizeClasses[size]} mx-auto bg-surface backdrop-blur-xl rounded-2xl border border-border-color shadow-2xl p-6 ${className}`}>
      {children}
    </div>
  );
}
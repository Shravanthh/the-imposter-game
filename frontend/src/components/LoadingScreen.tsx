import BackgroundEffects from './BackgroundEffects';

interface LoadingScreenProps {
  message?: string;
  onGoBack?: () => void;
}

export default function LoadingScreen({ message = "Loading the chaos...", onGoBack }: LoadingScreenProps) {
  return (
    <div className="relative min-h-screen bg-background flex flex-col">
      <BackgroundEffects />
      
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-surface backdrop-blur-xl rounded-2xl border border-border-color shadow-2xl p-8">
          <div className="flex flex-col items-center gap-6 text-center">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
            </div>
            
            <h2 className="text-2xl font-semibold text-white">
              {message}
            </h2>
            
            {onGoBack && (
              <button
                onClick={onGoBack}
                className="text-sm text-text-muted hover:text-white transition-colors underline"
              >
                Abandon Ship 🚢
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
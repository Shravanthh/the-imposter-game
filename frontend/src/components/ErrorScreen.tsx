import BackgroundEffects from './BackgroundEffects';

interface ErrorScreenProps {
  title?: string;
  message: string;
  onGoBack?: () => void;
  buttonText?: string;
}

export default function ErrorScreen({ 
  title = "Oops! Something exploded! 💥", 
  message, 
  onGoBack, 
  buttonText = "Run Away" 
}: ErrorScreenProps) {
  return (
    <div className="relative min-h-screen bg-background flex flex-col">
      <BackgroundEffects />
      
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-surface backdrop-blur-xl rounded-2xl border border-border-color shadow-2xl p-8">
          <div className="flex flex-col items-center gap-6 text-center">
            <div className="w-16 h-16 bg-error/20 rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-4xl text-error">error</span>
            </div>
            
            <h2 className="text-2xl font-semibold text-white">
              {title}
            </h2>
            
            <p className="text-text-muted">
              {message}
            </p>
            
            {onGoBack && (
              <button
                onClick={onGoBack}
                className="px-6 py-3 bg-primary hover:bg-primary-hover text-white font-semibold rounded-lg transition-colors"
              >
                {buttonText}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
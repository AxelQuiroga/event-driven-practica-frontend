interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 animate-fade-in">
      <div className="flex items-start gap-3">
        <span className="text-red-500 text-lg mt-0.5">✕</span>
        <div className="flex-1">
          <p className="font-semibold text-red-700 dark:text-red-400 text-sm">
            Error
          </p>
          <p className="text-red-600 dark:text-red-300 text-sm mt-1">
            {message}
          </p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-3 px-3 py-1.5 text-xs font-medium text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-800/40 rounded-md hover:bg-red-200 dark:hover:bg-red-700/40 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400"
            >
              Reintentar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

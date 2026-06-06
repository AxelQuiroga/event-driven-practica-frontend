interface EmptyStateProps {
  title?: string;
  message?: string;
  icon?: string;
}

export function EmptyState({
  title = 'No hay turnos',
  message = 'No hay turnos programados todavía. Creá uno nuevo con el formulario de arriba.',
  icon = '📅',
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center animate-fade-in">
      <span className="text-6xl mb-4" role="img" aria-label="calendario">
        {icon}
      </span>
      <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
        {title}
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
        {message}
      </p>
    </div>
  );
}

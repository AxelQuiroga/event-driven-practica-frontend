export type SortField = 'fecha' | 'cliente' | 'servicio';
export type SortDirection = 'asc' | 'desc';

interface TurnoFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  serviceFilter: string;
  onServiceFilterChange: (value: string) => void;
  sortField: SortField;
  sortDirection: SortDirection;
  onSortChange: (field: SortField) => void;
  servicios: string[];
}

const sortOptions: { field: SortField; label: string }[] = [
  { field: 'fecha', label: 'Fecha' },
  { field: 'cliente', label: 'Cliente' },
  { field: 'servicio', label: 'Servicio' },
];

export function TurnoFilters({
  search,
  onSearchChange,
  serviceFilter,
  onServiceFilterChange,
  sortField,
  sortDirection,
  onSortChange,
  servicios,
}: TurnoFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {/* Búsqueda */}
      <div className="flex-1 relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Buscar por cliente..."
          className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-colors"
        />
      </div>

      {/* Filtro por servicio */}
      {servicios.length > 0 && (
        <select
          value={serviceFilter}
          onChange={(e) => onServiceFilterChange(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-gray-100 focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-colors"
        >
          <option value="">Todos los servicios</option>
          {servicios.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      )}

      {/* Ordenamiento */}
      <div className="flex gap-1">
        {sortOptions.map(({ field, label }) => (
          <button
            key={field}
            onClick={() => onSortChange(field)}
            className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 ${
              sortField === field
                ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {label}
            {sortField === field && (
              <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

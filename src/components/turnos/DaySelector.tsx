interface DaySelectorProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
}

function toLocalDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getToday(): string {
  return toLocalDateStr(new Date());
}

function getTomorrow(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return toLocalDateStr(d);
}

function formatDateLabel(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' });
}

export function DaySelector({ selectedDate, onDateChange }: DaySelectorProps) {
  const today = getToday();
  const tomorrow = getTomorrow();

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <button
        onClick={() => onDateChange(today)}
        className={`px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wide transition-all ${
          selectedDate === today
            ? 'bg-amber-500 text-black'
            : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
        }`}
      >
        Hoy
      </button>
      <button
        onClick={() => onDateChange(tomorrow)}
        className={`px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wide transition-all ${
          selectedDate === tomorrow
            ? 'bg-amber-500 text-black'
            : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
        }`}
      >
        Mañana
      </button>
      <div className="relative">
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => onDateChange(e.target.value)}
          min={today}
          className="px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wide bg-zinc-800 text-zinc-300 border border-zinc-700 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 cursor-pointer"
        />
      </div>
      {selectedDate !== today && selectedDate !== tomorrow && (
        <span className="text-sm text-zinc-500 ml-1">
          {formatDateLabel(selectedDate)}
        </span>
      )}
    </div>
  );
}

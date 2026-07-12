import { useState } from 'react';
import { Header } from './components/layout/Header';
import { DayView } from './views/DayView';
import { WeekView } from './views/WeekView';

export type ViewMode = 'dia' | 'semana';

const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('dia');

  return (
    <div className="min-h-screen bg-black">
      <Header viewMode={viewMode} onViewModeChange={setViewMode} />

      <main className="max-w-5xl mx-auto px-4 py-6">
        {viewMode === 'dia' ? <DayView /> : <WeekView />}
      </main>
    </div>
  );
};

export default App;

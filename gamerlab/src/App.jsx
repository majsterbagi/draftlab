import { useEffect, useMemo, useState } from 'react';
import { loadState, saveState } from './storage.js';
import { forecastQueue } from './engine/forecast.js';
import ForecastPanel from './components/ForecastPanel.jsx';
import GameForm from './components/GameForm.jsx';
import GameList from './components/GameList.jsx';

export default function App() {
  const [state, setState] = useState(loadState);

  useEffect(() => {
    saveState(state);
  }, [state]);

  const forecast = useMemo(
    () => forecastQueue({ games: state.games, weeklyHours: state.weeklyHours }),
    [state.games, state.weeklyHours]
  );

  const setWeeklyHours = weeklyHours => setState(s => ({ ...s, weeklyHours }));

  const addGame = game =>
    setState(s => ({
      ...s,
      games: [
        ...s.games,
        { ...game, id: crypto.randomUUID(), addedAt: new Date().toISOString() },
      ],
    }));

  const updateGame = (id, patch) =>
    setState(s => ({
      ...s,
      games: s.games.map(g => {
        if (g.id !== id) return g;
        const next = { ...g, ...patch };
        if (patch.status === 'done' && g.status !== 'done') {
          next.finishedAt = new Date().toISOString();
        }
        return next;
      }),
    }));

  const removeGame = id =>
    setState(s => ({ ...s, games: s.games.filter(g => g.id !== id) }));

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
      <header className="mb-8 flex items-baseline justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Gamer<span className="text-sky-400">Lab</span>
          </h1>
          <p className="mt-1 text-sm text-neutral-400">
            menedżer kupki wstydu — policz, kiedy naprawdę to przejdziesz
          </p>
        </div>
        <a
          href="../"
          className="shrink-0 text-xs text-neutral-500 transition-colors hover:text-sky-400"
        >
          ← draftlab.pl
        </a>
      </header>

      <ForecastPanel
        weeklyHours={state.weeklyHours}
        onWeeklyHoursChange={setWeeklyHours}
        forecast={forecast}
        games={state.games}
      />

      <GameForm onAdd={addGame} />

      <GameList
        games={state.games}
        forecast={forecast}
        onUpdate={updateGame}
        onRemove={removeGame}
      />
    </div>
  );
}

import { useState } from 'react';
import { STATUSES, STATUS_LABELS, formatDate, formatHours } from '../constants.js';
import { remainingHours } from '../engine/forecast.js';

const FILTERS = [{ id: 'all', label: 'Wszystkie' }, ...STATUSES];

const STATUS_BADGE = {
  backlog: 'bg-neutral-500/15 text-neutral-300',
  playing: 'bg-sky-500/15 text-sky-300',
  done: 'bg-emerald-500/15 text-emerald-300',
  dropped: 'bg-rose-500/15 text-rose-300',
};

function GameRow({ game, entry, onUpdate, onRemove }) {
  const remaining = remainingHours(game);
  const inQueue = game.status === 'backlog' || game.status === 'playing';

  return (
    <li className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border border-white/10 bg-neutral-900 px-4 py-3">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate font-medium text-white">{game.title}</span>
          <span className={`rounded px-1.5 py-0.5 text-[10px] uppercase tracking-wide ${STATUS_BADGE[game.status]}`}>
            {STATUS_LABELS[game.status]}
          </span>
        </div>
        <div className="mt-0.5 text-xs text-neutral-500">
          {game.platform} · {formatHours(game.hours)}
          {game.status === 'playing' && remaining !== null && ` · zostało ${formatHours(remaining)}`}
          {inQueue && entry?.finishDate && ` · koniec ~${formatDate(entry.finishDate)}`}
          {game.status === 'done' && game.finishedAt && ` · ukończona ${formatDate(new Date(game.finishedAt))}`}
        </div>
      </div>

      {game.status === 'playing' && (
        <label className="flex items-center gap-1.5 text-xs text-neutral-500">
          przegrane
          <input
            type="number"
            min="0"
            step="0.5"
            value={game.hoursPlayed ?? 0}
            onChange={e => onUpdate(game.id, { hoursPlayed: Math.max(0, Number(e.target.value) || 0) })}
            className="w-16 rounded-lg border border-white/10 bg-neutral-950 px-2 py-1 text-right text-white outline-none focus:border-sky-500"
          />
          h
        </label>
      )}

      <select
        value={game.status}
        onChange={e => onUpdate(game.id, { status: e.target.value })}
        className="rounded-lg border border-white/10 bg-neutral-950 px-2 py-1 text-xs text-white outline-none focus:border-sky-500"
      >
        {STATUSES.map(s => (
          <option key={s.id} value={s.id}>
            {s.label}
          </option>
        ))}
      </select>

      <button
        type="button"
        onClick={() => onRemove(game.id)}
        title="Usuń grę"
        className="text-neutral-600 transition-colors hover:text-rose-400"
      >
        ✕
      </button>
    </li>
  );
}

export default function GameList({ games, forecast, onUpdate, onRemove }) {
  const [filter, setFilter] = useState('all');

  const visible = filter === 'all' ? games : games.filter(g => g.status === filter);

  return (
    <section>
      <div className="mb-3 flex flex-wrap gap-2">
        {FILTERS.map(f => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={`rounded-full px-3 py-1 text-xs transition-colors ${
              filter === f.id
                ? 'bg-sky-500 text-white'
                : 'bg-white/5 text-neutral-400 hover:text-white'
            }`}
          >
            {f.label}
            {f.id !== 'all' && ` (${games.filter(g => g.status === f.id).length})`}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="rounded-xl border border-dashed border-white/10 px-4 py-8 text-center text-sm text-neutral-500">
          {games.length === 0
            ? 'Pusto. Dodaj pierwszą grę — kupka wstydu sama się nie policzy.'
            : 'Brak gier w tym widoku.'}
        </p>
      ) : (
        <ul className="space-y-2">
          {visible.map(game => (
            <GameRow
              key={game.id}
              game={game}
              entry={forecast.perGame.get(game.id)}
              onUpdate={onUpdate}
              onRemove={onRemove}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

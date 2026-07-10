import { formatDate, formatHours } from '../constants.js';

function Tile({ label, value, hint }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="text-xs uppercase tracking-wide text-neutral-500">{label}</div>
      <div className="mt-1 text-xl font-semibold text-white">{value}</div>
      {hint && <div className="mt-1 text-xs text-neutral-500">{hint}</div>}
    </div>
  );
}

export default function ForecastPanel({ weeklyHours, onWeeklyHoursChange, forecast, games }) {
  const backlogCount = games.filter(g => g.status === 'backlog' || g.status === 'playing').length;
  const doneCount = games.filter(g => g.status === 'done').length;

  return (
    <section className="mb-8 rounded-2xl border border-white/10 bg-neutral-900 p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-400">
          Prognoza
        </h2>
        <label className="flex items-center gap-2 text-sm text-neutral-400">
          Gram tygodniowo
          <input
            type="number"
            min="0"
            step="0.5"
            value={weeklyHours}
            onChange={e => onWeeklyHoursChange(Math.max(0, Number(e.target.value) || 0))}
            className="w-20 rounded-lg border border-white/10 bg-neutral-950 px-2 py-1 text-right text-white outline-none focus:border-sky-500"
          />
          h
        </label>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Tile label="W kupce" value={backlogCount} hint={`ukończone: ${doneCount}`} />
        <Tile label="Do przejścia" value={formatHours(forecast.totalHours)} />
        <Tile
          label="Tygodni grania"
          value={forecast.weeksNeeded !== null ? Math.ceil(forecast.weeksNeeded) : '—'}
        />
        <Tile label="Kupka zniknie" value={formatDate(forecast.finishDate)} />
      </div>

      {forecast.unknownCount > 0 && (
        <p className="mt-3 text-xs text-amber-400/80">
          {forecast.unknownCount === 1
            ? '1 gra nie ma podanego czasu przejścia i nie liczy się do prognozy.'
            : `${forecast.unknownCount} gry nie mają podanego czasu przejścia i nie liczą się do prognozy.`}
        </p>
      )}
      {weeklyHours <= 0 && (
        <p className="mt-3 text-xs text-amber-400/80">
          Ustaw tygodniowy budżet grania, żeby zobaczyć daty.
        </p>
      )}
    </section>
  );
}

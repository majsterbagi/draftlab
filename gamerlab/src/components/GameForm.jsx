import { useState } from 'react';
import { PLATFORMS } from '../constants.js';

const EMPTY = { title: '', platform: 'PC', hours: '' };

export default function GameForm({ onAdd }) {
  const [form, setForm] = useState(EMPTY);

  const submit = e => {
    e.preventDefault();
    const title = form.title.trim();
    if (!title) return;

    const hours = Number(form.hours);
    onAdd({
      title,
      platform: form.platform,
      hours: form.hours !== '' && hours > 0 ? hours : null,
      hoursPlayed: 0,
      status: 'backlog',
    });
    setForm(EMPTY);
  };

  return (
    <form
      onSubmit={submit}
      className="mb-8 flex flex-wrap items-end gap-3 rounded-2xl border border-white/10 bg-neutral-900 p-5"
    >
      <label className="min-w-40 flex-1 text-sm text-neutral-400">
        Tytuł
        <input
          type="text"
          value={form.title}
          onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
          placeholder="np. Elden Ring"
          className="mt-1 w-full rounded-lg border border-white/10 bg-neutral-950 px-3 py-2 text-white outline-none placeholder:text-neutral-600 focus:border-sky-500"
        />
      </label>
      <label className="text-sm text-neutral-400">
        Platforma
        <select
          value={form.platform}
          onChange={e => setForm(f => ({ ...f, platform: e.target.value }))}
          className="mt-1 block rounded-lg border border-white/10 bg-neutral-950 px-3 py-2 text-white outline-none focus:border-sky-500"
        >
          {PLATFORMS.map(p => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </label>
      <label className="text-sm text-neutral-400">
        Czas przejścia (h)
        <input
          type="number"
          min="0"
          step="0.5"
          value={form.hours}
          onChange={e => setForm(f => ({ ...f, hours: e.target.value }))}
          placeholder="?"
          className="mt-1 block w-28 rounded-lg border border-white/10 bg-neutral-950 px-3 py-2 text-white outline-none placeholder:text-neutral-600 focus:border-sky-500"
        />
      </label>
      <button
        type="submit"
        disabled={!form.title.trim()}
        className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Dodaj na kupkę
      </button>
    </form>
  );
}

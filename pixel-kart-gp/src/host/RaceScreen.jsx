import { useEffect, useRef, useState } from 'react';
import { createTrack } from '../game/track.js';
import { createRace, stepRace, WORLD } from '../game/race.js';
import { createRenderer, clearMarks, drawFrame, kartSpeed } from '../render/renderer.js';
import { createKeyboard } from './keyboard.js';

const HUD_HZ = 10;

export default function RaceScreen() {
  const canvasRef = useRef(null);
  const [players, setPlayers] = useState(2);
  const [laps, setLaps] = useState(3);
  const [hud, setHud] = useState(null);
  const [runId, setRunId] = useState(0); // inkrementacja = restart wyścigu

  useEffect(() => {
    const track = createTrack();
    const race = createRace(track, { players, laps });
    const renderer = createRenderer(track);
    const keyboard = createKeyboard();
    const ctx = canvasRef.current.getContext('2d');
    clearMarks(renderer);

    let raf;
    let last = performance.now();
    let hudLast = 0;

    const frame = (now) => {
      const dt = Math.min(1 / 30, (now - last) / 1000);
      last = now;

      const inputs = race.karts.map((_, i) => keyboard.inputFor(i));
      stepRace(race, track, inputs, dt);
      drawFrame(renderer, ctx, race);

      if (now - hudLast > 1000 / HUD_HZ) {
        hudLast = now;
        setHud({
          phase: race.phase,
          countdown: Math.ceil(race.countdown),
          time: race.time,
          laps: race.laps,
          karts: race.karts.map((k) => ({
            name: k.name,
            color: k.color,
            lap: Math.min(k.lap, race.laps),
            speed: Math.round(kartSpeed(k)),
            finished: k.finished,
            finishTime: k.finishTime,
          })),
          order: [...race.order],
        });
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    const onRestartKey = (e) => {
      if (e.code === 'KeyR') setRunId((id) => id + 1);
    };
    window.addEventListener('keydown', onRestartKey);

    return () => {
      cancelAnimationFrame(raf);
      keyboard.dispose();
      window.removeEventListener('keydown', onRestartKey);
    };
  }, [players, laps, runId]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3 p-4 text-neutral-200 font-mono">
      <header className="flex items-baseline gap-4">
        <h1 className="text-2xl font-bold tracking-widest text-amber-300">PIXEL KART GP</h1>
        <span className="text-xs text-neutral-500">v0.1 — prototyp jazdy</span>
      </header>

      <div className="relative">
        <canvas
          ref={canvasRef}
          width={WORLD.width}
          height={WORLD.height}
          className="border-4 border-neutral-700 rounded"
          style={{ imageRendering: 'pixelated', width: 'min(960px, 92vw)' }}
        />

        {hud?.phase === 'countdown' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-8xl font-bold text-amber-300 drop-shadow-[0_0_12px_rgba(0,0,0,0.9)]">
              {hud.countdown}
            </span>
          </div>
        )}

        {hud?.phase === 'finished' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70 rounded">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-amber-300 mb-4">META! 🏁</h2>
              {hud.order.map((ki, place) => {
                const k = hud.karts[ki];
                return (
                  <div key={ki} className="text-lg" style={{ color: k.color }}>
                    {place + 1}. {k.name} — {formatTime(k.finishTime)}
                  </div>
                );
              })}
              <p className="mt-4 text-sm text-neutral-400">R — jeszcze raz</p>
            </div>
          </div>
        )}

        {hud && hud.phase === 'racing' && (
          <div className="absolute top-2 left-2 right-2 flex justify-between text-xs">
            <div className="bg-black/60 rounded px-2 py-1 space-y-0.5">
              {hud.order.map((ki, place) => {
                const k = hud.karts[ki];
                return (
                  <div key={ki} style={{ color: k.color }}>
                    {place + 1}. {k.name} · L{k.lap}/{hud.laps} · {k.speed} px/s
                    {k.finished && ' 🏁'}
                  </div>
                );
              })}
            </div>
            <div className="bg-black/60 rounded px-2 py-1 h-fit">{formatTime(hud.time)}</div>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-4 text-sm">
        <label className="flex items-center gap-2">
          Gracze:
          <select
            value={players}
            onChange={(e) => setPlayers(Number(e.target.value))}
            className="bg-neutral-800 rounded px-2 py-1"
          >
            <option value={1}>1</option>
            <option value={2}>2</option>
          </select>
        </label>
        <label className="flex items-center gap-2">
          Okrążenia:
          <select
            value={laps}
            onChange={(e) => setLaps(Number(e.target.value))}
            className="bg-neutral-800 rounded px-2 py-1"
          >
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </label>
        <button
          onClick={() => setRunId((id) => id + 1)}
          className="bg-amber-500 text-black font-bold rounded px-3 py-1 hover:bg-amber-400"
        >
          Restart (R)
        </button>
      </div>

      <footer className="text-xs text-neutral-500 text-center">
        <span className="text-red-400">P1</span>: strzałki + spacja (drift) ·{' '}
        <span className="text-sky-400">P2</span>: WASD + lewy Shift (drift) · drift ≥0.7s = mini-boost
      </footer>
    </div>
  );
}

function formatTime(t) {
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  const cs = Math.floor((t * 100) % 100);
  return `${m}:${String(s).padStart(2, '0')}.${String(cs).padStart(2, '0')}`;
}

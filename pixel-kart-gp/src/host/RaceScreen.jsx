import { useEffect, useRef, useState } from 'react';
import { createTrack } from '../game/track.js';
import { createRace, stepRace, applyAction, WORLD } from '../game/race.js';
import { createRenderer, clearMarks, drawFrame, kartSpeed } from '../render/renderer.js';

const HUD_HZ = 10;

// Uniwersalny ekran wyścigu (host TV). Skąd pochodzi input, decyduje rodzic:
// getInput(slotIndex) => { steer, throttle, drift }.
export default function RaceScreen({
  players,            // liczba lub [{ name, color }]
  laps = 3,
  getInput,
  pollAction,         // opcjonalnie: (slotIndex) => 'grab'|'use'|null, odpytywane co klatkę (np. klawiatura)
  actionRef,          // opcjonalnie: ref, do którego wstrzykujemy (slotIndex, action) => void (np. sieć)
  onSnapshot,         // opcjonalnie: (hud) => void, ~10 Hz — np. do wysyłki na pady
  finishedActions,    // opcjonalnie: dodatkowe przyciski na ekranie wyników
  footer,             // opcjonalnie: pasek pomocy pod planszą
  runId = 0,          // zmiana wartości = restart wyścigu
  onRequestRestart,   // wywoływane po R / przycisku restartu
}) {
  const canvasRef = useRef(null);
  const [hud, setHud] = useState(null);
  const callbacksRef = useRef({});
  callbacksRef.current = { getInput, pollAction, onSnapshot, onRequestRestart };

  useEffect(() => {
    const track = createTrack();
    const race = createRace(track, { players, laps });
    const renderer = createRenderer(track);
    const ctx = canvasRef.current.getContext('2d');
    clearMarks(renderer);

    if (actionRef) {
      actionRef.current = (slotIdx, action) => applyAction(race, track, slotIdx, action);
    }

    let raf;
    let last = performance.now();
    let hudLast = 0;

    const frame = (now) => {
      const dt = Math.min(1 / 30, (now - last) / 1000);
      last = now;

      const inputs = race.karts.map((_, i) => callbacksRef.current.getInput(i));
      stepRace(race, track, inputs, dt);
      race.karts.forEach((_, i) => {
        const action = callbacksRef.current.pollAction?.(i);
        if (action) applyAction(race, track, i, action);
      });
      drawFrame(renderer, ctx, race);

      if (now - hudLast > 1000 / HUD_HZ) {
        hudLast = now;
        const snapshot = {
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
            item: k.item,
            challenge: k.challenge ? k.challenge.elapsed / k.challenge.window : null,
            shield: k.shield,
          })),
          order: [...race.order],
        };
        setHud(snapshot);
        callbacksRef.current.onSnapshot?.(snapshot);
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    const onKey = (e) => {
      if (e.code === 'KeyR') callbacksRef.current.onRequestRestart?.();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('keydown', onKey);
      if (actionRef) actionRef.current = null;
    };
  }, [players, laps, runId]);

  return (
    <div className="flex flex-col items-center gap-3">
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
              <div className="mt-5 flex flex-wrap justify-center gap-3">
                <button
                  onClick={() => callbacksRef.current.onRequestRestart?.()}
                  className="bg-amber-500 text-black font-bold rounded px-4 py-2 hover:bg-amber-400"
                >
                  Jeszcze raz (R)
                </button>
                {finishedActions}
              </div>
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
                    {place + 1}. {k.name} · L{k.lap}/{hud.laps}
                    {k.shield && ' 🛡️'}
                    {k.item && ' ●'}
                    {k.finished && ' 🏁'}
                  </div>
                );
              })}
            </div>
            <div className="bg-black/60 rounded px-2 py-1 h-fit">{formatTime(hud.time)}</div>
          </div>
        )}
      </div>
      {footer}
    </div>
  );
}

export function formatTime(t) {
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  const cs = Math.floor((t * 100) % 100);
  return `${m}:${String(s).padStart(2, '0')}.${String(cs).padStart(2, '0')}`;
}

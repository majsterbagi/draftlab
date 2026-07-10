// Tryb lokalny (v0.1): 1–2 graczy na jednej klawiaturze. Zostaje jako
// najszybszy sposób testowania fizyki bez telefonów.

import { useEffect, useRef, useState } from 'react';
import RaceScreen from './RaceScreen.jsx';
import TrackPicker from './TrackPicker.jsx';
import { createKeyboard } from './keyboard.js';
import { DEFAULT_TRACK_ID } from '../game/tracks.js';

export default function LocalScreen() {
  const [players, setPlayers] = useState(2);
  const [laps, setLaps] = useState(3);
  const [trackId, setTrackId] = useState(DEFAULT_TRACK_ID);
  const [runId, setRunId] = useState(0);
  const keyboardRef = useRef(null);

  useEffect(() => {
    keyboardRef.current = createKeyboard();
    return () => keyboardRef.current.dispose();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3 p-4 text-neutral-200 font-mono">
      <header className="flex items-baseline gap-4">
        <h1 className="text-2xl font-bold tracking-widest text-amber-300">PIXEL KART GP</h1>
        <span className="text-xs text-neutral-500">tryb lokalny — jedna klawiatura</span>
      </header>

      <RaceScreen
        players={players}
        laps={laps}
        trackId={trackId}
        runId={runId}
        getInput={(i) => keyboardRef.current?.inputFor(i) ?? { steer: 0, throttle: 0, drift: false }}
        pollAction={(i) => (keyboardRef.current?.itemPressed(i) ? 'item' : null)}
        onRequestRestart={() => setRunId((id) => id + 1)}
        footer={
          <footer className="text-xs text-neutral-500 text-center">
            <span className="text-red-400">P1</span>: strzałki + spacja (drift) + Enter (przedmiot) ·{' '}
            <span className="text-sky-400">P2</span>: WASD + lewy Shift (drift) + lewy Ctrl (przedmiot)
          </footer>
        }
      />

      <TrackPicker value={trackId} onChange={setTrackId} />

      <div className="flex flex-wrap items-center gap-4 text-sm">
        <label className="flex items-center gap-2">
          Gracze:
          <select value={players} onChange={(e) => setPlayers(Number(e.target.value))}
            className="bg-neutral-800 rounded px-2 py-1">
            <option value={1}>1</option>
            <option value={2}>2</option>
          </select>
        </label>
        <label className="flex items-center gap-2">
          Okrążenia:
          <select value={laps} onChange={(e) => setLaps(Number(e.target.value))}
            className="bg-neutral-800 rounded px-2 py-1">
            {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </label>
        <button onClick={() => setRunId((id) => id + 1)}
          className="bg-amber-500 text-black font-bold rounded px-3 py-1 hover:bg-amber-400">
          Restart (R)
        </button>
        <a href="#/" className="text-neutral-400 hover:text-amber-300 underline">← tryb imprezowy</a>
      </div>
    </div>
  );
}

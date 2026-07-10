// Ekran hosta (TV/komputer): lobby z QR → wyścig → wyniki → rewanż.

import { useEffect, useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import RaceScreen from './RaceScreen.jsx';
import MenuScreen from './MenuScreen.jsx';
import TrackPicker from './TrackPicker.jsx';
import { isConfigMissing } from '../net/firebase.js';
import {
  createRoom, closeRoom, watchRoom, updateRoom, playerList, MAX_PLAYERS,
} from '../net/lobby.js';
import { createHostRtc } from '../net/webrtc.js';
import { KART_STYLES } from '../game/race.js';
import { DEFAULT_TRACK_ID } from '../game/tracks.js';

const NEUTRAL_INPUT = { steer: 0, throttle: 0, drift: false };

export default function HostApp() {
  const [screen, setScreen] = useState('menu'); // menu | lobby (pokój tworzy się w tle od startu)
  const [code, setCode] = useState(null);
  const [room, setRoom] = useState(null);
  const [laps, setLaps] = useState(3);
  const [trackId, setTrackId] = useState(DEFAULT_TRACK_ID);
  const [runId, setRunId] = useState(0);
  const [racePlayers, setRacePlayers] = useState(null); // skład zamrożony na czas wyścigu

  const inputsRef = useRef(new Map());   // playerId -> input
  const slotToIdRef = useRef([]);        // slotIndex (w wyścigu) -> playerId
  const rtcRef = useRef(null);
  const actionRef = useRef(null);        // (slotIdx, action) => void, ustawiane przez RaceScreen

  // Utworzenie pokoju + warstwa sieci. Efekt jest idempotentny (StrictMode
  // w dev montuje dwukrotnie): każde uruchomienie ma własny pokój i sprzątanie.
  useEffect(() => {
    if (isConfigMissing) return undefined;
    let alive = true;
    let unwatch = () => {};
    let rtc = null;
    let myCode = null;

    (async () => {
      const newCode = await createRoom();
      if (!alive) { closeRoom(newCode); return; }
      myCode = newCode;
      setCode(newCode);
      unwatch = watchRoom(newCode, setRoom);
      rtc = createHostRtc(newCode, {
        onInput: (playerId, msg) => {
          inputsRef.current.set(playerId, {
            steer: clamp(msg.steer ?? msg.s ?? 0),
            throttle: clamp(msg.throttle ?? msg.th ?? 0),
            drift: !!(msg.drift ?? msg.d),
          });
        },
        onAction: (playerId, action) => {
          const slotIdx = slotToIdRef.current.indexOf(playerId);
          if (slotIdx >= 0) actionRef.current?.(slotIdx, action);
        },
      });
      rtcRef.current = rtc;
    })();

    const cleanup = () => {
      alive = false;
      unwatch();
      rtc?.close();
      if (myCode) { closeRoom(myCode); myCode = null; }
    };
    window.addEventListener('beforeunload', cleanup);
    return () => { window.removeEventListener('beforeunload', cleanup); cleanup(); };
  }, []);

  const players = playerList(room?.players);
  const phase = room?.phase ?? 'lobby';

  const startRace = () => {
    if (players.length === 0) return;
    // Zamrażamy skład: slot w wyścigu = kolejność listy (wg slotu lobby).
    slotToIdRef.current = players.map((p) => p.id);
    setRacePlayers(players.map((p, i) => ({
      name: `${p.avatar} ${p.nick}`,
      color: KART_STYLES[p.slot % KART_STYLES.length].color,
    })));
    setRunId((id) => id + 1);
    updateRoom(code, { phase: 'racing', laps, trackId });
  };

  const backToLobby = () => {
    setRacePlayers(null);
    updateRoom(code, { phase: 'lobby' });
  };

  // Stan wyścigu → pady (pozycja, okrążenie, faza).
  const onSnapshot = (hud) => {
    if (!rtcRef.current) return;
    const states = {};
    slotToIdRef.current.forEach((playerId, slotIdx) => {
      const place = hud.order.indexOf(slotIdx);
      const kart = hud.karts[slotIdx];
      states[playerId] = {
        t: 's',
        phase: hud.phase,
        place: place + 1,
        total: hud.karts.length,
        lap: kart.lap,
        laps: hud.laps,
        speed: kart.speed,
        finished: kart.finished,
        item: kart.item,
        challenge: kart.challenge,
        shield: kart.shield,
      };
    });
    rtcRef.current.sendState(states);
  };

  if (isConfigMissing) {
    return (
      <Shell>
        <p className="text-red-400 max-w-md text-center">
          Brak konfiguracji Firebase (src/firebase-config.js). Dostępny jest tylko{' '}
          <a href="#/local" className="underline text-amber-300">tryb lokalny</a>.
        </p>
      </Shell>
    );
  }

  if (screen === 'menu') {
    return <MenuScreen onPlay={() => setScreen('lobby')} />;
  }

  if (phase === 'racing' && racePlayers) {
    return (
      <Shell subtitle={`pokój ${code}`}>
        <RaceScreen
          players={racePlayers}
          laps={room?.laps ?? laps}
          trackId={room?.trackId ?? trackId}
          runId={runId}
          getInput={(slotIdx) =>
            inputsRef.current.get(slotToIdRef.current[slotIdx]) ?? NEUTRAL_INPUT}
          actionRef={actionRef}
          onSnapshot={onSnapshot}
          onRequestRestart={() => setRunId((id) => id + 1)}
          finishedActions={
            <button onClick={backToLobby}
              className="bg-neutral-700 text-neutral-100 font-bold rounded px-4 py-2 hover:bg-neutral-600">
              Lobby
            </button>
          }
          footer={
            <footer className="text-xs text-neutral-500">
              Pady połączone przez telefon · R — restart wyścigu
            </footer>
          }
        />
      </Shell>
    );
  }

  const joinUrl = code
    ? `${window.location.origin}${window.location.pathname}#/pad/${code}`
    : '';

  return (
    <Shell subtitle="tryb imprezowy">
      <div className="flex flex-col md:flex-row items-center gap-8">
        <div className="bg-white p-4 rounded-xl">
          {code
            ? <QRCodeSVG value={joinUrl} size={220} />
            : <div className="w-[220px] h-[220px] flex items-center justify-center text-black">…</div>}
        </div>
        <div className="flex flex-col gap-4 items-center md:items-start">
          <div>
            <p className="text-neutral-400 text-sm">Zeskanuj telefonem albo wejdź na adres i podaj kod:</p>
            <p className="text-4xl font-bold tracking-[0.3em] text-amber-300 mt-1">{code ?? '····'}</p>
          </div>

          <div className="space-y-1 min-h-[7rem]">
            {players.map((p) => (
              <div key={p.id} className="flex items-center gap-2 text-lg"
                style={{ color: KART_STYLES[p.slot % KART_STYLES.length].color }}>
                <span>{p.avatar}</span>
                <span className="font-bold">{p.nick}</span>
                {!p.connected && <span className="text-xs text-neutral-500">(rozłączony)</span>}
              </div>
            ))}
            {players.length === 0 && (
              <p className="text-neutral-600 text-sm">Czekam na graczy… (max {MAX_PLAYERS})</p>
            )}
          </div>

          <div>
            <p className="text-xs text-neutral-500 mb-1">Trasa:</p>
            <TrackPicker value={trackId} onChange={setTrackId} />
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm">
              Okrążenia:
              <select value={laps} onChange={(e) => setLaps(Number(e.target.value))}
                className="bg-neutral-800 rounded px-2 py-1">
                {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </label>
            <button
              onClick={startRace}
              disabled={players.length === 0}
              className="bg-amber-500 text-black font-bold rounded px-5 py-2 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              START ({players.length}/{MAX_PLAYERS})
            </button>
          </div>
          <a href="#/local" className="text-xs text-neutral-500 hover:text-amber-300 underline">
            tryb lokalny (klawiatura, bez telefonów)
          </a>
        </div>
      </div>
    </Shell>
  );
}

function Shell({ subtitle, children }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-4 text-neutral-200 font-mono">
      <header className="flex items-baseline gap-4">
        <h1 className="text-2xl font-bold tracking-widest text-amber-300">PIXEL KART GP</h1>
        {subtitle && <span className="text-xs text-neutral-500">{subtitle}</span>}
      </header>
      {children}
    </div>
  );
}

function clamp(v) {
  return Math.max(-1, Math.min(1, Number(v) || 0));
}

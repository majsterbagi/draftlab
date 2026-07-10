// Pad na telefonie: dołączenie do pokoju → sterowanie kartem.
// Input idzie przez WebRTC DataChannel, awaryjnie przez RTDB.

import { useEffect, useRef, useState } from 'react';
import { isConfigMissing } from '../net/firebase.js';
import { joinRoom } from '../net/lobby.js';
import { connectPad } from '../net/webrtc.js';
import { KART_STYLES } from '../game/race.js';
import { ITEM_TYPES } from '../game/items.js';

const AVATARS = ['🏎️', '🚗', '🛺', '🚜', '🦊', '🐸', '👾', '🤖'];
const SEND_HZ = 30;

export default function ControllerApp({ code }) {
  const [joined, setJoined] = useState(null); // { playerId, slot }
  const [error, setError] = useState(null);

  if (isConfigMissing) {
    return <PadShell><p className="text-red-400 p-6 text-center">Brak konfiguracji Firebase.</p></PadShell>;
  }
  if (!joined) {
    return (
      <JoinScreen
        code={code}
        error={error}
        onJoin={async (nick, avatar) => {
          try {
            setError(null);
            setJoined(await joinRoom(code, { nick, avatar }));
          } catch (e) {
            setError(e.message === 'FULL' ? 'Pokój jest pełny (max 4 graczy).' : 'Nie znaleziono pokoju — sprawdź kod.');
          }
        }}
      />
    );
  }
  return <PadScreen code={code} playerId={joined.playerId} slot={joined.slot} />;
}

function JoinScreen({ code, error, onJoin }) {
  const [nick, setNick] = useState(localStorage.getItem('pkgp_nick') || '');
  const [avatar, setAvatar] = useState(AVATARS[0]);
  return (
    <PadShell>
      <div className="flex flex-col gap-4 p-6 max-w-sm mx-auto w-full">
        <p className="text-neutral-400 text-sm">Pokój: <span className="text-amber-300 font-bold tracking-widest">{code}</span></p>
        <input
          value={nick}
          onChange={(e) => setNick(e.target.value)}
          maxLength={12}
          placeholder="Twój nick"
          className="bg-neutral-800 rounded-lg px-4 py-3 text-lg outline-none focus:ring-2 ring-amber-400"
        />
        <div className="grid grid-cols-4 gap-2">
          {AVATARS.map((a) => (
            <button key={a} onClick={() => setAvatar(a)}
              className={`text-3xl py-2 rounded-lg ${avatar === a ? 'bg-amber-500/30 ring-2 ring-amber-400' : 'bg-neutral-800'}`}>
              {a}
            </button>
          ))}
        </div>
        <button
          onClick={() => { localStorage.setItem('pkgp_nick', nick); onJoin(nick, avatar); }}
          className="bg-amber-500 text-black font-bold rounded-lg py-4 text-xl active:bg-amber-400"
        >
          WSKAKUJĘ 🏁
        </button>
        {error && <p className="text-red-400 text-sm text-center">{error}</p>}
      </div>
    </PadShell>
  );
}

function PadScreen({ code, playerId, slot }) {
  const [mode, setMode] = useState('connecting'); // status łącza
  const [hostState, setHostState] = useState(null);
  const [gyro, setGyro] = useState(false);
  const inputRef = useRef({ steer: 0, throttle: 0, drift: false });
  const gyroSteerRef = useRef(0);
  const padRef = useRef(null);
  const color = KART_STYLES[slot % KART_STYLES.length].color;

  useEffect(() => {
    const pad = connectPad(code, playerId, {
      onStatus: setMode,
      onHostMessage: (msg) => { if (msg.t === 's') setHostState(msg); },
    });
    padRef.current = pad;
    const timer = setInterval(() => {
      const inp = { ...inputRef.current };
      if (gyroSteerRef.current !== 0 && inp.steer === 0) inp.steer = gyroSteerRef.current;
      pad.sendInput(inp);
    }, 1000 / SEND_HZ);

    // Blokada wygaszania ekranu (jeśli przeglądarka pozwala).
    let wakeLock;
    navigator.wakeLock?.request('screen').then((wl) => { wakeLock = wl; }).catch(() => {});

    return () => { clearInterval(timer); wakeLock?.release?.(); pad.close(); };
  }, [code, playerId]);

  // Żyroskop: telefon trzymany poziomo jak kierownica.
  useEffect(() => {
    if (!gyro) { gyroSteerRef.current = 0; return undefined; }
    const onOrient = (e) => {
      // W orientacji poziomej przechył "kierownicy" to beta (±180).
      const tilt = e.beta ?? 0;
      gyroSteerRef.current = Math.max(-1, Math.min(1, tilt / 28));
    };
    window.addEventListener('deviceorientation', onOrient);
    return () => window.removeEventListener('deviceorientation', onOrient);
  }, [gyro]);

  const enableGyro = async () => {
    try {
      if (typeof DeviceOrientationEvent !== 'undefined' && DeviceOrientationEvent.requestPermission) {
        const res = await DeviceOrientationEvent.requestPermission(); // iOS
        if (res !== 'granted') return;
      }
      setGyro(true);
    } catch { /* zostajemy przy przyciskach */ }
  };

  const hold = (field, value) => ({
    onPointerDown: (e) => {
      e.preventDefault();
      try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* np. zdarzenia syntetyczne */ }
      inputRef.current[field] = value;
    },
    onPointerUp: () => { inputRef.current[field] = field === 'drift' ? false : 0; },
    onPointerCancel: () => { inputRef.current[field] = field === 'drift' ? false : 0; },
  });

  const racing = hostState?.phase === 'racing' || hostState?.phase === 'countdown';
  const item = hostState?.item;
  // Ułamek 0..1 postępu okna wyzwania (null, gdy żadne nie trwa) — liczony na hoście.
  const challengeFraction = typeof hostState?.challenge === 'number' ? hostState.challenge : null;

  const sendItemAction = () => padRef.current?.sendAction('item');

  return (
    <PadShell color={color}>
      {/* Pasek statusu */}
      <div className="flex justify-between items-center px-3 py-2 text-xs text-neutral-400">
        <span style={{ color }}>■ slot {slot + 1}</span>
        <span>
          {hostState && racing && `P${hostState.place}/${hostState.total} · L${hostState.lap}/${hostState.laps}`}
          {hostState?.phase === 'finished' && 'META 🏁'}
          {!hostState && 'lobby — czekaj na start'}
        </span>
        <span title="łącze">{mode === 'webrtc' ? '⚡ P2P' : mode === 'fallback' ? '☁️ wolne łącze' : '…'}</span>
      </div>

      {/* Pad */}
      <div className="flex-1 flex flex-col gap-3 p-3 select-none" style={{ touchAction: 'none' }}>
        <div className="flex-1 grid grid-cols-2 gap-3">
          <div className="grid grid-rows-2 gap-3">
            {gyro ? (
              <div className="row-span-2 rounded-2xl bg-neutral-800/60 flex flex-col items-center justify-center text-neutral-400 text-sm">
                <span className="text-3xl mb-2">🎛️</span>
                przechylaj telefon
                <button onClick={() => setGyro(false)} className="mt-3 text-xs underline">wróć do przycisków</button>
              </div>
            ) : (
              <>
                <PadButton label="◀" {...hold('steer', -1)} />
                <PadButton label="▶" {...hold('steer', 1)} />
              </>
            )}
          </div>
          <div className="grid grid-rows-3 gap-3">
            <PadButton label="GAZ" accent {...hold('throttle', 1)} rows={2} />
            <PadButton label="DRIFT" {...hold('drift', true)} />
          </div>
        </div>

        <ItemButton item={item} challengeFraction={challengeFraction} onUse={sendItemAction} />
      </div>

      <div className="px-3 pb-3 flex justify-between text-xs text-neutral-500">
        {!gyro
          ? <button onClick={enableGyro} className="underline">🎛️ tryb żyroskopu</button>
          : <span />}
        <span>Pixel Kart GP</span>
      </div>
    </PadShell>
  );
}

function ItemButton({ item, challengeFraction, onUse }) {
  // Trzy stany: pusto (czekamy na ładowanie) / wyzwanie "ŁAP!" (pasek czasu na tapnięcie)
  // / trzymany przedmiot gotowy do użycia.
  if (challengeFraction != null) {
    const remaining = Math.max(0, 1 - challengeFraction);
    return (
      <button
        onClick={onUse}
        className="relative h-16 rounded-2xl bg-amber-500 text-black font-bold text-lg overflow-hidden active:scale-95 transition-transform"
        style={{ touchAction: 'none' }}
      >
        <span className="absolute inset-y-0 left-0 bg-amber-300/70" style={{ width: `${remaining * 100}%` }} />
        <span className="relative">ŁAP! ❓</span>
      </button>
    );
  }
  if (item) {
    const meta = ITEM_TYPES[item];
    return (
      <button
        onClick={onUse}
        className="h-16 rounded-2xl font-bold text-lg active:scale-95 transition-transform flex items-center justify-center gap-2"
        style={{ backgroundColor: meta.color, color: '#111', touchAction: 'none' }}
      >
        <span className="text-2xl">{meta.icon}</span> UŻYJ {meta.label}
      </button>
    );
  }
  return (
    <div className="h-16 rounded-2xl bg-neutral-900 text-neutral-600 text-sm flex items-center justify-center">
      brak przedmiotu — czekaj na "ŁAP!"
    </div>
  );
}

function PadButton({ label, accent, rows, ...handlers }) {
  return (
    <button
      {...handlers}
      className={`rounded-2xl text-2xl font-bold active:scale-95 transition-transform
        ${rows === 2 ? 'row-span-2' : ''}
        ${accent ? 'bg-amber-500 text-black active:bg-amber-400' : 'bg-neutral-800 text-neutral-200 active:bg-neutral-700'}`}
      style={{ touchAction: 'none' }}
    >
      {label}
    </button>
  );
}

function PadShell({ color, children }) {
  return (
    <div className="h-[100dvh] flex flex-col bg-neutral-950 text-neutral-200 font-mono overflow-hidden"
      style={color ? { boxShadow: `inset 0 4px 0 ${color}` } : undefined}>
      <h1 className="text-center text-sm font-bold tracking-widest text-amber-300 pt-2">PIXEL KART GP</h1>
      {children}
    </div>
  );
}

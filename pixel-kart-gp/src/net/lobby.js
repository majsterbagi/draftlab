// Lobby na Firebase RTDB — wzorzec z NEON QUIZ: pokoje pod rooms/{kod}.
// Pokoje Pixel Kart GP mają pole app: 'pixelkart', żeby nie mieszać się z quizem.

import {
  ref, get, set, update, remove, onValue, onDisconnect, push,
} from 'firebase/database';
import { db } from './firebase.js';

export const MAX_PLAYERS = 4;

const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUWXYZ23456789'; // bez O/0, I/1

export function randomCode(len = 4) {
  let s = '';
  for (let i = 0; i < len; i++) s += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  return s;
}

export const roomRef = (code, path = '') =>
  ref(db, `rooms/${code}${path ? '/' + path : ''}`);

export async function createRoom() {
  let code = randomCode();
  for (let i = 0; i < 5; i++) {
    const snap = await get(roomRef(code));
    if (!snap.exists()) break;
    const createdAt = snap.child('createdAt').val() || 0;
    if (Date.now() - createdAt > 24 * 3600 * 1000) {
      await remove(roomRef(code));
      break;
    }
    code = randomCode();
  }
  await set(roomRef(code), {
    app: 'pixelkart',
    createdAt: Date.now(),
    phase: 'lobby', // lobby | racing | finished
    laps: 3,
  });
  return code;
}

export async function closeRoom(code) {
  await remove(roomRef(code));
}

export async function joinRoom(code, { nick, avatar }) {
  const snap = await get(roomRef(code));
  if (!snap.exists() || snap.child('app').val() !== 'pixelkart') throw new Error('NO_ROOM');

  const players = snap.child('players').val() || {};

  // Powrót rozłączonego gracza — zachowuje slot i kolor.
  const savedId = localStorage.getItem(`pkgp_player_${code}`);
  if (savedId && players[savedId]) {
    await update(roomRef(code, `players/${savedId}`), { connected: true });
    onDisconnect(roomRef(code, `players/${savedId}/connected`)).set(false);
    return { playerId: savedId, slot: players[savedId].slot };
  }

  const taken = new Set(Object.values(players).map((p) => p.slot));
  if (taken.size >= MAX_PLAYERS) throw new Error('FULL');
  let slot = 0;
  while (taken.has(slot)) slot++;

  const pRef = push(roomRef(code, 'players'));
  await set(pRef, {
    nick: nick.trim().slice(0, 12) || `Gracz ${slot + 1}`,
    avatar: avatar || '🏎️',
    slot,
    connected: true,
    joinedAt: Date.now(),
  });
  localStorage.setItem(`pkgp_player_${code}`, pRef.key);
  onDisconnect(roomRef(code, `players/${pRef.key}/connected`)).set(false);
  return { playerId: pRef.key, slot };
}

// Subskrypcja całego pokoju (lobby + faza). Zwraca funkcję odpinającą.
export function watchRoom(code, callback) {
  return onValue(roomRef(code), (snap) => callback(snap.exists() ? snap.val() : null));
}

export async function updateRoom(code, fields) {
  await update(roomRef(code), fields);
}

// Posortowana lista graczy z obiektu players (wg slotu).
export function playerList(players) {
  return Object.entries(players || {})
    .map(([id, p]) => ({ id, ...p }))
    .sort((a, b) => a.slot - b.slot);
}

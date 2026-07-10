// Stan i przebieg wyścigu: odliczanie, checkpointy, okrążenia, pozycje.

import { createKart, stepKart } from './kart.js';
import { projectToTrack, signedDist, forwardDist, startPositions } from './track.js';

export const WORLD = { width: 480, height: 270 };

const COUNTDOWN = 3;
const CP_WINDOW = 16; // px wzdłuż toru, w których zalicza się checkpoint

export const KART_STYLES = [
  { color: '#ff5555', name: 'Gracz 1' },
  { color: '#55aaff', name: 'Gracz 2' },
  { color: '#ffcc44', name: 'Gracz 3' },
  { color: '#66dd77', name: 'Gracz 4' },
];

// players: liczba (style domyślne) lub tablica [{ name, color }].
export function createRace(track, { players = 2, laps = 3 } = {}) {
  const configs = Array.isArray(players)
    ? players.map((p, i) => ({ ...KART_STYLES[i], ...p }))
    : KART_STYLES.slice(0, players);
  const grid = startPositions(track, configs.length);
  const karts = grid.map((slot, i) => createKart({ ...slot, ...configs[i] }));
  karts.forEach((k) => {
    const proj = projectToTrack(track, k.x, k.y);
    k.s = proj.s;
  });
  return {
    phase: 'countdown', // countdown | racing | finished
    countdown: COUNTDOWN,
    time: 0,
    laps,
    karts,
    order: karts.map((_, i) => i), // indeksy posortowane wg pozycji w wyścigu
  };
}

export function stepRace(race, track, inputs, dt) {
  if (race.phase === 'countdown') {
    race.countdown -= dt;
    if (race.countdown <= 0) race.phase = 'racing';
    return;
  }
  if (race.phase === 'racing') race.time += dt;

  race.karts.forEach((kart, i) => {
    const input = kart.finished
      ? { steer: 0, throttle: -0.4, drift: false } // po mecie kart dohamowuje
      : inputs[i] || { steer: 0, throttle: 0, drift: false };
    stepKart(kart, input, dt);

    // Granice świata.
    kart.x = Math.max(4, Math.min(WORLD.width - 4, kart.x));
    kart.y = Math.max(4, Math.min(WORLD.height - 4, kart.y));

    // Postęp na torze.
    const proj = projectToTrack(track, kart.x, kart.y);
    kart.s = proj.s;
    kart.offTrack = proj.dist > track.width / 2;

    // Checkpoint zalicza się tylko na asfalcie (lub tuż przy nim) — jazda
    // na przełaj przez trawę nie może przesuwać postępu wyścigu.
    const nearTrack = proj.dist < track.width * 0.75;
    if (!kart.finished && nearTrack) {
      const target = track.cpS[kart.nextCp];
      if (Math.abs(signedDist(track, kart.s, target)) < CP_WINDOW) {
        if (kart.nextCp === 0) {
          kart.lap += 1;
          if (kart.lap > race.laps) {
            kart.finished = true;
            kart.finishTime = race.time;
          }
        }
        kart.nextCp = (kart.nextCp + 1) % track.checkpoints;
      }
    }
  });

  // Ranking: meta > okrążenie > checkpoint > dystans do następnego checkpointu.
  const score = (k) => {
    if (k.finished) return 1e9 - k.finishTime;
    const cpProgress = k.lap * track.checkpoints + (k.nextCp === 0 ? track.checkpoints : k.nextCp);
    return cpProgress * 1e4 - forwardDist(track, k.s, track.cpS[k.nextCp]);
  };
  race.order = race.karts
    .map((k, i) => [score(k), i])
    .sort((a, b) => b[0] - a[0])
    .map(([, i]) => i);

  if (race.phase === 'racing' && race.karts.every((k) => k.finished)) {
    race.phase = 'finished';
  }
}

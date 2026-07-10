// Stan i przebieg wyścigu: odliczanie, checkpointy, okrążenia, pozycje,
// power-upy (ładowanie przez mini-wyzwanie, pociski, banany, tarcza).

import { createKart, stepKart } from './kart.js';
import { projectToTrack, signedDist, forwardDist, startPositions } from './track.js';
import { rollItem, chargeInterval, CHALLENGE_WINDOW } from './items.js';

export const WORLD = { width: 480, height: 270 };

const COUNTDOWN = 3;
const CP_WINDOW = 16; // px wzdłuż toru, w których zalicza się checkpoint
const SPIN_DURATION = 0.9;
const ITEM_BOOST_DURATION = 1.1;
const SHELL_SPEED = 210;   // px/s
const SHELL_TTL = 3;
const SHELL_RADIUS = 6;
const BANANA_TTL = 22;
const BANANA_RADIUS = 6;
const HAZARD_OWNER_IMMUNITY = 0.6; // s — właściciel nie trafia sam siebie tuż po rzucie

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
    projectiles: [], // pociski w locie
    hazards: [],     // banany na torze
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
    if (kart.spinTime > 0) {
      kart.spinTime = Math.max(0, kart.spinTime - dt);
    }
    const spinning = kart.spinTime > 0;
    const input = kart.finished
      ? { steer: 0, throttle: -0.4, drift: false } // po mecie kart dohamowuje
      : spinning
        ? { steer: 0, throttle: 0, drift: false }  // trafiony kart traci kontrolę
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

  if (race.phase === 'racing') {
    stepItems(race, dt);
    stepProjectiles(race, track, dt);
    stepHazards(race, dt);
  }

  if (race.phase === 'racing' && race.karts.every((k) => k.finished)) {
    race.phase = 'finished';
  }
}

// --- Power-upy: ładowanie mini-wyzwania i jego wygaśnięcie ---

function stepItems(race, dt) {
  const n = race.karts.length;
  race.karts.forEach((kart, i) => {
    if (kart.finished) return;

    if (kart.challenge) {
      kart.challenge.elapsed += dt;
      if (kart.challenge.elapsed >= kart.challenge.window) {
        kart.challenge = null; // spudłowano — trzeba naładować ponownie
      }
      return;
    }
    if (kart.item) return; // trzyma już przedmiot — nowe wyzwanie dopiero po użyciu

    const rank = n > 1 ? race.order.indexOf(i) / (n - 1) : 0;
    kart.itemCharge += dt;
    if (kart.itemCharge >= chargeInterval(rank)) {
      kart.itemCharge = 0;
      kart.challenge = { elapsed: 0, window: CHALLENGE_WINDOW };
    }
  });
}

// Wywoływane z warstwy sieci/UI, gdy przyjdzie akcja gracza (host autorytatywny).
// Jeden generyczny przycisk "item": jeśli trwa wyzwanie — łapie przedmiot,
// jeśli kart go trzyma — zużywa go. Decyzja zapada tu, po stronie hosta,
// żeby opóźnienia sieci nie rozjeżdżały znaczenia przycisku na padzie.
export function applyAction(race, track, kartIndex, action) {
  const kart = race.karts[kartIndex];
  if (!kart || kart.finished || race.phase !== 'racing' || action !== 'item') return;

  if (kart.challenge) {
    const n = race.karts.length;
    const rank = n > 1 ? race.order.indexOf(kartIndex) / (n - 1) : 0;
    kart.item = rollItem(rank);
    kart.challenge = null;
    return;
  }

  if (kart.item) {
    const type = kart.item;
    kart.item = null;
    if (type === 'boost') {
      kart.boostTime = Math.max(kart.boostTime, ITEM_BOOST_DURATION);
    } else if (type === 'shield') {
      kart.shield = true;
    } else if (type === 'shell') {
      race.projectiles.push({
        ownerIdx: kartIndex,
        x: kart.x + Math.cos(kart.angle) * 8,
        y: kart.y + Math.sin(kart.angle) * 8,
        vx: Math.cos(kart.angle) * SHELL_SPEED,
        vy: Math.sin(kart.angle) * SHELL_SPEED,
        ttl: SHELL_TTL,
        age: 0,
      });
    } else if (type === 'banana') {
      race.hazards.push({
        ownerIdx: kartIndex,
        x: kart.x - Math.cos(kart.angle) * 10,
        y: kart.y - Math.sin(kart.angle) * 10,
        ttl: BANANA_TTL,
        age: 0,
      });
    }
  }
}

function hitKart(kart) {
  if (kart.shield) {
    kart.shield = false;
    return;
  }
  kart.spinTime = SPIN_DURATION;
  kart.vx = 0;
  kart.vy = 0;
}

function stepProjectiles(race, track, dt) {
  race.projectiles = race.projectiles.filter((p) => {
    p.age += dt;
    if (p.age > p.ttl) return false;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    if (p.x < 0 || p.x > WORLD.width || p.y < 0 || p.y > WORLD.height) return false;

    for (let i = 0; i < race.karts.length; i++) {
      if (i === p.ownerIdx && p.age < HAZARD_OWNER_IMMUNITY) continue;
      const kart = race.karts[i];
      if (kart.finished) continue;
      if (Math.hypot(kart.x - p.x, kart.y - p.y) < SHELL_RADIUS) {
        hitKart(kart);
        return false; // pocisk znika po trafieniu
      }
    }
    return true;
  });
}

function stepHazards(race, dt) {
  race.hazards = race.hazards.filter((h) => {
    h.age += dt;
    if (h.age > h.ttl) return false;

    for (let i = 0; i < race.karts.length; i++) {
      if (i === h.ownerIdx && h.age < HAZARD_OWNER_IMMUNITY) continue;
      const kart = race.karts[i];
      if (kart.finished || kart.spinTime > 0) continue;
      if (Math.hypot(kart.x - h.x, kart.y - h.y) < BANANA_RADIUS) {
        hitKart(kart);
        return false; // banan znika po najechaniu
      }
    }
    return true;
  });
}

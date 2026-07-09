// Arcade'owa fizyka karta: prędkość jako wektor rozkładany na składową
// wzdłużną (napęd, opór) i boczną (przyczepność / poślizg przy drifcie).

export const KART_PHYSICS = {
  accel: 150,        // przyspieszenie px/s^2
  brake: 300,
  reverseMax: 55,
  maxSpeed: 155,     // px/s
  boostMax: 215,
  boostAccel: 320,
  turnRate: 3.0,     // rad/s przy pełnym skręcie
  grip: 9.0,         // tłumienie prędkości bocznej (1/s)
  driftGrip: 2.4,
  drag: 0.55,        // opór toczenia (1/s)
  grassDrag: 2.6,
  grassMaxFactor: 0.45,
  driftMinSpeed: 70,     // poniżej tej prędkości drift się nie włącza
  driftBoostAfter: 0.7,  // sekundy driftu potrzebne na mini-boost
  boostDuration: 0.9,
};

export function createKart({ x, y, angle, color, name }) {
  return {
    x, y, angle, color, name,
    vx: 0, vy: 0,
    drifting: false, driftTime: 0, boostTime: 0,
    // stan wyścigu (aktualizowany przez race.js)
    s: 0, offTrack: false, lap: 1, nextCp: 1, finished: false, finishTime: 0,
  };
}

export function kartSpeed(kart) {
  return Math.hypot(kart.vx, kart.vy);
}

// input: { steer: -1..1, throttle: -1..1, drift: bool }
export function stepKart(kart, input, dt) {
  const P = KART_PHYSICS;
  const fx = Math.cos(kart.angle);
  const fy = Math.sin(kart.angle);
  let vFwd = kart.vx * fx + kart.vy * fy;
  let vLat = -kart.vx * fy + kart.vy * fx;

  // Skręt skaluje się z prędkością (stojąc nie da się obracać),
  // przy cofaniu kierunek skrętu naturalnie się odwraca przez znak vFwd.
  const turnScale = Math.max(-1, Math.min(1, vFwd / 55));
  const driftSteerBonus = kart.drifting ? 1.35 : 1;
  kart.angle += input.steer * P.turnRate * turnScale * driftSteerBonus * dt;

  // Drift: trzymany przycisk przy odpowiedniej prędkości.
  const wasDrifting = kart.drifting;
  kart.drifting = !!input.drift && vFwd > P.driftMinSpeed;
  if (kart.drifting) {
    kart.driftTime += dt;
  } else {
    if (wasDrifting && kart.driftTime >= P.driftBoostAfter) {
      kart.boostTime = P.boostDuration; // mini-boost za udany ślizg
    }
    kart.driftTime = 0;
  }
  if (kart.boostTime > 0) kart.boostTime = Math.max(0, kart.boostTime - dt);

  // Napęd / hamowanie.
  const boosting = kart.boostTime > 0;
  if (boosting) {
    vFwd += P.boostAccel * dt;
  } else if (input.throttle > 0) {
    vFwd += input.throttle * P.accel * dt;
  } else if (input.throttle < 0) {
    vFwd += input.throttle * (vFwd > 5 ? P.brake : P.accel) * dt;
  }

  // Opory: trawa mocno spowalnia i obniża limit prędkości.
  const drag = kart.offTrack ? P.grassDrag : P.drag;
  vFwd -= vFwd * Math.min(1, drag * dt);
  const grip = kart.drifting ? P.driftGrip : P.grip;
  vLat -= vLat * Math.min(1, grip * dt);

  let maxSpeed = boosting ? P.boostMax : P.maxSpeed;
  if (kart.offTrack && !boosting) maxSpeed *= P.grassMaxFactor;
  vFwd = Math.max(-P.reverseMax, Math.min(maxSpeed, vFwd));

  kart.vx = fx * vFwd - fy * vLat;
  kart.vy = fy * vFwd + fx * vLat;
  kart.x += kart.vx * dt;
  kart.y += kart.vy * dt;
}

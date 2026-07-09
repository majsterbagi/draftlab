// Tor jako zamknięta pętla: punkty kontrolne wygładzone krzywą Catmull-Rom.
// Wszystkie jednostki w pikselach świata (świat = 480x270).

const CONTROL_POINTS = [
  [70, 60], [170, 42], [300, 52], [408, 62], [444, 135],
  [406, 208], [304, 228], [244, 168], [186, 226], [82, 210], [38, 135],
];

const TRACK_WIDTH = 30; // pełna szerokość asfaltu
const CHECKPOINTS = 12;
const SAMPLES_PER_SEGMENT = 12;

function catmullRom(p0, p1, p2, p3, t) {
  const t2 = t * t;
  const t3 = t2 * t;
  return [
    0.5 * (2 * p1[0] + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3),
    0.5 * (2 * p1[1] + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3),
  ];
}

export function createTrack() {
  const pts = [];
  const n = CONTROL_POINTS.length;
  for (let i = 0; i < n; i++) {
    const p0 = CONTROL_POINTS[(i - 1 + n) % n];
    const p1 = CONTROL_POINTS[i];
    const p2 = CONTROL_POINTS[(i + 1) % n];
    const p3 = CONTROL_POINTS[(i + 2) % n];
    for (let t = 0; t < SAMPLES_PER_SEGMENT; t++) {
      pts.push(catmullRom(p0, p1, p2, p3, t / SAMPLES_PER_SEGMENT));
    }
  }

  // Skumulowane długości łuku dla każdego punktu polilinii.
  const cum = [0];
  for (let i = 1; i <= pts.length; i++) {
    const a = pts[i - 1];
    const b = pts[i % pts.length];
    cum.push(cum[i - 1] + Math.hypot(b[0] - a[0], b[1] - a[1]));
  }
  const length = cum[pts.length];

  const cpS = [];
  for (let i = 0; i < CHECKPOINTS; i++) cpS.push((length * i) / CHECKPOINTS);

  return { pts, cum, length, width: TRACK_WIDTH, cpS, checkpoints: CHECKPOINTS };
}

// Rzut punktu (x, y) na polilinię toru.
// Zwraca { dist, s }: odległość od osi toru i pozycję łukową wzdłuż pętli.
export function projectToTrack(track, x, y) {
  const { pts, cum } = track;
  let best = { dist: Infinity, s: 0 };
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % pts.length];
    const abx = b[0] - a[0];
    const aby = b[1] - a[1];
    const len2 = abx * abx + aby * aby || 1e-9;
    let t = ((x - a[0]) * abx + (y - a[1]) * aby) / len2;
    t = Math.max(0, Math.min(1, t));
    const px = a[0] + abx * t;
    const py = a[1] + aby * t;
    const dist = Math.hypot(x - px, y - py);
    if (dist < best.dist) {
      best = { dist, s: cum[i] + Math.sqrt(len2) * t };
    }
  }
  return best;
}

// Punkt i kierunek (styczna) toru dla pozycji łukowej s.
export function pointAt(track, s) {
  const { pts, cum, length } = track;
  s = ((s % length) + length) % length;
  let lo = 0;
  let hi = pts.length - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (cum[mid] <= s) lo = mid;
    else hi = mid - 1;
  }
  const a = pts[lo];
  const b = pts[(lo + 1) % pts.length];
  const segLen = cum[lo + 1] - cum[lo] || 1e-9;
  const t = (s - cum[lo]) / segLen;
  const x = a[0] + (b[0] - a[0]) * t;
  const y = a[1] + (b[1] - a[1]) * t;
  const angle = Math.atan2(b[1] - a[1], b[0] - a[0]);
  return { x, y, angle };
}

// Dystans "do przodu" po pętli od a do b (0..length).
export function forwardDist(track, a, b) {
  const L = track.length;
  return (((b - a) % L) + L) % L;
}

// Dystans z uwzględnieniem kierunku, w zakresie (-L/2, L/2].
export function signedDist(track, a, b) {
  const L = track.length;
  let d = forwardDist(track, a, b);
  if (d > L / 2) d -= L;
  return d;
}

// Pola startowe: siatka 2x2 za linią startu.
export function startPositions(track, count) {
  const out = [];
  for (let i = 0; i < count; i++) {
    const row = Math.floor(i / 2);
    const side = i % 2 === 0 ? -1 : 1;
    const p = pointAt(track, track.length - 14 - row * 14);
    const nx = -Math.sin(p.angle);
    const ny = Math.cos(p.angle);
    out.push({ x: p.x + nx * side * 7, y: p.y + ny * side * 7, angle: p.angle });
  }
  return out;
}

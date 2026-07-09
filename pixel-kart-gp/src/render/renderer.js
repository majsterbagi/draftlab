// Renderowanie na canvasie 480x270, skalowanym w CSS (image-rendering: pixelated).
// Tor jest rysowany raz do cache'a; ślady driftu na osobnej warstwie.

import { WORLD } from '../game/race.js';
import { pointAt, forwardDist } from '../game/track.js';
import { kartSpeed } from '../game/kart.js';

export function createRenderer(track) {
  const trackLayer = renderTrackLayer(track);
  const marksLayer = document.createElement('canvas');
  marksLayer.width = WORLD.width;
  marksLayer.height = WORLD.height;
  return { track, trackLayer, marksLayer };
}

export function clearMarks(renderer) {
  renderer.marksLayer.getContext('2d').clearRect(0, 0, WORLD.width, WORLD.height);
}

function renderTrackLayer(track) {
  const c = document.createElement('canvas');
  c.width = WORLD.width;
  c.height = WORLD.height;
  const ctx = c.getContext('2d');

  // Trawa: dwutonowa szachownica.
  ctx.fillStyle = '#3f7d34';
  ctx.fillRect(0, 0, c.width, c.height);
  ctx.fillStyle = '#468a3a';
  const T = 16;
  for (let y = 0; y < c.height / T; y++) {
    for (let x = 0; x < c.width / T; x++) {
      if ((x + y) % 2 === 0) ctx.fillRect(x * T, y * T, T, T);
    }
  }

  // Asfalt z krawężnikiem (czerwono-biała obwódka przez trzy pociągnięcia).
  const path = new Path2D();
  track.pts.forEach(([x, y], i) => (i === 0 ? path.moveTo(x, y) : path.lineTo(x, y)));
  path.closePath();
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.strokeStyle = '#c23b2a';
  ctx.lineWidth = track.width + 5;
  ctx.stroke(path);
  ctx.strokeStyle = '#e8e6da';
  ctx.lineWidth = track.width + 2;
  ctx.stroke(path);
  ctx.strokeStyle = '#43434e';
  ctx.lineWidth = track.width;
  ctx.stroke(path);

  // Delikatna linia środkowa (przerywana).
  ctx.strokeStyle = 'rgba(255,255,255,0.16)';
  ctx.lineWidth = 1;
  ctx.setLineDash([6, 8]);
  ctx.stroke(path);
  ctx.setLineDash([]);

  // Linia startu/mety: szachownica w poprzek toru przy s=0.
  const start = pointAt(track, 0);
  ctx.save();
  ctx.translate(start.x, start.y);
  ctx.rotate(start.angle);
  const half = track.width / 2;
  for (let row = 0; row < 2; row++) {
    for (let i = 0; i < Math.ceil(track.width / 4); i++) {
      ctx.fillStyle = (i + row) % 2 === 0 ? '#f0f0f0' : '#181818';
      ctx.fillRect(-4 + row * 4, -half + i * 4, 4, 4);
    }
  }
  ctx.restore();
  return c;
}

export function drawFrame(renderer, ctx, race) {
  const { track, trackLayer, marksLayer } = renderer;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(trackLayer, 0, 0);

  // Ślady opon przy drifcie (rysowane trwale na warstwie śladów).
  const marks = marksLayer.getContext('2d');
  marks.fillStyle = 'rgba(20,20,24,0.5)';
  race.karts.forEach((k) => {
    if (k.drifting && !k.offTrack) {
      const nx = -Math.sin(k.angle) * 2.5;
      const ny = Math.cos(k.angle) * 2.5;
      marks.fillRect(k.x + nx - 1, k.y + ny - 1, 1.6, 1.6);
      marks.fillRect(k.x - nx - 1, k.y - ny - 1, 1.6, 1.6);
    }
  });
  ctx.drawImage(marksLayer, 0, 0);

  race.karts.forEach((k) => drawKart(ctx, k));

  // Strzałka do następnego checkpointu dla lidera? Na razie minimalizm — pomijamy.
}

function drawKart(ctx, k) {
  ctx.save();
  ctx.translate(Math.round(k.x), Math.round(k.y));

  // Płomień boostu za kartem.
  if (k.boostTime > 0) {
    ctx.save();
    ctx.rotate(k.angle);
    ctx.fillStyle = Math.random() > 0.5 ? '#ffb030' : '#ff6020';
    ctx.fillRect(-9, -2, 4, 4);
    ctx.restore();
  }

  ctx.rotate(k.angle);
  // Koła.
  ctx.fillStyle = '#141418';
  ctx.fillRect(-5, -4.5, 3, 2);
  ctx.fillRect(2, -4.5, 3, 2);
  ctx.fillRect(-5, 2.5, 3, 2);
  ctx.fillRect(2, 2.5, 3, 2);
  // Nadwozie.
  ctx.fillStyle = k.color;
  ctx.fillRect(-6, -3, 12, 6);
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.fillRect(-6, -3, 12, 1.5); // cień górnej krawędzi
  // Szyba/kierowca.
  ctx.fillStyle = '#1c2a38';
  ctx.fillRect(1, -1.5, 3, 3);
  // Iskra driftu gotowego do boostu.
  if (k.drifting && k.driftTime >= 0.7) {
    ctx.fillStyle = '#8ff0ff';
    ctx.fillRect(-8, -1, 2, 2);
  }
  ctx.restore();
}

// Dane do minimapki/HUD — postęp okrążenia 0..1 dla paska.
export function lapProgress(track, kart) {
  return 1 - forwardDist(track, kart.s, 0) / track.length;
}

export { kartSpeed };

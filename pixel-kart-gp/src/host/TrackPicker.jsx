// Wybór trasy: karty z miniaturką (ten sam rysunek co w grze) i nazwą.
// Miniaturki liczone raz i cache'owane w module — trasy się nie zmieniają w locie.

import { useMemo } from 'react';
import { createTrack } from '../game/track.js';
import { renderTrackThumbnail } from '../render/renderer.js';
import { TRACKS } from '../game/tracks.js';

let thumbCache = null;
function getThumbnails() {
  if (!thumbCache) {
    thumbCache = new Map(TRACKS.map((t) => [t.id, renderTrackThumbnail(createTrack(t.id))]));
  }
  return thumbCache;
}

export default function TrackPicker({ value, onChange }) {
  const thumbs = useMemo(() => getThumbnails(), []);
  return (
    <div className="flex gap-2">
      {TRACKS.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={`rounded-lg overflow-hidden border-2 transition-colors ${
            value === t.id ? 'border-amber-400' : 'border-neutral-700 hover:border-neutral-500'
          }`}
          title={t.name}
        >
          <img src={thumbs.get(t.id)} alt={t.name} className="block"
            style={{ imageRendering: 'pixelated', width: '5.5rem', height: 'auto' }} />
          <div className={`text-[10px] text-center py-0.5 ${value === t.id ? 'bg-amber-500 text-black' : 'bg-neutral-800 text-neutral-400'}`}>
            {t.name}
          </div>
        </button>
      ))}
    </div>
  );
}

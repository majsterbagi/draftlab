// Katalog tras: tylko surowe punkty kontrolne + metadane. Geometria
// (wygładzanie, checkpointy, długość) liczy się w track.js.

export const TRACKS = [
  {
    id: 'canyon-eight',
    name: 'Ósemka Wąwozu',
    points: [
      [70, 60], [170, 42], [300, 52], [408, 62], [444, 135],
      [406, 208], [304, 228], [244, 168], [186, 226], [82, 210], [38, 135],
    ],
  },
  {
    id: 'wide-oval',
    name: 'Szeroka Pętla',
    points: [
      [70, 135], [88, 65], [200, 40], [258, 58], [320, 40], [412, 65],
      [444, 135], [412, 205], [320, 230], [258, 212], [200, 230], [88, 205],
    ],
  },
];

export const DEFAULT_TRACK_ID = TRACKS[0].id;

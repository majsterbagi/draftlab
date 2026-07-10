// Ta sama baza Firebase co NEON QUIZ (projekt draftlab) — pokoje Pixel Kart GP
// żyją w rooms/{kod} z polem app: 'pixelkart', zgodnie z regułami RTDB.
export const firebaseConfig = {
  apiKey: 'AIzaSyBl90zF1fBqA7C0A51dHGIifyBhmnW9siA',
  authDomain: 'draftlab-9f4b1.firebaseapp.com',
  databaseURL: 'https://draftlab-9f4b1-default-rtdb.europe-west1.firebasedatabase.app',
  projectId: 'draftlab-9f4b1',
  storageBucket: 'draftlab-9f4b1.firebasestorage.app',
  messagingSenderId: '975948550241',
  appId: '1:975948550241:web:76ad96e82ce7d790fb5a20',
};

export const isConfigMissing = firebaseConfig.apiKey.startsWith('WKLEJ');

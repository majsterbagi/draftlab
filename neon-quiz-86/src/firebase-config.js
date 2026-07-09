// ============================================================
// KONFIGURACJA FIREBASE — WKLEJ TU DANE ZE SWOJEJ KONSOLI
// ============================================================
// 1. Wejdź na https://console.firebase.google.com i utwórz projekt.
// 2. Dodaj aplikację webową (ikona </>) — Firebase pokaże obiekt
//    "firebaseConfig". Skopiuj jego pola poniżej.
// 3. W menu "Build" → "Realtime Database" utwórz bazę (tryb testowy,
//    potem wgraj reguły z pliku database.rules.json).
// 4. Pole databaseURL znajdziesz na górze zakładki Realtime Database
//    (np. https://twoj-projekt-default-rtdb.europe-west1.firebasedatabase.app)
//    — na planie Spark w regionie europe-west1 lub us-central1.
// ============================================================

export const firebaseConfig = {
  apiKey: 'AIzaSyBl90zF1fBqA7C0A51dHGIifyBhmnW9siA',
  authDomain: 'draftlab-9f4b1.firebaseapp.com',
  databaseURL: 'https://draftlab-9f4b1-default-rtdb.europe-west1.firebasedatabase.app',
  projectId: 'draftlab-9f4b1',
  storageBucket: 'draftlab-9f4b1.firebasestorage.app',
  messagingSenderId: '975948550241',
  appId: '1:975948550241:web:76ad96e82ce7d790fb5a20',
}

// true, gdy użytkownik jeszcze nie podmienił placeholderów
export const isConfigMissing = firebaseConfig.apiKey.startsWith('WKLEJ')

# NEON QUIZ 📺✨

Imprezowa gra quizowa w klimacie teleturnieju lat 80. Host wyświetla planszę na TV/laptopie,
gracze dołączają telefonami (kod pokoju / QR) i rywalizują w czasie rzeczywistym: **tajne
zakłady punktowe**, wydarzenia specjalne prowadzone przez wirtualnego prezentera i finałowy
**pojedynek na buzzery 1 na 1**.

W pełni **statyczna strona** (HTML/JS/CSS) — działa na zwykłym hostingu współdzielonym
przez FTP, bez Node.js na serwerze. Jedynym backendem jest **Firebase Realtime Database**
(darmowy plan Spark).

## Szybki start (dev)

```bash
npm install
# wklej konfigurację Firebase do src/firebase-config.js (patrz niżej)
npm run dev
```

- Ekran hosta: `http://localhost:5186/#/host`
- Telefon gracza: `http://localhost:5186/#/play` (albo QR z ekranu hosta)
- Edytor pytań: `http://localhost:5186/#/editor`

## Krok 1 — Załóż projekt Firebase i Realtime Database

1. Wejdź na [console.firebase.google.com](https://console.firebase.google.com) i zaloguj się kontem Google.
2. Kliknij **„Utwórz projekt"** (Create a project), nadaj nazwę np. `neon-quiz-86`.
   Google Analytics możesz wyłączyć — nie jest potrzebne.
3. Po utworzeniu projektu, w menu po lewej: **Build → Realtime Database**.
4. Kliknij **„Utwórz bazę danych"** (Create Database). Wybierz lokalizację
   (np. `europe-west1` dla Europy) i tryb **testowy** (locked/test — i tak zaraz wgramy własne reguły).
5. Wróć do strony głównej projektu i kliknij ikonę **`</>`** (Dodaj aplikację → Web).
   Nadaj dowolny pseudonim (np. `neon-quiz`), **bez** Firebase Hosting.
6. Firebase pokaże blok `const firebaseConfig = { ... }` — zostaw tę kartę otwartą.

## Krok 2 — Wklej konfigurację

Otwórz `src/firebase-config.js` i podmień placeholdery wartościami z kroku 1.6:

```js
export const firebaseConfig = {
  apiKey: '...',
  authDomain: 'twoj-projekt.firebaseapp.com',
  databaseURL: 'https://twoj-projekt-default-rtdb.europe-west1.firebasedatabase.app',
  projectId: 'twoj-projekt',
  storageBucket: 'twoj-projekt.appspot.com',
  messagingSenderId: '...',
  appId: '...',
}
```

⚠️ Pole **`databaseURL`** bywa pominięte w konsoli — znajdziesz je na górze zakładki
*Realtime Database* (adres zaczynający się od `https://` i kończący `firebasedatabase.app`).

## Krok 3 — Wgraj reguły bezpieczeństwa

1. W konsoli Firebase: **Realtime Database → zakładka „Reguły" (Rules)**.
2. Skopiuj całą zawartość pliku [`database.rules.json`](database.rules.json) z tego repozytorium
   i wklej w edytor reguł, zastępując dotychczasowe.
3. Kliknij **„Opublikuj" (Publish)**.

Reguły ograniczają odczyt/zapis wyłącznie do gałęzi `rooms/` (pokoje gry, kody 4-znakowe)
i `quizzes/` (zestawy pytań). Pokój starszy niż 24 h jest czyszczony automatycznie, gdy
nowy host wylosuje ten sam kod.

## Krok 4 — Build produkcyjny i wgranie przez FTP

```bash
npm run build
```

Vite zbuduje aplikację do folderu **`dist/`** ze ścieżkami względnymi (`base: './'`),
więc działa także w podkatalogu hostingu (np. `twojadomena.pl/quiz/`).

1. Połącz się ze swoim hostingiem programem FTP (np. FileZilla).
2. Wgraj **całą zawartość folderu `dist/`** do katalogu publicznego
   (`public_html/`, `www/` albo podkatalog np. `public_html/quiz/`).
3. Otwórz stronę w przeglądarce — gotowe. Nic więcej nie trzeba konfigurować:
   routing działa przez `#` (HashRouter), więc serwer nie potrzebuje żadnych przekierowań.

## Jak się gra

1. **Host** (TV/laptop) otwiera `.../#/host`, wybiera zestaw pytań i otwiera studio —
   na ekranie pojawia się 4-znakowy kod i QR.
2. **Gracze** (2–8) skanują QR telefonem, podają nick i wybierają neonowego awatara.
3. **3 rundy po 3 pytania**: głosowanie na kategorię → tajny zakład suwakiem
   (min 50 pkt, max 50% konta) → pytanie z bonusem za szybkość (×2.0 → ×1.5) →
   wielkie odsłonięcie stawek → tablica wyników.
4. **Wydarzenia specjalne** między rundami i raz w środku rundy: Runda w ciemno 🌑,
   Podwójna stawka 💰, Zakłócenia sygnału 📺, Telefon naopak ☎️, Licytacja pytania 🔨.
5. **Finał**: dwójka najlepszych staje do pojedynku na buzzery (do 4 punktów, max 7 pytań),
   reszta obstawia zwycięzcę jako publiczność.

Host steruje przepływem przyciskiem **„Dalej"**; fazy kończą się też same — po czasie
albo gdy wszyscy wykonali akcję. Rozłączony gracz wraca z tym samym nickiem bez utraty
konta; odświeżenie ekranu hosta wznawia grę z tego samego miejsca (stan gry w Firebase).

## Edytor pytań

`.../#/editor` — tworzenie i edycja zestawów (min. 4 kategorie po min. 3 pytania,
trudność ★–★★★, osobna pula min. 7 krótkich pytań pojedynkowych), duplikowanie,
usuwanie oraz eksport/import zestawu jako plik JSON. Przy pierwszym uruchomieniu
do bazy trafia przykładowy polski zestaw „Wieczór retro".

## Stack

React 18 + Vite · Tailwind CSS · framer-motion · Firebase Realtime Database (SDK modułowy) ·
qrcode.react · canvas-confetti · dźwięki syntezowane Web Audio API (zero plików audio)

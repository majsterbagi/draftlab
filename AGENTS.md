# Instrukcje dla agentów pracujących nad DraftLab.pl

Ten plik jest wspólnym kontraktem dla Codexa, Claude Code, Antigravity i innych agentów. Lista projektów nie jest zamknięta — automatycznie aktualizowany inwentarz znajduje się poniżej. Przed zmianą ustal, którego obszaru dotyczy praca.

## Kontrakt wdrożeniowy — FTP

Po każdej zmianie frontendu uruchom z katalogu głównego:

```bash
npm run build
```

Ten proces kompiluje wszystkie aplikacje do katalogu `dist/` i sprawdza, czy wymagane pliki powstały. Przez FTP wysyłamy wyłącznie zawartość głównego `dist/`, zachowując jej strukturę. Nie wysyłamy katalogu repozytorium, `src/`, `public/`, `node_modules/` ani podprojektowych `dist/`. Jeśli build zakończy się błędem, nie wdrażaj plików.

Changelog jest generowany z commitów Git i list zmienionych plików. Dlatego po zakończeniu pracy najpierw zapisz zmianę w commicie, a dopiero potem uruchom build. Jeden commit może pojawić się w dziennikach kilku projektów, jeśli zmienia ich pliki.

Poniższa sekcja `AUTO:PROJECT-INVENTORY` jest generowana przez `npm run agent:update`. Nie edytuj jej ręcznie. Aktualizuje się automatycznie przed `npm run dev` i `npm run build`; można ją odświeżyć ręcznie po dodaniu projektu.

Automatyczne wykrycie projektu aktualizuje dokumentację, ale nie zgaduje sposobu publikacji. Jeśli nowy projekt ma trafić na stronę i do paczki FTP, agent musi również podłączyć jego źródła do głównego buildu, dodać właściwy wpis w `src/data/db.js` albo konfigurację publikacji oraz sprawdzić wynik w `dist/`.

<!-- BEGIN AUTO:PROJECT-INVENTORY -->
## Automatycznie wykryty inwentarz projektu

Ta sekcja jest generowana przez `npm run agent:update`. Nowe wpisy pojawią się po dodaniu katalogu, pakietu `package.json`, strony w `apps/` albo projektu w `src/data/db.js`.

### Projekty zarejestrowane w DraftLab

| Nazwa | ID | URL | Status |
| --- | --- | --- | --- |
| BoboLab | bobolog | bobolog/ | active |
| NEON QUIZ | neon-quiz | neonquiz/ | active |
| Pixel Kart GP | pixel-kart | pixelkart/ | active |
| GamerLab | gamerlab | gamerlab/ | active |
| LabyrinthQR | labyrinth-qr | apps/LabyrinthQR.html | active |
| DraftCargo | draftcargo | apps/DraftCargo.html | active |
| SunTrack | suntrack | apps/SunTrack.html | active |
| Atmosphere | atmosphere | ./apps/Atmosphere.html | active |
| RetroVision | retrovision | apps/RetroVision.html | active |
| DraftCalc | draftcalc | apps/DraftCalc.html | active |

### Pakiety Node

| Ścieżka | Pakiet | Technologia | Build |
| --- | --- | --- | --- |
| . | aktualny-projekt | Vite / JS | npm run build |
| bobolog | bobolog | React | npm run build --prefix bobolog |
| gamerlab | gamerlab | React | npm run build --prefix gamerlab |
| neon-quiz-86 | neon-quiz-86 | React | npm run build --prefix neon-quiz-86 |
| pixel-kart-gp | pixel-kart-gp | React | npm run build --prefix pixel-kart-gp |

### Strony HTML głównego MPA

- `apps/Atmosphere.html`
- `apps/AtmosphereAnalytics.html`
- `apps/DraftCalc.html`
- `apps/DraftCargo.html`
- `apps/FluxBoard.html`
- `apps/LabyrinthQR.html`
- `apps/RetroVision.html`
- `apps/SunTrack.html`
- `apps/changelog.html`
- `apps/prototypes/suntrack-v1.html`
- `apps/prototypes/suntrack-v2.html`
- `apps/system-log.html`
- `apps/view.html`

### Katalogi główne

| Katalog | Rola |
| --- | --- |
| api | obszar projektu / narzędzia |
| apps | główne wejścia HTML |
| bobolog | obszar projektu / narzędzia |
| gamerlab | obszar projektu / narzędzia |
| neon-quiz-86 | obszar projektu / narzędzia |
| pixel-kart-gp | obszar projektu / narzędzia |
| public | obszar projektu / narzędzia |
| scripts | obszar projektu / narzędzia |
| src | kod głównej strony |
<!-- END AUTO:PROJECT-INVENTORY -->

## Status warsztatu — komenda `now` w terminalu

Strona główna ma interaktywny terminal (`src/components/NeuralTerminal.js`) z komendą `now` (alias `news`), która pokazuje, nad czym aktualnie trwają prace. Treść pochodzi z obiektu `now` w `src/data/db.js` (pola: `updated`, `project`, `lines`, `lines_en`).

Po zakończeniu znaczącej pracy nad projektem (nowa funkcja, premiera, zmiana kierunku) zaktualizuj ten wpis:

- ustaw `updated` na bieżącą datę i `project` na nazwę projektu, którego dotyczy praca;
- 2–3 krótkie linijki, pierwsza osoba, ton luźny i konkretny — jak notatka z garażu, nie komunikat prasowy; unikaj wyliczanek funkcji i marketingowych przymiotników;
- dopuszczalna autoironia i przyznanie, że coś jeszcze nie działa (np. „teraz uczę telefony być padami (WebRTC). na razie nie słuchają.");
- zawsze uzupełnij obie wersje językowe (`lines` i `lines_en`).

Drobne poprawki (typo, refaktor, fix builda) nie wymagają aktualizacji wpisu.

## Zasady bezpieczeństwa pracy

1. Zacznij od `git status --short --branch`. Istniejące zmiany użytkownika są ważne — nie resetuj ich i nie nadpisuj bez potrzeby.
2. Nie usuwaj `public/legacy/`, `public/bobolog/` ani `public/neonquiz/` bez świadomej decyzji dotyczącej sposobu wdrożenia.
3. Nie commituj `.env`, kluczy prywatnych, sekretów VAPID, kluczy service-role ani danych produkcyjnych.
4. `dist/` jest wynikiem builda. Zmienia się go przez źródła i skrypt builda, nie ręcznie.
5. `src/data/git_log_data.js` i `src/data/auto_changelogs.js` są generowane z Git. Jeśli trzeba zmienić ich zawartość, zmień commit/parser, a potem uruchom generator.
6. Nie zmieniaj reguł Firebase, RLS Supabase ani endpointów PHP bez sprawdzenia wpływu na istniejących użytkowników.

## Wybór miejsca zmiany

### Główna strona DraftLab

Technologia: vanilla JS, Web Components, Tailwind, Vite MPA.

- komponenty: `src/components/`;
- dane i konfiguracja treści: `src/data/db.js`;
- logika aplikacji: `src/apps/`;
- wspólna inicjalizacja: `src/main.js`, `src/core/`;
- wejścia HTML: `index.html`, `about.html`, `apps/*.html`.

Nie dodawaj Reacta do głównego serwisu. React jest używany wyłącznie w podprojektach.

### BoboLog

Technologia: React, Supabase, PWA.

- źródła: `bobolog/src/`;
- konfiguracja lokalna: `bobolog/.env`;
- przykład konfiguracji: `bobolog/.env.example`;
- backend cron/Web Push: `public/bobolog-api/`.

### Neon Quiz

Technologia: React, Firebase Realtime Database.

- źródła: `neon-quiz-86/src/`;
- reguły bazy: `neon-quiz-86/database.rules.json`;
- konfiguracja klienta: `neon-quiz-86/src/firebase-config.js`.

### PHP API

Źródła endpointów są w `api/`. `public/api/` jest generowane podczas buildu i nie powinno być edytowane ręcznie. Przed wdrożeniem zweryfikuj CORS, autoryzację, limity rozmiaru i uprawnienia do zapisu plików.

## Komendy kontrolne

```bash
npm install
npm install --prefix bobolog
npm install --prefix neon-quiz-86
npm run dev
npm run build
npm run preview
npm run snapshot:legacy
npm run build --prefix bobolog
npm run build --prefix neon-quiz-86
```

Po zmianie głównego serwisu uruchom `npm run build`. Po zmianie BoboLoga lub Neon Quizu uruchom ich własny build oraz główny build, bo wynik jest publikowany w `public/`.

## Standard zmiany

Przed zakończeniem:

- sprawdź diff i `git status`;
- usuń debugowe logi, kopie `.bak` i artefakty wygenerowane przypadkiem;
- nie mieszaj refaktoru z niepowiązaną zmianą wizualną;
- opisz w podsumowaniu zmienione katalogi, walidację i ewentualne ryzyko wdrożenia;
- jeśli nie można uruchomić PHP lub testów, napisz to wprost.

## Priorytety techniczne

1. bezpieczeństwo publicznych API i reguł baz;
2. poprawność produkcyjnego buildu;
3. zachowanie danych i kompatybilność istniejących URL-i;
4. prostota kodu i brak duplikatów;
5. dopiero potem optymalizacje wizualne i wydajnościowe.

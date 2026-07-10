# Architektura DraftLab.pl

Status: aktualna mapa projektu.

DraftLab.pl jest monorepo złożonym z głównego serwisu vanilla JS oraz dwóch niezależnych aplikacji React. Wspólnym punktem jest produkcyjny build głównego Vite, który publikuje podprojekty w katalogu `public/`.

## 1. Mapa systemu

```text
                    npm run build
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
  generate_git_log    build bobolog       build neon-quiz
        │                  │                  │
  src/data/*.js      public/bobolog/     public/neonquiz/
        └──────────────────┴──────────────────┘
                           │
                       Vite MPA
                           │
                          dist/
```

### Główna strona

- wejścia HTML: `index.html`, `about.html`, `apps/*.html` i `apps/prototypes/**/*.html`;
- runtime: `src/main.js`;
- UI: Web Components w `src/components/`;
- dane treści: `src/data/db.js`;
- style: `src/style.css` oraz Tailwind przez PostCSS;
- logika aplikacji: `src/apps/`;
- wspólny kod: `src/core/` i `src/utils/`.

Główna strona nie używa Reacta. Nie dodawaj zależności React do głównego `package.json`.

### BoboLog

`bobolog/` jest niezależnym projektem React. Ma własny `package.json`, lockfile, konfigurację Vite, PWA i zmienne środowiskowe. Jego źródła są w `bobolog/src/`, a wynik builda jest kopiowany do `public/bobolog/`.

### Neon Quiz

`neon-quiz-86/` jest niezależnym projektem React korzystającym z Firebase Realtime Database. Jego źródła są w `neon-quiz-86/src/`, reguły bazy w `database.rules.json`, a wynik builda jest kopiowany do `public/neonquiz/`.

## 2. Zasady źródeł danych

- `src/data/db.js` jest źródłem treści głównej strony.
- `src/data/git_log_data.js` i `src/data/auto_changelogs.js` są generowane przez `scripts/generate_git_log.js` na podstawie commitów i zmienionych ścieżek plików.
- Jeden commit może zostać przypisany do wielu projektów. Nowe top-level projekty są rozpoznawane po nazwie katalogu.
- `api/` zawiera źródłowe endpointy PHP.
- `public/api/` jest generowane podczas buildu z plików PHP w `api/`.
- `public/bobolog/`, `public/neonquiz/` i `public/legacy/` są zasobami publikowanymi. Nie edytuje się ich ręcznie.

## 3. Build i wdrożenie

```bash
npm run build
```

Skrypt `scripts/build.js` generuje changelogi, buduje oba podprojekty i publikuje ich wyniki w `public/`. Następnie Vite buduje główny serwis do `dist/`.

`scripts/update_agent_context.js` aktualizuje oznaczoną sekcję `AGENTS.md` na podstawie katalogów, pakietów Node, stron HTML i rejestru projektów w `src/data/db.js`. `scripts/verify_dist.js` działa po buildzie i sprawdza, czy wymagane aplikacje rzeczywiście znalazły się w paczce FTP.

Do wdrożenia używamy wyłącznie zawartości `dist/`. Nie wysyłamy `node_modules/`, źródeł aplikacji ani plików konfiguracyjnych Vite/Tailwind.

Katalogi `bobolog/dist/`, `neon-quiz-86/dist/` i `public/api/` są tymczasowe. Są ignorowane przez Git i pojawiają się ponownie podczas builda.

## 4. Legacy i prototypy

`public/legacy/` to świadomie utrzymywany snapshot starej wersji strony. Służy jako archiwum dostępne pod `/legacy/` i nie powinien być usuwany podczas zwykłego sprzątania.

`apps/prototypes/` zawiera stare wersje SunTrack. Są budowane jako osobne wejścia HTML, ponieważ `apps/changelog.html` udostępnia do nich linki.

## 5. API i stan serwera

PHP API jest oddzielone od kodu frontendu:

- `api/atmosphere.php` — odczyt i zapis pomiarów;
- `api/upload.php` — upload chunków dla DraftCargo;
- `api/download.php` — pobieranie plików;
- `api/stats.php` — statystyki DraftCargo;
- `public/bobolog-api/` — cron i Web Push dla BoboLoga.

Pliki JSON używane przez API są stanem serwera. Nie powinny być traktowane jak baza danych ani bezkrytycznie kopiowane między środowiskami. Szczegółowa lista kontroli znajduje się w `SECURITY.md`.

## 6. Zasady dla nowych zmian

1. Najpierw określ, którego z trzech projektów dotyczy zmiana.
2. Nie mieszaj zmian głównego serwisu z refaktorem BoboLoga lub Neon Quizu bez wyraźnej potrzeby.
3. Zmieniaj źródła, nie wygenerowane buildy.
4. Zachowuj istniejące ścieżki URL, chyba że zmiana migracyjna jest opisana.
5. Po zmianie uruchom odpowiedni build oraz główny `npm run build`.
6. Przeczytaj `AGENTS.md`, jeśli pracujesz jako agent.

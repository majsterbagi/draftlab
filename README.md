# DraftLab.pl

DraftLab.pl to osobisty, eksperymentalny warsztat webowy: kolekcja małych aplikacji, prototypów i narzędzi tworzonych iteracyjnie z pomocą człowieka oraz agentów AI.

Projekt nie jest jednym frameworkiem. To monorepo z trzema niezależnymi częściami:

- główna strona DraftLab — vanilla JavaScript, Web Components, Tailwind CSS i Vite MPA;
- BoboLog — osobna aplikacja React + Supabase, dostępna pod `/bobolog/`;
- Neon Quiz — osobna aplikacja React + Firebase Realtime Database, dostępna pod `/neonquiz/`.

## Struktura

```text
.
├── index.html, about.html       # strona główna i strona autora
├── apps/                        # podstrony aplikacji głównego serwisu
│   └── prototypes/              # historyczne prototypy, również budowane przez Vite
├── src/                         # kod głównego DraftLab
│   ├── components/              # Web Components wspólne dla strony
│   ├── apps/                    # logika poszczególnych aplikacji
│   ├── core/                    # współdzielone kontrolery i inicjalizacja
│   ├── data/                    # dane strony i pliki generowane z Git
│   └── style.css                # główny arkusz Tailwinda
├── api/                         # źródłowe endpointy PHP i lokalny stan API
├── public/                      # zasoby kopiowane do finalnego builda
│   ├── api/                     # generowane z `api/` podczas builda
│   ├── bobolog/                 # finalny build BoboLog
│   ├── neonquiz/                # finalny build Neon Quiz
│   └── legacy/                  # celowo przechowywane archiwum starej strony
├── bobolog/                     # źródła aplikacji BoboLog
├── neon-quiz-86/                # źródła aplikacji Neon Quiz
└── scripts/                     # generowanie changelogów i orkiestracja builda
```

## Uruchomienie

Wymagany jest Node.js 20+ oraz npm.

```bash
npm install
npm install --prefix bobolog
npm install --prefix neon-quiz-86
npm run dev
```

Główna strona działa wtedy na adresie pokazanym przez Vite. Osobne aplikacje uruchamia się niezależnie:

```bash
npm run dev --prefix bobolog
npm run dev --prefix neon-quiz-86
```

Vite nie wykonuje PHP. Do lokalnego testowania endpointów z `api/` potrzebny jest osobny serwer PHP albo środowisko hostingowe.

BoboLog korzysta z pliku `bobolog/.env`, który należy utworzyć na podstawie `bobolog/.env.example`. Neon Quiz ma konfigurację Firebase w `neon-quiz-86/src/firebase-config.js`; dane przeglądarkowe Firebase mogą znajdować się w kodzie klienta, ale bezpieczeństwo zapewniają reguły bazy w `database.rules.json`.

## Build produkcyjny

```bash
npm run build
```

`npm run agent:update` odświeża automatyczny inwentarz w `AGENTS.md`. Jest uruchamiane również automatycznie przed `dev` i `build`, więc nowe katalogi, pakiety Node, strony `apps/` i wpisy w `src/data/db.js` pojawią się w instrukcjach dla agentów bez ręcznego przepisywania listy.

Samo wykrycie nowego katalogu nie publikuje go automatycznie. Jeśli projekt ma być dostępny po wdrożeniu FTP, trzeba podłączyć go do głównego buildu i rejestru strony; kontrola `postbuild` zgłosi brak pliku, jeśli wpisany projekt nie trafi do `dist/`.

Build główny wykonuje kolejno:

1. generuje `src/data/git_log_data.js` i `src/data/auto_changelogs.js` z historii Git;
2. buduje BoboLog i publikuje wynik do `public/bobolog/`;
3. buduje Neon Quiz i publikuje wynik do `public/neonquiz/`;
4. buduje główną stronę oraz wszystkie strony HTML z `apps/` do `dist/`.

Po pomyślnym buildzie przez FTP wysyłamy wyłącznie zawartość głównego `dist/`, zachowując strukturę katalogów. `postbuild` automatycznie sprawdza wymagane ścieżki i nie pozwala uznać niepełnego outputu za gotowy. Katalogi `dist/` wewnątrz podprojektów oraz `public/api/` są tymczasowe i nie powinny być edytowane ani commitowane.

## Gdzie zmieniać dane

- dane projektów, menu i opisy głównej strony: `src/data/db.js`;
- tłumaczenia: `src/utils/i18n.js`;
- historia zmian: generuje ją `scripts/generate_git_log.js` — nie edytuj ręcznie plików `src/data/*log*` ani `auto_changelogs.js`;
- logika konkretnej aplikacji głównej: odpowiedni plik w `src/apps/`;
- BoboLog: tylko `bobolog/src/`;
- Neon Quiz: tylko `neon-quiz-86/src/`.

## Dziennik zmian

Dziennik jest generowany przez `scripts/generate_git_log.js` na podstawie historii Git oraz listy plików zmienionych w każdym commicie. Generator rozpoznaje aplikację po ścieżce, dlatego jeden commit może zostać przypisany do kilku projektów jednocześnie. Nowy projekt w osobnym katalogu dostaje automatyczny identyfikator na podstawie nazwy katalogu; po dodaniu go do `src/data/db.js` jego historia pojawi się także na stronie projektu.

Wpisy są oparte na commitach, nie na niezapisanych zmianach w working tree. Zalecany przepływ to: zakończyć zmianę, utworzyć commit, uruchomić `npm run build`, a dopiero potem wysłać `dist/` przez FTP.

## Legacy i prototypy

`public/legacy/` jest świadomie zachowanym snapshotem starej wersji serwisu. Nie należy go usuwać podczas zwykłego cleanupu. Można go odtworzyć po przygotowaniu właściwej wersji przez:

```bash
npm run build
npm run snapshot:legacy
```

Prototypy SunTrack znajdują się w `apps/prototypes/` i są budowane jako osobne strony, ponieważ changelog udostępnia do nich linki.

## Praca z agentami

Instrukcje operacyjne znajdują się w `AGENTS.md`. Jest to kanoniczny plik dla Codexa, Claude Code i agentów Google. `CLAUDE.md` oraz `GEMINI.md` są krótkimi punktami wejścia kierującymi do tego samego dokumentu, żeby zasady nie rozjeżdżały się między narzędziami.

Przed rozpoczęciem pracy agent powinien sprawdzić `git status`, przeczytać `AGENTS.md`, a po zmianach uruchomić przynajmniej `npm run build`.

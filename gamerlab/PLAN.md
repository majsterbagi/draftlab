# GamerLab — plan projektu

Menedżer kupki wstydu gier. Prowadzisz bibliotekę posiadanych gier, apka dociąga czasy przejścia i liczy, kiedy realnie skończysz backlog przy zadeklarowanym budżecie czasu.

## Decyzje (2026-07-10)

- **Nazwa:** GamerLab.
- **Charakter:** poważne narzędzie — statystyki, prognozy, wykresy; humor co najwyżej akcentem.
- **Odbiorcy:** właściciel + znajomi; bez ambicji skalowania.
- **Dodawanie gier:** ręcznie z autouzupełnianiem (IGDB). Importy (Steam, CSV, konsole) — późniejsze fazy.
- **Dane:** konto + Supabase (auth, Postgres, RLS per użytkownik) — wzorzec BoboLoga.
- **Tempo grania:** deklarowany budżet tygodniowy (np. 6h/tydz.). Log sesji — ewentualnie później.
- **Stack:** podprojekt React (`gamerlab/`), własny build wpinany w główny `dist/` jak bobolog/neon-quiz/pixel-kart. Główna strona DraftLab zostaje vanilla JS.

## Gry wieloosobowe i „bez końca" (FIFA, rogueliki, live service)

Takie gry nie mają czasu przejścia, ale zjadają realny czas grania — więc nie wolno ich ignorować w prognozie. Rozwiązanie:

1. Gra może mieć typ **`finite`** (domyślny) albo **`endless`**.
2. Gry `endless` nie wchodzą do sumy godzin backlogu ani do prognozy ukończenia.
3. Za to użytkownik deklaruje przy nich **tygodniowy „podatek czasowy"** — np. „FIFA: ~2h/tydz.". Prognoza backlogu liczy się z budżetu pomniejszonego o sumę podatków: 6h budżetu − 2h FIFA = 4h/tydz. na kupkę.
4. Efekt uboczny (świadomy): apka pokazuje wprost, ile prognoza się wydłuża przez gry-usługi — „FIFA opóźnia twój backlog o 14 miesięcy". To najuczciwsza statystyka w całym narzędziu.
5. Opcjonalnie gra `endless` może mieć **cel własny** zamiast czasu przejścia (np. „skończ sezon", „platyna") — wtedy liczy się jako ukończona po odhaczeniu celu.

## Model danych (Supabase / Postgres)

```
profiles
  id (uuid, = auth.uid)
  weekly_hours        numeric   -- deklarowany budżet tygodniowy

games                           -- cache metadanych z IGDB, wspólny dla wszystkich
  id (bigint, = igdb_id)
  title, cover_url, genres[], release_year
  ttb_main, ttb_extra, ttb_completionist   -- sekundy, z IGDB Time To Beat
  fetched_at          timestamptz          -- do odświeżania cache

user_games
  id (uuid)
  user_id             uuid → profiles
  game_id             bigint → games
  platform            text      -- 'PC' | 'PS5' | 'Switch' | ...
  status              text      -- 'backlog' | 'playing' | 'done' | 'dropped'
  kind                text      -- 'finite' | 'endless'
  queue_position      int       -- kolejność w kolejce grania (null = poza kolejką)
  ttb_override        numeric   -- ręczna korekta czasu przejścia (null = z games)
  ttb_variant         text      -- 'main' | 'extra' | 'completionist'
  weekly_tax_hours    numeric   -- tylko kind=endless
  endless_goal        text      -- opcjonalny cel dla endless
  added_at, finished_at
```

RLS: `user_games` i `profiles` tylko dla właściciela; `games` czytelne publicznie, zapis przez Edge Function.

## Integracja IGDB

- IGDB (API Twitcha) wymaga client id + secret **po stronie serwera** — sekret nie może trafić do frontu.
- **Supabase Edge Function** `igdb-search`: przyjmuje zapytanie tekstowe, odpytuje IGDB (search + time to beat), zapisuje wynik do tabeli `games` (cache) i zwraca listę do autouzupełniania.
- Cache w `games` ogranicza zużycie API i przyspiesza kolejne wyszukiwania tych samych tytułów.
- Brak czasu w IGDB → pole puste + możliwość ręcznego wpisania (`ttb_override`).

## Silnik prognozy (czysta funkcja po stronie frontu)

Wejście: budżet tygodniowy, suma podatków `endless`, kolejka gier `finite` ze statusem backlog/playing.
Wyjście: data ukończenia każdej gry (kaskadowo wg `queue_position`, gry poza kolejką po kolejce) i data wyzerowania backlogu.

## Road mapa

### v0.1 — szkielet (bez logowania) ✅ (2026-07-10)
- ✅ scaffold Vite+React w `gamerlab/`, wpięcie w główny build i `src/data/db.js`;
- ✅ biblioteka na localStorage, ręczne dodawanie gry z ręcznym czasem przejścia;
- ✅ budżet tygodniowy + prognoza ukończenia (silnik prognozy z testami `node --test`, kaskada per gra, odliczanie przegranych godzin przy statusie „gram").

### v0.2 — IGDB
- Edge Function `igdb-search` + autouzupełnianie (okładka, metadane, time to beat);
- warianty czasu (main/extra/100%) i `ttb_override`.

### v0.3 — konta i synchronizacja
- Supabase auth (magic link), migracja localStorage → konto przy pierwszym logowaniu;
- RLS, model danych jak wyżej.

### v0.4 — gry endless + kolejka
- typ `endless`, podatek tygodniowy, wpływ na prognozę, statystyka „ile cię to kosztuje";
- ręczna kolejka grania z kaskadową prognozą per gra.

### v0.5 — statystyki
- suma godzin backlogu, wykres spalania, rozbicia po platformie/gatunku, ukończone vs kupione per rok.

### Później (nieuporządkowane)
- import ze Steama (SteamID → biblioteka + realny czas grania), import CSV;
- log sesji i prognoza z realnego tempa zamiast deklaracji;
- publiczny link do backlogu (read-only), podpowiadacz „co dalej" (krótkie gry na szybkie zwycięstwa).

## Ryzyka / uwagi

- IGDB Time To Beat bywa niekompletne dla niszowych tytułów — stąd `ttb_override` od v0.2.
- HowLongToBeat nie ma oficjalnego API; nie budujemy na scraperach.
- Konsole (PSN/Xbox/Nintendo) nie mają oficjalnych API bibliotek — import tylko ręczny/CSV, nie obiecujemy więcej.

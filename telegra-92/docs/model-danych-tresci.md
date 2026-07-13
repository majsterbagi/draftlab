# Model danych treści — specyfikacja

> Status: **zaprojektowany** (sesja 2026-07-11). Implementacja jako schemat Supabase
> (Postgres) w Etapie 1. Decyzje produktowe podjęte przez właściciela; szczegóły
> techniczne (nazwy kolumn, indeksy) do doszlifowania przy implementacji.

## Decyzje produktowe

| Obszar | Decyzja |
|---|---|
| Kategorie | **Stała lista kuratorowana + własne w paczkach**: rdzeń ~12-20 globalnych kategorii z ikoną (gracz uczy się ich "smaku" — kluczowe przy zakładach w ciemno), paczka może dodać kategorie specjalne (np. "Pytania o solenizanta" w przyszłym edytorze hostów) |
| Paczki | **Tematyczna-mix**: paczka = "wieczór" (motyw + pytania z wielu kategorii i trudności, np. "Impreza ogólna vol. 1", "Lata 90"). Host wybiera 1-2 paczki i gra. To przyszła jednostka sprzedaży |
| Charakter treści | **Rating na paczce**: rodzinna / imprezowa / 18+. Pojedyncze pytania bez flag |
| Trudność | **3 poziomy (łatwe/średnie/trudne) nadawane ręcznie + kalibracja danymi**: od pierwszej wersji zbieramy statystyki odpowiedzi, system z czasem sugeruje korekty poziomów |
| Języki | i18n w modelu od pierwszego dnia; start: tylko `pl` |

## Encje

```
category ──< question >── pack          (pytanie należy do paczki i kategorii)
                │
                ├── question_i18n       (treść per język)
                └── question_stats      (agregaty odpowiedzi — kalibracja trudności)
```

### `category`
- `id`, `slug` (np. `kino`), `icon`, `sort_order`
- `scope`: `core` (globalna, kuratorowana) | `pack` (+ `pack_id` — kategoria specjalna paczki)
- nazwy w `category_i18n` (`name`, opcjonalny `flavor_text` — jednozdaniowy opis "smaku" kategorii pokazywany przy zakładzie w ciemno)

### `pack`
- `id`, `slug`, `rating` (`family` | `party` | `adult`), `status` (`draft` | `published`)
- `cover` (grafika), metadane wydawnicze (`version`, `published_at`)
- tytuł i opis w `pack_i18n`

### `question`
- `id`, `pack_id`, `category_id`
- `type`: `abcd` | `estimate` | `true_false` | `ordering`
- `difficulty`: 1 | 2 | 3 (łatwe/średnie/trudne — moduł mapuje na mnożniki ×1/×1.5/×2)
- `payload_schema` per typ (część niezależna od języka, np. poprawna wartość liczbowa
  w szacowaniu, tolerancja, jednostka)
- `status` (`draft` | `verified` | `published`) — pole pod pipeline AI + panel weryfikacji:
  pytania generowane lądują jako `draft`, po ludzkiej weryfikacji `verified`

### `question_i18n`
- `question_id`, `locale` (start: `pl`)
- treść zależna od typu: pytanie + odpowiedzi (abcd), pytanie + jednostka (estimate),
  zdanie (true_false), pytanie + elementy w poprawnej kolejności (ordering)

### `question_stats` (kalibracja trudności)
- agregat per pytanie: `times_shown`, `times_correct`, dla szacowania mediana błędu
- zapisywany po każdej rozegranej rundzie (anonimowo, bez danych graczy)
- panel treści pokaże z czasem sugestie: „to *łatwe* przechodzi 30% osób → podnieś trudność"

## Kontrakt z silnikiem gry

Sesja przy starcie **kompiluje playlistę**: silnik losuje/dobiera pytania z wybranych
paczek według potrzeb modułów (moduł 01 zamawia np. „5 pytań aktu I: trudność dowolna,
kategorie różnorodne; 3 pytania finałowe: trudność 2-3; 3 Pytania o Bank: typ `estimate`").
Wylosowany zestaw trafia do stanu pokoju — telefony i TV nie odpytują bazy w trakcie gry
(gra działa płynnie nawet przy chwilowych problemach z siecią; Realtime niesie tylko stan).

## Konsekwencje dla Etapu 2 (pierwsza paczka)

- Pierwsza paczka: **"Impreza ogólna vol. 1"**, rating `party` (do potwierdzenia),
  pokrywająca wszystkie 4 typy pytań i 3 trudności, z nadwyżką pytań `estimate`
  (Pytania o Bank zużywają je szybko).
- Lista rdzeniowych kategorii (nazwy, ikony, flavor texty) — **do zaprojektowania
  z właścicielem** (osobna sesja, to element rozgrywki widoczny na ekranie).

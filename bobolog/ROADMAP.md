# BoboLog — szczegółowa mapa drogowa

> Dokument przeznaczony dla sesji AI i dewelopera. Opisuje **stan aktualny** i **każdy
> przyszły krok** na tyle szczegółowo, żeby nowa sesja mogła kontynuować bez pytania
> o kontekst. Po zrealizowaniu wersji zaznaczaj zadania `[x]` i aktualizuj sekcję
> „Stan aktualny".

---

## Stack technologiczny (decyzje ostateczne)

| Warstwa | Technologia | Uwagi |
|---|---|---|
| Frontend | React 19 + Vite 7 + Tailwind 3 | Osobny podprojekt w `bobolog/` |
| Styleguide | CSS vars `--bb-*` w `src/index.css` | Motywy: mint / blush / sky + tryb nocny |
| Fonty | Baloo 2 (display) + Nunito (body) | Google Fonts, preconnect w index.html |
| Ikony | lucide-react | Już zainstalowane |
| Dane (tymczasowo) | localStorage via `src/data/store.js` | Podmieniane na Supabase w v0.2 |
| Backend | Supabase (auth, PostgreSQL, Storage, Edge Functions) | |
| Maile | SMTP skrzynka home.pl lub Supabase Edge Function | |
| Hosting | home.pl — statyczne pliki | Build → `dist/` → serwer |
| Subdomena | `bobolog.draftlab.pl` → docelowo `bobolog.pl` | Na razie: `draftlab.pl/bobolog/` |

---

> **Stan na 2026-07-04:** v0.1–v0.6 zakodowane. Po stronie użytkownika do zrobienia:
> SQL v0.6 w Supabase (sekcja „SQL do uruchomienia" przy v0.6), konfiguracja push-crona
> na home.pl i wgranie builda. Backlog: i18n, leki, widok pediatry, RODO.

## Stan aktualny — v0.1 ✅ GOTOWE (2026-07-03)

### Pliki źródłowe

```
bobolog/
├── src/
│   ├── App.jsx              ← główny komponent, routing przez stan (tab)
│   ├── main.jsx             ← punkt wejścia React
│   ├── index.css            ← wszystkie CSS vars --bb-*, motywy, tryb nocny
│   ├── components/
│   │   ├── Logo.jsx         ← SVG logo: bobas w bąbelku
│   │   └── QuickAdd.jsx     ← bottom sheet: karmienie / sen / pielucha
│   ├── data/
│   │   └── store.js         ← warstwa danych (localStorage); tu podmienić na Supabase
│   └── utils/
│       └── time.js          ← timeAgo, clock, dayLabel, duration
├── index.html               ← HTML entry, Google Fonts, theme-color
├── package.json             ← React 19, Vite 7, Tailwind 3, lucide-react
├── vite.config.js           ← base: './', port: 5180
└── tailwind.config.js       ← kolory bb.*, fontFamily display/body, borderRadius bubble
```

### Co działa

- [x] Cztery zakładki: Dziś / Historia / Statystyki / Ustawienia
- [x] Dashboard dnia: karty ostatniego karmienia, snu i pieluchy z `timeAgo`
- [x] Szybki wpis — karmienie: pierś lewa, pierś prawa, butelka (ml), posiłek stały
- [x] Szybki wpis — pielucha: mokra, kupa, mokra+kupa
- [x] Sen: timer start/stop (baner z rosnącym czasem na dashboardzie) + wpis ręczny od–do
- [x] Notatka opcjonalna przy każdym wpisie
- [x] Historia pogrupowana po dniach (Dziś / Wczoraj / data pełna)
- [x] Usuwanie wpisów z historii
- [x] Statystyki dnia: liczba karmień, pieluchy, suma czasu snu
- [x] Ustawienia: imię dziecka, wybór motywu (mint/blush/sky), przełącznik trybu nocnego
- [x] 3 motywy pastelowe + tryb nocny (6 kombinacji CSS vars)
- [x] Dane w localStorage przez `store.js` (listEntries, addEntry, removeEntry, lastEntry, getSettings, saveSettings)
- [x] Karta BoboLog na draftlab.pl (pierwsza pozycja w gridzie, `href: bobolog/`)
- [x] Dziennik zmian na draftlab.pl (`apps/changelog.html?id=bobolog`)
- [x] Build produkcyjny: `dist/` BoboLog wbudowany w `public/bobolog/` draftlaba

### Znane ograniczenia v0.1

- Brak kont — dane tylko lokalnie w przeglądarce
- Brak profilu dziecka (płeć, data urodzenia) — motyw ustawiany ręcznie
- Statystyki to tylko liczniki, brak wykresów
- Sen: przy zamknięciu przeglądarki timer trwa (zapisany w localStorage), OK

---

## v0.2 — Supabase: konta, rodziny, synchronizacja ✅ GOTOWE (2026-07-03)

**Cel:** dane na serwerze, wiele urządzeń, zaproszenia dla rodziny.

### 0. Przygotowanie środowiska

```bash
# W katalogu bobolog/
npm install @supabase/supabase-js
```

Utwórz projekt na supabase.com i dodaj plik `bobolog/.env`:
```
VITE_SUPABASE_URL=https://XXXXXXXX.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

Dodaj `.env` do `.gitignore` w `bobolog/`.

Utwórz `src/data/supabase.js`:
```js
import { createClient } from '@supabase/supabase-js';
export const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY
);
```

### 1. Schema bazy danych (SQL do wklejenia w Supabase SQL Editor)

```sql
-- Rodziny
create table families (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    created_by uuid references auth.users not null,
    created_at timestamptz default now()
);

-- Członkowie rodziny (role: admin | member)
create table family_members (
    id uuid primary key default gen_random_uuid(),
    family_id uuid references families on delete cascade not null,
    user_id uuid references auth.users on delete cascade not null,
    role text not null default 'member' check (role in ('admin', 'member')),
    invited_by uuid references auth.users,
    joined_at timestamptz default now(),
    unique(family_id, user_id)
);

-- Dzieci (powiązane z rodziną)
create table children (
    id uuid primary key default gen_random_uuid(),
    family_id uuid references families on delete cascade not null,
    name text not null,
    birth_date date,           -- null gdy tryb ciążowy (due_date zamiast)
    due_date date,             -- null gdy dziecko już urodzone
    gender text check (gender in ('boy', 'girl', 'neutral')) default 'neutral',
    created_at timestamptz default now()
);

-- Wpisy dziennika
create table entries (
    id uuid primary key default gen_random_uuid(),
    child_id uuid references children on delete cascade not null,
    family_id uuid references families not null,
    type text not null check (type in ('feed', 'sleep', 'diaper', 'weight', 'vaccine', 'milestone', 'note')),
    data jsonb not null default '{}',   -- elastyczne pole dla różnych typów
    at timestamptz not null default now(),
    created_by uuid references auth.users,
    created_at timestamptz default now()
);

-- Zaproszenia
create table invitations (
    id uuid primary key default gen_random_uuid(),
    family_id uuid references families on delete cascade not null,
    email text,                -- opcjonalne: zaproszenie na konkretny mail
    token text unique not null default encode(gen_random_bytes(24), 'base64url'),
    role text not null default 'member',
    created_by uuid references auth.users not null,
    expires_at timestamptz default now() + interval '7 days',
    used_at timestamptz,
    used_by uuid references auth.users
);
```

### 2. RLS (Row Level Security)

```sql
alter table families enable row level security;
alter table family_members enable row level security;
alter table children enable row level security;
alter table entries enable row level security;
alter table invitations enable row level security;

-- families: widoczne tylko dla członków
create policy "family members can view" on families
    for select using (
        id in (select family_id from family_members where user_id = auth.uid())
    );

-- children: widoczne dla członków rodziny
create policy "family members can view children" on children
    for select using (
        family_id in (select family_id from family_members where user_id = auth.uid())
    );
create policy "admins can manage children" on children
    for all using (
        family_id in (select family_id from family_members where user_id = auth.uid() and role = 'admin')
    );

-- entries: każdy członek rodziny czyta, każdy może dodawać
create policy "family members can read entries" on entries
    for select using (
        family_id in (select family_id from family_members where user_id = auth.uid())
    );
create policy "family members can insert entries" on entries
    for insert with check (
        family_id in (select family_id from family_members where user_id = auth.uid())
    );
-- tylko admini mogą usuwać
create policy "admins can delete entries" on entries
    for delete using (
        family_id in (select family_id from family_members where user_id = auth.uid() and role = 'admin')
    );

-- invitations: admini tworzą, każdy zalogowany może sprawdzić token
create policy "admins can manage invitations" on invitations
    for all using (
        family_id in (select family_id from family_members where user_id = auth.uid() and role = 'admin')
    );
create policy "anyone can check token" on invitations
    for select using (used_at is null and expires_at > now());
```

### 3. Nowe komponenty / ekrany

#### `src/screens/AuthScreen.jsx`
- Zakładki: Zaloguj / Zarejestruj
- Pola: e-mail + hasło
- Przyciski: „Zaloguj przez Google" i „Zaloguj przez Apple" (Supabase OAuth)
- Link „Zapomniałeś hasła?" → supabase.auth.resetPasswordForEmail()
- Po zalogowaniu → FamilySetupScreen (jeśli brak rodziny) lub App

#### `src/screens/FamilySetupScreen.jsx`
- Krok 1: „Utwórz rodzinę" (nazwa rodziny, np. „Rodzina Kowalskich")
- Krok 2: „Dodaj dziecko" — imię, data urodzenia lub tryb ciążowy (data porodu), płeć
- Płeć automatycznie ustawia motyw: girl→blush, boy→sky, neutral→mint
- Po zapisie → App (dashboard)

#### `src/screens/InviteScreen.jsx`
- Generowanie linku zaproszenia (kopiuj do schowka lub udostępnij)
- Lista aktywnych zaproszeń z datą ważności
- Lista członków rodziny z rolami; admini mogą zmieniać role

#### `src/screens/JoinFamilyScreen.jsx`
- Wywoływany gdy URL zawiera `?invite=TOKEN`
- Pokazuje: „Dołącz do rodziny [nazwa] jako [rola]"
- Przycisk Dołącz → wstawia rekord do family_members, oznacza invitation jako used

### 4. Modyfikacja `src/data/store.js`

Podmień implementację — zachowaj te same sygnatury funkcji (UI się nie zmieni):

```js
// Nowe sygnatury (identyczne jak localStorage, podmieniana implementacja)
export async function listEntries(childId) { ... }   // query Supabase
export async function addEntry(type, data) { ... }   // insert do Supabase
export async function removeEntry(id) { ... }        // delete (tylko admin)
export async function lastEntry(type, childId) { ... }
export async function getSettings() { ... }          // z localStorage (UI prefs)
export async function saveSettings(patch) { ... }    // do localStorage
```

**Ważne:** funkcje stają się async — w komponentach dodać `useEffect` + `useState`
lub context z React Query / SWR (rekomendacja: `@tanstack/react-query` v5).

### 5. Synchronizacja offline → online

- Timer snu (sleepStartedAt) zostaje w localStorage — odporny na utratę połączenia
- Przy powrocie online: sprawdź czy są wpisy w localStorage bez `id` Supabase → wyślij
- Strategia konfliktów: `at` z serwera wygrywa (last-write-wins)

### 6. Maile — zaproszenia i reset hasła

Supabase obsługuje reset hasła z własnego SMTP. W ustawieniach projektu Supabase:
- Authentication → Email → SMTP Settings
- Host: `mail.home.pl`, port 587, login: skrzynka na home.pl
- Szablony maili: dostosuj treść w Authentication → Email Templates

### Checklist v0.2

- [x] Instalacja @supabase/supabase-js, .env
- [x] Schema SQL + RLS w Supabase (naprawiono rekurencję przez funkcje security definer)
- [x] supabase.js client
- [x] AuthScreen (e-mail/hasło + Google + Apple)
- [x] FamilySetupScreen (rodzina + profil dziecka z płcią)
- [x] Podmiana store.js na Supabase (async)
- [x] React Query (@tanstack/react-query) dla async danych
- [x] InviteScreen (generowanie linku, lista członków)
- [x] JoinFamilyScreen (obsługa URL z tokenem)
- [x] Płeć dziecka → auto-motyw (girl=blush, boy=sky, neutral=mint)
- [x] Wielokrotne dzieci: selektor dziecka w headerze (jeśli >1)

**Uwagi:** migracja localStorage→Supabase pominięta (app nowa, brak użytkowników v0.1 do migracji). RLS naprawiono przez funkcje `is_family_member()` i `is_family_admin()` z `security definer`. INSERT do `families` używa `crypto.randomUUID()` po stronie klienta żeby uniknąć INSERT...RETURNING z pustym wynikiem SELECT.

---

## v0.3 — Waga, siatki centylowe WHO, rozszerzony dashboard

**Cel:** rejestrowanie wzrostu dziecka z wizualizacją na siatce centylowej.

### 1. Nowy typ wpisu: `weight`

Dane w `entries.data`:
```json
{ "weightKg": 7.35, "heightCm": 67.0, "headCm": 43.5 }
```

#### `src/components/QuickAdd.jsx` — nowa zakładka "Pomiar"

- Pola: waga (kg, krok 0.01), wzrost (cm, krok 0.5), obwód głowy (cm, krok 0.5)
- Wszystkie pola opcjonalne (można wpisać samo wagę)
- Data pomiaru (domyślnie: dziś)

### 2. Dane centylowe WHO

Utwórz `src/data/who_charts.js` — statyczny JSON z siatkami:
- Waga dla dziewczynek 0–60 mies. (percentyle: 3, 15, 50, 85, 97)
- Waga dla chłopców 0–60 mies.
- Wzrost dla dziewczynek 0–60 mies.
- Wzrost dla chłopców 0–60 mies.
- Obwód głowy dla dziewczynek i chłopców 0–36 mies.

Dane źródłowe: [WHO Child Growth Standards](https://www.who.int/tools/child-growth-standards/standards)
Format pliku:
```js
export const WHO_WEIGHT_GIRLS = [
    // { month: 0, p3: 2.4, p15: 2.8, p50: 3.2, p85: 3.7, p97: 4.2 },
    // ...
];
```

### 3. `src/components/CentileChart.jsx`

- Biblioteka: `recharts` (dodać do dependencies: `npm install recharts`)
- Wykres liniowy: osie X = wiek w miesiącach, Y = waga/wzrost
- Linie percentylowe (p3, p15, p50, p85, p97) w kolorach `--bb-*`
- Punkt dziecka: duży okrąg na siatce + tooltip z datą i wartością
- Przełącznik: Waga / Wzrost / Głowa
- Kolor obszarów między liniami: delikatne wypełnienie pastelowe

### 4. Rozszerzony dashboard statystyk (`src/screens/StatsScreen.jsx`)

Wydziel Stats z App.jsx do osobnego pliku. Dodaj:

#### Zakładka „Sen"
- Heatmapa snu: siatka 7 dni × 24 godziny
  - Każda komórka = 1 godzina; kolor nasycony jeśli dziecko spało
  - Implementacja: CSS Grid 24 kolumny × 7 wierszy, bez biblioteki
- Słupki: łączny czas snu per dzień (ostatnie 14 dni)
- Licznik: średni czas snu na dobę (ostatnie 7 dni)

#### Zakładka „Karmienie"
- Słupki: liczba karmień per dzień (ostatnie 14 dni)
- Podział: pierś vs butelka (kolorowe warstwy)
- Trend: strzałka ↑↓ vs poprzedni tydzień

#### Zakładka „Wzrost"
- Wykres centylowy (CentileChart.jsx)
- Lista pomiarów z datami

#### Przewidywanie (opcja „następne za ~X min")
- Karmienie: mediana przerw między karmieniami z ostatnich 7 dni
- Sen: jeśli ostatnia drzemka krótsza niż mediana → szacunkowy koniec snu
- Wyświetl jako chip pod kartą na dashboardzie: „Prawdopodobnie będzie głodny za 45 min"

### Checklist v0.3

- [x] Instalacja recharts
- [x] Nowy typ wpisu `weight` w QuickAdd.jsx
- [x] Plik who_charts.js z danymi WHO (waga + wzrost + głowa, chłopcy + dziewczynki)
- [x] CentileChart.jsx (recharts LineChart, punkty dziecka, percentyle)
- [x] StatsScreen.jsx wydzielony z App.jsx
- [x] Heatmapa snu (CSS Grid, bez biblioteki)
- [x] Wykresy słupkowe karmień i snu (recharts BarChart)
- [x] Przewidywanie następnego karmienia/snu
- [x] Zakładka Wzrost w statystykach z CentileChart

---

## v0.4 — Kalendarz szczepień PSO + przypomnienia mailowe

**Cel:** interaktywny harmonogram szczepień z alertami e-mail przed terminem.

### 1. Dane PSO

Utwórz `src/data/pso_vaccines.js` — Polski Program Szczepień Ochronnych 2024:

```js
export const PSO_VACCINES = [
    {
        id: 'hbv-0',
        name: 'WZW B (dawka 0)',
        shortName: 'HBV',
        offsetDays: 0,         // od daty urodzenia
        required: true,        // obowiązkowe
        description: 'Pierwsza dawka szczepionki przeciw wirusowemu zapaleniu wątroby typu B. Podawana w ciągu 24h od urodzenia.',
    },
    { id: 'bcg', name: 'Gruźlica (BCG)', shortName: 'BCG', offsetDays: 0, required: true },
    { id: 'hbv-1', name: 'WZW B (dawka 1)', shortName: 'HBV', offsetDays: 42, required: true },
    { id: 'dtap-ipv-hib-1', name: 'DTPa-IPV-Hib (dawka 1)', shortName: 'DTaP', offsetDays: 56, required: true },
    // ... pełna lista z Komunikatu GIS 2024
];
// offsetDays = liczba dni od birth_date; dla szczepień "co X miesięcy" — offset w dniach
```

Pełna lista ~20 pozycji obowiązkowych + ~10 zalecanych z polskiego kalendarza.

### 2. Schema bazy — tabela `vaccine_records`

```sql
create table vaccine_records (
    id uuid primary key default gen_random_uuid(),
    child_id uuid references children on delete cascade not null,
    family_id uuid references families not null,
    vaccine_id text not null,      -- klucz z PSO_VACCINES lub 'custom'
    custom_name text,              -- jeśli vaccine_id = 'custom'
    scheduled_date date not null,
    done_date date,                -- null = niezrobione
    batch_number text,
    notes text,
    created_at timestamptz default now()
);
```

RLS: rodzina widzi swoje rekordy, admini zarządzają.

### 3. `src/screens/VaccineScreen.jsx`

#### Widok listy (domyślny)
- Sekcja „Nadchodzące" — szczepienia do wykonania, posortowane rosnąco po dacie
- Sekcja „Zaległe" — przeterminowane (czerwone tło)
- Sekcja „Wykonane" — lista z datą wykonania, serie, notatką
- Każdy wiersz: ikona ✓ / ⏰, nazwa szczepionki, termin, przycisk „Oznacz jako wykonane"

#### Widok kalendarza miesięcznego
- Przełącznik lista / kalendarz
- Na kalendarzu: kropki w dni ze szczepieniami (różne kolory: nadchodzące / zaległe / wykonane)
- Klik w dzień → modal z detalami

#### Dodawanie szczepienia niestandardowego
- Przycisk „+ Dodaj własne szczepienie"
- Pola: nazwa, data, notatka

#### Modal „Oznacz jako wykonane"
- Pola: data wykonania (domyślnie dziś), numer serii, notatka
- Przycisk Zapisz → update vaccine_records.done_date

### 4. Automatyczne generowanie harmonogramu

Przy tworzeniu profilu dziecka (FamilySetupScreen, v0.2):
```js
function generateVaccineSchedule(childId, familyId, birthDate) {
    const records = PSO_VACCINES.map(v => ({
        child_id: childId,
        family_id: familyId,
        vaccine_id: v.id,
        scheduled_date: addDays(birthDate, v.offsetDays)
    }));
    // bulk insert do vaccine_records
}
```

### 5. Przypomnienia e-mail

Opcja A — Supabase Edge Function (cron):
```
supabase/functions/vaccine-reminders/index.ts
```
- Uruchamiana codziennie o 08:00 (Supabase Scheduler lub zewnętrzny cron)
- Zapytanie: `vaccine_records` gdzie `scheduled_date = today + 7` i `done_date is null`
- Dla każdego rekordu: pobierz e-mail admina rodziny, wyślij mail przez SMTP home.pl
- Template HTML maila: pastelowy, z nazwą dziecka, szczepieniem, datą

Opcja B — PHP cron na home.pl (prostsze, nie wymaga Supabase Functions):
```
api/vaccine-reminders.php
```
- Dostępny przez URL z tajnym tokenem (CRON_SECRET w .env)
- Cron job na home.pl: `0 8 * * * curl https://draftlab.pl/bobolog-api/vaccine-reminders.php?token=SECRET`

**Rekomendacja: Opcja B na start** — zero konfiguracji Supabase Functions, SMTP już na home.pl.

### SQL do uruchomienia w Supabase (Dashboard → SQL Editor)

```sql
create table vaccine_records (
    id uuid primary key default gen_random_uuid(),
    child_id uuid references children on delete cascade not null,
    family_id uuid references families not null,
    vaccine_id text not null,
    custom_name text,
    scheduled_date date not null,
    done_date date,
    batch_number text,
    notes text,
    created_at timestamptz default now()
);

alter table vaccine_records enable row level security;

create policy "family members can view vaccine_records" on vaccine_records
    for select using (is_family_member(family_id));

create policy "admins can manage vaccine_records" on vaccine_records
    for all using (is_family_admin(family_id));
```

### Cron na home.pl (po wgraniu pliku)

1. Ustaw zmienne środowiskowe w panelu home.pl (lub `.env`):
   - `BOBOLOG_CRON_SECRET` — dowolny losowy string
   - `SUPABASE_URL` — URL projektu Supabase
   - `SUPABASE_SERVICE_KEY` — klucz service_role (nie anon!)
2. Panel home.pl → Zadania CRON → dodaj:
   `0 8 * * * curl "https://draftlab.pl/bobolog-api/vaccine-reminders.php?token=TWOJ_SECRET"`

### Checklist v0.4

- [x] pso_vaccines.js z pełną listą PSO 2024 (obowiązkowe + zalecane)
- [x] Tabela vaccine_records w Supabase + RLS — **uruchom SQL powyżej**
- [x] generateVaccineSchedule() wywoływana przy tworzeniu profilu dziecka
- [x] VaccineScreen.jsx (lista: nadchodzące/zaległe/wykonane)
- [x] Widok kalendarza miesięcznego ze szczepieniami
- [x] Modal „Oznacz jako wykonane" (data, seria, notatka)
- [x] Dodawanie własnego szczepienia
- [x] PHP cron: public/bobolog-api/vaccine-reminders.php
- [x] Template HTML maila przypomnienia
- [ ] Konfiguracja crona na home.pl (panel → Zadania CRON) — krok manualny

---

## v0.5 — Zdjęcia, eksport, kamienie milowe, tryb ciążowy, PWA offline

**Cel:** pełna wersja do użytku rodzinnego.

### 1. Zdjęcia przy wpisach

Instalacja:
```bash
npm install browser-image-compression
```

Przepływ:
1. W QuickAdd.jsx: przycisk „Dodaj zdjęcie" → `<input type="file" accept="image/*" capture="environment">`
2. Kompresja przed upload: max 800px, quality 0.8 (`browser-image-compression`)
3. Upload do Supabase Storage: bucket `baby-photos`, ścieżka `{family_id}/{child_id}/{entry_id}.jpg`
4. Zapisz URL w `entries.data.photoUrl`
5. W historii: miniatura 60×60px z możliwością powiększenia (lightbox)

Polityka Storage:
```sql
-- Bucket: baby-photos, prywatny
-- Policy: tylko członkowie rodziny mogą czytać/pisać
```

### 2. Eksport PDF

Instalacja: `npm install jspdf html2canvas`

`src/utils/exportPdf.js`:
- Generuje HTML z tabelą wpisów + wykresami centylowymi
- `html2canvas` → `jsPDF.addImage()`
- Pobierz jako `bobolog-[imie-dziecka]-[data].pdf`

Zawartość PDF:
- Strona 1: Podsumowanie (dane dziecka, statystyki)
- Strona 2+: Lista wpisów z miesiąca (tabela: data, typ, szczegóły)
- Ostatnia strona: wykres centylowy wagi + wzrostu

### 3. Eksport CSV

`src/utils/exportCsv.js`:
```js
export function exportCsv(entries, filename) {
    const rows = [['Data', 'Czas', 'Typ', 'Szczegóły', 'Notatka']];
    entries.forEach(e => rows.push([...]));
    const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    // trigger download
}
```

Przycisk eksportu w StatsScreen → modal: wybierz zakres dat → Pobierz PDF / Pobierz CSV.

### 4. Kamienie milowe

`src/data/milestones.js`:
```js
export const DEVELOPMENTAL_MILESTONES = [
    { id: 'm-01', category: 'ruch', monthFrom: 1, monthTo: 3, name: 'Unosi główkę w pozycji na brzuchu', who: true },
    { id: 'm-02', category: 'ruch', monthFrom: 3, monthTo: 6, name: 'Obraca się z pleców na brzuch', who: true },
    { id: 'm-03', category: 'spoleczne', monthFrom: 1, monthTo: 3, name: 'Uśmiecha się w odpowiedzi na uśmiech', who: true },
    // ~30 kamieni wg WHO Developmental Milestones + kilka własnych placeholderów
];
```

`src/screens/MilestonesScreen.jsx`:
- Lista kamieni pogrupowana po kategoriach: Ruch / Komunikacja / Społeczne / Poznawcze
- Każdy kamień: checkbox + data osiągnięcia + opcjonalne zdjęcie
- Sekcja „Własne kamienie" — formularz: nazwa, data, notatka, zdjęcie
- Oś czasu: widok pionowy z zaznaczonymi kamieniami

### 5. Tryb ciążowy

Logika w FamilySetupScreen (v0.2):
- Jeśli `birth_date` jest w przyszłości lub użytkownik zaznaczył „Ciąża" → tryb ciążowy
- Pole: `due_date` (przewidywana data porodu)

Dashboard w trybie ciążowym (`src/components/PregnancyDashboard.jsx`):
- Duży licznik: „Jeszcze **32 dni** do porodu" + tydzień ciąży
- Pasek postępu: tygodnie 1–42
- Po osiągnięciu `due_date`: prompt „Czy dziecko już jest?" → jeśli tak, przenieś do trybu dziennika, wyczyść `due_date`, ustaw `birth_date = today`
- Opcjonalnie: ciekawostki o rozwoju płodu per tydzień (statyczny JSON)

### 6. PWA + tryb offline

`vite.config.js` — dodaj plugin:
```bash
npm install -D vite-plugin-pwa
```

```js
import { VitePWA } from 'vite-plugin-pwa';
// w defineConfig:
plugins: [react(), VitePWA({
    registerType: 'autoUpdate',
    workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [{ urlPattern: /^https:\/\/.*\.supabase\.co\/.*/, handler: 'NetworkFirst' }]
    },
    manifest: {
        name: 'BoboLog — dziennik rodzica',
        short_name: 'BoboLog',
        theme_color: '#C9EBDB',
        background_color: '#F4FAF6',
        icons: [{ src: '/icon-192.png', sizes: '192x192' }, { src: '/icon-512.png', sizes: '512x512' }]
    }
})]
```

Obsługa offline w store.js:
- Przy `addEntry`: jeśli offline → zapisz do `localStorage` z flagą `pending: true`
- `navigator.onLine` listener: przy powrocie → flush pending entries do Supabase
- Wyświetl chip „Offline — wpisy zostaną zsynchronizowane"

Dodaj ikony PWA: `public/icon-192.png` i `public/icon-512.png` (bobas w bąbelku, tło miętowe).

### SQL dla milestone_records (uruchom w Supabase SQL Editor)

```sql
create table milestone_records (
    id uuid primary key default gen_random_uuid(),
    child_id uuid references children on delete cascade not null,
    family_id uuid references families not null,
    milestone_id text not null,
    done_date date not null,
    created_at timestamptz default now(),
    unique(child_id, milestone_id)
);

alter table milestone_records enable row level security;

create policy "family members can view milestone_records" on milestone_records
    for select using (is_family_member(family_id));

create policy "admins can manage milestone_records" on milestone_records
    for all using (is_family_admin(family_id));
```

### Edycja profilu dziecka (dodane przy v0.4→v0.5)

- [x] `updateChild(childId, data)` w store.js
- [x] `ChildProfileSection` w zakładce Ustawienia — edycja imienia i daty urodzenia

### Checklist v0.5

- [x] exportCsv.js + przycisk „↓ CSV" w StatsScreen
- [x] Instalacja jspdf + jspdf-autotable
- [x] exportPdf.js + modal eksportu z wyborem zakresu dat + przycisk „↓ PDF" w StatsScreen
- [x] milestones.js z listą WHO (26 kamieni, 0–36 mies.)
- [x] MilestonesScreen.jsx (lista + filtr + pasek postępu + „← teraz")
- [x] Tabela milestone_records w Supabase + RLS — **uruchom SQL powyżej**
- [x] PregnancyDashboard.jsx (odliczanie, tydzień ciąży, pasek postępu) — zrealizowane w v0.6
- [x] Logika trybu ciążowego w FamilySetupScreen i App.jsx — zrealizowane w v0.6
- [x] Instalacja vite-plugin-pwa — zrealizowane w v0.6
- [x] manifest.json + ikony 192/512px — zrealizowane w v0.6
- [x] Obsługa offline: pending queue w localStorage + flush przy powrocie online — zrealizowane w v0.6
- [x] Zdjęcia — zrealizowane szerzej jako moduł Wspomnienia w v0.6

---

## v0.6 — „Duży przeskok" (zakres ustalony z właścicielem 2026-07-04)

**Cel:** największa aktualizacja od startu — nowe funkcje „wow" zamiast domykania drobiazgów.
Decyzje zapadły w wywiadzie 10 pytań; NIE renegocjować poniższych rozstrzygnięć:

- Charakter: głównie nowe funkcje „wow" (nie polerowanie istniejących).
- Analityka: **lokalna** (w przeglądarce), bez API AI — zero kosztów, dane nie wychodzą.
- Push: **tak, w tej wersji** (Web Push, wymaga PWA + tabeli subskrypcji + crona).
- Zdjęcia: **pełny moduł „Wspomnienia"** (nie prosty załącznik do wpisu).
- Zdrowie (leki/dieta/wizyty): NIE w tej wersji. Widok dla pediatry: NIE (zostaje PDF).
- Tryb ciążowy: **tak, pełny** (jedyny dług z pierwotnych decyzji produktowych).
- PWA: **pełny offline** z kolejką pending i sync „ostatni zapis wygrywa".
- Zdjęcia: mocna kompresja ~200–300 KB / max 1200px, bez limitów ilości (1 GB ≈ 4000 zdjęć).
- Analityka żyje na **przebudowanym dashboardzie „Dziś"** (sekcja insightów), nie w osobnej zakładce.

### Filary

1. **Lokalna analityka + przebudowa dashboardu „Dziś"**
   - Karta rytmu dnia (wykrywanie typowych pór drzemek/karmień z ostatnich 14 dni)
   - Przewidywana następna drzemka / karmienie (rozwinięcie obecnej mediany)
   - Podsumowanie tygodnia (sen/karmienia vs poprzedni tydzień, trendy)
   - Korelacje karmienie↔sen; wszystko liczone w przeglądarce, bez backendu

2. **Moduł „Wspomnienia"** (nowa zakładka)
   - Oś czasu zdjęć; upload do Supabase Storage, bucket `baby-photos`,
     ścieżka `{family_id}/{child_id}/…`, kompresja `browser-image-compression`
   - Miesięcznice („dziś kończy 5 miesięcy") — karta także na dashboardzie
   - Zdjęcia przy kamieniach milowych; widok „rok temu / miesiąc temu"

3. **PWA + pełny offline** (`vite-plugin-pwa`, manifest, ikony 192/512)
   - Kolejka pending w localStorage + flush po powrocie online, chip „Offline"

4. **Web Push** (na fundamencie PWA)
   - Tabela `push_subscriptions` w Supabase + VAPID
   - Przypomnienia: szczepienia, „dziecko śpi już X h", opcjonalnie miesięcznice
   - Wysyłka: rozszerzenie PHP crona w `public/bobolog-api/` (jak vaccine-reminders)

5. **Tryb ciążowy** (dokończenie z v0.5)
   - PregnancyDashboard: odliczanie, tydzień ciąży, pasek 1–42 tyg., ciekawostki per tydzień
   - Po `due_date`: prompt „Czy dziecko już jest?" → przejście w dziennik

### Checklist v0.6 — ✅ ZAKODOWANE (2026-07-04)

- [x] Moduł analityki lokalnej `src/utils/insights.js` (predykcje, rytm dnia, tydzień, korelacja Pearsona)
- [x] Przebudowa dashboardu „Dziś" — `src/components/InsightsSection.jsx`
- [x] MemoriesScreen (`src/screens/MemoriesScreen.jsx`): oś czasu, miesięcznice, „rok temu/miesiąc temu", lightbox
- [x] Upload + kompresja zdjęć (`src/utils/compressImage.js`, canvas, ~300 KB / 1200px, bez zależności)
- [x] Nowy typ wpisu `memory` + funkcje Storage w store.js (signed URLs, bucket prywatny)
- [x] vite-plugin-pwa (strategia injectManifest, własny `src/sw.js` bez workbox) + manifest + ikony 192/512/apple-touch
- [x] Kolejka offline pending w store.js + flush po `online` + chip „Offline" w App
- [x] Cache ostatnich 500 wpisów w localStorage (odczyt offline)
- [x] `src/utils/push.js` (subskrypcja VAPID) + sekcja „Powiadomienia push" w Ustawieniach
- [x] SW: handlery `push` + `notificationclick`
- [x] PHP: `public/bobolog-api/webpush-lib.php` (VAPID ES256 + RFC 8291 aes128gcm, bez composera; algorytm zweryfikowany round-tripem w Node)
- [x] PHP cron: `public/bobolog-api/push-notifications.php` (szczepienia jutro/za 7 dni + miesięcznice, czyszczenie martwych subskrypcji)
- [x] PregnancyDashboard.jsx (tydzień ciąży, pasek 1–42, ciekawostki `src/data/pregnancy_weeks.js`, przycisk „dziecko już jest" → birth_date + harmonogram PSO)
- [x] Wersja v0.6 w stopce, karta + changelog na draftlab.pl
- [x] Statystyki: dowolny zakres dni (przycisk „Własny", 2–365) + personalizacja sekcji
      (kolejność ↑↓ i widoczność 👁 per zakładka, panel „Dostosuj"; zapis w localStorage
      `bobolog.statsPrefs` — per urządzenie, jak pozostałe preferencje UI)

**Uwaga:** powiadomienie „dziecko śpi już X h" wymaga timera snu w bazie (dziś: localStorage per urządzenie) — przeniesione do backlogu.

### SQL do uruchomienia w Supabase (Dashboard → SQL Editor) — WYMAGANE

```sql
-- 1. Nowy typ wpisu: memory (zdjęcia-wspomnienia) + mood (nastrój dnia 1-10)
alter table entries drop constraint entries_type_check;
alter table entries add constraint entries_type_check
    check (type in ('feed','sleep','diaper','weight','vaccine','milestone','note','memory','mood'));

-- 2. Bucket na zdjęcia (prywatny) + polityki per rodzina (ścieżka: family_id/child_id/plik.jpg)
insert into storage.buckets (id, name, public) values ('baby-photos', 'baby-photos', false);

create policy "family can read photos" on storage.objects for select
    using (bucket_id = 'baby-photos' and is_family_member(((string_to_array(name, '/'))[1])::uuid));
create policy "family can upload photos" on storage.objects for insert
    with check (bucket_id = 'baby-photos' and is_family_member(((string_to_array(name, '/'))[1])::uuid));
create policy "admins can delete photos" on storage.objects for delete
    using (bucket_id = 'baby-photos' and is_family_admin(((string_to_array(name, '/'))[1])::uuid));

-- 3. Subskrypcje Web Push
create table push_subscriptions (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users on delete cascade not null,
    family_id uuid references families on delete cascade not null,
    endpoint text unique not null,
    p256dh text not null,
    auth text not null,
    created_at timestamptz default now()
);
alter table push_subscriptions enable row level security;
create policy "users manage own subscriptions" on push_subscriptions
    for all using (user_id = auth.uid()) with check (user_id = auth.uid());
```

### Konfiguracja na home.pl (kroki manualne)

1. Wgraj `public/bobolog-api/webpush-lib.php` i `push-notifications.php` na serwer.
2. Zmienne środowiskowe (panel home.pl lub edycja definiowanych stałych w pliku):
   - `BOBOLOG_VAPID_PUBLIC` — klucz publiczny (ten sam co `VITE_VAPID_PUBLIC_KEY` w `bobolog/.env`)
   - `BOBOLOG_VAPID_PRIVATE` — klucz prywatny VAPID (wygenerowany 2026-07-04, NIE commitować;
     zapisany tylko lokalnie — poproś AI o ponowną generację parą, jeśli zginie:
     `node -e` z `generateKeyPairSync('ec', {namedCurve:'prime256v1'})`)
   - `BOBOLOG_CRON_SECRET`, `SUPABASE_URL`, `SUPABASE_SERVICE_KEY` — jak przy vaccine-reminders
3. Cron: `30 8 * * * curl "https://draftlab.pl/bobolog-api/push-notifications.php?token=TWOJ_SECRET"`

---

---

## Przed publicznym launchem — obowiązkowe

Lista rzeczy celowo pominiętych podczas developmentu, które **muszą** być gotowe zanim
aplikacja trafi do szerszego grona użytkowników.

| # | Zadanie | Gdzie | Uwagi |
|---|---|---|---|
| 1 | **Włączyć potwierdzanie e-mail** | Supabase → Authentication → Settings → Enable email confirmations: ON | Wyłączone celowo podczas dev (2026-07) żeby szybko testować konta. Bez tego każdy może podać cudzy e-mail. |
| 2 | Włączyć logowanie przez Google | Supabase → Authentication → Providers → Google | Wymaga projektu w Google Cloud Console. |
| 3 | Włączyć logowanie przez Apple | Supabase → Authentication → Providers → Apple | Wymaga Apple Developer Account ($99/rok). |
| 4 | Dodać politykę prywatności i regulamin | Nowa podstrona w BoboLog | Wymagane RODO — dane dzieci to dane wrażliwe. |
| 5 | Skonfigurować własny szablon maili | Supabase → Authentication → Email Templates | Domyślne maile Supabase wyglądają nieprofesjonalnie. |
| 6 | Skonfigurować własny SMTP | Supabase → Settings → Auth → SMTP | Użyć skrzynki home.pl zamiast domyślnego Supabase mailer. |
| 7 | Zmienić URL aplikacji w Supabase | Supabase → Authentication → URL Configuration | Ustawić `Site URL` na docelową domenę (bobolog.pl). |
| 8 | Ping co 5 dni (anti-pause) | Cron na home.pl | Darmowy projekt Supabase pauzuje po 7 dniach bez aktywności. PHP: `curl https://klvqknvrfodqhjhxjyko.supabase.co/rest/v1/ -H "apikey: sb_publishable_..."` |

---

## Wersje przyszłe (backlog bez szczegółów)

| Wersja | Funkcja |
|---|---|
| v0.7 | **Korelacje nastroju** — wykres korelacji nastroju (1–10/dzień) z innymi czynnikami: średnim snem, liczbą karmień, zmianami pieluchy; widoczne w zakładce Trend w StatsScreen; korelacja Pearsona liczona lokalnie (analogicznie do `insights.js`); podpowiedź: „Dobry nastrój pojawia się gdy dziecko śpi średnio ≥ X h" |
| v0.8 | Wielojęzyczność (i18n): angielski, ewentualnie inne języki |
| v0.9 | Leki + temperatura + rozszerzanie diety + wizyty (odrzucone z v0.6 — pyt. 5) |
| v1.0 | Podgląd dla pediatry: link read-only do profilu dziecka (odrzucone z v0.6 — pyt. 6) |
| v1.1 | RODO: polityka prywatności, eksport wszystkich danych, usuń konto |
| v1.2 | Wersja premium / bobolog.pl (własna domena) |

---

## Konwencje deweloperskie

### Nowe komponenty

Umieszczaj w `src/components/` (małe, reusable) lub `src/screens/` (pełne ekrany, odpowiedniki zakładek). Styl: Tailwind utility classes + kolory przez `bg-bb-primary` itp. (zmapowane na CSS vars).

### Nowe typy wpisów

Każdy nowy typ wpisu (`weight`, `vaccine`, `milestone`) wymaga:
1. Rozszerzenia union type w komentarzu w `store.js`
2. Obsługi w `QuickAdd.jsx` (nowa zakładka w szybkim wpisie lub osobny ekran)
3. Obsługi w `History` (wyświetlanie `entryDetails()`)
4. Obsługi w `Stats` (liczniki, wykresy)

### Build i deploy

```bash
# 1. Zbuduj BoboLog
cd bobolog && npm run build

# 2. Skopiuj do draftlab (jeśli nadal w trybie bez subdomeny)
rm -rf ../public/bobolog && cp -r dist ../public/bobolog

# 3. Zbuduj draftlab
cd .. && npm run build

# 4. Wgraj cały dist/ na serwer home.pl
```

Po podpięciu subdomeny: pomiń kroki 2–3, wgraj `bobolog/dist/` bezpośrednio na subdomenę.

### Zmiana URL po podpięciu subdomeny

W `src/data/db.js` (draftlab):
```js
url: 'https://bobolog.draftlab.pl',   // zamiast 'bobolog/'
external: true,                        // dodaj z powrotem
```

W `bobolog/vite.config.js`:
```js
base: '/',   // zamiast './' — ścieżki absolutne na własnej domenie
```

---

*Dokument aktualizować po każdej wersji: zaznaczać [x] w checklistach, aktualizować sekcję „Stan aktualny".*

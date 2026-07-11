# LUNAPARK — dokument założycielski

> Nazwa produktu: **LUNAPARK** (przyjęta 2026-07-11; wcześniej projekt działał pod
> roboczą nazwą "TeleGra '92").
>
> Status: **faza projektowania** (start 2026-07-11). Projekt rozwijany długofalowo,
> docelowo komercyjnie. Odrębny od strony głównej DraftLab — ewentualne podlinkowanie
> dopiero gotowego produktu.

## 1. Wizja

**Platforma-teleturniej na żywo**: duży ekran (TV/laptop) jest studiem, telefony graczy
są pulpitami. Nie pojedyncza gra, lecz **system modułowych rund**, z których host układa
wieczór — od szybkiej 20-minutowej partii w pubie po godzinny "odcinek" na domówce.

Czym się różni od NEON QUIZ: NEON QUIZ to jedna zamknięta gra zrobiona w wieczór.
LUNAPARK to produkt: biblioteka trybów, biblioteka treści, konfigurowalna rozgrywka,
jakość oprawy na poziomie komercyjnym.

## 2. Decyzje podjęte (sesja projektowa 2026-07-11)

| Obszar | Decyzja |
|---|---|
| Odbiorcy | Domówki/znajomi, puby (pub quizy), spotkania rodzinne — **nie** korporacje |
| Ton | Luźny, ale zasady zrozumiałe dla wszystkich pokoleń naraz |
| Estetyka | **Nowoczesny minimalizm premium z DNA teleturnieju prime-time** — czysto i "drogo", ale z reflektorami, napięciem, dramaturgią chwili przed odpowiedzią |
| Kierunek wizualny | **"Lunapark"** (2026-07-11, po 4 rundach moodboardu — `docs/moodboard.html`): nocne wesołe miasteczko. Niebo nocy #171233, żarówka #FFB13D, wata cukrowa #FF5FA2, neon strzelnicy #43E0D8, światło kasy #F7F1E4. Role kolorów: bursztyn = pieniądze, róż = emocje/kulminacje, turkus = decyzje graczy. Żarówki marquee, łuny karuzeli, ciepły gruby grotesk z poświatą. Ryzyko: granica z jarmarcznością — pilnować nowoczesnej typografii i oszczędnego światła. Odrzucone po drodze: Złoty Sygnał, Antena, Aksamit (r. 1 — za ciemne/mało charakterystyczne), Żeton, Fest (r. 2), Rewia, Planetarium (r. 3), Molo, Lampiony, Pokaz (r. 4 — finaliści) |
| Struktura gry | **Modułowa** — rundy jako klocki, host komponuje sesję (długość 15–60+ min) |
| Format graczy | **Oba tryby**: indywidualny i drużynowy (wybór przy zakładaniu pokoju) |
| Rdzeń emocjonalny | Docelowo wszystkie cztery jako wybieralne tryby: ryzyko/zakłady, blef/psychologia, dynamika drużynowa, dramaturgia teleturnieju |
| Pierwszy moduł | **Ryzyko i zakłady** — działa solo i drużynowo, bez wpisywania tekstu, mamy doświadczenie z zakładami z NEON QUIZ |
| Próg MVP | **Szkielet platformy + surowy tryb** — najpierw architektura pod moduły (lobby, pokoje, konfigurator rund), mechanika może być na start prosta |
| Treść | Wszystkie trzy filary: (a) kuratorowane paczki pisane ręcznie, (b) pipeline AI + panel weryfikacji, (c) edytor własnych zestawów dla hostów |
| Języki | Start po polsku, ale **architektura treści z i18n od pierwszego dnia** (rynek szerszy niż PL w planach) |
| Stack | "Coś pośrodku": realtime jak w NEON QUIZ, ale **treść w prawdziwej bazie, nie w kodzie**; bez kont i płatności na start (gotowość na nie później) |
| Backend | **Supabase** (2026-07-11): Postgres na treść, Supabase Realtime na stan pokoju; RLS i konta gotowe pod przyszłą monetyzację |
| Język | **TypeScript od startu** (2026-07-11) — kontrakt modułów i maszyna stanów wymagają typów |
| Model biznesowy | Jeszcze nieustalony — najpierw świetny produkt, model dobierzemy po pierwszych graczach |

## 3. Architektura (propozycja do zatwierdzenia)

### Warstwy
1. **Silnik rozgrywki (realtime)** — host jest mózgiem gry (sprawdzony wzorzec z NEON QUIZ):
   maszyna stanów faz na ekranie hosta, telefony czytają stan pokoju i zapisują tylko akcje.
2. **Warstwa treści (baza)** — pytania/paczki poza kodem, ładowane do sesji przy starcie.
   Struktura pytania od razu wielojęzyczna: `{ id, type, difficulty, tags, i18n: { pl: {...} } }`.
3. **Warstwa modułów** — każda runda to moduł implementujący wspólny kontrakt
   (np. `setup(config) → fazy → wynik rundy`), rejestrowany w katalogu modułów.
   Konfigurator sesji hosta składa playlistę modułów.

### Rozstrzygnięte (2026-07-11)
- **Backend: Supabase** — Postgres na treść (paczki/pytania/i18n), Supabase Realtime
  na stan pokoju. Wzorzec "host mózgiem gry" przenosimy świadomie na model Realtime.
- **Frontend: React + Vite + Tailwind + framer-motion, TypeScript od startu.**
- **Maszyna stanów: XState** (zatwierdzone przy starcie Etapu 1) — formalna maszyna faz
  sesji i modułów; framer-motion jako baza animacji, warstwa "fajerwerków" (marquee,
  ceremonie) do rozstrzygnięcia w Etapie 3 (CSS/canvas/GSAP). Dźwięk: Howler.js w Etapie 3.
- **Układ aplikacji**: jedna appka Vite, routy `/host` (ekran TV) i `/play` (telefon).

### Do rozstrzygnięcia
- Dźwięk: oprawa audio (sygnały napięcia, fanfary) to część DNA prime-time — kiedy wchodzi.

## 4. Pierwszy moduł: "Ryzyko i zakłady"

**Zaprojektowany** (sesja 2026-07-11) — pełna specyfikacja w `docs/modul-01-ryzyko-i-zaklady.md`.
Sedno: zakłady **w ciemno** (widzisz tylko kategorię i trudność), trzy progi stawek + VA BANQUE,
przegrane stawki zasilają **Bank** padający w Pytaniu o Bank na końcu każdego z trzech aktów,
wygrane ważone trudnością (×1/×1.5/×2), bankructwo z ratunkiem. Trzy akty (domyślnie 5+5+3 pytań,
≈25-30 min) z eskalacją: kategorie losowane → wybierane rotacyjnie → licytowane. Cztery typy
pytań w v1 (ABCD, szacowanie, prawda/fałsz, uporządkuj). Otwarte detale (tryb drużynowy,
sabotaż, licytacja, czasy) wylistowane w specyfikacji.

## 5. Roadmapa (zgrubna)

- **Etap 0 — projekt** *(teraz)*: ~~mechanika modułu 1 na papierze~~ ✔, ~~wybór
  backendu~~ ✔ (Supabase + TS), ~~model danych treści~~ ✔ (`docs/model-danych-tresci.md`)
  ~~otwarte detale mechaniki modułu 01~~ ✔, ~~moodboard estetyki~~ ✔ (wybrany
  kierunek "Lunapark" po 4 rundach), ~~lista rdzeniowych kategorii~~ ✔ (16 kategorii
  w `docs/kategorie.html` — zaakceptowane jako punkt wyjściowy; flavor texty to szkice
  do przepisania przy pierwszej paczce, **bez nazwisk i marek**). **ETAP 0 ZAMKNIĘTY.**
- **Etap 1 — szkielet platformy**: pokoje + lobby (kod, dołączanie telefonem), maszyna
  stanów sesji, kontrakt modułów, konfigurator rund hosta, treść ładowana z bazy.
- **Etap 2 — moduł Ryzyko i zakłady** (surowy, grywalny end-to-end) + pierwsza
  kuratorowana paczka pytań PL. → **MVP: test na prawdziwej domówce.**
- **Etap 3 — oprawa**: design premium, animacje, dźwięk, ekrany intro/finał/zwycięzcy.
- **Etap 4 — treść w skali**: pipeline AI + panel weryfikacji, kolejne paczki.
- **Etap 5 — kolejne moduły**: blef/psychologia, dramaturgia (eliminacje), tryby drużynowe pogłębione.
- **Etap 6 — produkt**: konta hostów, edytor zestawów, przygotowanie pod monetyzację, i18n w praktyce.

## 6. Zasady pracy nad projektem

- **Decyzje produktowe podejmuje właściciel projektu** — przed wprowadzeniem nowej
  mechaniki, elementu UI czy decyzji brandingowej/architektonicznej przedstawiamy opcje
  z rekomendacją i czekamy na wybór. Autopilot tylko dla technicznych szczegółów wykonawczych.
- Decyzje produktowe zapisujemy w tym pliku (sekcja 2 rośnie).
- Nie kopiujemy kodu z NEON QUIZ bezmyślnie — przenosimy *wzorce*, kod piszemy pod platformę.
- Każdy etap kończy się czymś odpalanym/testowalnym.

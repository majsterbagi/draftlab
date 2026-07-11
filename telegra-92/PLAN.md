# TeleGra '92 — dokument założycielski

> Nazwa robocza (branding właściwy później — "TeleGra '92" była wcześniej kandydatem
> na rebranding NEON QUIZ; tu służy jako placeholder i może zostać, jeśli się obroni).
>
> Status: **faza projektowania** (start 2026-07-11). Projekt rozwijany długofalowo,
> docelowo komercyjnie. Odrębny od strony głównej DraftLab — ewentualne podlinkowanie
> dopiero gotowego produktu.

## 1. Wizja

**Platforma-teleturniej na żywo**: duży ekran (TV/laptop) jest studiem, telefony graczy
są pulpitami. Nie pojedyncza gra, lecz **system modułowych rund**, z których host układa
wieczór — od szybkiej 20-minutowej partii w pubie po godzinny "odcinek" na domówce.

Czym się różni od NEON QUIZ: NEON QUIZ to jedna zamknięta gra zrobiona w wieczór.
TeleGra '92 to produkt: biblioteka trybów, biblioteka treści, konfigurowalna rozgrywka,
jakość oprawy na poziomie komercyjnym.

## 2. Decyzje podjęte (sesja projektowa 2026-07-11)

| Obszar | Decyzja |
|---|---|
| Odbiorcy | Domówki/znajomi, puby (pub quizy), spotkania rodzinne — **nie** korporacje |
| Ton | Luźny, ale zasady zrozumiałe dla wszystkich pokoleń naraz |
| Estetyka | **Nowoczesny minimalizm premium z DNA teleturnieju prime-time** — czysto i "drogo", ale z reflektorami, napięciem, dramaturgią chwili przed odpowiedzią |
| Struktura gry | **Modułowa** — rundy jako klocki, host komponuje sesję (długość 15–60+ min) |
| Format graczy | **Oba tryby**: indywidualny i drużynowy (wybór przy zakładaniu pokoju) |
| Rdzeń emocjonalny | Docelowo wszystkie cztery jako wybieralne tryby: ryzyko/zakłady, blef/psychologia, dynamika drużynowa, dramaturgia teleturnieju |
| Pierwszy moduł | **Ryzyko i zakłady** — działa solo i drużynowo, bez wpisywania tekstu, mamy doświadczenie z zakładami z NEON QUIZ |
| Próg MVP | **Szkielet platformy + surowy tryb** — najpierw architektura pod moduły (lobby, pokoje, konfigurator rund), mechanika może być na start prosta |
| Treść | Wszystkie trzy filary: (a) kuratorowane paczki pisane ręcznie, (b) pipeline AI + panel weryfikacji, (c) edytor własnych zestawów dla hostów |
| Języki | Start po polsku, ale **architektura treści z i18n od pierwszego dnia** (rynek szerszy niż PL w planach) |
| Stack | "Coś pośrodku": realtime jak w NEON QUIZ, ale **treść w prawdziwej bazie, nie w kodzie**; bez kont i płatności na start (gotowość na nie później) |
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

### Do rozstrzygnięcia (następna sesja)
- **Backend**: Firebase (RTDB na stan gry + Firestore na treść — jeden projekt, znany
  wzorzec) vs Supabase (Postgres na treść + Realtime na stan — znany z GamerLab, lepszy
  pod przyszłe konta/płatności/panel treści). Wstępna rekomendacja: **Supabase**,
  bo warstwa treści i przyszły panel weryfikacji AI ciążą ku relacyjnej bazie.
- Frontend: React + Vite + Tailwind + framer-motion (kontynuacja sprawdzonego stacku)
  — czy coś zmieniamy (np. TypeScript od startu? rekomendacja: **tak**, projekt długofalowy).
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

- **Etap 0 — projekt** *(teraz)*: ~~mechanika modułu 1 na papierze~~ ✔ (2026-07-11),
  model danych treści, wybór backendu, moodboard estetyki premium/prime-time.
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

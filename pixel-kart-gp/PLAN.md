# PIXEL KART GP 🏁

Gra imprezowa w duchu Mario Kart. Komputer/TV to ekran wyścigu (host), telefony to
kontrolery + ekran ekwipunku. Podprojekt DraftLab, rozwijany dla frajdy, bez deadline'u.

---

## 1. Koncept

- **Gatunek:** wyścig top-down (widok z góry) w ładnym pixel arcie.
- **Gracze:** maks. 4, dołączanie przez QR kod, gra w przeglądarce telefonu (bez instalacji).
- **Czas wyścigu:** ~3 min, długość konfigurowalna w ustawieniach hosta.
- **Serce gry:** power-upy (klasyka: pocisk, banan, boost, tarcza) + rubber-banding
  (ostatni dostają lepsze itemy) + fajna, "miękka" fizyka jazdy z driftem.
- **Power-upy zdobywa się przez mini-wyzwania na telefonie** w trakcie jazdy
  (np. szybkie tapnięcie sekwencji, przeciągnięcie wzoru) — im lepiej, tym lepszy item.
- **Telefon pokazuje:** ekwipunek, mini-wyzwania, pozycję w wyścigu, przycisk użycia itemu.
- **Ekran hosta pokazuje:** cały tor, wszystkie karty, pozycje, okrążenia, eventy.

## 2. Rozstrzygnięte decyzje (Q&A z 2026-07-09)

| Temat | Decyzja |
|---|---|
| Styl | Pixel art "ale ładny", top-down |
| Sterowanie | Kilka trybów do wyboru (patrz §4) |
| Gracze | Max 4 |
| Power-upy | Klasyka na start, rubber-banding TAK |
| Zdobywanie itemów | Mini-wyzwania na telefonie |
| Tryby | 2 na start (pojedynczy wyścig + Grand Prix), później więcej |
| Trasy | 1 dopracowana trasa na MVP, projektowane ręcznie ("z górnej półki", nie proceduralne) |
| Personalizacja | Nazwa + awatar; wybór auta w przyszłości |
| Audio | Minimalizm na start |
| Hosting | Ten sam serwer/model co NEON QUIZ 86 (statyczny build) |
| Dołączanie | QR kod |
| Miejsce w repo | Osobny podprojekt `pixel-kart-gp/` (możliwe wydzielenie w przyszłości) |
| Nazwa | **Pixel Kart GP** |

## 3. Architektura techniczna

### Stack (spójny z NEON QUIZ 86)
- **Vite + React 18 + Tailwind** — shell aplikacji (lobby, menu, ekrany telefonu).
- **Canvas 2D** — sam wyścig renderowany w pętli gry (60 fps) poza Reactem;
  React tylko opakowuje canvas. Bez silnika na start; jeśli zabraknie wydajności → PixiJS.
- **Firebase RTDB** — lobby, dołączanie, konfiguracja pokoju (jak w NEON QUIZ).

### Sieć — kluczowy problem: latencja sterowania
Quiz toleruje sekundę opóźnienia, wyścig nie. Plan dwuwarstwowy:

1. **Warstwa lobby (Firebase RTDB):** tworzenie pokoju, QR, dołączanie, nazwy/awatary,
   ustawienia — dokładnie wzorzec z NEON QUIZ 86.
2. **Warstwa gry (WebRTC DataChannel):** po skompletowaniu lobby host nawiązuje
   bezpośrednie połączenia P2P z każdym telefonem. **Sygnalizacja przez Firebase RTDB**
   (wymiana ofert/kandydatów ICE), potem dane lecą bezpośrednio po Wi-Fi w LAN —
   latencja rzędu kilku–kilkunastu ms, zero kosztów serwera, działa na statycznym hostingu.
   - Telefon wysyła tylko input (kierunek, gaz, użycie itemu) — mały, częsty pakiet.
   - Host jest autorytatywny: cała symulacja fizyki i logika gry liczy się na hoście.
   - Host odsyła telefonom rzadkie aktualizacje stanu (pozycja, ekwipunek, wyzwania).
3. **Fallback:** gdy WebRTC nie wstanie (nietypowa sieć), awaryjnie input przez RTDB —
   grywalne dzięki temu, że sterowanie może być "rzadkie" (tryb tap, patrz niżej).

### Fizyka jazdy (custom, arcade)
- Model: przyspieszenie/hamowanie, skręt zależny od prędkości, **drift** z mini-boostem
  po udanym ślizgu, kolizje z bandami (odbicie + utrata prędkości), nawierzchnie
  (asfalt / trawa spowalnia / plamy boostu).
- Tor definiowany jako dane (tilemapa + linia środkowa toru do liczenia pozycji/okrążeń
  i checkpointów przeciw skrótom).

## 4. Sterowanie — tryby do wyboru (per gracz)

1. **Kierownica (żyroskop):** przechylanie telefonu = skręt; gaz automatyczny lub przycisk.
2. **Przyciski:** lewo/prawo + gaz/hamulec na ekranie.
3. **Kciuk (touch-slider):** przesuwanie kciukiem po dolnej belce = pozycja kierownicy.

Wspólny dla wszystkich: duży przycisk ITEM. Gracz wybiera tryb w lobby, można
zmienić między wyścigami.

## 5. Struktura podprojektu

```
pixel-kart-gp/
├── PLAN.md
├── index.html
├── package.json
├── src/
│   ├── host/          # ekran gry: lobby, canvas wyścigu, wyniki
│   ├── controller/    # ekran telefonu: join, pad, ekwipunek, mini-wyzwania
│   ├── game/          # czysta logika: fizyka, tor, itemy, pozycje (bez Reacta)
│   ├── net/           # lobby (RTDB) + WebRTC (sygnalizacja, kanały danych)
│   └── assets/        # sprite'y, tilesety, dźwięki
└── ...
```

Zasada: `game/` nie importuje niczego z Reacta ani sieci — czysta, testowalna symulacja.
Ułatwi to też ewentualne wydzielenie projektu w przyszłości.

## 6. Road mapa

### v0.1 — Prototyp jazdy (fundament) ✅
- [x] Scaffold projektu (Vite + React + Tailwind + canvas)
- [x] Pętla gry + fizyka karta (jazda klawiaturą, drift z mini-boostem, trawa spowalnia)
- [x] Pierwsza trasa (oś toru Catmull-Rom zamiast tilemapy — prostsze i wystarczające;
      checkpointy z blokadą skrótów przez trawę, okrążenia, pozycje, meta)
- [x] Placeholder grafika (proceduralne sprite'y, ślady driftu, płomień boostu)
- [x] Bonus: 2 graczy lokalnie (strzałki+spacja / WASD+Shift), ustawienia okrążeń, restart
- [x] Tuning po testach (feedback 2026-07-09: "ciężko się steruje, za szybko, za wąsko"):
      droga 30→42 px, prędkość max 155→125, szybszy skręt (3.0→3.6 rad/s, pełny już
      od 40 px/s). Feeling jazdy nadal do obserwacji w v0.2 na prawdziwych padach.

**Cel:** samą jazdą po torze ma być przyjemnie sterować. To tu rozstrzyga się "fajna fizyka".

### v0.2 — Telefony jako pady ✅
- [x] Lobby: pokój, QR, dołączanie, nick + awatar (ta sama baza RTDB co NEON QUIZ,
      pokoje rooms/{kod} z polem app: 'pixelkart' — bez zmian reguł w konsoli)
- [x] WebRTC: pad inicjuje ofertę, sygnalizacja przez RTDB, DataChannel bez retransmisji
      (input 30 Hz → host, stan 10 Hz → pad); automatyczny fallback przez RTDB po 5 s
- [x] Sterowanie: przyciski (◀ ▶ GAZ DRIFT) + tryb żyroskopu (beta, z obsługą zgody iOS)
- [x] Do 4 kart sterowanych z telefonów; tryb lokalny na klawiaturze został pod #/local
- [x] Zweryfikowane E2E: pad w iframe → lobby → P2P → wyścig → stan zwrotny na padzie

### v0.3 — MVP: "działa na imprezie" 🎉 ✅
- [x] Power-upy: pocisk (leci po linii prostej, trafia w co jest z przodu), banan
      (statyczna pułapka za kartem), boost (mini-boost na żądanie), tarcza (blokuje
      jedno trafienie) — game/items.js + logika w game/race.js
- [x] Mini-wyzwania na telefonie: kart bez itemu ładuje się (czas zależny od miejsca —
      rubber-banding), potem ~1.5 s okno "ŁAP! ❓" na padzie; jeden generyczny przycisk
      ITEM łapie/używa zależnie od stanu karta (host autorytatywnie rozstrzyga sens akcji,
      więc opóźnienia sieci nie psują znaczenia przycisku)
- [x] Rubber-banding podwójny: czas ładowania (lider ~7s, ostatni ~3s) i pula itemów
      (lider głównie boost/tarcza, ostatni głównie pociski)
- [x] Ekran telefonu: przycisk ITEM z paskiem czasu wyzwania / ikoną trzymanego itemu
- [x] Start (3-2-1), meta, ekran wyników — z v0.1/v0.2, bez zmian
- [x] Ustawienia hosta: okrążenia (z v0.2)
- [x] Tryb lokalny też ma przedmioty (Enter / lewy Ctrl) — do szybkich testów bez telefonów
- [x] Zweryfikowane headless: pełny cykl złap→pocisk→trafienie→spin, blokada tarczą

### v0.4 — Szlif (w toku)
- [x] Ekran menu (checkerboard jak linia mety, "GRAJ ▶", link do trybu lokalnego) —
      pokój tworzy się w tle od razu, więc QR jest gotowy zanim gracz kliknie GRAJ
- [x] Druga trasa "Szeroka Pętla" (kontrast do pierwszej: szerokie łuki zamiast
      wąskiego zacisku) — trasy jako dane w game/tracks.js, wybór kartami z miniaturką
      (ten sam rysunek co w grze) w lobby hosta i w trybie lokalnym
- [x] Powiększony obszar gry na ekranie (canvas do min(1220px, 95vw), było 960px/92vw;
      fizyka i tuning bez zmian — to tylko powiększenie renderu w CSS)
- [ ] Docelowy pixel art trasy i kart
- [ ] Trzeci tryb sterowania (touch-slider)
- [ ] Tryb Grand Prix (seria wyścigów, punktacja, klasyfikacja generalna)
- [ ] Minimalne audio: start, item, meta
- [x] Podpięcie do strony głównej DraftLab (wpis w bazie projektów, aktualizowany co wersję)

### Później (backlog)
- Kolejne trasy (każda z własnym motywem)
- Wybór auta (statystyki: szybkość/przyczepność)
- Nowe power-upy, w tym "imprezowe" (zamiana miejsc, odwrócone sterowanie)
- Więcej trybów (battle/eliminacje, tryb drużynowy)
- Duchy/rekordy okrążeń, soundtrack
- Ewentualne wydzielenie do osobnego repo

## 7. Ryzyka i uwagi

- **WebRTC w LAN** zwykle działa świetnie, ale niektóre routery izolują klientów
  (AP isolation) — stąd fallback przez RTDB i "tolerancyjny" design inputu.
- **Żyroskop na iOS** wymaga zgody użytkownika (`DeviceOrientationEvent.requestPermission`)
  i HTTPS — przycisk "włącz kierownicę" w UI pada.
- **Wygaszanie ekranu telefonu** — Wake Lock API + fallback.
- Kolejność road mapy jest celowa: najpierw frajda z samej jazdy (v0.1), dopiero
  potem sieć — jeśli jazda nie będzie fajna, reszta nie ma znaczenia.

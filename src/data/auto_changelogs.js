export const PROJECT_CHANGES = {
    "pixel-kart": [
        {
            "date": "2026-07-10 21:29",
            "version": "#87213cf",
            "type": "UPDATE",
            "desc": "Pixel Kart GP v0.3: power-upy z rubber-bandingiem (MVP)",
            "details": "- game/items.js: pocisk/banan/boost/tarcza, pula i tempo ładowania\n  zależne od miejsca w wyścigu (rubber-banding: ostatni ładuje się\n  szybciej i losuje mocniejsze przedmioty)\n- game/race.js: mini-wyzwanie \"ŁAP!\" (okno 1.5s) zamiast automatycznego\n  przydziału; jeden generyczny action 'item' (host autorytatywnie\n  rozstrzyga grab vs use, więc opóźnienia sieci nie psują znaczenia\n  przycisku); pociski lecą po linii prostej, banany to statyczne\n  pułapki, trafienie = spin (utrata kontroli), tarcza blokuje 1 hit\n- net/webrtc.js: kanał akcji jednorazowych (P2P + fallback RTDB\n  przez actions/{playerId} z auto-czyszczeniem)\n- ControllerApp.jsx: przycisk ITEM z paskiem czasu wyzwania / ikoną\n  trzymanego przedmiotu; HostApp/RaceScreen przekazują stan itemów\n  do padów i renderują znaczniki nad kartami\n- LocalScreen/keyboard.js: przedmioty też w trybie lokalnym (Enter /\n  lewy Ctrl) do szybkich testów bez telefonów\n- Zweryfikowane headless: pełny cykl złap→pocisk→trafienie→spin,\n  blokada tarczą, plus wcześniejsze testy fizyki/checkpointów\n\nCo-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
        },
        {
            "date": "2026-07-10 18:44",
            "version": "#a3e7c08",
            "type": "SYS",
            "desc": "Pipeline builda FTP, dokumentacja agentów i porządki warsztatu",
            "details": "Nowy skrypt builda (scripts/build.js) publikujący podprojekty do public/\nz weryfikacją paczki FTP (verify_dist.js) i automatyczną aktualizacją\ninwentarza projektów (update_agent_context.js + AGENTS.md/CLAUDE.md/GEMINI.md).\nPorządki po refaktorze strony głównej: usunięte nieużywane komponenty\n(GitLog, NewsFeed, SystemLog, DlReturn), pliki .bak i lokalna kopia\nqr-code-styling. Dokumentacja: README, SECURITY, aktualizacja ARCHITECTURE\ni GITHUB_GUIDE. Publikacja builda Pixel Kart GP w public/pixelkart.\n\nCo-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
        },
        {
            "date": "2026-07-10 15:11",
            "version": "#b1f3c6f",
            "type": "UPDATE",
            "desc": "Pixel Kart GP v0.2: telefony jako pady (lobby QR + WebRTC)",
            "details": "- Lobby na Firebase RTDB (ta sama baza co NEON QUIZ): pokoje rooms/{kod}\n  z app:'pixelkart', nick + awatar, powroty rozłączonych graczy, max 4\n- WebRTC DataChannel bez retransmisji: pad wysyła input 30 Hz, host\n  odsyła stan (pozycja/okrążenie) 10 Hz; sygnalizacja przez RTDB,\n  automatyczny fallback inputu przez RTDB po 5 s (izolacja AP)\n- Pad na telefonie: przyciski ◀ ▶ GAZ DRIFT, tryb żyroskopu (beta,\n  zgoda iOS), wake lock, pasek statusu łącza i pozycji\n- Host: lobby z QR i kodem, start/rewanż/powrót do lobby\n- RaceScreen uniwersalny (input wstrzykiwany), tryb lokalny pod #/local\n- E2E zweryfikowane: pad w iframe → P2P → jazda + stan zwrotny\n\nCo-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
        },
        {
            "date": "2026-07-09 22:05",
            "version": "#18792aa",
            "type": "UPDATE",
            "desc": "Pixel Kart GP: tuning prowadzenia po testach",
            "details": "Feedback: ciężkie sterowanie, za duża prędkość, za wąska droga.\n- Szerokość asfaltu 30 -> 42 px\n- Prędkość max 155 -> 125 px/s (boost 215 -> 180), przyspieszenie 150 -> 140\n- Skręt 3.0 -> 3.6 rad/s, pełna skuteczność już od 40 px/s (było 55)\n- Drift dostępny od 60 px/s (dopasowanie do niższej prędkości)\nSymulacja headless: mniej wypadnięć z toru (512 -> 166 klatek), testy OK.\n\nCo-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
        },
        {
            "date": "2026-07-09 21:54",
            "version": "#ddd138e",
            "type": "UPDATE",
            "desc": "Pixel Kart GP: base './' w Vite pod hosting w podkatalogu /pixelkart/",
            "details": "Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
        },
        {
            "date": "2026-07-09 21:44",
            "version": "#2953e0d",
            "type": "UPDATE",
            "desc": "Pixel Kart GP v0.1: prototyp jazdy (fizyka, trasa, okrążenia)",
            "details": "- Fizyka arcade: napęd/opory rozkładane na składowe, drift z mini-boostem,\n  trawa spowalnia; czysta logika w src/game/ bez Reacta i sieci\n- Trasa jako oś Catmull-Rom z projekcją pozycji, checkpointy z blokadą\n  skrótów przez trawę, okrążenia, ranking, meta\n- Render pixel-art na canvasie 480x270 (CSS pixelated), ślady driftu\n- 2 graczy lokalnie na klawiaturze, ustawienia okrążeń, restart\n- Zweryfikowane symulacją headless (pełny wyścig + test anty-skrótowy)\n\nCo-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
        },
        {
            "date": "2026-07-09 21:31",
            "version": "#b602811",
            "type": "UPDATE",
            "desc": "Add Pixel Kart GP project plan",
            "details": "Nowy podprojekt: gra imprezowa w duchu Mario Kart (host na TV,\ntelefony jako pady przez QR). PLAN.md zawiera decyzje z sesji Q&A,\narchitekturę (WebRTC input + Firebase lobby) i road mapę v0.1-v0.4.\n\nCo-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
        }
    ],
    "gamerlab": [
        {
            "date": "2026-07-10 18:44",
            "version": "#b03f824",
            "type": "FEAT",
            "desc": "GamerLab v0.1 — menedżer kupki wstydu gier",
            "details": "Nowy podprojekt React (gamerlab/): biblioteka posiadanych gier z czasem\nprzejścia i statusami (kupka / gram / ukończona / porzucona), tygodniowy\nbudżet grania i kaskadowa prognoza — data ukończenia każdej gry po kolei\noraz dzień wyzerowania całej kupki. Odliczanie już przegranych godzin przy\ngrze w toku, gry bez znanego czasu wykazane osobno. Dane w localStorage,\nsilnik prognozy jako czysty moduł z testami node --test. Wpięcie w główny\nbuild (public/gamerlab), wpis w db.js z changelogiem i aktualizacja wpisu\nnow w terminalu.\n\nCo-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
        }
    ],
    "labyrinth-qr": [
        {
            "date": "2026-07-10 18:44",
            "version": "#a3e7c08",
            "type": "SYS",
            "desc": "Pipeline builda FTP, dokumentacja agentów i porządki warsztatu",
            "details": "Nowy skrypt builda (scripts/build.js) publikujący podprojekty do public/\nz weryfikacją paczki FTP (verify_dist.js) i automatyczną aktualizacją\ninwentarza projektów (update_agent_context.js + AGENTS.md/CLAUDE.md/GEMINI.md).\nPorządki po refaktorze strony głównej: usunięte nieużywane komponenty\n(GitLog, NewsFeed, SystemLog, DlReturn), pliki .bak i lokalna kopia\nqr-code-styling. Dokumentacja: README, SECURITY, aktualizacja ARCHITECTURE\ni GITHUB_GUIDE. Publikacja builda Pixel Kart GP w public/pixelkart.\n\nCo-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
        },
        {
            "date": "2026-07-02 22:29",
            "version": "#c4b1f7d",
            "type": "FEAT",
            "desc": "FEAT v2.1: Nowa generacja podstron i aplikacji + DraftLab Core (interaktywny terminal)",
            "details": "- DraftLab Core: terminal z siecią neuronową (canvas) na stronie głównej;\n  komendy help/apps/open/stats/whoami/legacy/lang/matrix/clear, PL/EN,\n  pauza poza viewportem, prefers-reduced-motion\n- Dziennik zmian zredukowany do kompaktowego zwijanego paska (UnifiedLog v2)\n- Nowy układ dolnej sekcji: Manifest+Stack -> Rdzeń Systemu -> dziennik\n- Podstrony: system-log (glass modal, zaokrąglone filtry), changelog\n  (glass sidebar, karty funkcji), view (glass container)\n- Aplikacje: pinned lucide 0.462.0, preconnect fonts, naprawiony favicon\n  FluxBoard, glass/rounded panele w LabyrinthQR i DraftCargo\n- Nowe klucze i18n PL/EN dla terminala i dziennika\n\nCo-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
        },
        {
            "date": "2026-07-02 22:16",
            "version": "#1f7cc11",
            "type": "FEAT",
            "desc": "FEAT v2.0: Generalna modernizacja UI + mechanizm wersji klasycznej (/legacy)",
            "details": "- Nowy design system: glassmorphism, aurora glow, gradienty, zaokrąglenia, cienie\n- Sticky glass header z paskiem postępu scrolla i linkiem do v1.0\n- Paleta poleceń Cmd+K (nawigacja po stronach i aplikacjach, PL/EN)\n- Karty projektów: spotlight-hover, animacje wejścia, live badge\n- Nowa stopka 3-kolumnowa z linkiem do wersji klasycznej\n- Hero: aurora, animowane statystyki (aplikacje/commity), drugi CTA\n- Scroll-reveal (IntersectionObserver) + prefers-reduced-motion\n- MPA View Transitions, SVG favicon, theme-color, preconnect fonts\n- about.html: usunięto Tailwind CDN (kompilowany CSS)\n- Snapshot starej strony w public/legacy + skrypt snapshot:legacy\n- Powrót do starego kodu: git checkout legacy-v1\n\nCo-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
        },
        {
            "date": "2026-01-06 00:33",
            "version": "#5aee8a8",
            "type": "UPDATE",
            "desc": "DraftCalc v0.1: Zaawansowany kalkulator procentowy z wizualizacją i i18n",
            "details": null
        },
        {
            "date": "2025-12-23 22:02",
            "version": "#8fb6faa",
            "type": "FEAT",
            "desc": "Kompleksowa optymalizacja UI i usprawnienia Atmosphere",
            "details": "- Atmosphere: Legendy wykresów (Green/Blue) i skala 0.5°C w Analytics\n- Header: Zwiększenie logo do 18px i ikony do w-6 na wszystkich stronach\n- Hero: Wdrożenie text-wrap: balance oraz poprawki typograficzne (i&nbsp;wyobraźni)\n- Hero: Przywrócenie migającego kursora po ładowaniu tłumaczeń\n- UI: Usunięcie nadmiarowych przycisków <dl-return> i ujednolicenie nagłówków\n- Data: Synchronizacja statusów projektów i opisów pustych slotów"
        },
        {
            "date": "2025-12-23 19:38",
            "version": "#738b8b0",
            "type": "UPDATE",
            "desc": "PRE-UPDATE: Saving state before Phase 2 UI Upgrade",
            "details": null
        }
    ],
    "suntrack": [
        {
            "date": "2026-07-10 18:44",
            "version": "#a3e7c08",
            "type": "SYS",
            "desc": "Pipeline builda FTP, dokumentacja agentów i porządki warsztatu",
            "details": "Nowy skrypt builda (scripts/build.js) publikujący podprojekty do public/\nz weryfikacją paczki FTP (verify_dist.js) i automatyczną aktualizacją\ninwentarza projektów (update_agent_context.js + AGENTS.md/CLAUDE.md/GEMINI.md).\nPorządki po refaktorze strony głównej: usunięte nieużywane komponenty\n(GitLog, NewsFeed, SystemLog, DlReturn), pliki .bak i lokalna kopia\nqr-code-styling. Dokumentacja: README, SECURITY, aktualizacja ARCHITECTURE\ni GITHUB_GUIDE. Publikacja builda Pixel Kart GP w public/pixelkart.\n\nCo-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
        },
        {
            "date": "2026-07-10 15:31",
            "version": "#632b470",
            "type": "FIX",
            "desc": "Smooth the sun across the horizon",
            "details": null
        },
        {
            "date": "2026-07-10 15:16",
            "version": "#c791273",
            "type": "FIX",
            "desc": "Align celestial motion with sky paths",
            "details": null
        },
        {
            "date": "2026-07-02 22:41",
            "version": "#85d690e",
            "type": "FEAT",
            "desc": "FEAT v2.2: Redesign wnętrz aplikacji — DraftCalc, Atmosphere, SunTrack, FluxBoard, RetroVision",
            "details": "- Wspólny system hero-stripów aplikacji (dl-app-hero/icon/badge/action w style.css)\n- Atmosphere: hero-strip, karty dl-* z gradientem i hover-glow, wykres temp z wypełnieniem gradientowym\n- AtmosphereAnalytics: gradientowe stat-cardy z hover-glow\n- FluxBoard: szklany toolbar z badge, widgety glass z cyan-glow i hover-lift, modal rounded-2xl\n- RetroVision: nowy badge tytułowy, panel ustawień rounded-2xl, glass karta uprawnień kamery\n- DraftCalc: hero-strip, szklany dashboard-card z blur, glow focus inputów, szklany sidebar\n- SunTrack: gradientowe panele (--panel-bg), hover-glow stat-cardów, glow focus wyszukiwarki\n\nWersja klasyczna wszystkich aplikacji nadal dostępna pod /legacy/\n\nCo-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
        },
        {
            "date": "2026-07-02 22:29",
            "version": "#c4b1f7d",
            "type": "FEAT",
            "desc": "FEAT v2.1: Nowa generacja podstron i aplikacji + DraftLab Core (interaktywny terminal)",
            "details": "- DraftLab Core: terminal z siecią neuronową (canvas) na stronie głównej;\n  komendy help/apps/open/stats/whoami/legacy/lang/matrix/clear, PL/EN,\n  pauza poza viewportem, prefers-reduced-motion\n- Dziennik zmian zredukowany do kompaktowego zwijanego paska (UnifiedLog v2)\n- Nowy układ dolnej sekcji: Manifest+Stack -> Rdzeń Systemu -> dziennik\n- Podstrony: system-log (glass modal, zaokrąglone filtry), changelog\n  (glass sidebar, karty funkcji), view (glass container)\n- Aplikacje: pinned lucide 0.462.0, preconnect fonts, naprawiony favicon\n  FluxBoard, glass/rounded panele w LabyrinthQR i DraftCargo\n- Nowe klucze i18n PL/EN dla terminala i dziennika\n\nCo-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
        },
        {
            "date": "2026-07-02 22:16",
            "version": "#1f7cc11",
            "type": "FEAT",
            "desc": "FEAT v2.0: Generalna modernizacja UI + mechanizm wersji klasycznej (/legacy)",
            "details": "- Nowy design system: glassmorphism, aurora glow, gradienty, zaokrąglenia, cienie\n- Sticky glass header z paskiem postępu scrolla i linkiem do v1.0\n- Paleta poleceń Cmd+K (nawigacja po stronach i aplikacjach, PL/EN)\n- Karty projektów: spotlight-hover, animacje wejścia, live badge\n- Nowa stopka 3-kolumnowa z linkiem do wersji klasycznej\n- Hero: aurora, animowane statystyki (aplikacje/commity), drugi CTA\n- Scroll-reveal (IntersectionObserver) + prefers-reduced-motion\n- MPA View Transitions, SVG favicon, theme-color, preconnect fonts\n- about.html: usunięto Tailwind CDN (kompilowany CSS)\n- Snapshot starej strony w public/legacy + skrypt snapshot:legacy\n- Powrót do starego kodu: git checkout legacy-v1\n\nCo-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
        },
        {
            "date": "2026-01-06 00:33",
            "version": "#5aee8a8",
            "type": "UPDATE",
            "desc": "DraftCalc v0.1: Zaawansowany kalkulator procentowy z wizualizacją i i18n",
            "details": null
        },
        {
            "date": "2025-12-23 22:02",
            "version": "#8fb6faa",
            "type": "FEAT",
            "desc": "Kompleksowa optymalizacja UI i usprawnienia Atmosphere",
            "details": "- Atmosphere: Legendy wykresów (Green/Blue) i skala 0.5°C w Analytics\n- Header: Zwiększenie logo do 18px i ikony do w-6 na wszystkich stronach\n- Hero: Wdrożenie text-wrap: balance oraz poprawki typograficzne (i&nbsp;wyobraźni)\n- Hero: Przywrócenie migającego kursora po ładowaniu tłumaczeń\n- UI: Usunięcie nadmiarowych przycisków <dl-return> i ujednolicenie nagłówków\n- Data: Synchronizacja statusów projektów i opisów pustych slotów"
        },
        {
            "date": "2025-12-21 23:25",
            "version": "#5d7159e",
            "type": "FEAT",
            "desc": "Archiwum Prototypów SunTrack - galeria historycznych wersji aplikacji (v1.0 i v2.0) w sekcji changelog",
            "details": null
        },
        {
            "date": "2025-12-21 22:54",
            "version": "#b3fb03a",
            "type": "FEAT",
            "desc": "Ulepszenia UI - smuklejszy nagłówek, poprawione ikony pór roku, wyłączony tryb Stealth",
            "details": null
        },
        {
            "date": "2025-12-20 21:04",
            "version": "#a1b893b",
            "type": "DOCS",
            "desc": "Usunięcie szczegółów technicznych z changelog v2.0",
            "details": null
        },
        {
            "date": "2025-12-20 21:01",
            "version": "#0a246a6",
            "type": "DOCS",
            "desc": "Aktualizacja changelog w db.js do v2.0",
            "details": null
        },
        {
            "date": "2025-12-20 20:58",
            "version": "#786d110",
            "type": "FEAT",
            "desc": "V2.0 - Kompletna przebudowa aplikacji",
            "details": "MAJOR UPDATE:\n- Nowy minimalistyczny design \n- Wizualizacja nieba z płynnymi gradientami kolorów\n- Trajektorie sezonowe (wiosna, lato, jesień, zima) z przełącznikami\n- Suwak czasu na dole ekranu z przyciskiem TERAZ\n- Efekt lens flare przy słońcu\n- Księżyc widoczny tylko w nocy\n- Wyszukiwarka miast ograniczona do Polski\n- Automatyczna geolokalizacja przy każdym uruchomieniu\n- Reverse geocoding do pobierania nazwy miasta\n- Wycentrowane trajektorie względem solar noon\n- Dashboard z kartami: Wschód, Zachód, Długość Dnia, Golden AM/PM, Zmiana\n- Panel przełączników pór roku z ikonami Lucide\n- Responsywny design z safe-area-inset dla iPhone\n- Nagłówek Nucleus z nawigacją"
        },
        {
            "date": "2025-12-18 22:33",
            "version": "#be79a4d",
            "type": "STYLE",
            "desc": "Fix sky banding in SunTrack and scoped background-size in global styles",
            "details": null
        },
        {
            "date": "2025-12-18 22:16",
            "version": "#803d651",
            "type": "UPDATE",
            "desc": "Initial professional build (v3.0)",
            "details": null
        }
    ],
    "bobolog": [
        {
            "date": "2026-07-09 21:03",
            "version": "#910c76f",
            "type": "UPDATE",
            "desc": "Add new projects and bundle local app builds into the site",
            "details": null
        }
    ],
    "neon-quiz": [
        {
            "date": "2026-07-09 21:03",
            "version": "#910c76f",
            "type": "UPDATE",
            "desc": "Add new projects and bundle local app builds into the site",
            "details": null
        }
    ],
    "atmosphere": [
        {
            "date": "2026-07-02 22:41",
            "version": "#85d690e",
            "type": "FEAT",
            "desc": "FEAT v2.2: Redesign wnętrz aplikacji — DraftCalc, Atmosphere, SunTrack, FluxBoard, RetroVision",
            "details": "- Wspólny system hero-stripów aplikacji (dl-app-hero/icon/badge/action w style.css)\n- Atmosphere: hero-strip, karty dl-* z gradientem i hover-glow, wykres temp z wypełnieniem gradientowym\n- AtmosphereAnalytics: gradientowe stat-cardy z hover-glow\n- FluxBoard: szklany toolbar z badge, widgety glass z cyan-glow i hover-lift, modal rounded-2xl\n- RetroVision: nowy badge tytułowy, panel ustawień rounded-2xl, glass karta uprawnień kamery\n- DraftCalc: hero-strip, szklany dashboard-card z blur, glow focus inputów, szklany sidebar\n- SunTrack: gradientowe panele (--panel-bg), hover-glow stat-cardów, glow focus wyszukiwarki\n\nWersja klasyczna wszystkich aplikacji nadal dostępna pod /legacy/\n\nCo-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
        },
        {
            "date": "2026-07-02 22:29",
            "version": "#c4b1f7d",
            "type": "FEAT",
            "desc": "FEAT v2.1: Nowa generacja podstron i aplikacji + DraftLab Core (interaktywny terminal)",
            "details": "- DraftLab Core: terminal z siecią neuronową (canvas) na stronie głównej;\n  komendy help/apps/open/stats/whoami/legacy/lang/matrix/clear, PL/EN,\n  pauza poza viewportem, prefers-reduced-motion\n- Dziennik zmian zredukowany do kompaktowego zwijanego paska (UnifiedLog v2)\n- Nowy układ dolnej sekcji: Manifest+Stack -> Rdzeń Systemu -> dziennik\n- Podstrony: system-log (glass modal, zaokrąglone filtry), changelog\n  (glass sidebar, karty funkcji), view (glass container)\n- Aplikacje: pinned lucide 0.462.0, preconnect fonts, naprawiony favicon\n  FluxBoard, glass/rounded panele w LabyrinthQR i DraftCargo\n- Nowe klucze i18n PL/EN dla terminala i dziennika\n\nCo-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
        },
        {
            "date": "2026-07-02 22:16",
            "version": "#1f7cc11",
            "type": "FEAT",
            "desc": "FEAT v2.0: Generalna modernizacja UI + mechanizm wersji klasycznej (/legacy)",
            "details": "- Nowy design system: glassmorphism, aurora glow, gradienty, zaokrąglenia, cienie\n- Sticky glass header z paskiem postępu scrolla i linkiem do v1.0\n- Paleta poleceń Cmd+K (nawigacja po stronach i aplikacjach, PL/EN)\n- Karty projektów: spotlight-hover, animacje wejścia, live badge\n- Nowa stopka 3-kolumnowa z linkiem do wersji klasycznej\n- Hero: aurora, animowane statystyki (aplikacje/commity), drugi CTA\n- Scroll-reveal (IntersectionObserver) + prefers-reduced-motion\n- MPA View Transitions, SVG favicon, theme-color, preconnect fonts\n- about.html: usunięto Tailwind CDN (kompilowany CSS)\n- Snapshot starej strony w public/legacy + skrypt snapshot:legacy\n- Powrót do starego kodu: git checkout legacy-v1\n\nCo-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
        },
        {
            "date": "2026-07-02 22:03",
            "version": "#8d31809",
            "type": "SNAPSHOT",
            "desc": "Stan strony przed modernizacją (Legacy v1)",
            "details": "Pełny stan źródeł przed generalną modernizacją UI.\nPowrót do tej wersji: git checkout legacy-v1\n\nCo-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
        },
        {
            "date": "2026-01-06 00:33",
            "version": "#5aee8a8",
            "type": "UPDATE",
            "desc": "DraftCalc v0.1: Zaawansowany kalkulator procentowy z wizualizacją i i18n",
            "details": null
        },
        {
            "date": "2025-12-25 11:16",
            "version": "#408af1c",
            "type": "FIX",
            "desc": "Atmosphere header padding & humidity scale; ADD: API backend scripts",
            "details": null
        },
        {
            "date": "2025-12-23 22:02",
            "version": "#8fb6faa",
            "type": "FEAT",
            "desc": "Kompleksowa optymalizacja UI i usprawnienia Atmosphere",
            "details": "- Atmosphere: Legendy wykresów (Green/Blue) i skala 0.5°C w Analytics\n- Header: Zwiększenie logo do 18px i ikony do w-6 na wszystkich stronach\n- Hero: Wdrożenie text-wrap: balance oraz poprawki typograficzne (i&nbsp;wyobraźni)\n- Hero: Przywrócenie migającego kursora po ładowaniu tłumaczeń\n- UI: Usunięcie nadmiarowych przycisków <dl-return> i ujednolicenie nagłówków\n- Data: Synchronizacja statusów projektów i opisów pustych slotów"
        },
        {
            "date": "2025-12-21 00:17",
            "version": "#136a966",
            "type": "FEAT",
            "desc": "Integracja automatycznych logów i paginacja",
            "details": "Wdrożono automatyczne łączenie logów Git z aplikacjami.\\nZaimplementowano paginację w widoku changeloga (5 wpisów na stronę).\\nNaprawiono skrypty builda w package.json."
        },
        {
            "date": "2025-12-20 13:48",
            "version": "#90e1cb7",
            "type": "FEAT",
            "desc": "Unify logs and automate generation",
            "details": "Implemented UnifiedLog component merging app and system logs. Added scripts/generate_git_log.js to automate changelog generation from git history. Updated db.js to use dynamic changelog data."
        },
        {
            "date": "2025-12-19 22:43",
            "version": "#90b11fe",
            "type": "STYLE",
            "desc": "Fix stat unit spacing overlap",
            "details": null
        },
        {
            "date": "2025-12-19 22:42",
            "version": "#8278c3c",
            "type": "FIX",
            "desc": "Dismiss chart tooltip on outside click/touch",
            "details": null
        },
        {
            "date": "2025-12-19 22:16",
            "version": "#570f380",
            "type": "STYLE",
            "desc": "Softer color and smaller font for last update text",
            "details": null
        },
        {
            "date": "2025-12-19 22:15",
            "version": "#8b4aa2a",
            "type": "STYLE",
            "desc": "Add 'Ostatni pomiar:' prefix to chart time",
            "details": null
        },
        {
            "date": "2025-12-19 22:04",
            "version": "#bdd6d4a",
            "type": "DOCS",
            "desc": "Bump version to v0.2.0, add Analytics changelog",
            "details": null
        },
        {
            "date": "2025-12-19 22:03",
            "version": "#1351161",
            "type": "FEAT",
            "desc": "Add seasonal averages section",
            "details": null
        },
        {
            "date": "2025-12-19 21:56",
            "version": "#7dcc74d",
            "type": "FEAT",
            "desc": "Add interactive analytics page with week/month/year ranges",
            "details": null
        },
        {
            "date": "2025-12-19 21:50",
            "version": "#024dda2",
            "type": "FEAT",
            "desc": "Replace dew point with avg humidity, add time-of-day stats",
            "details": null
        },
        {
            "date": "2025-12-19 21:45",
            "version": "#f97cd21",
            "type": "FEAT",
            "desc": "Use Nucleus header for consistent navigation",
            "details": null
        },
        {
            "date": "2025-12-19 21:42",
            "version": "#d30d0f9",
            "type": "STYLE",
            "desc": "Move back button to top-right",
            "details": null
        },
        {
            "date": "2025-12-19 21:40",
            "version": "#c94df07",
            "type": "DOCS",
            "desc": "Update changelog description",
            "details": null
        },
        {
            "date": "2025-12-19 21:40",
            "version": "#61ba9db",
            "type": "STYLE",
            "desc": "Move scrollbar to body (right edge) and make header sticky",
            "details": null
        },
        {
            "date": "2025-12-19 21:38",
            "version": "#1eb4198",
            "type": "FIX",
            "desc": "Enable scrollbar and downgrade to v0.1.0",
            "details": null
        },
        {
            "date": "2025-12-19 21:35",
            "version": "#add8618",
            "type": "STYLE",
            "desc": "Move analytics section below chart",
            "details": null
        },
        {
            "date": "2025-12-19 21:32",
            "version": "#7476a23",
            "type": "FEAT",
            "desc": "Add analytics, history nav and update copy",
            "details": null
        },
        {
            "date": "2025-12-19 21:28",
            "version": "#277c94e",
            "type": "FEAT",
            "desc": "Add changelog and reorder apps",
            "details": null
        },
        {
            "date": "2025-12-19 21:21",
            "version": "#bde6819",
            "type": "SYS",
            "desc": "Restore public folder structure and persist fixes",
            "details": null
        },
        {
            "date": "2025-12-19 21:15",
            "version": "#cf2130e",
            "type": "FIX",
            "desc": "Correct API path and enable module bundling",
            "details": null
        },
        {
            "date": "2025-12-19 20:53",
            "version": "#d63fe2f",
            "type": "FIX",
            "desc": "Robust atmosphere.php (suppress warnings, fix permissions, handle empty input)",
            "details": null
        }
    ],
    "draftcalc": [
        {
            "date": "2026-07-02 22:41",
            "version": "#85d690e",
            "type": "FEAT",
            "desc": "FEAT v2.2: Redesign wnętrz aplikacji — DraftCalc, Atmosphere, SunTrack, FluxBoard, RetroVision",
            "details": "- Wspólny system hero-stripów aplikacji (dl-app-hero/icon/badge/action w style.css)\n- Atmosphere: hero-strip, karty dl-* z gradientem i hover-glow, wykres temp z wypełnieniem gradientowym\n- AtmosphereAnalytics: gradientowe stat-cardy z hover-glow\n- FluxBoard: szklany toolbar z badge, widgety glass z cyan-glow i hover-lift, modal rounded-2xl\n- RetroVision: nowy badge tytułowy, panel ustawień rounded-2xl, glass karta uprawnień kamery\n- DraftCalc: hero-strip, szklany dashboard-card z blur, glow focus inputów, szklany sidebar\n- SunTrack: gradientowe panele (--panel-bg), hover-glow stat-cardów, glow focus wyszukiwarki\n\nWersja klasyczna wszystkich aplikacji nadal dostępna pod /legacy/\n\nCo-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
        },
        {
            "date": "2026-07-02 22:29",
            "version": "#c4b1f7d",
            "type": "FEAT",
            "desc": "FEAT v2.1: Nowa generacja podstron i aplikacji + DraftLab Core (interaktywny terminal)",
            "details": "- DraftLab Core: terminal z siecią neuronową (canvas) na stronie głównej;\n  komendy help/apps/open/stats/whoami/legacy/lang/matrix/clear, PL/EN,\n  pauza poza viewportem, prefers-reduced-motion\n- Dziennik zmian zredukowany do kompaktowego zwijanego paska (UnifiedLog v2)\n- Nowy układ dolnej sekcji: Manifest+Stack -> Rdzeń Systemu -> dziennik\n- Podstrony: system-log (glass modal, zaokrąglone filtry), changelog\n  (glass sidebar, karty funkcji), view (glass container)\n- Aplikacje: pinned lucide 0.462.0, preconnect fonts, naprawiony favicon\n  FluxBoard, glass/rounded panele w LabyrinthQR i DraftCargo\n- Nowe klucze i18n PL/EN dla terminala i dziennika\n\nCo-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
        },
        {
            "date": "2026-07-02 22:16",
            "version": "#1f7cc11",
            "type": "FEAT",
            "desc": "FEAT v2.0: Generalna modernizacja UI + mechanizm wersji klasycznej (/legacy)",
            "details": "- Nowy design system: glassmorphism, aurora glow, gradienty, zaokrąglenia, cienie\n- Sticky glass header z paskiem postępu scrolla i linkiem do v1.0\n- Paleta poleceń Cmd+K (nawigacja po stronach i aplikacjach, PL/EN)\n- Karty projektów: spotlight-hover, animacje wejścia, live badge\n- Nowa stopka 3-kolumnowa z linkiem do wersji klasycznej\n- Hero: aurora, animowane statystyki (aplikacje/commity), drugi CTA\n- Scroll-reveal (IntersectionObserver) + prefers-reduced-motion\n- MPA View Transitions, SVG favicon, theme-color, preconnect fonts\n- about.html: usunięto Tailwind CDN (kompilowany CSS)\n- Snapshot starej strony w public/legacy + skrypt snapshot:legacy\n- Powrót do starego kodu: git checkout legacy-v1\n\nCo-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
        },
        {
            "date": "2026-07-02 22:03",
            "version": "#8d31809",
            "type": "SNAPSHOT",
            "desc": "Stan strony przed modernizacją (Legacy v1)",
            "details": "Pełny stan źródeł przed generalną modernizacją UI.\nPowrót do tej wersji: git checkout legacy-v1\n\nCo-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
        },
        {
            "date": "2026-01-06 00:33",
            "version": "#5aee8a8",
            "type": "UPDATE",
            "desc": "DraftCalc v0.1: Zaawansowany kalkulator procentowy z wizualizacją i i18n",
            "details": null
        }
    ],
    "fluxboard": [
        {
            "date": "2026-07-02 22:41",
            "version": "#85d690e",
            "type": "FEAT",
            "desc": "FEAT v2.2: Redesign wnętrz aplikacji — DraftCalc, Atmosphere, SunTrack, FluxBoard, RetroVision",
            "details": "- Wspólny system hero-stripów aplikacji (dl-app-hero/icon/badge/action w style.css)\n- Atmosphere: hero-strip, karty dl-* z gradientem i hover-glow, wykres temp z wypełnieniem gradientowym\n- AtmosphereAnalytics: gradientowe stat-cardy z hover-glow\n- FluxBoard: szklany toolbar z badge, widgety glass z cyan-glow i hover-lift, modal rounded-2xl\n- RetroVision: nowy badge tytułowy, panel ustawień rounded-2xl, glass karta uprawnień kamery\n- DraftCalc: hero-strip, szklany dashboard-card z blur, glow focus inputów, szklany sidebar\n- SunTrack: gradientowe panele (--panel-bg), hover-glow stat-cardów, glow focus wyszukiwarki\n\nWersja klasyczna wszystkich aplikacji nadal dostępna pod /legacy/\n\nCo-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
        },
        {
            "date": "2026-07-02 22:29",
            "version": "#c4b1f7d",
            "type": "FEAT",
            "desc": "FEAT v2.1: Nowa generacja podstron i aplikacji + DraftLab Core (interaktywny terminal)",
            "details": "- DraftLab Core: terminal z siecią neuronową (canvas) na stronie głównej;\n  komendy help/apps/open/stats/whoami/legacy/lang/matrix/clear, PL/EN,\n  pauza poza viewportem, prefers-reduced-motion\n- Dziennik zmian zredukowany do kompaktowego zwijanego paska (UnifiedLog v2)\n- Nowy układ dolnej sekcji: Manifest+Stack -> Rdzeń Systemu -> dziennik\n- Podstrony: system-log (glass modal, zaokrąglone filtry), changelog\n  (glass sidebar, karty funkcji), view (glass container)\n- Aplikacje: pinned lucide 0.462.0, preconnect fonts, naprawiony favicon\n  FluxBoard, glass/rounded panele w LabyrinthQR i DraftCargo\n- Nowe klucze i18n PL/EN dla terminala i dziennika\n\nCo-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
        },
        {
            "date": "2026-07-02 22:16",
            "version": "#1f7cc11",
            "type": "FEAT",
            "desc": "FEAT v2.0: Generalna modernizacja UI + mechanizm wersji klasycznej (/legacy)",
            "details": "- Nowy design system: glassmorphism, aurora glow, gradienty, zaokrąglenia, cienie\n- Sticky glass header z paskiem postępu scrolla i linkiem do v1.0\n- Paleta poleceń Cmd+K (nawigacja po stronach i aplikacjach, PL/EN)\n- Karty projektów: spotlight-hover, animacje wejścia, live badge\n- Nowa stopka 3-kolumnowa z linkiem do wersji klasycznej\n- Hero: aurora, animowane statystyki (aplikacje/commity), drugi CTA\n- Scroll-reveal (IntersectionObserver) + prefers-reduced-motion\n- MPA View Transitions, SVG favicon, theme-color, preconnect fonts\n- about.html: usunięto Tailwind CDN (kompilowany CSS)\n- Snapshot starej strony w public/legacy + skrypt snapshot:legacy\n- Powrót do starego kodu: git checkout legacy-v1\n\nCo-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
        },
        {
            "date": "2026-01-06 00:33",
            "version": "#5aee8a8",
            "type": "UPDATE",
            "desc": "DraftCalc v0.1: Zaawansowany kalkulator procentowy z wizualizacją i i18n",
            "details": null
        }
    ],
    "retrovision": [
        {
            "date": "2026-07-02 22:41",
            "version": "#85d690e",
            "type": "FEAT",
            "desc": "FEAT v2.2: Redesign wnętrz aplikacji — DraftCalc, Atmosphere, SunTrack, FluxBoard, RetroVision",
            "details": "- Wspólny system hero-stripów aplikacji (dl-app-hero/icon/badge/action w style.css)\n- Atmosphere: hero-strip, karty dl-* z gradientem i hover-glow, wykres temp z wypełnieniem gradientowym\n- AtmosphereAnalytics: gradientowe stat-cardy z hover-glow\n- FluxBoard: szklany toolbar z badge, widgety glass z cyan-glow i hover-lift, modal rounded-2xl\n- RetroVision: nowy badge tytułowy, panel ustawień rounded-2xl, glass karta uprawnień kamery\n- DraftCalc: hero-strip, szklany dashboard-card z blur, glow focus inputów, szklany sidebar\n- SunTrack: gradientowe panele (--panel-bg), hover-glow stat-cardów, glow focus wyszukiwarki\n\nWersja klasyczna wszystkich aplikacji nadal dostępna pod /legacy/\n\nCo-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
        },
        {
            "date": "2026-07-02 22:29",
            "version": "#c4b1f7d",
            "type": "FEAT",
            "desc": "FEAT v2.1: Nowa generacja podstron i aplikacji + DraftLab Core (interaktywny terminal)",
            "details": "- DraftLab Core: terminal z siecią neuronową (canvas) na stronie głównej;\n  komendy help/apps/open/stats/whoami/legacy/lang/matrix/clear, PL/EN,\n  pauza poza viewportem, prefers-reduced-motion\n- Dziennik zmian zredukowany do kompaktowego zwijanego paska (UnifiedLog v2)\n- Nowy układ dolnej sekcji: Manifest+Stack -> Rdzeń Systemu -> dziennik\n- Podstrony: system-log (glass modal, zaokrąglone filtry), changelog\n  (glass sidebar, karty funkcji), view (glass container)\n- Aplikacje: pinned lucide 0.462.0, preconnect fonts, naprawiony favicon\n  FluxBoard, glass/rounded panele w LabyrinthQR i DraftCargo\n- Nowe klucze i18n PL/EN dla terminala i dziennika\n\nCo-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
        },
        {
            "date": "2026-07-02 22:16",
            "version": "#1f7cc11",
            "type": "FEAT",
            "desc": "FEAT v2.0: Generalna modernizacja UI + mechanizm wersji klasycznej (/legacy)",
            "details": "- Nowy design system: glassmorphism, aurora glow, gradienty, zaokrąglenia, cienie\n- Sticky glass header z paskiem postępu scrolla i linkiem do v1.0\n- Paleta poleceń Cmd+K (nawigacja po stronach i aplikacjach, PL/EN)\n- Karty projektów: spotlight-hover, animacje wejścia, live badge\n- Nowa stopka 3-kolumnowa z linkiem do wersji klasycznej\n- Hero: aurora, animowane statystyki (aplikacje/commity), drugi CTA\n- Scroll-reveal (IntersectionObserver) + prefers-reduced-motion\n- MPA View Transitions, SVG favicon, theme-color, preconnect fonts\n- about.html: usunięto Tailwind CDN (kompilowany CSS)\n- Snapshot starej strony w public/legacy + skrypt snapshot:legacy\n- Powrót do starego kodu: git checkout legacy-v1\n\nCo-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
        },
        {
            "date": "2026-01-06 00:33",
            "version": "#5aee8a8",
            "type": "UPDATE",
            "desc": "DraftCalc v0.1: Zaawansowany kalkulator procentowy z wizualizacją i i18n",
            "details": null
        }
    ],
    "draftcargo": [
        {
            "date": "2026-07-02 22:29",
            "version": "#c4b1f7d",
            "type": "FEAT",
            "desc": "FEAT v2.1: Nowa generacja podstron i aplikacji + DraftLab Core (interaktywny terminal)",
            "details": "- DraftLab Core: terminal z siecią neuronową (canvas) na stronie głównej;\n  komendy help/apps/open/stats/whoami/legacy/lang/matrix/clear, PL/EN,\n  pauza poza viewportem, prefers-reduced-motion\n- Dziennik zmian zredukowany do kompaktowego zwijanego paska (UnifiedLog v2)\n- Nowy układ dolnej sekcji: Manifest+Stack -> Rdzeń Systemu -> dziennik\n- Podstrony: system-log (glass modal, zaokrąglone filtry), changelog\n  (glass sidebar, karty funkcji), view (glass container)\n- Aplikacje: pinned lucide 0.462.0, preconnect fonts, naprawiony favicon\n  FluxBoard, glass/rounded panele w LabyrinthQR i DraftCargo\n- Nowe klucze i18n PL/EN dla terminala i dziennika\n\nCo-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
        },
        {
            "date": "2026-07-02 22:16",
            "version": "#1f7cc11",
            "type": "FEAT",
            "desc": "FEAT v2.0: Generalna modernizacja UI + mechanizm wersji klasycznej (/legacy)",
            "details": "- Nowy design system: glassmorphism, aurora glow, gradienty, zaokrąglenia, cienie\n- Sticky glass header z paskiem postępu scrolla i linkiem do v1.0\n- Paleta poleceń Cmd+K (nawigacja po stronach i aplikacjach, PL/EN)\n- Karty projektów: spotlight-hover, animacje wejścia, live badge\n- Nowa stopka 3-kolumnowa z linkiem do wersji klasycznej\n- Hero: aurora, animowane statystyki (aplikacje/commity), drugi CTA\n- Scroll-reveal (IntersectionObserver) + prefers-reduced-motion\n- MPA View Transitions, SVG favicon, theme-color, preconnect fonts\n- about.html: usunięto Tailwind CDN (kompilowany CSS)\n- Snapshot starej strony w public/legacy + skrypt snapshot:legacy\n- Powrót do starego kodu: git checkout legacy-v1\n\nCo-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
        },
        {
            "date": "2026-01-06 00:33",
            "version": "#5aee8a8",
            "type": "UPDATE",
            "desc": "DraftCalc v0.1: Zaawansowany kalkulator procentowy z wizualizacją i i18n",
            "details": null
        },
        {
            "date": "2025-12-25 11:16",
            "version": "#408af1c",
            "type": "FIX",
            "desc": "Atmosphere header padding & humidity scale; ADD: API backend scripts",
            "details": null
        },
        {
            "date": "2025-12-23 22:02",
            "version": "#8fb6faa",
            "type": "FEAT",
            "desc": "Kompleksowa optymalizacja UI i usprawnienia Atmosphere",
            "details": "- Atmosphere: Legendy wykresów (Green/Blue) i skala 0.5°C w Analytics\n- Header: Zwiększenie logo do 18px i ikony do w-6 na wszystkich stronach\n- Hero: Wdrożenie text-wrap: balance oraz poprawki typograficzne (i&nbsp;wyobraźni)\n- Hero: Przywrócenie migającego kursora po ładowaniu tłumaczeń\n- UI: Usunięcie nadmiarowych przycisków <dl-return> i ujednolicenie nagłówków\n- Data: Synchronizacja statusów projektów i opisów pustych slotów"
        },
        {
            "date": "2025-12-21 00:56",
            "version": "#75d9b76",
            "type": "FIX",
            "desc": "Remove stats.json from distribution to prevent overwriting server data",
            "details": null
        },
        {
            "date": "2025-12-21 00:54",
            "version": "#ad77c88",
            "type": "FEAT",
            "desc": "Fix stats counter, add download.php, and fix Vite build structure",
            "details": null
        },
        {
            "date": "2025-12-20 13:48",
            "version": "#90e1cb7",
            "type": "FEAT",
            "desc": "Unify logs and automate generation",
            "details": "Implemented UnifiedLog component merging app and system logs. Added scripts/generate_git_log.js to automate changelog generation from git history. Updated db.js to use dynamic changelog data."
        },
        {
            "date": "2025-12-18 23:26",
            "version": "#cfe5728",
            "type": "FIX",
            "desc": "Fix mobile upload: use FormData + 512KB chunks + better error handling",
            "details": null
        },
        {
            "date": "2025-12-18 23:24",
            "version": "#a6f6d04",
            "type": "FIX",
            "desc": "Fix 503: reduce chunk size to 1MB and lower PHP limits",
            "details": null
        },
        {
            "date": "2025-12-18 23:13",
            "version": "#f8585c4",
            "type": "BYPASS",
            "desc": "Base64 encoding to avoid tmp folder (Error 6)",
            "details": null
        },
        {
            "date": "2025-12-18 23:09",
            "version": "#b76020c",
            "type": "FIX",
            "desc": "Fix DraftCargo: use move_uploaded_file instead of RAW upload",
            "details": null
        },
        {
            "date": "2025-12-18 23:05",
            "version": "#ab7c43c",
            "type": "UPDATE",
            "desc": "Refactor DraftCargo to RAW upload (bypass tmp folder issue)",
            "details": null
        },
        {
            "date": "2025-12-18 22:54",
            "version": "#d68ef1e",
            "type": "FIX",
            "desc": "Fix PHP Fatal error by adding robust upload validation",
            "details": null
        },
        {
            "date": "2025-12-18 22:51",
            "version": "#eaea0ce",
            "type": "FIX",
            "desc": "Fix PHP regex typo and add error logging for 500 error",
            "details": null
        },
        {
            "date": "2025-12-18 22:50",
            "version": "#73ae0cb",
            "type": "FIX",
            "desc": "Fix DraftCargo paths and error messages",
            "details": null
        },
        {
            "date": "2025-12-18 22:45",
            "version": "#ab5ed01",
            "type": "UPDATE",
            "desc": "Implement DraftCargo (File Transfer v0.1) for home.pl",
            "details": null
        }
    ]
};

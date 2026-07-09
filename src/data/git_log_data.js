export const GIT_LOG_DATA = [
    {
        "hash": "85d690e",
        "date": "2026-07-02 22:41",
        "type": "FEAT",
        "component": "SYS",
        "desc": "FEAT v2.2: Redesign wnętrz aplikacji — DraftCalc, Atmosphere, SunTrack, FluxBoard, RetroVision",
        "details": "- Wspólny system hero-stripów aplikacji (dl-app-hero/icon/badge/action w style.css)\n- Atmosphere: hero-strip, karty dl-* z gradientem i hover-glow, wykres temp z wypełnieniem gradientowym\n- AtmosphereAnalytics: gradientowe stat-cardy z hover-glow\n- FluxBoard: szklany toolbar z badge, widgety glass z cyan-glow i hover-lift, modal rounded-2xl\n- RetroVision: nowy badge tytułowy, panel ustawień rounded-2xl, glass karta uprawnień kamery\n- DraftCalc: hero-strip, szklany dashboard-card z blur, glow focus inputów, szklany sidebar\n- SunTrack: gradientowe panele (--panel-bg), hover-glow stat-cardów, glow focus wyszukiwarki\n\nWersja klasyczna wszystkich aplikacji nadal dostępna pod /legacy/\n\nCo-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
    },
    {
        "hash": "c4b1f7d",
        "date": "2026-07-02 22:29",
        "type": "FEAT",
        "component": "SYS",
        "desc": "FEAT v2.1: Nowa generacja podstron i aplikacji + DraftLab Core (interaktywny terminal)",
        "details": "- DraftLab Core: terminal z siecią neuronową (canvas) na stronie głównej;\n  komendy help/apps/open/stats/whoami/legacy/lang/matrix/clear, PL/EN,\n  pauza poza viewportem, prefers-reduced-motion\n- Dziennik zmian zredukowany do kompaktowego zwijanego paska (UnifiedLog v2)\n- Nowy układ dolnej sekcji: Manifest+Stack -> Rdzeń Systemu -> dziennik\n- Podstrony: system-log (glass modal, zaokrąglone filtry), changelog\n  (glass sidebar, karty funkcji), view (glass container)\n- Aplikacje: pinned lucide 0.462.0, preconnect fonts, naprawiony favicon\n  FluxBoard, glass/rounded panele w LabyrinthQR i DraftCargo\n- Nowe klucze i18n PL/EN dla terminala i dziennika\n\nCo-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
    },
    {
        "hash": "1f7cc11",
        "date": "2026-07-02 22:16",
        "type": "FEAT",
        "component": "SYS",
        "desc": "FEAT v2.0: Generalna modernizacja UI + mechanizm wersji klasycznej (/legacy)",
        "details": "- Nowy design system: glassmorphism, aurora glow, gradienty, zaokrąglenia, cienie\n- Sticky glass header z paskiem postępu scrolla i linkiem do v1.0\n- Paleta poleceń Cmd+K (nawigacja po stronach i aplikacjach, PL/EN)\n- Karty projektów: spotlight-hover, animacje wejścia, live badge\n- Nowa stopka 3-kolumnowa z linkiem do wersji klasycznej\n- Hero: aurora, animowane statystyki (aplikacje/commity), drugi CTA\n- Scroll-reveal (IntersectionObserver) + prefers-reduced-motion\n- MPA View Transitions, SVG favicon, theme-color, preconnect fonts\n- about.html: usunięto Tailwind CDN (kompilowany CSS)\n- Snapshot starej strony w public/legacy + skrypt snapshot:legacy\n- Powrót do starego kodu: git checkout legacy-v1\n\nCo-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
    },
    {
        "hash": "8d31809",
        "date": "2026-07-02 22:03",
        "type": "SNAPSHOT",
        "component": "SYS",
        "desc": "Stan strony przed modernizacją (Legacy v1)",
        "details": "Pełny stan źródeł przed generalną modernizacją UI.\nPowrót do tej wersji: git checkout legacy-v1\n\nCo-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
    },
    {
        "hash": "21da97a",
        "date": "2026-01-06 00:40",
        "type": "UPDATE",
        "component": "SYS",
        "desc": "Dodano kolory teal, violet i amber do ProjectGrid",
        "details": null
    },
    {
        "hash": "5aee8a8",
        "date": "2026-01-06 00:33",
        "type": "UPDATE",
        "component": "SYS",
        "desc": "DraftCalc v0.1: Zaawansowany kalkulator procentowy z wizualizacją i i18n",
        "details": null
    },
    {
        "hash": "408af1c",
        "date": "2025-12-25 11:16",
        "type": "FIX",
        "component": "SYS",
        "desc": "Atmosphere header padding & humidity scale; ADD: API backend scripts",
        "details": null
    },
    {
        "hash": "8fb6faa",
        "date": "2025-12-23 22:02",
        "type": "FEAT",
        "component": "SYS",
        "desc": "Kompleksowa optymalizacja UI i usprawnienia Atmosphere",
        "details": "- Atmosphere: Legendy wykresów (Green/Blue) i skala 0.5°C w Analytics\n- Header: Zwiększenie logo do 18px i ikony do w-6 na wszystkich stronach\n- Hero: Wdrożenie text-wrap: balance oraz poprawki typograficzne (i&nbsp;wyobraźni)\n- Hero: Przywrócenie migającego kursora po ładowaniu tłumaczeń\n- UI: Usunięcie nadmiarowych przycisków <dl-return> i ujednolicenie nagłówków\n- Data: Synchronizacja statusów projektów i opisów pustych slotów"
    },
    {
        "hash": "738b8b0",
        "date": "2025-12-23 19:38",
        "type": "UPDATE",
        "component": "SYS",
        "desc": "PRE-UPDATE: Saving state before Phase 2 UI Upgrade",
        "details": null
    },
    {
        "hash": "5d7159e",
        "date": "2025-12-21 23:25",
        "type": "FEAT",
        "component": "SYS",
        "desc": "Archiwum Prototypów SunTrack - galeria historycznych wersji aplikacji (v1.0 i v2.0) w sekcji changelog",
        "details": null
    },
    {
        "hash": "b3fb03a",
        "date": "2025-12-21 22:54",
        "type": "FEAT",
        "component": "SUNTRACK",
        "desc": "Ulepszenia UI - smuklejszy nagłówek, poprawione ikony pór roku, wyłączony tryb Stealth",
        "details": null
    },
    {
        "hash": "844f554",
        "date": "2025-12-21 00:58",
        "type": "SYS",
        "component": "SYS",
        "desc": "Update changelog for DraftCargo v0.6.0 and refresh system logs",
        "details": null
    },
    {
        "hash": "75d9b76",
        "date": "2025-12-21 00:56",
        "type": "FIX",
        "component": "DRAFTCARGO",
        "desc": "Remove stats.json from distribution to prevent overwriting server data",
        "details": null
    },
    {
        "hash": "ad77c88",
        "date": "2025-12-21 00:54",
        "type": "FEAT",
        "component": "DRAFTCARGO",
        "desc": "Fix stats counter, add download.php, and fix Vite build structure",
        "details": null
    },
    {
        "hash": "136a966",
        "date": "2025-12-21 00:17",
        "type": "FEAT",
        "component": "LOG",
        "desc": "Integracja automatycznych logów i paginacja",
        "details": "Wdrożono automatyczne łączenie logów Git z aplikacjami.\\nZaimplementowano paginację w widoku changeloga (5 wpisów na stronę).\\nNaprawiono skrypty builda w package.json."
    },
    {
        "hash": "34561d5",
        "date": "2025-12-20 21:10",
        "type": "STYLE",
        "component": "SYS",
        "desc": "Zmniejszona przerwa między projektami a dziennikiem",
        "details": null
    },
    {
        "hash": "e8677ed",
        "date": "2025-12-20 21:09",
        "type": "STYLE",
        "component": "SYS",
        "desc": "Mniejsza przerwa między toggle a dziennikiem",
        "details": null
    },
    {
        "hash": "01ba1ca",
        "date": "2025-12-20 21:07",
        "type": "FIX",
        "component": "SYS",
        "desc": "Kolorowanie typu MAJOR w dzienniku zmian + czas dla SunTrack v2.0",
        "details": null
    },
    {
        "hash": "f527815",
        "date": "2025-12-20 21:06",
        "type": "FEAT",
        "component": "SYS",
        "desc": "Ukrywanie pustych slotów domyślnie z opcją odsłonięcia",
        "details": null
    },
    {
        "hash": "a1b893b",
        "date": "2025-12-20 21:04",
        "type": "DOCS",
        "component": "SUNTRACK",
        "desc": "Usunięcie szczegółów technicznych z changelog v2.0",
        "details": null
    },
    {
        "hash": "b0e2079",
        "date": "2025-12-20 21:03",
        "type": "DOCS",
        "component": "SYS",
        "desc": "Usunięcie wzmianki o inspiracji Lumy",
        "details": null
    },
    {
        "hash": "0a246a6",
        "date": "2025-12-20 21:01",
        "type": "DOCS",
        "component": "SUNTRACK",
        "desc": "Aktualizacja changelog w db.js do v2.0",
        "details": null
    },
    {
        "hash": "786d110",
        "date": "2025-12-20 20:58",
        "type": "FEAT",
        "component": "SUNTRACK",
        "desc": "V2.0 - Kompletna przebudowa aplikacji",
        "details": "MAJOR UPDATE:\n- Nowy minimalistyczny design \n- Wizualizacja nieba z płynnymi gradientami kolorów\n- Trajektorie sezonowe (wiosna, lato, jesień, zima) z przełącznikami\n- Suwak czasu na dole ekranu z przyciskiem TERAZ\n- Efekt lens flare przy słońcu\n- Księżyc widoczny tylko w nocy\n- Wyszukiwarka miast ograniczona do Polski\n- Automatyczna geolokalizacja przy każdym uruchomieniu\n- Reverse geocoding do pobierania nazwy miasta\n- Wycentrowane trajektorie względem solar noon\n- Dashboard z kartami: Wschód, Zachód, Długość Dnia, Golden AM/PM, Zmiana\n- Panel przełączników pór roku z ikonami Lucide\n- Responsywny design z safe-area-inset dla iPhone\n- Nagłówek Nucleus z nawigacją"
    },
    {
        "hash": "81ee910",
        "date": "2025-12-20 18:24",
        "type": "FIX",
        "component": "SYS",
        "desc": "System Log - usunięcie zielonego paska interfejsu",
        "details": "Zlikwidowano nieprawidłowo wyświetlający się zielony pasek gradientowy w górnej części interfejsu dziennika systemowego. Usunięto element div z klasą fixed top-0 zawierający gradient from-tech-green."
    },
    {
        "hash": "3053b20",
        "date": "2025-12-20 14:13",
        "type": "DOCS",
        "component": "LOG",
        "desc": "Synchronizacja wygenerowanych danych logów",
        "details": null
    },
    {
        "hash": "f9b9ac1",
        "date": "2025-12-20 14:11",
        "type": "STYLE",
        "component": "LOG",
        "desc": "Zmiana koloru dopisku o specyfikacji na szary",
        "details": "Zmieniono kolor tekstu 'ZAWIERA SZCZEGÓŁOWĄ SPECYFIKACJĘ' z zielonego na szary (text-tech-dim) dla lepszej czytelności i uspokojenia UI."
    },
    {
        "hash": "c81d716",
        "date": "2025-12-20 14:10",
        "type": "FEAT",
        "component": "LOG",
        "desc": "Wdrożenie System Log 2.0 z paginacją, filtrami i polską specyfikacją techniczną",
        "details": null
    },
    {
        "hash": "09589ad",
        "date": "2025-12-20 14:08",
        "type": "STYLE",
        "component": "LOG",
        "desc": "Przywrócenie technicznych typów badge",
        "details": "Zgodnie z życzeniem użytkownika, badge'e z typami zmian (FEAT, FIX, STYLE) zostały przywrócone do oryginalnych, technicznych nazw.\nWszystkie opisy zmian oraz szczegóły techniczne pozostały w języku polskim dla pełnej jasności."
    },
    {
        "hash": "810fc8a",
        "date": "2025-12-20 14:06",
        "type": "FEAT",
        "component": "LOG",
        "desc": "Pełna polonizacja interfejsu i poprawka danych",
        "details": "Wprowadzono polskie nazwy typów zmian (NOWOŚĆ, NAPRAWA, STYL).\nPrzetłumaczono etykiety interfejsu w panelu logów i modalach.\nZastosowano bezpieczniejsze separatory ASCII w skrypcie generującym.\nZaktualizowano nawigację (przycisk 'Powrót')."
    },
    {
        "hash": "a329563",
        "date": "2025-12-20 13:58",
        "type": "FEAT",
        "component": "LOG",
        "desc": "Wdrożenie obsługi polskich opisów",
        "details": "Zaktualizowano skrypt 'generate_git_log.js' o obsługę treści commita (%b).\nDodano sekcję 'Szczegóły Techniczne' w widokach HTML (System Log oraz App Changelog).\nWprowadzono separator <__EOL__> w parserze dla bezpieczeństwa danych."
    },
    {
        "hash": "df80888",
        "date": "2025-12-20 13:55",
        "type": "FEAT",
        "component": "SYSTEM-LOG",
        "desc": "Add pagination, filters and unified navigation",
        "details": "Implemented System Log 2.0 with pagination (10 per page), type filtering (ALL/APPS/SYSTEM) and consistent navigation bar. Fixed button label."
    },
    {
        "hash": "90e1cb7",
        "date": "2025-12-20 13:48",
        "type": "FEAT",
        "component": "SYSTEM-LOG",
        "desc": "Unify logs and automate generation",
        "details": "Implemented UnifiedLog component merging app and system logs. Added scripts/generate_git_log.js to automate changelog generation from git history. Updated db.js to use dynamic changelog data."
    },
    {
        "hash": "d65cc91",
        "date": "2025-12-19 22:52",
        "type": "STYLE",
        "component": "UI",
        "desc": "Reduce spacing between tags and buttons",
        "details": null
    },
    {
        "hash": "706d9da",
        "date": "2025-12-19 22:49",
        "type": "STYLE",
        "component": "SYS",
        "desc": "Revert \"style(ui): condense project grid layout\"",
        "details": "This reverts commit 9aad8739e28c3782bada460cb122985672bab144."
    },
    {
        "hash": "9aad873",
        "date": "2025-12-19 22:48",
        "type": "STYLE",
        "component": "UI",
        "desc": "Condense project grid layout",
        "details": null
    },
    {
        "hash": "5b29c1d",
        "date": "2025-12-19 22:47",
        "type": "STYLE",
        "component": "UI",
        "desc": "Align project title with icon",
        "details": null
    },
    {
        "hash": "90b11fe",
        "date": "2025-12-19 22:43",
        "type": "STYLE",
        "component": "ATMOSPHERE",
        "desc": "Fix stat unit spacing overlap",
        "details": null
    },
    {
        "hash": "8278c3c",
        "date": "2025-12-19 22:42",
        "type": "FIX",
        "component": "ATMOSPHERE",
        "desc": "Dismiss chart tooltip on outside click/touch",
        "details": null
    },
    {
        "hash": "daf0f42",
        "date": "2025-12-19 22:34",
        "type": "STYLE",
        "component": "SYSTEM-LOG",
        "desc": "Compact layout with expanding text",
        "details": null
    },
    {
        "hash": "20fd7ca",
        "date": "2025-12-19 22:31",
        "type": "FEAT",
        "component": "SYSTEM-LOG",
        "desc": "Dynamic changelog aggregator",
        "details": null
    },
    {
        "hash": "46b9157",
        "date": "2025-12-19 22:27",
        "type": "STYLE",
        "component": "HOME",
        "desc": "Compact header layout for better usability",
        "details": null
    },
    {
        "hash": "bfcc2d1",
        "date": "2025-12-19 22:24",
        "type": "FIX",
        "component": "UI",
        "desc": "Repair project grid rendering and hide empty slots on mobile",
        "details": null
    },
    {
        "hash": "da6eef4",
        "date": "2025-12-19 22:21",
        "type": "FEAT",
        "component": "UI",
        "desc": "Ensure project grid always has valid row layout (fill with empty slots)",
        "details": null
    },
    {
        "hash": "570f380",
        "date": "2025-12-19 22:16",
        "type": "STYLE",
        "component": "ATMOSPHERE",
        "desc": "Softer color and smaller font for last update text",
        "details": null
    },
    {
        "hash": "8b4aa2a",
        "date": "2025-12-19 22:15",
        "type": "STYLE",
        "component": "ATMOSPHERE",
        "desc": "Add 'Ostatni pomiar:' prefix to chart time",
        "details": null
    },
    {
        "hash": "b192aec",
        "date": "2025-12-19 22:13",
        "type": "STYLE",
        "component": "SYS",
        "desc": "Remove AI from tech stack",
        "details": null
    },
    {
        "hash": "e369aaa",
        "date": "2025-12-19 22:12",
        "type": "STYLE",
        "component": "SYS",
        "desc": "Replace specific AI brand names with generic 'AI' references",
        "details": null
    },
    {
        "hash": "c980de9",
        "date": "2025-12-19 22:07",
        "type": "FIX",
        "component": "CHANGELOG",
        "desc": "Increase top padding to prevent header overlap on mobile",
        "details": null
    },
    {
        "hash": "bdd6d4a",
        "date": "2025-12-19 22:04",
        "type": "DOCS",
        "component": "ATMOSPHERE",
        "desc": "Bump version to v0.2.0, add Analytics changelog",
        "details": null
    },
    {
        "hash": "1351161",
        "date": "2025-12-19 22:03",
        "type": "FEAT",
        "component": "ANALYTICS",
        "desc": "Add seasonal averages section",
        "details": null
    }
];
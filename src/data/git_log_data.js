export const GIT_LOG_DATA = [
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
    },
    {
        "hash": "7dcc74d",
        "date": "2025-12-19 21:56",
        "type": "FEAT",
        "component": "ATMOSPHERE",
        "desc": "Add interactive analytics page with week/month/year ranges",
        "details": null
    },
    {
        "hash": "024dda2",
        "date": "2025-12-19 21:50",
        "type": "FEAT",
        "component": "ATMOSPHERE",
        "desc": "Replace dew point with avg humidity, add time-of-day stats",
        "details": null
    },
    {
        "hash": "f97cd21",
        "date": "2025-12-19 21:45",
        "type": "FEAT",
        "component": "ATMOSPHERE",
        "desc": "Use Nucleus header for consistent navigation",
        "details": null
    },
    {
        "hash": "d30d0f9",
        "date": "2025-12-19 21:42",
        "type": "STYLE",
        "component": "ATMOSPHERE",
        "desc": "Move back button to top-right",
        "details": null
    },
    {
        "hash": "c94df07",
        "date": "2025-12-19 21:40",
        "type": "DOCS",
        "component": "ATMOSPHERE",
        "desc": "Update changelog description",
        "details": null
    },
    {
        "hash": "61ba9db",
        "date": "2025-12-19 21:40",
        "type": "STYLE",
        "component": "ATMOSPHERE",
        "desc": "Move scrollbar to body (right edge) and make header sticky",
        "details": null
    },
    {
        "hash": "1eb4198",
        "date": "2025-12-19 21:38",
        "type": "FIX",
        "component": "ATMOSPHERE",
        "desc": "Enable scrollbar and downgrade to v0.1.0",
        "details": null
    },
    {
        "hash": "add8618",
        "date": "2025-12-19 21:35",
        "type": "STYLE",
        "component": "ATMOSPHERE",
        "desc": "Move analytics section below chart",
        "details": null
    },
    {
        "hash": "7476a23",
        "date": "2025-12-19 21:32",
        "type": "FEAT",
        "component": "ATMOSPHERE",
        "desc": "Add analytics, history nav and update copy",
        "details": null
    }
];
export const GIT_LOG_DATA = [
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
    },
    {
        "hash": "277c94e",
        "date": "2025-12-19 21:28",
        "type": "FEAT",
        "component": "ATMOSPHERE",
        "desc": "Add changelog and reorder apps",
        "details": null
    },
    {
        "hash": "c286464",
        "date": "2025-12-19 21:25",
        "type": "STYLE",
        "component": "SYS",
        "desc": "Change Atmosphere card color to green",
        "details": null
    },
    {
        "hash": "bde6819",
        "date": "2025-12-19 21:21",
        "type": "SYS",
        "component": "SYS",
        "desc": "Restore public folder structure and persist fixes",
        "details": null
    },
    {
        "hash": "cf2130e",
        "date": "2025-12-19 21:15",
        "type": "FIX",
        "component": "ATMOSPHERE",
        "desc": "Correct API path and enable module bundling",
        "details": null
    },
    {
        "hash": "27b5354",
        "date": "2025-12-19 20:54",
        "type": "DEBUG",
        "component": "SYS",
        "desc": "Add test endpoint for API diagnosis",
        "details": null
    },
    {
        "hash": "d63fe2f",
        "date": "2025-12-19 20:53",
        "type": "FIX",
        "component": "API",
        "desc": "Robust atmosphere.php (suppress warnings, fix permissions, handle empty input)",
        "details": null
    },
    {
        "hash": "800a019",
        "date": "2025-12-19 20:49",
        "type": "FIX",
        "component": "FOOTER",
        "desc": "Safe visitor counter fetch (timeout + checks) to prevent mobile connection errors",
        "details": null
    },
    {
        "hash": "bdd9b9a",
        "date": "2025-12-19 20:24",
        "type": "FEAT",
        "component": "SYS",
        "desc": "Add visitor counter, invert profile hover, unify scrollbar",
        "details": null
    },
    {
        "hash": "ca67001",
        "date": "2025-12-19 16:33",
        "type": "FEAT",
        "component": "ABOUT",
        "desc": "Update about page content and styles, add profile image",
        "details": null
    },
    {
        "hash": "cd36769",
        "date": "2025-12-18 23:28",
        "type": "UPDATE",
        "component": "SYS",
        "desc": "Update DraftCargo changelog to v.0.5.0 (mobile optimization)",
        "details": null
    },
    {
        "hash": "cfe5728",
        "date": "2025-12-18 23:26",
        "type": "FIX",
        "component": "SYS",
        "desc": "Fix mobile upload: use FormData + 512KB chunks + better error handling",
        "details": null
    },
    {
        "hash": "a6f6d04",
        "date": "2025-12-18 23:24",
        "type": "FIX",
        "component": "SYS",
        "desc": "Fix 503: reduce chunk size to 1MB and lower PHP limits",
        "details": null
    },
    {
        "hash": "29e7922",
        "date": "2025-12-18 23:19",
        "type": "UPDATE",
        "component": "SYS",
        "desc": "Remove home.pl references from DraftCargo changelog",
        "details": null
    },
    {
        "hash": "f89b710",
        "date": "2025-12-18 23:18",
        "type": "UPDATE",
        "component": "SYS",
        "desc": "Add project-specific icons (sun for SunTrack, package for DraftCargo)",
        "details": null
    },
    {
        "hash": "f87797f",
        "date": "2025-12-18 23:16",
        "type": "UPDATE",
        "component": "SYS",
        "desc": "Add DraftCargo changelog and details to db.js",
        "details": null
    },
    {
        "hash": "f8585c4",
        "date": "2025-12-18 23:13",
        "type": "BYPASS",
        "component": "SYS",
        "desc": "Base64 encoding to avoid tmp folder (Error 6)",
        "details": null
    },
    {
        "hash": "b76020c",
        "date": "2025-12-18 23:09",
        "type": "FIX",
        "component": "SYS",
        "desc": "Fix DraftCargo: use move_uploaded_file instead of RAW upload",
        "details": null
    },
    {
        "hash": "ab7c43c",
        "date": "2025-12-18 23:05",
        "type": "UPDATE",
        "component": "SYS",
        "desc": "Refactor DraftCargo to RAW upload (bypass tmp folder issue)",
        "details": null
    }
];
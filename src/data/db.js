export const SITE_DATA = {
    config: {
        title: "DraftLab.pl",
        status: "ONLINE",
        mode: "EXPLORATION",
        techStack: [
            { label: "AI", value: "Antigravity Codebase Agent / Gemini 2.0" },
            { label: "Build", value: "Vite / PostCSS / Tailwind (Native)" },
            { label: "Core", value: "Web Components / ES Modules" },
            { label: "VCS", value: "Git / GitHub" }
        ]
    },
    menu: [
        { name: "WARSZTAT", url: "index.html" },
        { name: "O MNIE", url: "about.html" }
    ],
    projects: [
        {
            id: "suntrack",
            title: "SunTrack",
            desc: "Wizualizacja pozycji słońca i faz dnia w estetyce Liquid Glass.",
            tags: ["PWA", "SunCalc", "Glassmorphism"],
            version: "v.0.3.0",
            url: "apps/SunTrack.html",
            changelogUrl: "apps/changelog.html?id=suntrack",
            icon: "sun",
            active: true,
            color: "yellow",

            details: {
                about: "Aplikacja webowa typu PWA do wizualizacji pozycji słońca i śledzenia faz dnia. Narzędzie dedykowane fotografom i miłośnikom nieba, łączące fizycznie poprawne dane astronomiczne z artystycznym interfejsem.",
                features: [
                    { title: "Symulacja Time Travel", desc: "Suwak czasu (00:00-23:59) z fizyczną zmianą pozycji słońca i dynamicznym tłem." },
                    { title: "Living Sky", desc: "Proceduralne chmury, ptaki w dzień, migoczące gwiazdy w nocy." },
                    { title: "Dane Astronomiczne", desc: "Golden Hour, wschody/zachody, elewacja słońca w stopniach." },
                    { title: "Geolokalizacja", desc: "Auto-wykrywanie pozycji i Reverse Geocoding (OpenStreetMap)." }
                ],
                techStack: ["HTML5 / CSS3", "Vanilla JS (ES6+)", "SunCalc v1.8.0", "Lucide Icons", "PWA Support"],
                roadmap: [
                    { done: false, task: "Wybór lokalizacji z mapy" },
                    { done: false, task: "Wizualizacja faz księżyca" },
                    { done: false, task: "Powiadomienia o Złotej Godzinie" },
                    { done: false, task: "Tryb offline (Service Worker)" }
                ]
            },

            changes: [
                {
                    version: "v.0.3.0",
                    date: "2025-12-18",
                    type: "VISUAL",
                    desc: "Aesthetics & Micro-UI: Nowe, naturalne chmury (Cumulus), realistyczna paleta barw nieba. Kompresja interfejsu (Fit-to-Screen) oraz pełne spolszczenie i optymalizacja ikon."
                },
                {
                    version: "v.0.2.1",
                    date: "2025-12-18",
                    type: "HOTFIX",
                    desc: "Safari Core & Geo Hybrid: Wymuszenie ciemnego paska adresu, naprawa pętli renderującej oraz wdrożenie Hybrydowej Geolokalizacji (Automatyczny fallback do IP API przy blokadzie GPS)."
                },
                {
                    version: "v.0.2.0",
                    date: "2025-12-17",
                    type: "FEAT",
                    desc: "System Manifest & Core Fixes: Wdrożenie dynamicznego panelu dokumentacji. Naprawa pętli czasu rzeczywistego (Live Clock), korekta horyzontu na mobile oraz ulepszony UX geolokalizacji."
                },
                {
                    version: "v.0.1",
                    date: "2025-12-18",
                    type: "CORE",
                    desc: "Geo & Scale: Automatyczna geolokalizacja, Golden Hour, skalowanie interfejsu (mobile-first), optymalizacja suwaka."
                },
                {
                    version: "v.0.0.4",
                    date: "2025-12-17",
                    type: "FEAT",
                    desc: "Living Sky: Warstwy animowane (chmury, ptaki), logika gwiazd, clean look (usunięcie trajektorii)."
                },
                {
                    version: "v.0.0.3",
                    date: "2025-12-16",
                    type: "FIX",
                    desc: "Horizon Fix: Dostosowanie horyzontu UI, fizyczna skala wysokości 1:1."
                },
                {
                    version: "v.0.0.2",
                    date: "2025-12-15",
                    type: "UX",
                    desc: "Smooth & PWA: Interpolacja kolorów nieba, metatagi iOS (fullscreen)."
                },
                {
                    version: "v.0.0.1",
                    date: "2025-12-14",
                    type: "INIT",
                    desc: "Prototype: Baza HTML/JS, SunCalc, Glassmorphism base."
                }
            ]
        },
        {
            id: "draftcargo",
            title: "DraftCargo",
            desc: "Prywatny transfer plików do 1GB. Automatyczne czyszczenie po 72h.",
            tags: ["PHP", "Base64", "Chunking"],
            version: "v.0.5.0",
            url: "apps/DraftCargo.html",
            changelogUrl: "apps/changelog.html?id=draftcargo",
            icon: "package",
            active: true,
            color: "blue",

            details: {
                about: "Prywatna alternatywa dla WeTransfer. Pozwala przesyłać pliki do 1GB bez rejestracji. Pliki są automatycznie usuwane po 72 godzinach. Zoptymalizowana pod restrykcyjne hostingi współdzielone.",
                features: [
                    { title: "Chunked Upload", desc: "Pliki dzielone na 512KB kawałki. Stabilne przesyłanie nawet przy słabym połączeniu." },
                    { title: "Base64 Bypass", desc: "Unikalna metoda omijająca ograniczenia serwerów bez folderu tmp." },
                    { title: "Auto-Cleanup (72h)", desc: "Skrypt CRON automatycznie usuwa wygasłe pliki." },
                    { title: "Mobile Ready", desc: "Zoptymalizowane pod przeglądarki mobilne (iOS Safari, Chrome)." }
                ],
                techStack: ["PHP 8.x", "Vanilla JS (ES6+)", "Base64 Encoding", "CRON Jobs", "Lucide Icons"],
                roadmap: [
                    { done: true, task: "Podstawowy upload plików" },
                    { done: true, task: "Chunking dla dużych plików" },
                    { done: true, task: "Bypass dla restrykcyjnych hostingów" },
                    { done: true, task: "Optymalizacja mobile" },
                    { done: false, task: "Podgląd postępu pobierania" },
                    { done: false, task: "Opcjonalne hasło do pliku" }
                ]
            },

            changes: [
                {
                    version: "v.0.5.0",
                    date: "2025-12-18",
                    type: "FEAT",
                    desc: "Mobile Optimization: Zmniejszone chunki do 512KB, FormData zamiast URLSearchParams, lepsze logowanie błędów, walidacja Base64."
                },
                {
                    version: "v.0.4.0",
                    date: "2025-12-18",
                    type: "CORE",
                    desc: "Base64 Bypass: Fundamentalna zmiana architektury. Pliki wysyłane jako tekst Base64, całkowicie omijając mechanizm $_FILES i folder tymczasowy."
                },
                {
                    version: "v.0.3.0",
                    date: "2025-12-18",
                    type: "FIX",
                    desc: "RAW Upload Attempt: Próba użycia php://input - nieudana na niektórych hostingach (zwraca 0 bajtów)."
                },
                {
                    version: "v.0.2.0",
                    date: "2025-12-18",
                    type: "FIX",
                    desc: "Error Handling: Dodanie diagnostyki błędów, logowania do pliku, obsługa kodów błędów PHP."
                },
                {
                    version: "v.0.1.0",
                    date: "2025-12-18",
                    type: "INIT",
                    desc: "Pierwsza wersja: Chunked upload, Industrial UI, integracja z CRON dla auto-cleanup."
                }
            ]
        },
        {
            id: 'atmosphere',
            title: 'Atmosphere',
            desc: 'Dziennik klimatyczny HomePod mini. Wizualizacja temperatury i wilgotności w cyklu dobowym (4 pomiary na dzień).',
            version: 'v0.2.0',
            active: true,
            url: './apps/Atmosphere.html',
            changelogUrl: "apps/changelog.html?id=atmosphere",
            tags: ['IoT', 'Chart.js', 'PHP'],
            color: 'green',
            icon: 'cloud',

            details: {
                about: "System monitoringu parametrów powietrza wykorzystujący czujniki HomePod mini. Dane zbierane są automatycznie przez Skróty iOS i wizualizowane na interaktywnym wykresie.",
                features: [
                    { title: "Daily Timeline", desc: "Interaktywny wykres liniowy pokazujący zmiany klimatu w cyklach 6-godzinnych." },
                    { title: "iOS Integration", desc: "Automatyczne zbieranie danych 4x dziennie (06:00, 12:00, 18:00, 00:00)." },
                    { title: "Analytics Dashboard", desc: "Analiza danych w zakresie tygodnia, miesiąca lub roku z agregacją." },
                    { title: "Lightweight API", desc: "Minimalistyczny backend PHP niewymagający bazy danych SQL." }
                ],
                techStack: ["Chart.js", "PHP 8.x (JSON Storage)", "iOS Shortcuts", "Vanilla JS", "Tailwind CSS"],
                roadmap: [
                    { done: true, task: "Odbiór danych z HomePod" },
                    { done: true, task: "Wizualizacja na wykresie" },
                    { done: true, task: "Strona Analytics z zakresami" },
                    { done: false, task: "Eksport danych do CSV" }
                ]
            },

            changes: [
                {
                    version: "v.0.2.0",
                    date: "2025-12-19",
                    type: "FEATURE",
                    desc: "Analytics Dashboard: Nowa strona z interaktywnym wykresem (tydzień/miesiąc/rok), statystyki wg pory dnia i pory roku, ujednolicona nawigacja z resztą strony."
                },
                {
                    version: "v.0.1.0",
                    date: "2025-12-19",
                    type: "INIT",
                    desc: "Public Release: Stabilna wersja API, wykres 24h, integracja z iOS Shortcuts, wyświetla statystyki i agreguje dane."
                }
            ]
        },
        {
            id: "slot_03",
            title: "Slot_03: Empty",
            desc: "Czekam na kolejny pomysł...",
            tags: [],
            version: "TBD",
            url: "#",
            active: false,
            color: "gray"
        }
    ],
    news: [
        {
            date: "2025-12-17",
            title: "Tutaj będzie panel z newsami",
            content: "Bedzie działać ale potrzeba czasu :)"
        },
        {
            date: "2025-12-17",
            title: "System Update",
            content: "Refaktoryzacja struktury DraftLab. Przejście na Web Components i architekturę modułową."
        },
        {
            date: "2025-12-16",
            title: "Inicjalizacja",
            content: "Pierwszy commit projektu. Uruchomienie środowiska developerskiego."
        }
    ]
};
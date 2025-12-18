export const SITE_DATA = {
    config: {
        title: "DraftLab.pl",
        status: "ONLINE",
        mode: "EXPLORATION"
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
            id: "slot_02",
            title: "Slot_02: Empty",
            desc: "Czekam na kolejny pomysł...",
            tags: [],
            version: "TBD",
            url: "#",
            active: false,
            color: "gray"
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
import { PROJECT_CHANGES } from './auto_changelogs.js';

const RAW_DATA = {
    config: {
        title: "DraftLab.pl",
        status: "ONLINE",
        mode: "EXPLORATION",
        techStack: [
            { label: "Build", value: "Vite / PostCSS / Tailwind (Native)" },
            { label: "Core", value: "Web Components / ES Modules" },
            { label: "VCS", value: "Git / GitHub" }
        ],
        apiEndpoints: {
            atmosphere: '../api/atmosphere.php'
        }
    },
    menu: [
        { name: "WARSZTAT", url: "index.html" },
        { name: "O MNIE", url: "about.html" }
    ],
    projects: [
        {
            id: "suntrack",
            title: "SunTrack",
            desc: "Wizualizacja pozycji słońca z trajektoriami sezonowymi i automatyczną geolokalizacją.",
            tags: ["PWA", "SunCalc", "Glassmorphism"],
            version: "v2.0",
            url: "apps/SunTrack.html",
            changelogUrl: "apps/changelog.html?id=suntrack",
            icon: "sun",
            active: true,
            color: "yellow",

            details: {
                about: "Aplikacja webowa typu PWA do wizualizacji pozycji słońca i śledzenia faz dnia. Narzędzie dedykowane fotografom i miłośnikom nieba, łączące fizycznie poprawne dane astronomiczne z artystycznym interfejsem.",
                features: [
                    { title: "Trajektorie Sezonowe", desc: "Porównanie ścieżek słońca: wiosna, lato, jesień, zima z kolorowymi liniami." },
                    { title: "Wizualizacja Nieba", desc: "Płynne gradienty kolorów zależne od wysokości słońca, efekt lens flare." },
                    { title: "Auto-Geolokalizacja", desc: "Automatyczne wykrywanie pozycji przy każdym uruchomieniu z reverse geocoding." },
                    { title: "Dashboard Danych", desc: "Wschód, zachód, długość dnia, Golden Hour AM/PM, zmiana względem najdłuższego dnia." }
                ],
                techStack: ["HTML5 / CSS3", "Vanilla JS (ES6+)", "SunCalc v1.8.0", "Lucide Icons", "Nominatim API"],
                roadmap: [
                    { done: true, task: "Trajektorie sezonowe" },
                    { done: true, task: "Automatyczna geolokalizacja" },
                    { done: false, task: "Wybór lokalizacji z mapy" },
                    { done: false, task: "Powiadomienia o Złotej Godzinie" }
                ]
            },

            changes: [
                {
                    version: "v2.0",
                    date: "2025-12-20 21:00",
                    type: "MAJOR",
                    desc: "Kompletna przebudowa aplikacji: nowy minimalistyczny design, trajektorie sezonowe z przełącznikami, płynne gradienty nieba, lens flare, automatyczna geolokalizacja z reverse geocoding, wyszukiwarka ograniczona do Polski, wycentrowane trajektorie względem solar noon, responsywny dashboard."
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
                    version: "v0.6.0",
                    date: "2025-12-21",
                    type: "FEAT",
                    desc: "Stats & Download Fix: Zaimplementowano bezpieczny licznik transferów z blokowaniem plików, dodano dedykowany skrypt pobierania oraz naprawiono strukturę budowania Vite dla API."
                },
                {
                    version: "v.0.5.0",
                    date: "2025-12-18",
                    type: "FEAT",
                    desc: "Mobile Optimization: Zmniejszone chunki do 512KB, FormData zamiast URLSearchParams, lepsze logowanie błędów, walidacja Base64."
                }
            ]
        },
        {
            id: 'atmosphere',
            title: 'Atmosphere',
            desc: 'Dziennik klimatyczny HomePod mini. Wizualizacja temperatury i wilgotności w cyklu dobowym (4 pomiary na dzień).',
            version: 'v0.2.1',
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

            changes: []
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

// --- DATA MERGE LOGIC ---
// Merge auto-generated git logs with manual entries

RAW_DATA.projects.forEach(project => {
    const gitChanges = PROJECT_CHANGES[project.id] || [];

    // Combine arrays
    const combined = [...(project.changes || []), ...gitChanges];

    // Deduplicate by date + desc (naive approach)
    const unique = [];
    const seen = new Set();

    combined.forEach(item => {
        const key = `${item.date}-${item.desc}`;
        if (!seen.has(key)) {
            seen.add(key);
            unique.push(item);
        }
    });

    // Sort by date desc
    unique.sort((a, b) => new Date(b.date) - new Date(a.date));

    project.changes = unique;
});

export const SITE_DATA = RAW_DATA;
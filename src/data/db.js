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
        { name: "WARSZTAT", name_en: "WORKSHOP", url: "index.html" },
        { name: "O MNIE", name_en: "ABOUT", url: "about.html" }
    ],
    projects: [
        {
            id: "labyrinth-qr",
            title: "LabyrinthQR",
            title_en: "LabyrinthQR",
            desc: "Industrialny generator kodów QR. Pełna personalizacja: Kształty, Kolory, Logo.",
            desc_en: "Industrial QR code generator. Full customization: Shapes, Colors, Logo.",
            tags: ["QR Generator", "Client-Side", "Canvas"],
            version: "v1.0.0",
            url: "apps/LabyrinthQR.html",
            changelogUrl: "apps/changelog.html?id=labyrinth-qr",
            icon: "qr-code",
            active: true,
            color: "green",

            details: {
                about: "Zaawansowany generator kodów QR w estetyce Industrial Tech. Pozwala na tworzenie unikalnych kodów z własnym logo, gradientami i niestandardowymi kształtami modułów. Generowanie kodów działa lokalnie, z opcją zapisu wiadomości w chmurze (Leave Message).",
                features: [
                    { title: "Advanced Styling", desc: "Zmiana kształtu modułów (Dots, Rounded, Liquid) i narożników." },
                    { title: "Hybrid Core", desc: "Generowanie QR w przeglądarce + opcjonalny hosting wiadomości i zdjęć." },
                    { title: "Logo Support", desc: "Możliwość wgrania własnego znaku graficznego na środek kodu." },
                    { title: "Smart Templates", desc: "Gotowe szablony dla Wi-Fi, vCard i Linków." }
                ],
                techStack: ["Vanilla JS", "QR Code Styling Lib", "Canvas API", "FileReader API"],
                roadmap: [
                    { done: true, task: "Integracja biblioteki generującej" },
                    { done: true, task: "Panel konfiguracji wyglądu" },
                    { done: false, task: "Zapisywanie presetów" },
                    { done: false, task: "Generowanie kodów wektorowych (SVG)" }
                ]
            },
            details_en: {
                about: "Advanced QR code generator in Industrial Tech aesthetics. Allows creating unique codes with custom logos, gradients, and module shapes. Code generation works locally, with an option to save messages in the cloud (Leave Message).",
                features: [
                    { title: "Advanced Styling", desc: "Change module shapes (Dots, Rounded, Liquid) and corners." },
                    { title: "Hybrid Core", desc: "Browser-based QR generation + optional message and image hosting." },
                    { title: "Logo Support", desc: "Ability to upload a custom graphic mark to the center of the code." },
                    { title: "Smart Templates", desc: "Ready-made templates for Wi-Fi, vCard, and Links." }
                ],
                techStack: ["Vanilla JS", "QR Code Styling Lib", "Canvas API", "FileReader API"],
                roadmap: [
                    { done: true, task: "Generator library integration" },
                    { done: true, task: "Appearance configuration panel" },
                    { done: false, task: "Saving presets" },
                    { done: false, task: "Vector code generation (SVG)" }
                ]
            },

            changes: [
                {
                    version: "v1.0.1",
                    date: "2025-12-23",
                    type: "POLISH",
                    desc: "UI/UX Polish: Ujednolicenie nawigacji (Nucleus Header), poprawa widoczności inputów (High Contrast), typografia bez łamania linii dla Wi-Fi, precyzyjniejszy opis funkcji."
                },
                {
                    version: "v1.0.0",
                    date: "2025-12-23",
                    type: "INIT",
                    desc: "Initial Release: Premiera generatora LabyrinthQR z pełną obsługą stylizacji i prywatności."
                }
            ]
        },
        {
            id: "draftcargo",
            title: "DraftCargo",
            title_en: "DraftCargo",
            desc: "Prywatny transfer plików do 1GB. Automatyczne czyszczenie po 72h.",
            desc_en: "Private file transfer up to 1GB. Auto-cleanup after 72h.",
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
            details_en: {
                about: "Private alternative to WeTransfer. Allows sending files up to 1GB without registration. Files are automatically deleted after 72 hours. Optimized for restrictive shared hosting.",
                features: [
                    { title: "Chunked Upload", desc: "Files split into 512KB chunks. Stable upload even with poor connection." },
                    { title: "Base64 Bypass", desc: "Unique method bypassing server restrictions without tmp folder." },
                    { title: "Auto-Cleanup (72h)", desc: "CRON script automatically deletes expired files." },
                    { title: "Mobile Ready", desc: "Optimized for mobile browsers (iOS Safari, Chrome)." }
                ],
                techStack: ["PHP 8.x", "Vanilla JS (ES6+)", "Base64 Encoding", "CRON Jobs", "Lucide Icons"],
                roadmap: [
                    { done: true, task: "Basic file upload" },
                    { done: true, task: "Chunking for large files" },
                    { done: true, task: "Bypass for restrictive hosting" },
                    { done: true, task: "Mobile optimization" },
                    { done: false, task: "Download progress preview" },
                    { done: false, task: "Optional file password" }
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
            id: "suntrack",
            title: "SunTrack",
            title_en: "SunTrack",
            desc: "Wizualizacja pozycji słońca z trajektoriami sezonowymi i automatyczną geolokalizacją.",
            desc_en: "Sun position visualization with seasonal trajectories and automatic geolocation.",
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
                techStack: ["Vanilla JS", "SunCalc Library", "PWA / Service Worker", "CSS3 Variables", "OpenStreetMap API"],
            },
            details_en: {
                about: "PWA web application for visualizing sun position and tracking day phases. A tool dedicated to photographers and sky enthusiasts, combining physically correct astronomical data with an artistic interface.",
                features: [
                    { title: "Seasonal Trajectories", desc: "Comparison of sun paths: spring, summer, autumn, winter with colored lines." },
                    { title: "Sky Visualization", desc: "Smooth color gradients depending on sun altitude, lens flare effect." },
                    { title: "Auto-Geolocation", desc: "Automatic position detection on every launch with reverse geocoding." },
                    { title: "Data Dashboard", desc: "Sunrise, sunset, day length, Golden Hour AM/PM, change versus longest day." }
                ],
                techStack: ["Vanilla JS", "SunCalc Library", "PWA / Service Worker", "CSS3 Variables", "OpenStreetMap API"],
            },

            changes: [
                {
                    version: "v2.0.1",
                    date: "2025-12-30",
                    type: "FIX",
                    desc: "System Fix: Naprawiono brakującą stopkę w globalnym widoku dziennika zmian (changelog.html)."
                },
                {
                    version: "v2.0",
                    date: "2025-12-20 21:00",
                    type: "MAJOR",
                    desc: "Kompletna przebudowa aplikacji: nowy minimalistyczny design, trajektorie sezonowe z przełącznikami, płynne gradienty nieba, lens flare, automatyczna geolokalizacja z reverse geocoding, wyszukiwarka ograniczona do Polski, wycentrowane trajektorie względem solar noon, responsywny dashboard."
                }
            ]
        },
        {
            id: 'atmosphere',
            title: 'Atmosphere',
            title_en: 'Atmosphere',
            desc: 'Dziennik klimatyczny HomePod mini. Wizualizacja temperatury i wilgotności w cyklu dobowym (4 pomiary na dzień).',
            desc_en: 'HomePod mini climate journal. Visualization of temperature and humidity in a daily cycle (4 measurements per day).',
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
            details_en: {
                about: "Air parameter monitoring system using HomePod mini sensors. Data is automatically collected by iOS Shortcuts and visualized on an interactive chart.",
                features: [
                    { title: "Daily Timeline", desc: "Interactive line chart showing climate changes in 6-hour cycles." },
                    { title: "iOS Integration", desc: "Automatic data collection 4x daily (06:00, 12:00, 18:00, 00:00)." },
                    { title: "Analytics Dashboard", desc: "Data analysis over a week, month, or year range with aggregation." },
                    { title: "Lightweight API", desc: "Minimalist PHP backend requiring no SQL database." }
                ],
                techStack: ["Chart.js", "PHP 8.x (JSON Storage)", "iOS Shortcuts", "Vanilla JS", "Tailwind CSS"],
                roadmap: [
                    { done: true, task: "Data reception from HomePod" },
                    { done: true, task: "Chart visualization" },
                    { done: true, task: "Analytics page with ranges" },
                    { done: false, task: "Data export to CSV" }
                ]
            },

            changes: []
        },

        {
            id: 'retrovision',
            title: 'RetroVision',
            title_en: 'RetroVision',
            desc: 'Filtr kamery zmieniający obraz w strumień kodu ASCII w czasie rzeczywistym. Matrix w Twojej przeglądarce.',
            desc_en: 'Camera filter turning video into a real-time ASCII code stream. The Matrix in your browser.',
            version: 'v1.0.0',
            active: true,
            url: 'apps/RetroVision.html',
            changelogUrl: 'apps/changelog.html?id=retrovision',
            tags: ['Camera', 'ASCII', 'Canvas'],
            color: 'green',
            icon: 'camera',

            details: {
                about: "Eksperymentalny projekt wizualny przetwarzający obraz z kamery na znaki tekstowe ASCII w czasie rzeczywistym. Nawiązuje do estetyki terminali i filmów Sci-Fi z lat 90.",
                features: [
                    { title: "Real-time ASCII", desc: "Konwersja 30 klatek na sekundę z pełną płynnością." },
                    { title: "Visual Modes", desc: "Tryby: Matrix (Katakana), Binary (0/1), Standard (ASCII)." },
                    { title: "Snapshot", desc: "Możliwość wykonania i pobrania zdjęcia w formacie PNG." },
                    { title: "Privacy", desc: "Obraz jest przetwarzany lokalnie w przeglądarce. Nikdzie nie jest wysyłany." }
                ],
                techStack: ["Vanilla JS", "Canvas API", "MediaStream API", "Offscreen Processing"],
                roadmap: [
                    { done: true, task: "Dostęp do kamery" },
                    { done: true, task: "Silnik renderujący ASCII" },
                    { done: true, task: "Filtry i ustawienia" },
                    { done: false, task: "Nagrywanie wideo (GIF/WebM)" }
                ]
            },
            details_en: {
                about: "Experimental visual project processing camera feed into ASCII text characters in real-time. References terminal aesthetics and 90s Sci-Fi movies.",
                features: [
                    { title: "Real-time ASCII", desc: "30 fps conversion with full smoothness." },
                    { title: "Visual Modes", desc: "Modes: Matrix (Katakana), Binary (0/1), Standard (ASCII)." },
                    { title: "Snapshot", desc: "Ability to take and download a photo in PNG format." },
                    { title: "Privacy", desc: "Image is processed locally in the browser. Sent nowhere." }
                ],
                techStack: ["Vanilla JS", "Canvas API", "MediaStream API", "Offscreen Processing"],
                roadmap: [
                    { done: true, task: "Camera access" },
                    { done: true, task: "ASCII rendering engine" },
                    { done: true, task: "Filters and settings" },
                    { done: false, task: "Video recording (GIF/WebM)" }
                ]
            },

            changes: [
                {
                    version: "v1.1.0",
                    date: "2025-12-30 22:00",
                    type: "UPDATE",
                    desc: "UX & i18n: Pełna internacjonalizacja (PL/EN), nowy zwijany panel ustawień, usprawnienia mobilne, stały przycisk migawki oraz dedykowane ustawienia gęstości per zestaw znaków."
                },
                {
                    version: "v1.0.0",
                    date: "2025-12-30",
                    type: "INIT",
                    desc: "Initial Release: Premiera RetroVision - ASCII Camera Filter."
                }
            ]
        },
        {
            id: 'draftcalc',
            title: 'DraftCalc',
            title_en: 'DraftCalc',
            desc: 'Industrialne obliczenia procentowe. Dashboard v0.1 z wizualizacją i historią.',
            desc_en: 'Industrial percentage calculations. Dashboard v0.1 with visualization and history.',
            version: 'v0.1',
            active: true,
            url: 'apps/DraftCalc.html',
            changelogUrl: 'apps/changelog.html?id=draftcalc',
            tags: ['Calculator', 'Visualizer', 'Productivity'],
            color: 'green',
            icon: 'percent',

            details: {
                about: "Zaawansowany kalkulator procentowy w estetyce Industrial Tech. Oferuje cztery tryby obliczeń, wizualizację wyników oraz historię obliczeń.",
                features: [
                    { title: "4 Tryby Obliczeń", desc: "Zmiana wartości, % z liczby, Jaki to %, Dodaj/Odejmij % - wszystkie w jednym dashboardzie." },
                    { title: "Wizualizacja", desc: "Wykresy słupkowe i paski postępu dla każdego obliczenia." },
                    { title: "Smart History", desc: "Lokalny zapis ostatnich obliczeń z możliwością kopiowania wyników." },
                    { title: "Wielojęzyczność", desc: "Pełna obsługa języka polskiego i angielskiego." }
                ],
                techStack: ["Vanilla JS", "CSS3 Grid", "LocalStorage", "Dynamic DOM", "i18n System"],
                roadmap: [
                    { done: true, task: "Silnik obliczeń procentowych" },
                    { done: true, task: "Panel wizualizacji" },
                    { done: true, task: "Moduł historii" },
                    { done: true, task: "System wielojęzyczności" },
                    { done: false, task: "Eksport raportów PDF" },
                    { done: false, task: "Zapisywanie presetów obliczeń" }
                ]
            },
            details_en: {
                about: "Advanced percentage calculator in Industrial Tech aesthetics. Offers four calculation modes, results visualization, and calculation history.",
                features: [
                    { title: "4 Calculation Modes", desc: "Value change, % of number, What %, Add/Subtract % - all in one dashboard." },
                    { title: "Visualization", desc: "Bar charts and progress bars for each calculation." },
                    { title: "Smart History", desc: "Local record of recent calculations with copy capability." },
                    { title: "Multilingual", desc: "Full Polish and English language support." }
                ],
                techStack: ["Vanilla JS", "CSS3 Grid", "LocalStorage", "Dynamic DOM", "i18n System"],
                roadmap: [
                    { done: true, task: "Percentage calculation engine" },
                    { done: true, task: "Visualization panel" },
                    { done: true, task: "History module" },
                    { done: true, task: "Multilingual system" },
                    { done: false, task: "PDF report export" },
                    { done: false, task: "Save calculation presets" }
                ]
            },

            changes: [
                {
                    version: "v0.1",
                    date: "2026-01-06",
                    type: "INIT",
                    desc: "Pierwsza wersja DraftCalc - zaawansowany kalkulator procentowy z czterema trybami działania: Zmiana wartości, % z liczby, Jaki to %, oraz Dodaj/Odejmij %. Implementacja wizualizacji wyników, historii obliczeń, przełącznika operacji oraz pełnej wielojęzyczności (PL/EN).",
                    details: "Funkcje:\n→ 4 tryby obliczeń procentowych\n→ Dynamiczne opisy wyjaśniające działanie każdego trybu\n→ Wizualizacja wyników (wykresy słupkowe i paski postępu)\n→ Przełącznik operacji dodawania/odejmowania w trybie ±%\n→ Historia obliczeń z możliwością kopiowania wyników\n→ Wielojęzyczna obsługa (PL/EN)\n→ Industrial Tech Design System"
                }
            ]
        },


    ],
    news: [
        {
            date: "2025-12-17",
            title: "Tutaj będzie panel z newsami",
            title_en: "News panel coming soon",
            content: "Bedzie działać ale potrzeba czasu :)",
            content_en: "It will work but needs time :)"
        },
        {
            date: "2025-12-17",
            title: "System Update",
            title_en: "System Update",
            content: "Refaktoryzacja struktury DraftLab. Przejście na Web Components i architekturę modułową.",
            content_en: "DraftLab structure refactoring. Transition to Web Components and modular architecture."
        },
        {
            date: "2025-12-16",
            title: "Inicjalizacja",
            title_en: "Initialization",
            content: "Pierwszy commit projektu. Uruchomienie środowiska developerskiego.",
            content_en: "First project commit. launching development environment."
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
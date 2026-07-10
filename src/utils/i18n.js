
// src/utils/i18n.js

export class I18n {
    constructor() {
        this.lang = this.getInitialLang();
        this.listeners = new Set();

        this.dictionary = {
            pl: {
                // Hero
                "hero.init": "> Inicjalizacja warsztatu...",
                "hero.title": "Eksperymentalny <br>Warsztat Web <span class=\"text-tech-green\">AI</span><span class=\"cursor-blink\">_</span>",
                "hero.subtitle": "Kolekcja aplikacji webowych współtworzonych z modelami językowymi. Od promptu do wdrożenia. Testuję granice kodu i&nbsp;wyobraźni.",
                "hero.cta": "Przeglądaj Projekty",

                // Section Headers
                "section.repo": "REPOZYTORIUM",
                "section.manifest": "/ Manifest",
                "section.stack": "/ Tech Stack",

                // Content
                "manifest.text": "DraftLab.pl to mój cyfrowy brudnopis. Tutaj testuję granice współpracy człowiek-maszyna,\nzamieniając prompty w kod.",

                // UI Elements
                "ui.run": "Uruchom",
                "ui.offline": "OFFLINE",
                "ui.show_empty": "Pokaż puste sloty",
                "ui.hide_empty": "Ukryj puste sloty",
                "ui.empty_slot": "Empty",
                "ui.tbd": "TBD",

                // Footer
                "footer.copyright": "DraftLab.pl © 2025.",
                "footer.rights": "All systems operational.",

                // Links
                "link.github": "GitHub",

                // App: SunTrack
                "sun.title": "SunTrack",
                "sun.subtitle": "Wizualizacja pozycji słońca",
                "sun.search.placeholder": "Szukaj miasta...",
                "sun.search.no_results": "Nie znaleziono lokalizacji.",
                "sun.search.error": "Nie udało się pobrać lokalizacji.",
                "sun.search.loading": "Szukam...",
                "sun.location.current": "Użyj mojej lokalizacji",
                "sun.date": "DATA PLANOWANIA",
                "sun.date_input": "Wybierz datę do planowania",
                "sun.today": "DZIŚ",
                "sun.time_slider": "Godzina na osi czasu",
                "sun.season.spring": "Wiosna",
                "sun.season.spring.short": "WIO",
                "sun.season.summer": "Lato",
                "sun.season.summer.short": "LAT",
                "sun.season.autumn": "Jesień",
                "sun.season.autumn.short": "JES",
                "sun.season.winter": "Zima",
                "sun.season.winter.short": "ZIM",
                "sun.now": "TERAZ",
                "sun.timelapse.play": "ODTWÓRZ",
                "sun.timelapse.pause": "PAUZA",
                "sun.timelapse.speed": "Tempo animacji",
                "sun.features.label": "Narzędzia planowania",
                "sun.shadow.title": "SYMULATOR CIENIA",
                "sun.shadow.subtitle": "Kierunek i długość dla wybranego obiektu",
                "sun.shadow.height": "Wysokość obiektu",
                "sun.shadow.length": "Długość",
                "sun.shadow.direction": "Kierunek",
                "sun.shadow.ratio": "Stosunek",
                "sun.shadow.none": "BRAK CIENIA",
                "sun.moon.short": "KSI",
                "sun.moon.title": "KSIĘŻYC",
                "sun.moon.subtitle": "Faza i trasa dla wybranej daty",
                "sun.moon.trajectory": "TRASA",
                "sun.moon.rise": "Wschód",
                "sun.moon.set": "Zachód",
                "sun.moon.altitude": "Wysokość",
                "sun.moon.azimuth": "Azymut",
                "sun.moon.illuminated": "oświetlenia",
                "sun.moon.always_up": "CAŁĄ DOBĘ",
                "sun.moon.phase.new": "Nów",
                "sun.moon.phase.waxing_crescent": "Przybywający sierp",
                "sun.moon.phase.first_quarter": "Pierwsza kwadra",
                "sun.moon.phase.waxing_gibbous": "Przybywający garb",
                "sun.moon.phase.full": "Pełnia",
                "sun.moon.phase.waning_gibbous": "Ubywający garb",
                "sun.moon.phase.last_quarter": "Ostatnia kwadra",
                "sun.moon.phase.waning_crescent": "Ubywający sierp",
                "sun.stat.sunrise": "WSCHÓD",
                "sun.stat.sunset": "ZACHÓD",
                "sun.stat.noon": "SOLAR NOON",
                "sun.stat.daylen": "DŁUGOŚĆ DNIA",
                "sun.stat.golden_am": "GOLDEN HOUR AM",
                "sun.stat.golden_pm": "GOLDEN HOUR PM",
                "sun.stat.azimuth": "Azymut",
                "sun.stat.max_elev": "Maks. wysokość",
                "sun.stat.daydiff": "od najdłuższego",
                "sun.phase.day": "DZIEŃ",
                "sun.phase.golden": "ZŁOTA GODZINA",
                "sun.phase.blue": "BLUE HOUR",
                "sun.phase.night": "NOC",
                "sun.state.polar_day": "DZIEŃ POLARNY",
                "sun.state.polar_night": "NOC POLARNA",
                "sun.state.no_data": "BRAK DANYCH",

                // App: DraftCargo
                "cargo.status": "Status: SECURE_CHANNEL_ACTIVE | Limit: 1024MB | TTL: 72H",
                "cargo.drop.title": "WYBIERZ LUB PRZECIĄGNIJ PLIK",
                "cargo.drop.subtitle": "MAX_CARGO_SIZE: 1GB",
                "cargo.uploading": "WYSYŁANIE...",
                "cargo.byte_status": "WYSYŁANIE PAKIETÓW...",
                "cargo.success": "ŁADUNEK ZABEZPIECZONY",
                "cargo.success.sub": "Plik zostanie automatycznie usunięty za 72h.",
                "cargo.btn.copy": "KOPIUJ",
                "cargo.copied": "Link skopiowany!",
                "cargo.sys.init": "> System: DraftCargo Initialization...",
                "cargo.sys.proto": "> Protocol: HTTP/2 Chunked Transfer",
                "cargo.sys.life": "> Lifecycle: 259200s (72h)",
                "cargo.sys.ready": "> Ready for input_",

                // App: LabyrinthQR
                "qr.subtitle": "Twórz bezpieczne i estetyczne kody QR. Generator działa lokalnie (Client-Side). Obsługa linków, Wi-Fi, wizytówek oraz wiadomości w chmurze.",
                "qr.sect.1": "1. DANE WEJŚCIOWE",
                "qr.sect.2": "2. STYLIZACJA",
                "qr.type.text": "Tekst",
                "qr.type.msg": "Wiadomość",
                "qr.type.url": "Link / URL",
                "qr.type.wifi": "Wi-Fi",
                "qr.type.card": "vCard",
                "qr.shape": "Kształt Modułów",
                "qr.color.main": "Kolor Główny",
                "qr.color.bg": "Kolor Tła",
                "qr.logo": "Logo (Środek)",
                "qr.logo.remove": "Usuń",
                "qr.logo.select": "Wybierz plik...",
                "qr.size": "Rozmiar",
                "qr.btn.print": "DRUKUJ",
                "qr.inp.text": "Dowolny Tekst",
                "qr.inp.placeholder": "Wpisz tekst tutaj...",
                "qr.inp.page_text": "Tekst na stronie",
                "qr.inp.page_placeholder": "Wiadomość do wyświetlenia...",
                "qr.inp.img_label": "Dołącz Zdjęcie (Opcjonalnie)",
                "qr.inp.img_select": "Wybierz plik...",
                "qr.inp.img_status_ok": "Obraz dołączony.",
                "qr.inp.img_status_none": "Brak zdjęcia.",
                "qr.inp.wifi_ssid": "Nazwa Sieci (SSID)",
                "qr.inp.wifi_pass": "Hasło",
                "qr.inp.wifi_enc": "Typ",
                "qr.inp.vcard_name": "Imię i Nazwisko",
                "qr.inp.vcard_phone": "Telefon",
                "qr.inp.vcard_email": "Email",
                "qr.uploading": "Przesyłanie...",
                "qr.uploaded": "Wgrano pomyślnie!",
                "qr.upload_error": "Błąd przesyłania.",

                // App: Atmosphere
                "atmo.live": "LIVE STATUS",
                "atmo.temp": "TEMP",
                "atmo.humidity": "WILGOTNOŚĆ",
                "atmo.chart.24h": "Wykres 24H",
                "atmo.analytics.day": "ANALYTICS (DOBA)",
                "atmo.minmax": "MIN / MAX",
                "atmo.avg_hum": "ŚREDNIA / WILG.",
                "atmo.periods": "PORY DNIA",
                "atmo.period.morning": "RANO",
                "atmo.period.noon": "POŁUDNIE",
                "atmo.period.evening": "WIECZÓR",
                "atmo.period.night": "NOC",
                "atmo.last_update": "Ostatni pomiar",
                "atmo.chart.temp": "Temperatura",
                "atmo.chart.hum": "Wilgotność",
                "shared.no_data": "BRAK DANYCH",
                "shared.today": "DZISIAJ",

                // App: System Log
                "sys.title": "SYSTEM LOG",
                "sys.subtitle": "// PEŁNY REJESTR ZMIAN",
                "sys.stat.commits": "COMMITY",
                "sys.stat.changes": "ZMIANY",
                "sys.stat.repo": "REPOZYTORIUM",
                "sys.stat.main": "GŁÓWNE",
                "sys.filter.all": "WSZYSTKIE",
                "sys.filter.apps": "APLIKACJE",
                "sys.filter.sys": "SYSTEM",
                "sys.nav.prev": "POPRZEDNIA",
                "sys.nav.next": "NASTĘPNA",
                "sys.nav.page": "STRONA",
                "sys.footer": "End of Log Stream",
                "sys.modal.type": "TYP",
                "sys.modal.comp": "KOMPONENT",
                "sys.modal.desc": "OPIS ZMIANY",
                "sys.modal.tech": "SZCZEGÓŁY TECHNICZNE",
                "sys.modal.close": "ZAMKNIJ",
                "sys.modal.empty": "Brak dodatkowych szczegółów technicznych dla tej zmiany.",
                "sys.item.has_details": "Zawiera szczegółową specyfikację",
                "sys.item.tech_details": "Szczegóły techniczne",


                // Shared
                "shared.loading": "LOADING",
                "shared.copy": "Kopiuj",
                "shared.close": "Zamknij",
                "shared.return": "POWRÓT",

                // About Me
                "about.title": "DraftLab.pl | O Mnie",
                "about.header.prefix": "SYSTEM LOG_FILE",
                "about.header.title": "LOG SYSTEMOWY <span class=\"text-tech-dim\">/</span><br>O MNIE",

                "about.s1.title": "Level 33: Geneza",
                "about.s1.content": "Rocznik '92. Dziś na liczniku mam 33 lata, ale mentalnie często wracam do momentu, gdy technologia miała zapach nagrzanego plastiku i dźwięk łączącego się modemu.<br><br>Mój start nie był łatwy - to była walka o zasoby. Pod biurkiem królował beżowy tower: Intel 233MHz (z fizycznym przyciskiem TURBO, który dawał złudzenie prędkości), dysk 4GB i zaledwie 32MB RAM. Ta ilość pamięci często uczyła pokory. Brak akceleratora 3D oznaczał \"Game Over\" dla nowych tytułów, a brak stałego łącza w małej miejscowości sprawiał, że Internet był towarem deficytowym, liczonym w impulsach telefonicznych.",

                "about.s2.title": "Era \"Offline Web\"",
                "about.s2.content": "Właśnie te ograniczenia zdefiniowały mnie jako twórcę. Zamiast grać w Heroes III, pochłaniałem \"Internet offline\" – ziny na płytach CD-Action (pozdro dla czytelników Action Maga!). Fascynowało mnie, że po drugiej stronie ekranu jest człowiek, który wpisał kod i to zadziałało.<br><br>Otworzyłem systemowy Notatnik. Bez kolorowania składni, bez IntelliSense, bez YouTube'a. Metodą prób i błędów, analizując źródła stron ściągniętych u kolegów na dyskietki, składałem pierwsze tagi HTML. To wtedy zrozumiałem, że wolę tworzyć cyfrowe światy, niż tylko je konsumować.",

                "about.s3.title": "Od Forów do Korporacji (i z powrotem)",
                "about.s3.content": "Lata 2000. to czas rozkwitu mojej pasji. W gimnazjum stworzyłem Grasz.info – forum, które stworzyło całkiem fajną społeczność i to w czasach przed Facebookiem. To była czysta zajawka.<br><br>Dorosłe życie napisało inny scenariusz. Dziś pracuję jako zakupowiec w korporacji. Choć szanuję ten świat procesów i tabelek, brakowało mi w nim tej iskry z czasów 32MB RAM-u. DraftLab.pl to mój powrót do korzeni. To \"cyfrowy garaż\", w którym po godzinach zrzucam korporacyjny pancerz i znów jestem tym chłopakiem, który chce zbudować coś fajnego w sieci.",

                "about.s4.title": "Sojusz z Maszyną",
                "about.s4.content": "Technologia zatoczyła koło. Dziś, zamiast walczyć z brakiem pamięci, mam do dyspozycji nieskończoną moc chmury i AI. Nie uciekam od tego. Traktuję modele językowe jak potężnego asystenta, który zdejmuje mi z głowy żmudne kodowanie. Dzięki temu mogę realizować wizje, na które kiedyś brakowało mi \"skill pointów\".<br><br>Mimo fascynacji, zachowuję czujność. Widzę chaos generatywnej rewolucji, spam i problemy etyczne. Korzystam z AI, ale na własnych zasadach - jako narzędzia, które służy mojej kreatywności, a nie ją zastępuje.",

                "about.s5.title": "System Offline",
                "about.s5.content": "Równowaga to podstawa. Kiedy wygaszam monitory, wracam do analogu. Czas wolny to rodzina, rower i natura. A gdy chwytam za pada? Nierzadko odpalam gry Nintendo. Bo tam, tak jak w moich projektach, nie liczą się gigaherce i fotorealizm, ale pomysł i czysta frajda z rozgrywki.",

                "about.profile.status": "ONLINE",
                "about.profile.location": "Warszawa, PL",
                "about.profile.contact": "Nawiąż połączenie",

                // App: RetroVision
                "rv.overlay.title": "DOSTĘP_DO_TERMINALA",
                "rv.overlay.desc": "RetroVision wymaga dostępu do sensora optycznego. Przetwarzanie odbywa się lokalnie.",
                "rv.overlay.btn": "INICJALIZACJA SYSTEMU",
                "rv.lbl.charset": "ZESTAW ZNAKÓW",
                "rv.lbl.density": "GĘSTOŚĆ SIATKI",
                "rv.lbl.color": "KOLOR",
                "rv.btn.snap": "ZDJĘCIE",
                "rv.err.access": "ODMOWA DOSTĘPU",

                // App: DraftCalc
                "calc.title": "DraftCalc",
                "calc.subtitle": "/ Percent_Calculator_System v0.1",
                "calc.status.label": "Status",
                "calc.status.ready": "READY",
                "calc.operation.add": "Dodaj",
                "calc.operation.subtract": "Odejmij",
                "calc.mode.change": "Zmiana wartości",
                "calc.mode.change.desc": "Oblicza procentową różnicę między dwiema liczbami (wzrost lub spadek).",
                "calc.mode.percent_of": "% z liczby",
                "calc.mode.percent_of.desc": "Oblicza konkretną wartość na podstawie podanego procentu i liczby bazowej.",
                "calc.mode.what_percent": "Jaki to %?",
                "calc.mode.what_percent.desc": "Sprawdza, jakim procentem jednej liczby jest druga liczba.",
                "calc.mode.add_sub": "Dodaj/Odejmij %",
                "calc.mode.add_sub.desc": "Pozwala szybko dodać lub odjąć dany procent od wybranej kwoty/liczby.",
                "calc.label.old_val": "Stara Wartość",
                "calc.label.new_val": "Nowa Wartość",
                "calc.label.percent": "Procent (%)",
                "calc.label.from_num": "Z liczby",
                "calc.label.part": "Część (A)",
                "calc.label.whole": "Całość (B)",
                "calc.label.num": "Liczba",
                "calc.history": "Historia",
                "calc.changelog.title": "Dziennik Zmian",
                "calc.changelog.features": "Funkcje:",
                "calc.changelog.v01.desc": "Pierwsza wersja DraftCalc - zaawansowany kalkulator procentowy z czterema trybami działania: Zmiana wartości, % z liczby, Jaki to %, oraz Dodaj/Odejmij %.",
                "calc.changelog.v01.f1": "→ 4 tryby obliczeń procentowych",
                "calc.changelog.v01.f2": "→ Dynamiczne opisy wyjaśniające działanie każdego trybu",
                "calc.changelog.v01.f3": "→ Wizualizacja wyników (wykresy słupkowe i paski postępu)",
                "calc.changelog.v01.f4": "→ Przełącznik operacji dodawania/odejmowania w trybie ±%",
                "calc.changelog.v01.f5": "→ Historia obliczeń z możliwością kopiowania wyników",
                "calc.changelog.v01.f6": "→ Wielojęzyczna obsługa (PL/EN)",
                "calc.changelog.v01.f7": "→ Digital Blueprint Design System",

                // Modern UI (v2)
                "ui.legacy": "Wersja klasyczna",
                "ui.legacy_title": "Przełącz na archiwalną wersję strony (v1)",
                "ui.search": "Szukaj",
                "palette.placeholder": "Wpisz nazwę aplikacji lub strony...",
                "palette.empty": "Brak wyników.",
                "palette.pages": "STRONY",
                "palette.apps": "APLIKACJE",
                "palette.hint": "nawigacja",
                "palette.hint_select": "wybierz",
                "palette.hint_close": "zamknij",
                "hero.cta2": "Poznaj autora",
                "hero.stat.apps": "APLIKACJE",
                "hero.stat.commits": "COMMITY",
                "hero.stat.update": "AKTUALIZACJA",
                "hero.stat.releases": "WYDANIA",
                "hero.stat.tech": "TECHNOLOGIE",
                "hero.stat.mode": "TRYB",
                "footer.nav": "NAWIGACJA",
                "footer.system": "SYSTEM",
                "footer.legacy_note": "Tęsknisz za starym wyglądem?",
                "footer.back_top": "Do góry",

                // Terminal (DraftLab Core)
                "term.section_title": "/ Rdzeń Systemu",
                "term.boot1": "> Ładowanie modułów: ui, apps, i18n, neural...",
                "term.boot2": "> Połączono z siecią neuronową warsztatu.",
                "term.boot3": "Gotowy. Wpisz 'help' lub kliknij komendę poniżej.",
                "term.hint": "steruj myszą po tle ↑",
                "term.cmd.help": "lista komend",
                "term.cmd.now": "co teraz na warsztacie",
                "term.now_title": "TERAZ NA WARSZTACIE",
                "term.now_updated": "aktualizacja",
                "term.now_empty": "cisza w warsztacie. wpadnij później.",
                "term.cmd.apps": "pokaż wszystkie aplikacje",
                "term.cmd.open": "uruchom aplikację",
                "term.cmd.stats": "statystyki warsztatu",
                "term.cmd.whoami": "kim jest autor",
                "term.cmd.legacy": "podróż w czasie do v1.0",
                "term.cmd.lang": "zmień język",
                "term.cmd.matrix": "tryb Matrix (tło)",
                "term.cmd.clear": "wyczyść ekran",
                "term.open_usage": "Użycie: open <nazwa>, np. open suntrack",
                "term.opening": "Uruchamiam",
                "term.not_found": "Nie znaleziono aplikacji",
                "term.last_update": "Ostatnia zmiana",
                "term.stack": "Stack",
                "term.whoami_desc": "zakupowiec za dnia, twórca warsztatu web AI po godzinach →",
                "term.time_travel": "Inicjuję podróż w czasie do roku 2025...",
                "term.matrix_on": "Witaj w Matrixie. Wpisz 'matrix' ponownie, by wyjść.",
                "term.matrix_off": "Powrót do sieci neuronowej.",
                "term.sudo": "Odmowa dostępu. Miła próba ;)",
                "term.unknown": "Nieznana komenda",
                "term.try_help": "wpisz 'help'",

                // Compact changelog
                "log.title": "Dziennik zmian",
                "log.last": "ostatnia zmiana",
                "log.show": "Rozwiń",
                "log.hide": "Zwiń",
                "log.full": "Pełny rejestr"
            },
            en: {
                // Hero
                "hero.init": "> Workshop Initialization...",
                "hero.title": "Experimental <br>Web <span class=\"text-tech-green\">AI</span> Workshop<span class=\"cursor-blink\">_</span>",
                "hero.subtitle": "A collection of web applications co-created with language models. From prompt to deployment. Testing the limits of code and&nbsp;imagination.",
                "hero.cta": "Browse Projects",

                // Section Headers
                "section.repo": "REPOSITORY",
                "section.manifest": "/ Manifest",
                "section.stack": "/ Tech Stack",

                // Content
                "manifest.text": "DraftLab.pl is my digital draft board. Here I test the limits of human-machine collaboration,\nturning prompts into code.",

                // UI Elements
                "ui.run": "Launch",
                "ui.offline": "OFFLINE",
                "ui.show_empty": "Show Empty Slots",
                "ui.hide_empty": "Hide Empty Slots",
                "ui.empty_slot": "Empty",
                "ui.tbd": "TBD",

                // Footer
                "footer.copyright": "DraftLab.pl © 2025.",
                "footer.rights": "All systems operational.",

                // Links
                "link.github": "GitHub",

                // App: SunTrack
                "sun.title": "SunTrack",
                "sun.subtitle": "Sun position visualization",
                "sun.search.placeholder": "Search city...",
                "sun.search.no_results": "No location found.",
                "sun.search.error": "Could not load locations.",
                "sun.search.loading": "Searching...",
                "sun.location.current": "Use my current location",
                "sun.date": "PLANNING DATE",
                "sun.date_input": "Choose a date to plan",
                "sun.today": "TODAY",
                "sun.time_slider": "Time of day",
                "sun.season.spring": "Spring",
                "sun.season.spring.short": "SPR",
                "sun.season.summer": "Summer",
                "sun.season.summer.short": "SUM",
                "sun.season.autumn": "Autumn",
                "sun.season.autumn.short": "AUT",
                "sun.season.winter": "Winter",
                "sun.season.winter.short": "WIN",
                "sun.now": "NOW",
                "sun.timelapse.play": "PLAY",
                "sun.timelapse.pause": "PAUSE",
                "sun.timelapse.speed": "Animation speed",
                "sun.features.label": "Planning tools",
                "sun.shadow.title": "SHADOW SIMULATOR",
                "sun.shadow.subtitle": "Direction and length for the selected object",
                "sun.shadow.height": "Object height",
                "sun.shadow.length": "Length",
                "sun.shadow.direction": "Direction",
                "sun.shadow.ratio": "Ratio",
                "sun.shadow.none": "NO SHADOW",
                "sun.moon.short": "MOON",
                "sun.moon.title": "MOON",
                "sun.moon.subtitle": "Phase and path for the selected date",
                "sun.moon.trajectory": "PATH",
                "sun.moon.rise": "Moonrise",
                "sun.moon.set": "Moonset",
                "sun.moon.altitude": "Altitude",
                "sun.moon.azimuth": "Azimuth",
                "sun.moon.illuminated": "illuminated",
                "sun.moon.always_up": "ALL DAY",
                "sun.moon.phase.new": "New Moon",
                "sun.moon.phase.waxing_crescent": "Waxing Crescent",
                "sun.moon.phase.first_quarter": "First Quarter",
                "sun.moon.phase.waxing_gibbous": "Waxing Gibbous",
                "sun.moon.phase.full": "Full Moon",
                "sun.moon.phase.waning_gibbous": "Waning Gibbous",
                "sun.moon.phase.last_quarter": "Last Quarter",
                "sun.moon.phase.waning_crescent": "Waning Crescent",
                "sun.stat.sunrise": "SUNRISE",
                "sun.stat.sunset": "SUNSET",
                "sun.stat.noon": "SOLAR NOON",
                "sun.stat.daylen": "DAY LENGTH",
                "sun.stat.golden_am": "GOLDEN HOUR AM",
                "sun.stat.golden_pm": "GOLDEN HOUR PM",
                "sun.stat.azimuth": "Azimuth",
                "sun.stat.max_elev": "Max elevation",
                "sun.stat.daydiff": "from longest day",
                "sun.phase.day": "DAY",
                "sun.phase.golden": "GOLDEN HOUR",
                "sun.phase.blue": "BLUE HOUR",
                "sun.phase.night": "NIGHT",
                "sun.state.polar_day": "POLAR DAY",
                "sun.state.polar_night": "POLAR NIGHT",
                "sun.state.no_data": "NO DATA",

                // App: DraftCargo
                "cargo.status": "Status: SECURE_CHANNEL_ACTIVE | Limit: 1024MB | TTL: 72H",
                "cargo.drop.title": "SELECT OR DRAG FILE",
                "cargo.drop.subtitle": "MAX_CARGO_SIZE: 1GB",
                "cargo.uploading": "UPLOADING...",
                "cargo.byte_status": "SENDING CHUNKS...",
                "cargo.success": "CARGO SECURED",
                "cargo.success.sub": "File will be automatically deleted in 72h.",
                "cargo.btn.copy": "COPY",
                "cargo.copied": "Link copied!",
                "cargo.sys.init": "> System: DraftCargo Initialization...",
                "cargo.sys.proto": "> Protocol: HTTP/2 Chunked Transfer",
                "cargo.sys.life": "> Lifecycle: 259200s (72h)",
                "cargo.sys.ready": "> Ready for input_",

                // App: LabyrinthQR
                "qr.subtitle": "Create secure and aesthetic QR codes. Generator works locally (Client-Side). Supports links, Wi-Fi, vCards and cloud messages.",
                "qr.sect.1": "1. INPUT DATA",
                "qr.sect.2": "2. STYLING",
                "qr.type.text": "Text",
                "qr.type.msg": "Message",
                "qr.type.url": "Link / URL",
                "qr.type.wifi": "Wi-Fi",
                "qr.type.card": "vCard",
                "qr.shape": "Module Shape",
                "qr.color.main": "Main Color",
                "qr.color.bg": "Background Color",
                "qr.logo": "Logo (Center)",
                "qr.logo.remove": "Remove",
                "qr.logo.select": "Select file...",
                "qr.size": "Size",
                "qr.btn.print": "PRINT",
                "qr.inp.text": "Any Text",
                "qr.inp.placeholder": "Enter text here...",
                "qr.inp.page_text": "Page Text",
                "qr.inp.page_placeholder": "Message to display...",
                "qr.inp.img_label": "Attach Image (Optional)",
                "qr.inp.img_select": "Select file...",
                "qr.inp.img_status_ok": "Image attached.",
                "qr.inp.img_status_none": "No image.",
                "qr.inp.wifi_ssid": "Network Name (SSID)",
                "qr.inp.wifi_pass": "Password",
                "qr.inp.wifi_enc": "Type",
                "qr.inp.vcard_name": "Full Name",
                "qr.inp.vcard_phone": "Phone",
                "qr.inp.vcard_email": "Email",
                "qr.uploading": "Uploading...",
                "qr.uploaded": "Upload successful!",
                "qr.upload_error": "Upload error.",

                // App: Atmosphere
                "atmo.live": "LIVE STATUS",
                "atmo.temp": "TEMP",
                "atmo.humidity": "HUMIDITY",
                "atmo.chart.24h": "24H CHART",
                "atmo.analytics.day": "ANALYTICS (DAY)",
                "atmo.minmax": "MIN / MAX",
                "atmo.avg_hum": "AVG / HUM.",
                "atmo.periods": "TIME OF DAY",
                "atmo.period.morning": "MORNING",
                "atmo.period.noon": "NOON",
                "atmo.period.evening": "EVENING",
                "atmo.period.night": "NIGHT",
                "atmo.last_update": "Last Update",
                "atmo.chart.temp": "Temperature",
                "atmo.chart.hum": "Humidity",
                "shared.no_data": "NO DATA",
                "shared.today": "TODAY",


                // App: System Log
                "sys.title": "SYSTEM LOG",
                "sys.subtitle": "// FULL CHANGE LOG",
                "sys.stat.commits": "COMMITS",
                "sys.stat.changes": "UPDATES",
                "sys.stat.repo": "REPOSITORY",
                "sys.stat.main": "MAIN",
                "sys.filter.all": "ALL",
                "sys.filter.apps": "APPS",
                "sys.filter.sys": "SYSTEM",
                "sys.nav.prev": "PREV",
                "sys.nav.next": "NEXT",
                "sys.nav.page": "PAGE",
                "sys.footer": "End of Log Stream",
                "sys.modal.type": "TYPE",
                "sys.modal.comp": "COMPONENT",
                "sys.modal.desc": "CHANGE DESCRIPTION",
                "sys.modal.tech": "TECHNICAL DETAILS",
                "sys.modal.close": "CLOSE",
                "sys.modal.empty": "No technical details available for this change.",
                "sys.item.has_details": "Contains detailed specification",
                "sys.item.tech_details": "Technical details",


                // Shared
                "shared.loading": "LOADING",
                "shared.copy": "Copy",
                "shared.close": "Close",
                "shared.return": "BACK",

                // About Me
                "about.title": "DraftLab.pl | About Me",
                "about.header.prefix": "SYSTEM LOG_FILE",
                "about.header.title": "SYSTEM LOG <span class=\"text-tech-dim\">/</span><br>ABOUT ME",

                "about.s1.title": "Level 33: Genesis",
                "about.s1.content": "Born in '92. Today I'm 33, but mentally I often return to the moment when technology smelled like warm plastic and sounded like a connecting modem.<br><br>My start wasn't easy - it was a fight for resources. Under the desk sat a beige tower: Intel 233MHz (with a physical TURBO button for the illusion of speed), 4GB disk, and only 32MB RAM. That amount of memory often taught humility. No 3D accelerator meant \"Game Over\" for new titles, and no constant connection in a small town made the Internet a scarce commodity, counted in telephone pulses.",

                "about.s2.title": "Era of \"Offline Web\"",
                "about.s2.content": "Those limitations defined me as a creator. Instead of playing Heroes III, I consumed \"Offline Internet\" – zines on CD-Action discs (shoutout to Action Mag readers!). I was fascinated that on the other side of the screen was a person who wrote code and it worked.<br><br>I opened system Notepad. No syntax highlighting, no IntelliSense, no YouTube. By trial and error, analyzing source codes of sites downloaded by friends onto floppies, I assembled my first HTML tags. That's when I realized I prefer creating digital worlds than just consuming them.",

                "about.s3.title": "From Forums to Corporate (and back)",
                "about.s3.content": "The 2000s were the prime time of my passion. In middle school, I created Grasz.info – a forum that built a quite nice community way before Facebook. It was pure passion.<br><br>Adult life wrote a different script. Today I work as a procurement specialist in a corporation. Although I respect this world of processes and spreadsheets, it lacked that spark from the 32MB RAM days. DraftLab.pl is my return to roots. It's a \"digital garage\" where after hours I shed my corporate armor and become that kid who wants to build something cool online.",

                "about.s4.title": "Alliance with the Machine",
                "about.s4.content": "Technology has come full circle. Today, instead of fighting memory shortages, I have the infinite power of the cloud and AI at my disposal. I don't run away from it. I treat language models like a powerful assistant that takes tedious coding off my hands. This allows me to realize visions for which I once lacked \"skill points\".<br><br>Despite the fascination, I stay vigilant. I see the chaos of the generative revolution, spam, and ethical issues. I use AI, but on my own terms - as a tool that serves my creativity, not replaces it.",

                "about.s5.title": "System Offline",
                "about.s5.content": "Balance is key. When I turn off the monitors, I return to analog. Free time is family, cycling, and nature. And when I grab a controller? I often play Nintendo games. Because there, just as in my projects, it's not gigaherz and photorealism that matter, but the idea and pure fun of gameplay.",

                "about.profile.status": "ONLINE",
                "about.profile.location": "Warsaw, PL",
                "about.profile.contact": "Establish Connection",

                // App: RetroVision
                "rv.overlay.title": "ACCESS_TERMINAL_CAMERA",
                "rv.overlay.desc": "RetroVision requires optical sensor access to generate the matrix feed. Processing is local.",
                "rv.overlay.btn": "INITIALIZE SYSTEM",
                "rv.lbl.charset": "CHARSET",
                "rv.lbl.density": "DENSITY",
                "rv.lbl.color": "COLOR",
                "rv.btn.snap": "SNAP",
                "rv.err.access": "ACCESS DENIED",

                // App: DraftCalc
                "calc.title": "DraftCalc",
                "calc.subtitle": "/ Percent_Calculator_System v0.1",
                "calc.status.label": "Status",
                "calc.status.ready": "READY",
                "calc.operation.add": "Add",
                "calc.operation.subtract": "Subtract",
                "calc.mode.change": "Value Change",
                "calc.mode.change.desc": "Calculates the percentage difference between two numbers (growth or decline).",
                "calc.mode.percent_of": "% of Number",
                "calc.mode.percent_of.desc": "Calculates a specific value based on the given percentage and base number.",
                "calc.mode.what_percent": "What % is it?",
                "calc.mode.what_percent.desc": "Checks what percentage of one number is another number.",
                "calc.mode.add_sub": "Add/Subtract %",
                "calc.mode.add_sub.desc": "Allows you to quickly add or subtract a given percentage from a selected amount/number.",
                "calc.label.old_val": "Old Value",
                "calc.label.new_val": "New Value",
                "calc.label.percent": "Percent (%)",
                "calc.label.from_num": "From Number",
                "calc.label.part": "Part (A)",
                "calc.label.whole": "Whole (B)",
                "calc.label.num": "Number",
                "calc.history": "History",
                "calc.changelog.title": "Changelog",
                "calc.changelog.features": "Features:",
                "calc.changelog.v01.desc": "First version of DraftCalc - advanced percentage calculator with four calculation modes: Value Change, % of Number, What %, and Add/Subtract %.",
                "calc.changelog.v01.f1": "→ 4 percentage calculation modes",
                "calc.changelog.v01.f2": "→ Dynamic descriptions explaining each mode's operation",
                "calc.changelog.v01.f3": "→ Results visualization (bar charts and progress bars)",
                "calc.changelog.v01.f4": "→ Add/subtract operation toggle in ±% mode",
                "calc.changelog.v01.f5": "→ Calculation history with copy functionality",
                "calc.changelog.v01.f6": "→ Multilingual support (PL/EN)",
                "calc.changelog.v01.f7": "→ Digital Blueprint Design System",

                // Modern UI (v2)
                "ui.legacy": "Classic version",
                "ui.legacy_title": "Switch to the archived version of the site (v1)",
                "ui.search": "Search",
                "palette.placeholder": "Type an app or page name...",
                "palette.empty": "No results.",
                "palette.pages": "PAGES",
                "palette.apps": "APPS",
                "palette.hint": "navigate",
                "palette.hint_select": "select",
                "palette.hint_close": "close",
                "hero.cta2": "Meet the author",
                "hero.stat.apps": "APPS",
                "hero.stat.commits": "COMMITS",
                "hero.stat.update": "LAST UPDATE",
                "hero.stat.releases": "RELEASES",
                "hero.stat.tech": "TECHNOLOGIES",
                "hero.stat.mode": "MODE",
                "footer.nav": "NAVIGATION",
                "footer.system": "SYSTEM",
                "footer.legacy_note": "Missing the old look?",
                "footer.back_top": "Back to top",

                // Terminal (DraftLab Core)
                "term.section_title": "/ System Core",
                "term.boot1": "> Loading modules: ui, apps, i18n, neural...",
                "term.boot2": "> Connected to the workshop neural network.",
                "term.boot3": "Ready. Type 'help' or click a command below.",
                "term.hint": "move your mouse over the background ↑",
                "term.cmd.help": "list commands",
                "term.cmd.now": "what's on the bench right now",
                "term.now_title": "NOW ON THE BENCH",
                "term.now_updated": "updated",
                "term.now_empty": "the workshop is quiet. come back later.",
                "term.cmd.apps": "show all apps",
                "term.cmd.open": "launch an app",
                "term.cmd.stats": "workshop stats",
                "term.cmd.whoami": "who is the author",
                "term.cmd.legacy": "time travel to v1.0",
                "term.cmd.lang": "switch language",
                "term.cmd.matrix": "Matrix mode (background)",
                "term.cmd.clear": "clear screen",
                "term.open_usage": "Usage: open <name>, e.g. open suntrack",
                "term.opening": "Launching",
                "term.not_found": "App not found",
                "term.last_update": "Last change",
                "term.stack": "Stack",
                "term.whoami_desc": "procurement by day, web AI workshop builder by night →",
                "term.time_travel": "Initiating time travel to 2025...",
                "term.matrix_on": "Welcome to the Matrix. Type 'matrix' again to exit.",
                "term.matrix_off": "Back to the neural network.",
                "term.sudo": "Permission denied. Nice try ;)",
                "term.unknown": "Unknown command",
                "term.try_help": "type 'help'",

                // Compact changelog
                "log.title": "Changelog",
                "log.last": "latest change",
                "log.show": "Expand",
                "log.hide": "Collapse",
                "log.full": "Full registry"
            }
        };

        // Expose globally for convenience
        window.i18n = this;
    }

    getInitialLang() {
        const saved = localStorage.getItem('draftlab_lang');
        if (saved) return saved;

        const browserLang = navigator.language || navigator.userLanguage;
        if (browserLang.toLowerCase().startsWith('pl')) {
            return 'pl';
        }
        return 'en';
    }

    setLang(lang) {
        if (lang !== 'pl' && lang !== 'en') return;
        this.lang = lang;
        localStorage.setItem('draftlab_lang', lang);
        this.notify();
        this.updateStaticElements();
    }

    t(key) {
        return this.dictionary[this.lang][key] || key;
    }

    // Subscribe to language changes
    subscribe(callback) {
        this.listeners.add(callback);
    }

    unsubscribe(callback) {
        this.listeners.delete(callback);
    }

    notify() {
        this.listeners.forEach(cb => cb(this.lang));
    }

    // Auto-update elements with data-i18n attribute
    updateStaticElements() {
        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach(el => {
            const key = el.getAttribute('data-i18n');
            const translation = this.t(key);

            // Check if it is HTML or just text
            const targetAttr = el.getAttribute('data-i18n-target');

            if (targetAttr) {
                el.setAttribute(targetAttr, translation);
            } else if (el.hasAttribute('data-i18n-html')) {
                el.innerHTML = translation;
            } else {
                if (key === 'hero.title' || key === 'hero.init') {
                    el.innerHTML = translation;
                } else {
                    el.textContent = translation;
                }
            }
        });
    }
}

export const i18n = new I18n();

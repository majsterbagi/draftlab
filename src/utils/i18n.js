
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
                "sun.season.spring": "Wiosna",
                "sun.season.spring.short": "WIO",
                "sun.season.summer": "Lato",
                "sun.season.summer.short": "LAT",
                "sun.season.autumn": "Jesień",
                "sun.season.autumn.short": "JES",
                "sun.season.winter": "Zima",
                "sun.season.winter.short": "ZIM",
                "sun.now": "TERAZ",
                "sun.stat.sunrise": "WSCHÓD",
                "sun.stat.sunset": "ZACHÓD",
                "sun.stat.noon": "SOLAR NOON",
                "sun.stat.daylen": "DŁUGOŚĆ DNIA",
                "sun.stat.golden_am": "GOLDEN HOUR AM",
                "sun.stat.golden_pm": "GOLDEN HOUR PM",

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
                "about.profile.contact": "Nawiąż połączenie"
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
                "sun.season.spring": "Spring",
                "sun.season.spring.short": "SPR",
                "sun.season.summer": "Summer",
                "sun.season.summer.short": "SUM",
                "sun.season.autumn": "Autumn",
                "sun.season.autumn.short": "AUT",
                "sun.season.winter": "Winter",
                "sun.season.winter.short": "WIN",
                "sun.now": "NOW",
                "sun.stat.sunrise": "SUNRISE",
                "sun.stat.sunset": "SUNSET",
                "sun.stat.noon": "SOLAR NOON",
                "sun.stat.daylen": "DAY LENGTH",
                "sun.stat.golden_am": "GOLDEN HOUR AM",
                "sun.stat.golden_pm": "GOLDEN HOUR PM",

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
                "about.profile.contact": "Establish Connection"
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

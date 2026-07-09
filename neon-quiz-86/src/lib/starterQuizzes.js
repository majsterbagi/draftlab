// Startowe zestawy pytań (PL) — seedowane do Firebase, każdy pod osobnym id
// w quizzes/{id}. Oryginalne pytania ogólnowiedzowe w duchu klasycznych
// teleturniejów (nie kopiowane z konkretnych, chronionych praw autorskich
// programów) — bezpieczne do użycia i edycji we własnym zakresie.
import { SAMPLE_QUIZ } from './sampleQuiz.js'

const WIEDZA_OGOLNA = {
  name: 'Wiedza Ogólna – Express',
  categories: [
    {
      name: 'Geografia świata',
      questions: [
        { text: 'Która rzeka jest tradycyjnie uznawana za najdłuższą na świecie?', answers: ['Amazonka', 'Nil', 'Jangcy', 'Missisipi'], correct: 1, difficulty: 1 },
        { text: 'Jak nazywa się najwyższy szczyt świata?', answers: ['K2', 'Mount Everest', 'Kilimandżaro', 'Mont Blanc'], correct: 1, difficulty: 1 },
        { text: 'Jak nazywa się największa gorąca pustynia świata?', answers: ['Gobi', 'Kalahari', 'Sahara', 'Atakama'], correct: 2, difficulty: 2 },
        { text: 'Jak nazywa się stolica Kanady?', answers: ['Toronto', 'Vancouver', 'Ottawa', 'Montreal'], correct: 2, difficulty: 2 },
        { text: 'Który kraj ma obecnie największą liczbę ludności na świecie?', answers: ['Chiny', 'Indie', 'USA', 'Indonezja'], correct: 1, difficulty: 3 },
        { text: 'Na jakim kontynencie leży pustynia Sahara?', answers: ['Azja', 'Afryka', 'Ameryka Południowa', 'Australia'], correct: 1, difficulty: 1 },
      ],
    },
    {
      name: 'Historia powszechna',
      questions: [
        { text: 'W którym roku zakończyła się II wojna światowa?', answers: ['1943', '1944', '1945', '1946'], correct: 2, difficulty: 1 },
        { text: 'Kto był pierwszym prezydentem Stanów Zjednoczonych?', answers: ['Thomas Jefferson', 'George Washington', 'Abraham Lincoln', 'John Adams'], correct: 1, difficulty: 1 },
        { text: 'Który starożytny cud świata przetrwał do dziś w największym stopniu?', answers: ['Ogrody Semiramidy', 'Kolos Rodyjski', 'Piramidy w Gizie', 'Latarnia na Faros'], correct: 2, difficulty: 2 },
        { text: 'W którym roku upadł Mur Berliński?', answers: ['1987', '1989', '1991', '1993'], correct: 1, difficulty: 2 },
        { text: 'Jak potocznie nazywano epidemię dżumy, która spustoszyła średniowieczną Europę?', answers: ['Czarna Śmierć', 'Wielki Mór', 'Szara Zaraza', 'Czarna Ospa'], correct: 0, difficulty: 2 },
        { text: 'Który cesarz rzymski zalegalizował chrześcijaństwo edyktem mediolańskim (313 r.)?', answers: ['Neron', 'Konstantyn Wielki', 'Justynian', 'Marek Aureliusz'], correct: 1, difficulty: 3 },
      ],
    },
    {
      name: 'Nauka i przyroda',
      questions: [
        { text: 'Ile nóg ma typowy pająk?', answers: ['6', '8', '10', '12'], correct: 1, difficulty: 1 },
        { text: 'Jaki gaz jest niezbędny roślinom do fotosyntezy?', answers: ['Tlen', 'Azot', 'Dwutlenek węgla', 'Wodór'], correct: 2, difficulty: 1 },
        { text: 'Jaki jest chemiczny wzór wody?', answers: ['CO2', 'H2O', 'O2', 'NaCl'], correct: 1, difficulty: 1 },
        { text: 'Który narząd w ciele człowieka produkuje insulinę?', answers: ['Wątroba', 'Nerka', 'Trzustka', 'Śledziona'], correct: 2, difficulty: 2 },
        { text: 'Jak nazywa się najmniejsza jednostka materii zachowująca właściwości pierwiastka?', answers: ['Cząsteczka', 'Atom', 'Jon', 'Elektron'], correct: 1, difficulty: 2 },
        { text: 'Ile chromosomów ma typowa komórka ciała człowieka?', answers: ['23', '44', '46', '48'], correct: 2, difficulty: 3 },
      ],
    },
    {
      name: 'Sztuka i literatura',
      questions: [
        { text: 'Kto namalował "Mona Lisę"?', answers: ['Michał Anioł', 'Leonardo da Vinci', 'Rafael', 'Botticelli'], correct: 1, difficulty: 1 },
        { text: 'Kto jest autorem "Hamleta"?', answers: ['Charles Dickens', 'William Shakespeare', 'Oscar Wilde', 'George Orwell'], correct: 1, difficulty: 1 },
        { text: 'Kto napisał epopeję narodową "Pan Tadeusz"?', answers: ['Juliusz Słowacki', 'Adam Mickiewicz', 'Cyprian Norwid', 'Henryk Sienkiewicz'], correct: 1, difficulty: 1 },
        { text: 'Który malarz w przypływie kryzysu uciął sobie fragment ucha?', answers: ['Paul Gauguin', 'Claude Monet', 'Vincent van Gogh', 'Edvard Munch'], correct: 2, difficulty: 2 },
        { text: 'Kto napisał powieść "Zbrodnia i kara"?', answers: ['Lew Tołstoj', 'Fiodor Dostojewski', 'Anton Czechow', 'Iwan Turgieniew'], correct: 1, difficulty: 2 },
        { text: 'W jakim nurcie malarskim tworzył Claude Monet?', answers: ['Kubizm', 'Impresjonizm', 'Surrealizm', 'Barok'], correct: 1, difficulty: 2 },
      ],
    },
  ],
  duel: [
    { text: 'Jaka jest stolica Francji?', answers: ['Lyon', 'Marsylia', 'Paryż', 'Nicea'], correct: 2 },
    { text: 'Ile dni ma rok przestępny?', answers: ['364', '365', '366', '367'], correct: 2 },
    { text: 'Jaki jest symbol chemiczny złota?', answers: ['Ag', 'Au', 'Fe', 'Gd'], correct: 1 },
    { text: 'Kto jest autorem teorii względności?', answers: ['Isaac Newton', 'Albert Einstein', 'Niels Bohr', 'Galileusz'], correct: 1 },
    { text: 'Jaki jest największy ocean na Ziemi?', answers: ['Atlantycki', 'Indyjski', 'Spokojny', 'Arktyczny'], correct: 2 },
    { text: 'Ile kontynentów liczy Ziemia (w klasycznym podziale)?', answers: ['5', '6', '7', '8'], correct: 2 },
    { text: 'W jakim kraju leży Machu Picchu?', answers: ['Meksyk', 'Peru', 'Chile', 'Boliwia'], correct: 1 },
    { text: 'Jak nazywa się waluta Japonii?', answers: ['Won', 'Juan', 'Jen', 'Bat'], correct: 2 },
    { text: 'Ile miesięcy ma rok?', answers: ['10', '11', '12', '13'], correct: 2 },
    { text: 'Kto namalował "Gwiaździstą noc"?', answers: ['Vincent van Gogh', 'Pablo Picasso', 'Salvador Dalí', 'Edvard Munch'], correct: 0 },
    { text: 'Jaka jest stolica Włoch?', answers: ['Mediolan', 'Neapol', 'Rzym', 'Wenecja'], correct: 2 },
    { text: 'Jaki gaz stanowi największą część powietrza, którym oddychamy?', answers: ['Tlen', 'Azot', 'Dwutlenek węgla', 'Wodór'], correct: 1 },
    { text: 'Który zmysł odpowiada za słyszenie dźwięków?', answers: ['Wzrok', 'Słuch', 'Węch', 'Dotyk'], correct: 1 },
    { text: 'Kto napisał "Małego Księcia"?', answers: ['Antoine de Saint-Exupéry', 'Jules Verne', 'Victor Hugo', 'Albert Camus'], correct: 0 },
    { text: 'Jakie jest najmniejsze państwo świata?', answers: ['Monako', 'San Marino', 'Watykan', 'Liechtenstein'], correct: 2 },
  ],
}

const SPORT = {
  name: 'Sport i Rekreacja',
  categories: [
    {
      name: 'Piłka nożna',
      questions: [
        { text: 'Ilu zawodników jednej drużyny przebywa na boisku (bez rezerwowych)?', answers: ['9', '10', '11', '12'], correct: 2, difficulty: 1 },
        { text: 'Ile trwa standardowy mecz piłki nożnej (czas regulaminowy)?', answers: ['80 minut', '90 minut', '100 minut', '120 minut'], correct: 1, difficulty: 1 },
        { text: 'Jak nazywa się kara za faul popełniony we własnym polu karnym?', answers: ['Rzut wolny', 'Rzut rożny', 'Rzut karny', 'Wrzut z autu'], correct: 2, difficulty: 1 },
        { text: 'Który kraj zdobył Mistrzostwo Świata w piłce nożnej najwięcej razy (do 2022 r.)?', answers: ['Niemcy', 'Włochy', 'Brazylia', 'Argentyna'], correct: 2, difficulty: 2 },
        { text: 'Który piłkarz zdobył Złotą Piłkę (France Football) najwięcej razy?', answers: ['Cristiano Ronaldo', 'Lionel Messi', 'Pelé', 'Diego Maradona'], correct: 1, difficulty: 2 },
        { text: 'W którym kraju odbyły się Mistrzostwa Świata w piłce nożnej w 2022 roku?', answers: ['Zjednoczone Emiraty Arabskie', 'Arabia Saudyjska', 'Katar', 'Kuwejt'], correct: 2, difficulty: 2 },
      ],
    },
    {
      name: 'Igrzyska Olimpijskie',
      questions: [
        { text: 'W którym kraju odbyły się pierwsze nowożytne igrzyska olimpijskie (1896 r.)?', answers: ['Francja', 'Grecja', 'Włochy', 'Wielka Brytania'], correct: 1, difficulty: 1 },
        { text: 'Ile kółek znajduje się na fladze olimpijskiej?', answers: ['4', '5', '6', '7'], correct: 1, difficulty: 1 },
        { text: 'Co symbolizują kółka na fladze olimpijskiej?', answers: ['Pory roku', 'Zamieszkane kontynenty', 'Żywioły', 'Dyscypliny sportowe'], correct: 1, difficulty: 2 },
        { text: 'Co ile lat odbywają się letnie igrzyska olimpijskie?', answers: ['Co 2 lata', 'Co 3 lata', 'Co 4 lata', 'Co 5 lat'], correct: 2, difficulty: 1 },
        { text: 'W którym mieście odbyły się letnie igrzyska olimpijskie w 2021 roku (przełożone z 2020)?', answers: ['Paryż', 'Tokio', 'Pekin', 'Los Angeles'], correct: 1, difficulty: 2 },
        { text: 'Który kraj zdobył łącznie najwięcej medali olimpijskich w historii?', answers: ['ZSRR', 'Chiny', 'USA', 'Niemcy'], correct: 2, difficulty: 3 },
      ],
    },
    {
      name: 'Sporty zimowe',
      questions: [
        { text: 'Na czym jeżdżą zawodnicy w narciarstwie alpejskim?', answers: ['Na łyżwach', 'Na nartach', 'Na saniach', 'Na deskorolce śnieżnej'], correct: 1, difficulty: 1 },
        { text: 'Jak nazywa się dyscyplina łącząca bieg narciarski ze strzelaniem?', answers: ['Kombinacja norweska', 'Biathlon', 'Skeleton', 'Curling'], correct: 1, difficulty: 2 },
        { text: 'Ilu zawodników drużyny hokejowej przebywa jednocześnie na lodzie (łącznie z bramkarzem)?', answers: ['5', '6', '7', '8'], correct: 1, difficulty: 2 },
        { text: 'Jak nazywa się skok narciarski z bardzo dużej skoczni, na wyjątkowo długie odległości?', answers: ['Slalom gigant', 'Lot narciarski', 'Kombinacja alpejska', 'Zjazd ekstremalny'], correct: 1, difficulty: 3 },
        { text: 'Który kraj najczęściej gościł zimowe igrzyska olimpijskie?', answers: ['Francja', 'Norwegia', 'USA', 'Kanada'], correct: 2, difficulty: 3 },
        { text: 'Jak nazywa się zjazd na jednoosobowych saniach, leżąc na plecach?', answers: ['Bobsleje', 'Skeleton', 'Saneczkarstwo', 'Curling'], correct: 2, difficulty: 2 },
      ],
    },
    {
      name: 'Rekordy i ciekawostki sportowe',
      questions: [
        { text: 'Kto jest aktualnym rekordzistą świata na 100 metrów?', answers: ['Carl Lewis', 'Usain Bolt', 'Justin Gatlin', 'Tyson Gay'], correct: 1, difficulty: 1 },
        { text: 'Ile trwa jedna runda w boksie zawodowym?', answers: ['2 minuty', '3 minuty', '4 minuty', '5 minut'], correct: 1, difficulty: 2 },
        { text: 'Jak nazywa się prestiżowy turniej tenisowy rozgrywany na kortach trawiastych w Londynie?', answers: ['US Open', 'Roland Garros', 'Wimbledon', 'Australian Open'], correct: 2, difficulty: 2 },
        { text: 'Jak nazywa się zdobycie trzech bramek/punktów przez jednego zawodnika w meczu?', answers: ['Hat-trick', 'Triple play', 'Grand slam', 'Combo'], correct: 0, difficulty: 1 },
        { text: 'Ile punktów wart jest udany rzut za linią 3 punktów w koszykówce?', answers: ['2', '3', '4', '5'], correct: 1, difficulty: 1 },
        { text: 'Jak nazywa się najbardziej znany wieloetapowy wyścig kolarski, rozgrywany co roku we Francji?', answers: ['Giro d\'Italia', 'Vuelta a España', 'Tour de France', 'Paryż-Roubaix'], correct: 2, difficulty: 1 },
      ],
    },
  ],
  duel: [
    { text: 'Ile kółek znajduje się na fladze olimpijskiej?', answers: ['4', '5', '6', '7'], correct: 1 },
    { text: 'Ilu zawodników drużyny koszykówki gra jednocześnie na boisku?', answers: ['4', '5', '6', '7'], correct: 1 },
    { text: 'W jakim kraju narodziła się koszykówka?', answers: ['Kanada', 'USA', 'Francja', 'Anglia'], correct: 1 },
    { text: 'Ile setów trzeba wygrać, by wygrać standardowy mecz siatkówki?', answers: ['2', '3', '4', '5'], correct: 1 },
    { text: 'Jak nazywają się najbardziej prestiżowe klubowe rozgrywki piłkarskie w Europie?', answers: ['Liga Europy', 'Liga Mistrzów', 'Puchar Zdobywców Pucharów', 'Superpuchar'], correct: 1 },
    { text: 'Ile minut trwa jedna kwarta meczu NBA?', answers: ['10', '12', '15', '20'], correct: 1 },
    { text: 'Który kraj wygrał Mistrzostwa Europy w piłce nożnej w 2016 roku?', answers: ['Francja', 'Niemcy', 'Portugalia', 'Hiszpania'], correct: 2 },
    { text: 'Jak nazywa się najstarszy regularnie rozgrywany maraton na świecie?', answers: ['Maraton Nowojorski', 'Maraton Bostoński', 'Maraton Berliński', 'Maraton Londyński'], correct: 1 },
    { text: 'Ilu zawodników drużyny siatkówki gra jednocześnie na boisku?', answers: ['5', '6', '7', '8'], correct: 1 },
    { text: 'W którym mieście odbyły się letnie igrzyska olimpijskie w 2016 roku?', answers: ['Londyn', 'Rio de Janeiro', 'Pekin', 'Ateny'], correct: 1 },
    { text: 'Ile rund liczy walka o tytuł mistrza świata w boksie zawodowym?', answers: ['8', '10', '12', '15'], correct: 2 },
    { text: 'Ile punktów wart jest "touchdown" w futbolu amerykańskim?', answers: ['3', '5', '6', '7'], correct: 2 },
    { text: 'Gdzie co roku odbywa się prestiżowy wyścig Formuły 1 ulicami miasta-państwa?', answers: ['Grand Prix Monako', 'Grand Prix Włoch', 'Grand Prix Belgii', 'Grand Prix Węgier'], correct: 0 },
    { text: 'Który kraj był gospodarzem Mistrzostw Świata w piłce nożnej w 2018 roku?', answers: ['Brazylia', 'Rosja', 'Niemcy', 'RPA'], correct: 1 },
    { text: 'Jaka jest standardowa wysokość kosza w koszykówce?', answers: ['2,44 m', '3,05 m', '3,50 m', '2,80 m'], correct: 1 },
  ],
}

const KINO_MUZYKA = {
  name: 'Kino, Muzyka i Pop-kultura',
  categories: [
    {
      name: 'Kino światowe',
      questions: [
        { text: 'Kto wyreżyserował filmową trylogię "Władca Pierścieni"?', answers: ['Guillermo del Toro', 'Peter Jackson', 'James Cameron', 'Ridley Scott'], correct: 1, difficulty: 1 },
        { text: 'Który film zdobył Oscara za najlepszy film w 2020 roku (za rok 2019), jako pierwszy nieanglojęzyczny w historii?', answers: ['Parasite', 'Roma', 'Joker', '1917'], correct: 0, difficulty: 2 },
        { text: 'Kto zdobył Oscara za rolę Jokera w filmie z 2019 roku?', answers: ['Jared Leto', 'Heath Ledger', 'Joaquin Phoenix', 'Jack Nicholson'], correct: 2, difficulty: 2 },
        { text: 'W jakim uniwersum filmowym rozgrywa się seria "Avengers"?', answers: ['DC Extended Universe', 'Marvel Cinematic Universe', 'Star Wars Universe', 'Wizarding World'], correct: 1, difficulty: 1 },
        { text: 'Kto wyreżyserował film "Incepcja"?', answers: ['Denis Villeneuve', 'Christopher Nolan', 'David Fincher', 'Steven Spielberg'], correct: 1, difficulty: 2 },
        { text: 'Jak nazywa się najbardziej prestiżowa nagroda filmowa w USA (statuetka)?', answers: ['Złoty Glob', 'Nagroda BAFTA', 'Oscar', 'Cezar'], correct: 2, difficulty: 1 },
      ],
    },
    {
      name: 'Muzyka popularna',
      questions: [
        { text: 'W jakim zespole śpiewał Freddie Mercury?', answers: ['The Rolling Stones', 'Queen', 'Led Zeppelin', 'Pink Floyd'], correct: 1, difficulty: 1 },
        { text: 'Kto jest nazywany "Królem Popu"?', answers: ['Prince', 'Elvis Presley', 'Michael Jackson', 'David Bowie'], correct: 2, difficulty: 1 },
        { text: 'Który polski zespół wykonał hit "Chcemy być sobą"?', answers: ['Lady Pank', 'Perfect', 'Maanam', 'Budka Suflera'], correct: 1, difficulty: 2 },
        { text: 'Jak nazywa się najbardziej prestiżowa doroczna nagroda muzyczna w USA?', answers: ['MTV Video Music Award', 'Grammy', 'American Music Award', 'Billboard Award'], correct: 1, difficulty: 1 },
        { text: 'Kto skomponował "Cztery pory roku"?', answers: ['Johann Sebastian Bach', 'Antonio Vivaldi', 'Wolfgang Amadeus Mozart', 'Ludwig van Beethoven'], correct: 1, difficulty: 2 },
        { text: 'Który niemiecki zespół uznawany jest za pioniera muzyki elektronicznej?', answers: ['Kraftwerk', 'Rammstein', 'Scorpions', 'Modern Talking'], correct: 0, difficulty: 2 },
      ],
    },
    {
      name: 'Seriale i streaming',
      questions: [
        { text: 'W jakim mieście toczy się akcja serialu "Przyjaciele"?', answers: ['Los Angeles', 'Nowy Jork', 'Chicago', 'Boston'], correct: 1, difficulty: 1 },
        { text: 'Jak nazywa się fikcyjny kontynent, na którym rozgrywa się większość akcji "Gry o Tron"?', answers: ['Essos', 'Westeros', 'Valyria', 'Naath'], correct: 1, difficulty: 2 },
        { text: 'Który serwis streamingowy wyprodukował serial "Stranger Things"?', answers: ['HBO Max', 'Netflix', 'Disney+', 'Amazon Prime'], correct: 1, difficulty: 1 },
        { text: 'Jak nazywa się główny bohater serialu "Breaking Bad"?', answers: ['Jesse Pinkman', 'Saul Goodman', 'Walter White', 'Gus Fring'], correct: 2, difficulty: 2 },
        { text: 'Jak nazywa się rodzina bohaterów kultowego serialu animowanego z Springfield?', answers: ['Griffinowie', 'Simpsonowie', 'Smithowie', 'Belcherowie'], correct: 1, difficulty: 1 },
        { text: 'Który serial opowiada o rodzinie mafijnej z New Jersey pod wodzą Tony\'ego?', answers: ['Ojciec Chrzestny', 'Rodzina Soprano', 'Peaky Blinders', 'Narcos'], correct: 1, difficulty: 2 },
      ],
    },
    {
      name: 'Gry wideo',
      questions: [
        { text: 'Jak nazywa się kultowy hydraulik, maskotka firmy Nintendo?', answers: ['Luigi', 'Mario', 'Yoshi', 'Wario'], correct: 1, difficulty: 1 },
        { text: 'W jakiej grze gracze budują i eksplorują świat zbudowany z klocków?', answers: ['Roblox', 'Minecraft', 'Terraria', 'Fortnite'], correct: 1, difficulty: 1 },
        { text: 'Jak nazywa się seria gier o otwartym świecie, produkowana przez Rockstar Games?', answers: ['Assassin\'s Creed', 'Grand Theft Auto', 'Red Dead Redemption', 'Watch Dogs'], correct: 1, difficulty: 1 },
        { text: 'Który koncern jest twórcą konsoli PlayStation?', answers: ['Microsoft', 'Nintendo', 'Sony', 'Sega'], correct: 2, difficulty: 1 },
        { text: 'Jak nazywa się główny bohater serii gier "The Legend of Zelda"?', answers: ['Link', 'Zelda', 'Ganon', 'Epona'], correct: 0, difficulty: 2 },
        { text: 'W jakiej grze battle royale gracze skaczą z "autobusu bojowego" na wyspę?', answers: ['PUBG', 'Fortnite', 'Apex Legends', 'Warzone'], correct: 1, difficulty: 2 },
      ],
    },
  ],
  duel: [
    { text: 'Kto zagrał kapitana Jacka Sparrowa w "Piratach z Karaibów"?', answers: ['Orlando Bloom', 'Johnny Depp', 'Geoffrey Rush', 'Javier Bardem'], correct: 1 },
    { text: 'Która firma jest producentem iPhone\'a?', answers: ['Samsung', 'Google', 'Apple', 'Huawei'], correct: 2 },
    { text: 'Który zespół nagrał "Bohemian Rhapsody"?', answers: ['The Beatles', 'Queen', 'ABBA', 'Genesis'], correct: 1 },
    { text: 'W którym kraju powstało studio filmowe znane jako Bollywood?', answers: ['Pakistan', 'Indie', 'Bangladesz', 'Sri Lanka'], correct: 1 },
    { text: 'Jak nazywa się główny rywal Mario w grach Nintendo?', answers: ['Bowser', 'Wario', 'King Boo', 'Dry Bones'], correct: 0 },
    { text: 'Który serwis streamingowy wyprodukował serial "The Crown"?', answers: ['Netflix', 'HBO', 'Disney+', 'Apple TV+'], correct: 0 },
    { text: 'Kto wyreżyserował film "Titanic" z 1997 roku?', answers: ['Steven Spielberg', 'James Cameron', 'Ron Howard', 'Michael Bay'], correct: 1 },
    { text: 'Kto nazywany jest w świecie muzyki "Slim Shady"?', answers: ['Snoop Dogg', 'Eminem', 'Dr. Dre', '50 Cent'], correct: 1 },
    { text: 'W jakiej klasycznej grze komputerowej gracz zarządza rozwojem wirtualnego miasta?', answers: ['SimCity', 'Age of Empires', 'Civilization', 'The Settlers'], correct: 0 },
    { text: 'Kto zagrał Neo w filmie "Matrix"?', answers: ['Brad Pitt', 'Tom Cruise', 'Keanu Reeves', 'Will Smith'], correct: 2 },
    { text: 'Jak nazywa się fikcyjne miasto, w którym działa Batman?', answers: ['Metropolis', 'Gotham', 'Star City', 'Central City'], correct: 1 },
    { text: 'Jak nazywa się pierwszy pełnometrażowy film animowany studia Pixar, o zabawkach?', answers: ['Toy Story', 'Gdzie jest Nemo?', 'Auta', 'Shrek'], correct: 0 },
    { text: 'Który serwis należący do Google służy do oglądania i publikowania filmów online?', answers: ['Vimeo', 'YouTube', 'TikTok', 'Twitch'], correct: 1 },
    { text: 'Kto skomponował muzykę do "Gwiezdnych Wojen"?', answers: ['Hans Zimmer', 'John Williams', 'Danny Elfman', 'Alan Silvestri'], correct: 1 },
    { text: 'Jak nazywa się festiwal filmowy odbywający się co roku w Cannes?', answers: ['Festiwal Filmowy w Cannes', 'Sundance', 'Berlinale', 'Wenecki Festiwal Filmowy'], correct: 0 },
  ],
}

const POLSKA = {
  name: 'Polska w Pigułce',
  categories: [
    {
      name: 'Geografia Polski',
      questions: [
        { text: 'Jaka jest stolica Polski?', answers: ['Kraków', 'Warszawa', 'Wrocław', 'Poznań'], correct: 1, difficulty: 1 },
        { text: 'Jak nazywa się najdłuższa rzeka Polski?', answers: ['Odra', 'Warta', 'Wisła', 'Bug'], correct: 2, difficulty: 1 },
        { text: 'Jak nazywa się najwyższy szczyt Polski?', answers: ['Śnieżka', 'Rysy', 'Babia Góra', 'Kasprowy Wierch'], correct: 1, difficulty: 2 },
        { text: 'Jak nazywa się największe jezioro w Polsce?', answers: ['Śniardwy', 'Mamry', 'Hańcza', 'Gopło'], correct: 0, difficulty: 2 },
        { text: 'Z iloma krajami graniczy Polska?', answers: ['5', '6', '7', '8'], correct: 2, difficulty: 2 },
        { text: 'Nad jakim morzem leży Polska?', answers: ['Morze Północne', 'Morze Bałtyckie', 'Morze Czarne', 'Morze Śródziemne'], correct: 1, difficulty: 1 },
      ],
    },
    {
      name: 'Historia Polski',
      questions: [
        { text: 'W którym roku Polska odzyskała niepodległość po 123 latach zaborów?', answers: ['1916', '1918', '1920', '1922'], correct: 1, difficulty: 1 },
        { text: 'Który władca przyjął chrzest Polski w 966 roku?', answers: ['Bolesław Chrobry', 'Mieszko I', 'Kazimierz Wielki', 'Władysław Łokietek'], correct: 1, difficulty: 1 },
        { text: 'W którym roku wybuchło Powstanie Warszawskie?', answers: ['1943', '1944', '1945', '1946'], correct: 1, difficulty: 2 },
        { text: 'Jak nazywał się związek zawodowy, który zapoczątkował przemiany polityczne w 1980 roku?', answers: ['Solidarność', 'Praworządność', 'Jedność', 'Odrodzenie'], correct: 0, difficulty: 2 },
        { text: 'Który król dowodził wojskami polsko-litewskimi w zwycięskiej bitwie pod Grunwaldem (1410)?', answers: ['Kazimierz Wielki', 'Władysław Jagiełło', 'Zygmunt Stary', 'Stefan Batory'], correct: 1, difficulty: 2 },
        { text: 'W którym roku Polska wstąpiła do Unii Europejskiej?', answers: ['2002', '2004', '2006', '2008'], correct: 1, difficulty: 2 },
      ],
    },
    {
      name: 'Kultura polska',
      questions: [
        { text: 'Kto napisał słowa hymnu Polski "Mazurek Dąbrowskiego"?', answers: ['Ignacy Krasicki', 'Józef Wybicki', 'Adam Mickiewicz', 'Cyprian Norwid'], correct: 1, difficulty: 2 },
        { text: 'Który polski kompozytor jest autorem słynnych polonezów i mazurków?', answers: ['Fryderyk Chopin', 'Stanisław Moniuszko', 'Karol Szymanowski', 'Ignacy Paderewski'], correct: 0, difficulty: 1 },
        { text: 'Kto otrzymał literacką Nagrodę Nobla za powieść "Chłopi"?', answers: ['Henryk Sienkiewicz', 'Władysław Reymont', 'Czesław Miłosz', 'Wisława Szymborska'], correct: 1, difficulty: 3 },
        { text: 'Jak nazywa się najstarszy i najbardziej znany polski festiwal piosenki, odbywający się w Opolu?', answers: ['Open\'er Festival', 'Krajowy Festiwal Piosenki Polskiej', 'Przystanek Woodstock', 'Sopot Festival'], correct: 1, difficulty: 2 },
        { text: 'Który polski reżyser nakręcił "Popiół i diament" oraz "Ziemię obiecaną"?', answers: ['Roman Polański', 'Krzysztof Kieślowski', 'Andrzej Wajda', 'Agnieszka Holland'], correct: 2, difficulty: 2 },
        { text: 'Ilu Polaków (do 2023 r.) otrzymało literacką Nagrodę Nobla?', answers: ['3', '4', '5', '6'], correct: 2, difficulty: 3 },
      ],
    },
    {
      name: 'Polska kuchnia',
      questions: [
        { text: 'Jak nazywają się tradycyjne pierogi z nadzieniem z ziemniaków, twarogu i cebuli?', answers: ['Pierogi ruskie', 'Pierogi z mięsem', 'Uszka', 'Kołduny'], correct: 0, difficulty: 1 },
        { text: 'Jaka zupa na bazie żytniego zakwasu tradycyjnie gości na wielkanocnym stole?', answers: ['Rosół', 'Żurek', 'Barszcz biały', 'Krupnik'], correct: 1, difficulty: 2 },
        { text: 'Jak nazywa się tradycyjna zupa z buraków, podawana na czerwono?', answers: ['Chłodnik', 'Barszcz czerwony', 'Botwinka', 'Kapuśniak'], correct: 1, difficulty: 1 },
        { text: 'Jakie słodkie ciasto drożdżowe je się tradycyjnie w Tłusty Czwartek?', answers: ['Faworki', 'Pączki', 'Sernik', 'Makowiec'], correct: 1, difficulty: 1 },
        { text: 'Jak nazywa się danie z kiszonej kapusty i różnych rodzajów mięsa, typowe dla kuchni polskiej?', answers: ['Gołąbki', 'Bigos', 'Flaki', 'Zrazy'], correct: 1, difficulty: 2 },
        { text: 'Jaka ryba tradycyjnie gości w galarecie na polskim stole wigilijnym?', answers: ['Łosoś', 'Śledź', 'Karp', 'Dorsz'], correct: 2, difficulty: 2 },
      ],
    },
  ],
  duel: [
    { text: 'Jaka jest stolica Polski?', answers: ['Kraków', 'Warszawa', 'Łódź', 'Gdańsk'], correct: 1 },
    { text: 'Ile województw ma Polska?', answers: ['14', '15', '16', '17'], correct: 2 },
    { text: 'Jak nazywa się najdłuższa rzeka Polski?', answers: ['Odra', 'Wisła', 'Warta', 'Bug'], correct: 1 },
    { text: 'W którym roku Polska wstąpiła do NATO?', answers: ['1997', '1999', '2001', '2004'], correct: 1 },
    { text: 'Jak nazywa się polska waluta?', answers: ['Korona', 'Forint', 'Złoty', 'Leu'], correct: 2 },
    { text: 'Kto namalował monumentalną "Bitwę pod Grunwaldem"?', answers: ['Jan Matejko', 'Stanisław Wyspiański', 'Jacek Malczewski', 'Józef Chełmoński'], correct: 0 },
    { text: 'Jaki ptak widnieje w godle Polski?', answers: ['Sokół', 'Orzeł biały', 'Bocian', 'Jastrząb'], correct: 1 },
    { text: 'W jakiej miejscowości urodził się Fryderyk Chopin?', answers: ['Warszawa', 'Żelazowa Wola', 'Kraków', 'Poznań'], correct: 1 },
    { text: 'Jak nazywa się najwyższe pasmo górskie w Polsce?', answers: ['Bieszczady', 'Sudety', 'Tatry', 'Beskidy'], correct: 2 },
    { text: 'Które polskie święto państwowe obchodzone jest 11 listopada?', answers: ['Święto Konstytucji', 'Święto Niepodległości', 'Dzień Flagi', 'Święto Pracy'], correct: 1 },
    { text: 'Jak nazywa się wędzony ser owczy z Podhala, chroniony unijną nazwą regionalną?', answers: ['Bundz', 'Oscypek', 'Bryndza', 'Redykołka'], correct: 1 },
    { text: 'Ilu różnych osób sprawowało urząd prezydenta III RP do 2020 roku?', answers: ['3', '4', '5', '6'], correct: 2 },
    { text: 'Jak nazywa się najstarszy uniwersytet w Polsce, założony w 1364 roku?', answers: ['Uniwersytet Warszawski', 'Uniwersytet Jagielloński', 'Uniwersytet Wrocławski', 'Uniwersytet Poznański'], correct: 1 },
    { text: 'W którym mieście odbywa się co roku festiwal muzyczny Open\'er?', answers: ['Sopot', 'Gdynia', 'Gdańsk', 'Kołobrzeg'], correct: 1 },
    { text: 'Jak nazywa się najwyższe polskie odznaczenie państwowe?', answers: ['Krzyż Virtuti Militari', 'Order Orła Białego', 'Order Odrodzenia Polski', 'Krzyż Zasługi'], correct: 1 },
  ],
}

export const STARTER_QUIZZES = {
  przykladowy: SAMPLE_QUIZ,
  'wiedza-ogolna': WIEDZA_OGOLNA,
  sport: SPORT,
  'kino-muzyka': KINO_MUZYKA,
  polska: POLSKA,
}

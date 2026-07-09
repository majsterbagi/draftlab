// Przykładowy zestaw pytań (PL) — seedowany do Firebase przy pierwszym uruchomieniu.
// Format: categories: [{ name, questions: [{ text, answers[4], correct, difficulty }] }],
// duel: [{ text, answers[4], correct }]

export const SAMPLE_QUIZ = {
  name: 'Zestaw startowy: Wieczór retro',
  categories: [
    {
      name: 'Muzyka lat 80.',
      questions: [
        { text: 'Kto nagrał album "Thriller" — najlepiej sprzedającą się płytę wszech czasów?', answers: ['Prince', 'Michael Jackson', 'Madonna', 'Lionel Richie'], correct: 1, difficulty: 1 },
        { text: 'Który zespół zaśpiewał "Take On Me" ze słynnym rysunkowym teledyskiem?', answers: ['Duran Duran', 'Depeche Mode', 'a-ha', 'Tears for Fears'], correct: 2, difficulty: 1 },
        { text: 'Jak nazywała się wokalistka zespołu Blondie?', answers: ['Debbie Harry', 'Cyndi Lauper', 'Pat Benatar', 'Joan Jett'], correct: 0, difficulty: 2 },
        { text: 'Który polski zespół nagrał przebój "Autobiografia"?', answers: ['Lady Pank', 'Maanam', 'Perfect', 'Republika'], correct: 2, difficulty: 1 },
        { text: 'W którym roku odbył się koncert Live Aid?', answers: ['1983', '1984', '1985', '1987'], correct: 2, difficulty: 3 },
        { text: 'Jaki instrument zdefiniował brzmienie synth-popu lat 80.?', answers: ['Skrzypce elektryczne', 'Syntezator', 'Banjo', 'Organy Hammonda'], correct: 1, difficulty: 1 },
      ],
    },
    {
      name: 'Kino i seriale',
      questions: [
        { text: 'Jak nazywał się samochód z filmu "Powrót do przyszłości"?', answers: ['Mustang', 'DeLorean', 'Corvette', 'Camaro'], correct: 1, difficulty: 1 },
        { text: 'Kto zagrał Johna Rambo?', answers: ['Arnold Schwarzenegger', 'Chuck Norris', 'Sylvester Stallone', 'Bruce Willis'], correct: 2, difficulty: 1 },
        { text: 'Jak nazywał się kosmita z filmu Spielberga z 1982 roku?', answers: ['E.T.', 'Alf', 'Yoda', 'Chewbacca'], correct: 0, difficulty: 1 },
        { text: 'W serialu "Knight Rider" samochód KITT rozmawiał z kierowcą. Jak nazywał się bohater?', answers: ['Colt Seavers', 'Michael Knight', 'Thomas Magnum', 'MacGyver'], correct: 1, difficulty: 2 },
        { text: 'Który film z 1987 r. wyreżyserował Paul Verhoeven?', answers: ['Predator', 'RoboCop', 'Terminator', 'Obcy'], correct: 1, difficulty: 3 },
        { text: 'Jak nazywa się duch-przyjaciel z filmu "Pogromcy duchów", zielony i żarłoczny?', answers: ['Casper', 'Slimer', 'Zuul', 'Gozer'], correct: 1, difficulty: 2 },
      ],
    },
    {
      name: 'Technologia retro',
      questions: [
        { text: 'Jaki komputer 8-bitowy był hitem w Polsce lat 80.?', answers: ['Commodore 64', 'iMac', 'ThinkPad', 'Amiga 4000'], correct: 0, difficulty: 1 },
        { text: 'Co odtwarzał walkman?', answers: ['Płyty CD', 'Kasety magnetofonowe', 'Płyty winylowe', 'Pliki MP3'], correct: 1, difficulty: 1 },
        { text: 'Jak nazywała się pierwsza masowo popularna konsola firmy Nintendo (1983)?', answers: ['Game Boy', 'SNES', 'Famicom/NES', 'Atari 2600'], correct: 2, difficulty: 2 },
        { text: 'Ile mieściła standardowa dyskietka 3,5 cala?', answers: ['1,44 MB', '700 MB', '4,7 GB', '64 KB'], correct: 0, difficulty: 2 },
        { text: 'W którym roku premierę miał pierwszy telefon komórkowy Motorola DynaTAC?', answers: ['1979', '1983', '1989', '1991'], correct: 1, difficulty: 3 },
        { text: 'Jak nazywała się kultowa gra z 1984 r. o spadających klockach?', answers: ['Pac-Man', 'Arkanoid', 'Tetris', 'Pong'], correct: 2, difficulty: 1 },
      ],
    },
    {
      name: 'PRL i okolice',
      questions: [
        { text: 'Jak nazywał się popularny polski samochód "maluch"?', answers: ['Fiat 126p', 'Polonez', 'Syrena', 'Warszawa'], correct: 0, difficulty: 1 },
        { text: 'Co można było kupić w Pewexie?', answers: ['Tylko meble', 'Towary za dewizy', 'Tylko gazety', 'Bilety kolejowe'], correct: 1, difficulty: 1 },
        { text: 'Jak nazywał się teleturniej z Ryszardem Rembiszewskim i wielkim kołem?', answers: ['Familiada', 'Koło Fortuny', 'Jaka to melodia?', 'Milionerzy'], correct: 1, difficulty: 2 },
        { text: 'Który napój w proszku był hitem dzieciństwa w PRL?', answers: ['Oranżada w proszku', 'Cola w proszku', 'Lemoniada w kapsułkach', 'Herbata rozpuszczalna'], correct: 0, difficulty: 1 },
        { text: 'W którym roku w Polsce zniesiono kartki na mięso?', answers: ['1985', '1989', '1992', '1980'], correct: 1, difficulty: 3 },
        { text: 'Jak nazywała się popularna guma do żucia z komiksowymi historyjkami?', answers: ['Orbit', 'Donald', 'Hubba Bubba', 'Turbo'], correct: 1, difficulty: 2 },
      ],
    },
  ],
  duel: [
    { text: 'Stolica Australii?', answers: ['Sydney', 'Melbourne', 'Canberra', 'Perth'], correct: 2 },
    { text: 'Ile nóg ma pająk?', answers: ['6', '8', '10', '12'], correct: 1 },
    { text: 'Rok wybuchu II wojny światowej?', answers: ['1937', '1938', '1939', '1941'], correct: 2 },
    { text: 'Największa planeta Układu Słonecznego?', answers: ['Saturn', 'Jowisz', 'Neptun', 'Uran'], correct: 1 },
    { text: 'Ile minut trwa mecz piłki nożnej (bez doliczonego czasu)?', answers: ['80', '90', '100', '120'], correct: 1 },
    { text: 'Jaki kolor powstaje ze zmieszania niebieskiego i żółtego?', answers: ['Fioletowy', 'Zielony', 'Pomarańczowy', 'Brązowy'], correct: 1 },
    { text: 'Najdłuższa rzeka w Polsce?', answers: ['Odra', 'Warta', 'Wisła', 'Bug'], correct: 2 },
    { text: 'Ile stron ma sześcian?', answers: ['4', '6', '8', '12'], correct: 1 },
    { text: 'Który pierwiastek ma symbol "O"?', answers: ['Złoto', 'Osm', 'Tlen', 'Ołów'], correct: 2 },
    { text: 'Autor "Pana Tadeusza"?', answers: ['Słowacki', 'Mickiewicz', 'Norwid', 'Sienkiewicz'], correct: 1 },
    { text: 'Ile żyć ma tradycyjnie kot?', answers: ['7', '9', '3', '5'], correct: 1 },
    { text: 'W którym mieście stoi Krzywa Wieża?', answers: ['Rzym', 'Piza', 'Florencja', 'Wenecja'], correct: 1 },
    { text: 'Jak nazywa się najszybszy lądowy ssak?', answers: ['Lew', 'Gepard', 'Antylopa', 'Koń'], correct: 1 },
    { text: 'Ile kontynentów jest na Ziemi?', answers: ['5', '6', '7', '8'], correct: 2 },
    { text: 'Co mierzy barometr?', answers: ['Temperaturę', 'Wilgotność', 'Ciśnienie', 'Wiatr'], correct: 2 },
  ],
}

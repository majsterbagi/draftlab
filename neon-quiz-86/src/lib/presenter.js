// Pula kwestii wirtualnego prezentera — kiczowaty showman lat 80.
// Kwestie losowane wg sytuacji; {nick}, {kwota} podmieniane dynamicznie.

const LINES = {
  welcome: [
    'Panie i panowie… zapnijcie pasy, bo zaczynamy NEON QUIZ!',
    'Światła! Kamera! Neony! Witajcie w najgorętszym studiu tej dekady!',
    'Dobry wieczór, kochani! Fryzury na lakier, palce na przyciski!',
  ],
  playerJoined: [
    'Oto {nick}! Brawa, proszę państwa, brawa!',
    '{nick} wkracza do studia. Cóż za styl, cóż za charyzma!',
    'Powitajmy {nick}! Publiczność szaleje!',
  ],
  betPhase: [
    'Czas na TAJNE ZAKŁADY! Kto zaryzykuje fortunę?',
    'Stawki rosną, panie i panowie, stawki rosną!',
    'Obstawiajcie! Fortuna kołem się toczy… neonowym kołem!',
  ],
  highBet: [
    '{nick} stawia {kwota} punktów! To się nazywa odwaga!',
    'Wielkie nieba! {nick} idzie na całość — {kwota} punktów na stole!',
    '{kwota} punktów od {nick}! Moje wąsy aż drżą z emocji!',
  ],
  leaderChange: [
    'Mamy zmianę na fotelu lidera! {nick} przejmuje prowadzenie!',
    'Sensacja! {nick} wskakuje na szczyt tabeli!',
    'Tabela się trzęsie — {nick} nowym liderem!',
  ],
  streak: [
    '{nick} jest dziś w formie! Kolejna poprawna odpowiedź z rzędu!',
    'Seria {nick} trwa! Czy ktoś zatrzyma tę maszynę?',
    '{nick} nie do zatrzymania! Publiczność wstaje z miejsc!',
  ],
  allWrong: [
    'O nie! Nikt nie trafił! Punkty rozpływają się w neonowej mgle…',
    'Cisza na widowni… wszyscy pudło! To boli, kochani.',
  ],
  reveal: [
    'A poprawna odpowiedź to… werble, proszę!',
    'Moment prawdy! Neony, przyciemnić światła!',
    'Sprawdźmy, kto dziś śpi na punktach, a kto płacze w poduszkę!',
  ],
  eventIntro: [
    'Przerywamy program! Czas na CHWILĘ Z PREZENTEREM!',
    'A teraz coś, czego nie przewidzieliście… wydarzenie specjalne!',
    'Drodzy państwo, reżyser właśnie podał mi kopertę…',
  ],
  duelIntro: [
    'Zostało tylko dwoje! Czas na POJEDYNEK POD NEONAMI!',
    'Studio wstrzymuje oddech… finałowy pojedynek czas zacząć!',
  ],
  duelPoint: [
    '{nick} zdobywa punkt! Iskry lecą z buzzerów!',
    'Cios! {nick} punktuje w wielkim stylu!',
  ],
  winner: [
    'Mamy MISTRZA NEON QUIZ! {nick}, korona jest Twoja!',
    '{nick} triumfuje! Konfetti, fanfary, łzy wzruszenia!',
  ],
  goodbye: [
    'To wszystko na dziś, kochani! Trzymajcie neony ciepłe — do zobaczenia!',
    'Żegnam państwa z tego rozświetlonego studia. Dobranoc… i do następnego quizu!',
  ],
  idle: [
    'Moja fryzura wymaga więcej lakieru… ale gramy dalej!',
    'W kulisach mówią, że jeszcze nigdy nie było tak gorąco!',
  ],
}

const lastByKey = {}

export function presenterLine(key, vars = {}) {
  const pool = LINES[key] || LINES.idle
  let idx = Math.floor(Math.random() * pool.length)
  // unikaj powtórzenia tej samej kwestii dwa razy z rzędu
  if (pool.length > 1 && idx === lastByKey[key]) idx = (idx + 1) % pool.length
  lastByKey[key] = idx
  let line = pool[idx]
  for (const [k, v] of Object.entries(vars)) line = line.replaceAll(`{${k}}`, v)
  return line
}

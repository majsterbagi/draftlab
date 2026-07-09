// Parametry rozgrywki NEON QUIZ

export const START_SCORE = 1000
export const MIN_SCORE = 100          // gracz nie może zbankrutować poniżej tego
export const MIN_BET = 50
export const MAX_BET_FRACTION = 0.5   // max 50% konta
export const DOUBLE_MIN_BET_FRACTION = 0.3 // wydarzenie "Podwójna stawka"

export const BET_TIME = 10            // sekundy
export const QUESTION_TIME = 20
export const VOTE_TIME = 12
export const DUEL_ANSWER_TIME = 5
export const BLIND_DELAY = 5          // runda w ciemno: odsłona odpowiedzi po 5 s

export const SPEED_MULT_MAX = 2.0     // odpowiedź natychmiast
export const SPEED_MULT_MIN = 1.5     // odpowiedź na koniec czasu

export const ROUNDS = 3
export const QUESTIONS_PER_ROUND = 3
export const DUEL_TARGET = 4          // punkty do zwycięstwa
export const DUEL_MAX_QUESTIONS = 7

export const MIN_PLAYERS = 2
export const MAX_PLAYERS = 8

// Fazy gry (rooms/{kod}/state.phase)
export const PHASES = {
  LOBBY: 'lobby',
  CATEGORY_VOTE: 'category_vote',
  BET: 'bet',
  QUESTION: 'question',
  REVEAL: 'reveal',
  SCOREBOARD: 'scoreboard',
  EVENT: 'event',            // ogłoszenie wydarzenia przez prezentera
  EVENT_PICK: 'event_pick',  // np. wybór ofiary zakłóceń, licytacja
  DUEL_INTRO: 'duel_intro',
  AUDIENCE_BET: 'audience_bet',
  DUEL_BUZZER: 'duel_buzzer',
  DUEL_ANSWER: 'duel_answer',
  DUEL_RESULT: 'duel_result',
  WINNER: 'winner',
}

// Wydarzenia specjalne
export const EVENTS = {
  BLIND: 'blind',
  DOUBLE: 'double',
  GLITCH: 'glitch',
  REVERSE: 'reverse',
  AUCTION: 'auction',
}

export const EVENT_META = {
  [EVENTS.BLIND]: { emoji: '🌑', name: 'Runda w ciemno', desc: 'Najpierw obstawiasz w ciemno — odpowiedzi pokażą się dopiero po 5 sekundach pytania!' },
  [EVENTS.DOUBLE]: { emoji: '💰', name: 'Podwójna stawka', desc: 'Mnożniki ×2, ale minimalny zakład to aż 30% Twojego konta. Odważni wygrywają!' },
  [EVENTS.GLITCH]: { emoji: '📺', name: 'Zakłócenia sygnału', desc: 'Dwaj ostatni w rankingu wybierają ofiarę — jej telefon dostanie zakłócenia!' },
  [EVENTS.REVERSE]: { emoji: '☎️', name: 'Telefon do przyjaciela naopak', desc: 'Lider obstawia za ostatniego gracza — a ostatni za lidera. Powodzenia!' },
  [EVENTS.AUCTION]: { emoji: '🔨', name: 'Licytacja pytania', desc: 'Kto da więcej? Najwyższa oferta kupuje wyłączność na to pytanie!' },
}

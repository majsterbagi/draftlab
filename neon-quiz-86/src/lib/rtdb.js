// Pomocnicze funkcje i hooki do Firebase Realtime Database
import { useEffect, useState } from 'react'
import {
  ref, get, set, update, remove, onValue, onDisconnect,
  serverTimestamp, push,
} from 'firebase/database'
import { db } from './firebase.js'
import { STARTER_QUIZZES } from './starterQuizzes.js'
import { START_SCORE, MAX_PLAYERS, PHASES } from './constants.js'

const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUWXYZ23456789' // bez O/0, I/1 — czytelne z ekranu

export function randomCode(len = 4) {
  let s = ''
  for (let i = 0; i < len; i++) s += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]
  return s
}

export const roomRef = (code, path = '') => ref(db, `rooms/${code}${path ? '/' + path : ''}`)

// --- Pokój ---

export async function createRoom(quizId) {
  let code = randomCode()
  for (let i = 0; i < 5; i++) {
    const snap = await get(roomRef(code))
    if (!snap.exists()) break
    const createdAt = snap.child('createdAt').val() || 0
    // pokój starszy niż 24 h pod tym kodem — czyścimy i przejmujemy kod
    if (Date.now() - createdAt > 24 * 3600 * 1000) {
      await remove(roomRef(code))
      break
    }
    code = randomCode()
  }
  await set(roomRef(code), {
    createdAt: Date.now(),
    quizId,
    state: { phase: PHASES.LOBBY, round: 0, questionIndex: 0 },
  })
  return code
}

export async function fetchRoom(code) {
  const snap = await get(roomRef(code))
  return snap.exists() ? snap.val() : null
}

// --- Gracze ---

export async function joinRoom(code, { nick, avatar }) {
  const room = await fetchRoom(code)
  if (!room) throw new Error('NO_ROOM')

  const players = room.players || {}
  const savedId = localStorage.getItem(`nq86_player_${code}`)

  // powrót rozłączonego gracza — to samo id, konto i awatar zostają
  if (savedId && players[savedId]) {
    await update(roomRef(code, `players/${savedId}`), { connected: true })
    onDisconnect(roomRef(code, `players/${savedId}/connected`)).set(false)
    return { playerId: savedId, player: players[savedId] }
  }
  // powrót po utracie localStorage — dopasowanie po nicku
  const byNick = Object.entries(players).find(([, p]) => p.nick.toLowerCase() === nick.trim().toLowerCase())
  if (byNick) {
    const [pid] = byNick
    localStorage.setItem(`nq86_player_${code}`, pid)
    await update(roomRef(code, `players/${pid}`), { connected: true })
    onDisconnect(roomRef(code, `players/${pid}/connected`)).set(false)
    return { playerId: pid, player: byNick[1] }
  }

  if (room.state?.phase !== PHASES.LOBBY) throw new Error('GAME_STARTED')
  if (Object.keys(players).length >= MAX_PLAYERS) throw new Error('ROOM_FULL')
  if (Object.values(players).some((p) => p.avatar === avatar)) throw new Error('AVATAR_TAKEN')

  const pRef = push(roomRef(code, 'players'))
  const player = {
    nick: nick.trim().slice(0, 16),
    avatar,
    score: START_SCORE,
    prestige: 0,
    streak: 0,
    connected: true,
    joinedAt: serverTimestamp(),
  }
  await set(pRef, player)
  localStorage.setItem(`nq86_player_${code}`, pRef.key)
  onDisconnect(roomRef(code, `players/${pRef.key}/connected`)).set(false)
  return { playerId: pRef.key, player }
}

// --- Akcje graczy ---

export const submitVote = (code, playerId, category) =>
  set(roomRef(code, `votes/${playerId}`), category)

export const submitBet = (code, qKey, playerId, amount) =>
  set(roomRef(code, `bets/${qKey}/${playerId}`), { amount, at: serverTimestamp() })

export const submitAnswer = (code, qKey, playerId, choice) =>
  set(roomRef(code, `answers/${qKey}/${playerId}`), { choice, at: serverTimestamp() })

export const submitEventPick = (code, playerId, value) =>
  set(roomRef(code, `eventPicks/${playerId}`), value)

export const submitAudienceBet = (code, playerId, finalistId) =>
  set(roomRef(code, `audienceBets/${playerId}`), finalistId)

export const submitBuzz = (code, duelQ, playerId) =>
  set(roomRef(code, `buzzes/${duelQ}/${playerId}`), serverTimestamp())

export const submitDuelAnswer = (code, duelQ, playerId, choice) =>
  set(roomRef(code, `duelAnswers/${duelQ}/${playerId}`), { choice, at: serverTimestamp() })

// Gracz zgłasza "gotowość" po odsłonięciu odpowiedzi / na tablicy wyników —
// gdy wszyscy klikną, host automatycznie przechodzi dalej bez ręcznego "Dalej".
export const submitReady = (code, playerId) =>
  set(roomRef(code, `ready/${playerId}`), true)

// --- Hooki na subskrypcje ---

export function useDbValue(path, deps = []) {
  const key = path + '|' + JSON.stringify(deps)
  const [snapshotKey, setSnapshotKey] = useState(key)
  const [value, setValue] = useState(undefined) // undefined = ładowanie, null = brak

  // Gdy ścieżka się zmienia (np. nowe pytanie => nowy qKey), zerujemy wartość
  // OD RAZU w trakcie renderu — nie w useEffect. Inaczej przez jedną klatkę
  // hook zwracałby jeszcze dane POPRZEDNIEGO pytania (np. "wszyscy odpowiedzieli"
  // z poprzedniej rundy), a silnik gry (gameEngine.js) zdążyłby błędnie uznać,
  // że wszyscy już odpowiedzieli na NOWE pytanie, i rozliczyć je od razu —
  // przyznając/zabierając punkty bez faktycznej odpowiedzi graczy.
  if (key !== snapshotKey) {
    setSnapshotKey(key)
    setValue(undefined)
  }

  useEffect(() => {
    if (!db || !path) { setValue(null); return }
    const unsub = onValue(ref(db, path), (snap) => setValue(snap.exists() ? snap.val() : null))
    return unsub
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, ...deps])
  return value
}

export const useRoomState = (code) => useDbValue(code ? `rooms/${code}/state` : null)
export const useRoomPlayers = (code) => useDbValue(code ? `rooms/${code}/players` : null)

// --- Quizy ---

// Dosiewa każdy brakujący zestaw startowy pojedynczo — dzięki temu dodanie
// nowego banku pytań w kodzie od razu pojawia się też w istniejących
// pokojach/bazach, a nie tylko przy zupełnie pierwszym uruchomieniu.
export async function ensureSampleQuiz() {
  for (const [id, quiz] of Object.entries(STARTER_QUIZZES)) {
    const snap = await get(ref(db, `quizzes/${id}`))
    if (!snap.exists()) {
      await set(ref(db, `quizzes/${id}`), { ...quiz, updatedAt: Date.now() })
    }
  }
}

export async function listQuizzes() {
  const snap = await get(ref(db, 'quizzes'))
  return snap.exists() ? snap.val() : {}
}

export const saveQuiz = (id, quiz) => set(ref(db, `quizzes/${id}`), { ...quiz, updatedAt: Date.now() })
export const deleteQuiz = (id) => remove(ref(db, `quizzes/${id}`))
export const fetchQuiz = async (id) => {
  const snap = await get(ref(db, `quizzes/${id}`))
  return snap.exists() ? snap.val() : null
}

// --- Stan gry (zapisuje wyłącznie host) ---

export const writeState = (code, statePatch) => update(roomRef(code, 'state'), statePatch)
export const setState = (code, state) => set(roomRef(code, 'state'), state)
export const clearPath = (code, path) => remove(roomRef(code, path))
export const updatePlayer = (code, playerId, patch) => update(roomRef(code, `players/${playerId}`), patch)

// Silnik gry — działa WYŁĄCZNIE w przeglądarce hosta.
// Host czyta akcje graczy z Firebase, prowadzi maszynę faz i zapisuje stan
// do rooms/{kod}/state. Telefony graczy tylko renderują ten stan.
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  useDbValue, useRoomState, useRoomPlayers, writeState,
  clearPath, updatePlayer, fetchQuiz,
} from './rtdb.js'
import {
  PHASES, EVENTS, BET_TIME, QUESTION_TIME, VOTE_TIME, DUEL_ANSWER_TIME,
  ROUNDS, QUESTIONS_PER_ROUND, MIN_BET, MIN_SCORE, DOUBLE_MIN_BET_FRACTION,
  SPEED_MULT_MAX, SPEED_MULT_MIN, DUEL_TARGET, DUEL_MAX_QUESTIONS,
} from './constants.js'
import { presenterLine } from './presenter.js'
import {
  sfxFanfare, sfxReveal, sfxCorrect, sfxError, sfxEvent, sfxBuzzer, sfxCoin,
} from './sounds.js'

const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5)
const qKeyOf = (round, qi) => `r${round}q${qi}`

function speedMult(elapsedMs) {
  const frac = Math.min(1, Math.max(0, elapsedMs / (QUESTION_TIME * 1000)))
  return SPEED_MULT_MAX - frac * (SPEED_MULT_MAX - SPEED_MULT_MIN)
}

export function useGameEngine(code) {
  const state = useRoomState(code)
  const players = useRoomPlayers(code)
  const [quiz, setQuiz] = useState(null)
  const [presenter, setPresenter] = useState({ line: '', mood: 'normal' })
  const roomMeta = useDbValue(code ? `rooms/${code}/quizId` : null)

  const qKey = state ? qKeyOf(state.round, state.questionIndex) : null
  const votes = useDbValue(code && state?.phase === PHASES.CATEGORY_VOTE ? `rooms/${code}/votes` : null)
  const bets = useDbValue(code && qKey ? `rooms/${code}/bets/${qKey}` : null, [qKey])
  const answers = useDbValue(code && qKey ? `rooms/${code}/answers/${qKey}` : null, [qKey])
  const eventPicks = useDbValue(code ? `rooms/${code}/eventPicks` : null)
  const audienceBets = useDbValue(code ? `rooms/${code}/audienceBets` : null)
  const duelQi = state?.duel?.qIndex
  const buzzes = useDbValue(code && duelQi != null ? `rooms/${code}/buzzes/${duelQi}` : null, [duelQi])
  const duelAnswers = useDbValue(code && duelQi != null ? `rooms/${code}/duelAnswers/${duelQi}` : null, [duelQi])
  // gracze klikają "Dalej" na telefonie po odsłonięciu i na tablicy wyników —
  // gdy wszyscy gotowi, host przechodzi dalej automatycznie (patrz efekt niżej)
  const ready = useDbValue(
    code && (state?.phase === PHASES.REVEAL || state?.phase === PHASES.SCOREBOARD) ? `rooms/${code}/ready` : null,
  )

  const say = useCallback((key, vars, mood = 'normal') => {
    setPresenter({ line: presenterLine(key, vars), mood })
  }, [])

  // wczytaj zestaw pytań
  useEffect(() => {
    if (roomMeta) fetchQuiz(roomMeta).then(setQuiz)
  }, [roomMeta])

  // powitanie nowych graczy w lobby
  const prevPlayerCount = useRef(0)
  useEffect(() => {
    const n = players ? Object.keys(players).length : 0
    if (state?.phase === PHASES.LOBBY && n > prevPlayerCount.current && n > 0) {
      const newest = Object.values(players).sort((a, b) => (b.joinedAt || 0) - (a.joinedAt || 0))[0]
      say('playerJoined', { nick: newest.nick }, 'excited')
    }
    prevPlayerCount.current = n
  }, [players, state?.phase, say])

  const playerList = players
    ? Object.entries(players).map(([id, p]) => ({ id, ...p }))
    : []
  const ranked = [...playerList].sort((a, b) => b.score - a.score)

  // === Przejścia faz ===

  const startVote = useCallback((round) => {
    const used = state?.usedCategories || []
    const all = quiz.categories.map((c) => c.name)
    const fresh = all.filter((c) => !used.includes(c))
    const pool = fresh.length >= 3 ? fresh : all
    const options = shuffle(pool).slice(0, 3)
    clearPath(code, 'votes')
    writeState(code, {
      phase: PHASES.CATEGORY_VOTE,
      round,
      questionIndex: 0,
      voteOptions: options,
      phaseEndsAt: Date.now() + VOTE_TIME * 1000,
      reveal: null,
    })
    sfxFanfare()
  }, [code, quiz, state])

  const startBet = useCallback((st = state) => {
    const round = st.round
    const qi = st.questionIndex
    const catName = st.category
    const cat = quiz.categories.find((c) => c.name === catName)
    const qIdx = st.roundQuestions[qi]
    const q = cat.questions[qIdx]
    const isDouble = st.event?.type === EVENTS.DOUBLE
    clearPath(code, 'eventPicks')
    writeState(code, {
      phase: PHASES.BET,
      question: { category: catName, difficulty: q.difficulty, text: q.text, answers: q.answers },
      correct: null,
      minBetFraction: isDouble ? DOUBLE_MIN_BET_FRACTION : null,
      phaseEndsAt: Date.now() + BET_TIME * 1000,
    })
    say(st.event?.type === EVENTS.AUCTION ? 'eventIntro' : 'betPhase')
  }, [code, quiz, state, say])

  // start pytania — treść i odpowiedzi na ekran
  const startQuestion = useCallback((auctionWinnerId = null) => {
    writeState(code, {
      phase: PHASES.QUESTION,
      questionStartedAt: { '.sv': 'timestamp' },
      phaseEndsAt: Date.now() + QUESTION_TIME * 1000,
      'event/winnerId': auctionWinnerId || null,
    })
  }, [code])

  // === Rozliczenie pytania ===
  const resolveQuestion = useCallback(() => {
    const st = state
    const cat = quiz.categories.find((c) => c.name === st.category)
    const q = cat.questions[st.roundQuestions[st.questionIndex]]
    const ev = st.event || {}
    const isDouble = ev.type === EVENTS.DOUBLE
    const isAuction = ev.type === EVENTS.AUCTION
    const startedAt = st.questionStartedAt || Date.now() - QUESTION_TIME * 1000

    const results = {}
    for (const p of playerList) {
      if (isAuction && p.id !== ev.winnerId) {
        results[p.id] = { bet: 0, delta: 0, ok: null, mult: 0, newScore: p.score, choice: null }
        continue
      }
      const placed = bets?.[p.id]
      const minBet = isDouble ? Math.ceil(p.score * DOUBLE_MIN_BET_FRACTION) : MIN_BET
      const bet = placed ? placed.amount : Math.min(minBet, p.score)
      const ans = answers?.[p.id]
      const ok = ans != null && ans.choice === q.correct
      let mult = 0
      let delta = -bet
      if (ok) {
        mult = speedMult((ans.at || Date.now()) - startedAt) * (isDouble ? 2 : 1)
        delta = Math.round(bet * mult)
      }
      const newScore = Math.max(MIN_SCORE, p.score + delta)
      results[p.id] = {
        bet, delta: newScore - p.score, ok, mult: Math.round(mult * 100) / 100, newScore,
        choice: ans?.choice ?? null,
      }
    }

    // zapis wyników od razu (odporność na odświeżenie hosta) — animacja jest tylko wizualna
    const prevLeader = ranked[0]?.id
    for (const p of playerList) {
      const r = results[p.id]
      updatePlayer(code, p.id, {
        score: r.newScore,
        streak: r.ok ? (p.streak || 0) + 1 : 0,
      })
    }

    // kolejność odsłaniania: od najmniejszej stawki do największej (dramaturgia)
    const order = Object.entries(results)
      .filter(([, r]) => r.ok !== null)
      .sort((a, b) => a[1].bet - b[1].bet)
      .map(([id]) => id)

    clearPath(code, 'ready')
    writeState(code, {
      phase: PHASES.REVEAL,
      correct: q.correct,
      reveal: { results, order },
      phaseEndsAt: null,
    })
    sfxReveal()

    // komentarz prezentera: najodważniejszy zakład / seria / zmiana lidera
    const boldest = order[order.length - 1]
    const anyCorrect = Object.values(results).some((r) => r.ok)
    const newRanked = playerList
      .map((p) => ({ ...p, score: results[p.id].newScore }))
      .sort((a, b) => b.score - a.score)
    setTimeout(() => {
      if (!anyCorrect) say('allWrong')
      else if (newRanked[0].id !== prevLeader) say('leaderChange', { nick: newRanked[0].nick }, 'excited')
      else if (boldest && results[boldest].ok && (players[boldest].streak || 0) + 1 >= 3)
        say('streak', { nick: players[boldest].nick }, 'excited')
      else if (boldest)
        say('highBet', { nick: players[boldest].nick, kwota: results[boldest].bet }, 'excited')
    }, 1500)
  }, [state, quiz, playerList, bets, answers, ranked, players, code, say])

  // === Pojedynek ===

  const startDuelQuestion = useCallback((st = state) => {
    const duel = st.duel
    const qi = duel.qIndex
    const q = quiz.duel[duel.order[qi % duel.order.length]]
    writeState(code, {
      phase: PHASES.DUEL_BUZZER,
      'duel/question': { text: q.text, answers: q.answers },
      'duel/buzzWinner': null,
      phaseEndsAt: Date.now() + 15 * 1000,
    })
  }, [code, quiz, state])

  const resolveDuelAnswer = useCallback(() => {
    const st = state
    const duel = st.duel
    const q = quiz.duel[duel.order[duel.qIndex % duel.order.length]]
    const ansEntry = duelAnswers?.[duel.buzzWinner]
    const ok = ansEntry != null && ansEntry.choice === q.correct
    const scorer = ok ? duel.buzzWinner : (duel.buzzWinner === duel.a ? duel.b : duel.a)
    const scores = { ...duel.scores, [scorer]: (duel.scores?.[scorer] || 0) + 1 }
    writeState(code, {
      phase: PHASES.DUEL_RESULT,
      'duel/scores': scores,
      'duel/lastScorer': scorer,
      'duel/lastCorrect': q.correct,
      'duel/lastOk': ok,
      phaseEndsAt: null,
    })
    ;(ok ? sfxCorrect : sfxError)()
    say('duelPoint', { nick: players[scorer]?.nick || '?' }, 'excited')
  }, [state, quiz, duelAnswers, players, code, say])

  const finishGame = useCallback((winnerId) => {
    // prestiż dla publiczności, która trafiła zwycięzcę
    for (const [pid, betOn] of Object.entries(audienceBets || {})) {
      if (betOn === winnerId && players[pid]) {
        updatePlayer(code, pid, { prestige: (players[pid].prestige || 0) + 1 })
      }
    }
    writeState(code, { phase: PHASES.WINNER, winnerId, phaseEndsAt: null })
    sfxFanfare()
    say('winner', { nick: players[winnerId]?.nick || '?' }, 'excited')
    setTimeout(() => say('goodbye'), 8000)
  }, [audienceBets, players, code, say])

  // Strażnik: każde ujęcie stanu może wywołać przejście tylko RAZ —
  // inaczej timer + "wszyscy odpowiedzieli" + klik hosta rozliczyłyby
  // to samo pytanie wielokrotnie (podwójna punktacja).
  const lastAdvanceKey = useRef(null)

  // === Główna funkcja przejścia "co dalej" ===
  const advance = useCallback(() => {
    if (!state || !quiz) return
    const st = state
    const ph = st.phase
    const advanceKey = [ph, st.round, st.questionIndex, st.phaseEndsAt,
      st.duel?.qIndex, st.duel?.buzzWinner].join('|')
    if (lastAdvanceKey.current === advanceKey) return
    lastAdvanceKey.current = advanceKey

    if (ph === PHASES.LOBBY) {
      // start gry — zaplanuj wydarzenie w środku losowej rundy
      writeState(code, {
        midEvent: { round: 1 + Math.floor(Math.random() * ROUNDS), q: 1 + Math.floor(Math.random() * (QUESTIONS_PER_ROUND - 1)) },
        usedCategories: [], usedEvents: [], event: null,
      })
      say('welcome', {}, 'excited')
      setTimeout(() => startVote(1), 100)
      return
    }

    if (ph === PHASES.CATEGORY_VOTE) {
      // zliczanie głosów, remis = losowanie
      const tally = {}
      for (const c of st.voteOptions) tally[c] = 0
      for (const v of Object.values(votes || {})) if (tally[v] != null) tally[v]++
      const max = Math.max(...Object.values(tally))
      const winners = st.voteOptions.filter((c) => tally[c] === max)
      const category = winners[Math.floor(Math.random() * winners.length)]
      const cat = quiz.categories.find((c) => c.name === category)
      // klucze RTDB nie mogą zawierać . # $ / [ ]
      const catKey = category.replace(/[.#$/\[\]]/g, '_')
      const usedQ = st.usedQuestions?.[catKey] || []
      const available = cat.questions.map((_, i) => i).filter((i) => !usedQ.includes(i))
      const chosen = shuffle(available.length >= QUESTIONS_PER_ROUND ? available : cat.questions.map((_, i) => i))
        .slice(0, QUESTIONS_PER_ROUND)
      writeState(code, {
        category,
        roundQuestions: chosen,
        usedCategories: [...(st.usedCategories || []), category],
        [`usedQuestions/${catKey}`]: [...usedQ, ...chosen],
      })
      // wydarzenie w środku rundy?
      const next = { ...st, category, roundQuestions: chosen }
      maybeEventThenBet(next)
      return
    }

    if (ph === PHASES.EVENT) {
      const ev = st.event
      if (ev.type === EVENTS.GLITCH) {
        writeState(code, { phase: PHASES.EVENT_PICK, phaseEndsAt: Date.now() + 12 * 1000 })
        return
      }
      goAfterEvent(st)
      return
    }

    if (ph === PHASES.EVENT_PICK) {
      // wybór ofiary zakłóceń
      const picks = Object.entries(eventPicks || {}).filter(([pid]) => st.event.pickers.includes(pid)).map(([, v]) => v)
      const candidates = picks.length ? picks : playerList.filter((p) => !st.event.pickers.includes(p.id)).map((p) => p.id)
      const victimId = candidates[Math.floor(Math.random() * candidates.length)]
      writeState(code, { 'event/victimId': victimId })
      goAfterEvent({ ...st, event: { ...st.event, victimId } })
      return
    }

    if (ph === PHASES.BET) {
      if (st.event?.type === EVENTS.AUCTION) {
        // licytacja: najwyższa oferta odpowiada jako jedyna
        const entries = Object.entries(bets || {})
        if (!entries.length) { startQuestion(ranked[0].id); return }
        entries.sort((a, b) => b[1].amount - a[1].amount || a[1].at - b[1].at)
        startQuestion(entries[0][0])
        return
      }
      startQuestion()
      return
    }

    if (ph === PHASES.QUESTION) { resolveQuestion(); return }

    if (ph === PHASES.REVEAL) {
      clearPath(code, 'ready')
      writeState(code, { phase: PHASES.SCOREBOARD, phaseEndsAt: null })
      return
    }

    if (ph === PHASES.SCOREBOARD) {
      const lastQ = st.questionIndex >= QUESTIONS_PER_ROUND - 1
      writeState(code, { event: null }) // wydarzenie zużyte
      if (!lastQ) {
        const next = { ...st, questionIndex: st.questionIndex + 1, event: null }
        writeState(code, { questionIndex: st.questionIndex + 1 })
        maybeEventThenBet(next)
        return
      }
      if (st.round < ROUNDS) {
        // wydarzenie między rundami, potem głosowanie
        const goVote = () => startVote(st.round + 1)
        const stNoEvent = { ...st, event: null }
        if (!announceEventFor(stNoEvent, `vote:${st.round + 1}`)) goVote()
        return
      }
      // finał
      const [a, b] = ranked
      clearPath(code, 'audienceBets')
      writeState(code, {
        phase: PHASES.DUEL_INTRO,
        duel: { a: a.id, b: b.id, scores: { [a.id]: 0, [b.id]: 0 }, qIndex: 0, order: shuffle(quiz.duel.map((_, i) => i)) },
        phaseEndsAt: null,
      })
      sfxFanfare()
      say('duelIntro', {}, 'excited')
      return
    }

    if (ph === PHASES.DUEL_INTRO) {
      const audience = playerList.filter((p) => p.id !== st.duel.a && p.id !== st.duel.b)
      if (audience.length > 0) {
        writeState(code, { phase: PHASES.AUDIENCE_BET, phaseEndsAt: Date.now() + 15 * 1000 })
      } else {
        startDuelQuestion()
      }
      return
    }

    if (ph === PHASES.AUDIENCE_BET) { startDuelQuestion(); return }

    if (ph === PHASES.DUEL_BUZZER) {
      // nikt nie kliknął buzzera — pomijamy pytanie
      writeState(code, { 'duel/qIndex': st.duel.qIndex + 1 })
      startDuelQuestion({ ...st, duel: { ...st.duel, qIndex: st.duel.qIndex + 1 } })
      return
    }

    if (ph === PHASES.DUEL_ANSWER) { resolveDuelAnswer(); return }

    if (ph === PHASES.DUEL_RESULT) {
      const d = st.duel
      const sA = d.scores?.[d.a] || 0
      const sB = d.scores?.[d.b] || 0
      const played = d.qIndex + 1
      if (sA >= DUEL_TARGET || sB >= DUEL_TARGET || (played >= DUEL_MAX_QUESTIONS && sA !== sB)) {
        finishGame(sA >= sB ? d.a : d.b)
        return
      }
      writeState(code, { 'duel/qIndex': d.qIndex + 1 })
      startDuelQuestion({ ...st, duel: { ...d, qIndex: d.qIndex + 1 } })
      return
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, quiz, votes, bets, answers, eventPicks, playerList, ranked, code,
      startVote, startBet, startQuestion, resolveQuestion, startDuelQuestion,
      resolveDuelAnswer, finishGame, say])

  // pomocnicze: ogłoś wydarzenie (jeśli wypada) i przejdź do zakładów
  function maybeEventThenBet(st) {
    const isMid = st.midEvent && st.midEvent.round === st.round && st.midEvent.q === st.questionIndex && !st.event
    if (isMid && announceEventFor(st, 'bet')) return
    startBet(st)
  }

  function announceEventFor(st, afterTag) {
    const type = pickEventFrom(st)
    if (!type) return false
    const ev = { type }
    const rankedNow = [...playerList].sort((a, b) => b.score - a.score)
    if (type === EVENTS.REVERSE) {
      ev.map = {
        [rankedNow[0].id]: rankedNow[rankedNow.length - 1].id,
        [rankedNow[rankedNow.length - 1].id]: rankedNow[0].id,
      }
    }
    if (type === EVENTS.GLITCH) {
      ev.pickers = rankedNow.slice(-2).map((p) => p.id)
      ev.effect = Math.random() < 0.5 ? 'snow' : 'flee'
    }
    clearPath(code, 'eventPicks')
    writeState(code, {
      phase: PHASES.EVENT,
      event: ev,
      usedEvents: [...(st.usedEvents || []), type],
      afterEvent: afterTag,
      phaseEndsAt: null,
    })
    sfxEvent()
    say('eventIntro', {}, 'excited')
    return true
  }

  function pickEventFrom(st) {
    const used = st.usedEvents || []
    const n = playerList.length
    const pool = Object.values(EVENTS).filter((e) => {
      if (used.includes(e)) return false
      if ((e === EVENTS.GLITCH || e === EVENTS.REVERSE) && n < 3) return false
      return true
    })
    return pool.length ? pool[Math.floor(Math.random() * pool.length)] : null
  }

  function goAfterEvent(st) {
    const tag = st.afterEvent || 'bet'
    if (tag.startsWith('vote:')) {
      const round = parseInt(tag.split(':')[1], 10)
      // wydarzenie ma obowiązywać w pierwszym pytaniu nowej rundy — event zostaje w stanie
      startVoteKeepingEvent(round)
    } else {
      startBet(st)
    }
  }

  function startVoteKeepingEvent(round) {
    const used = state?.usedCategories || []
    const all = quiz.categories.map((c) => c.name)
    const fresh = all.filter((c) => !used.includes(c))
    const pool = fresh.length >= 3 ? fresh : all
    clearPath(code, 'votes')
    writeState(code, {
      phase: PHASES.CATEGORY_VOTE,
      round,
      questionIndex: 0,
      voteOptions: shuffle(pool).slice(0, 3),
      phaseEndsAt: Date.now() + VOTE_TIME * 1000,
      reveal: null,
    })
  }

  // === Automatyczne kończenie faz: timer LUB wszyscy wykonali akcję ===

  const advanceRef = useRef(advance)
  advanceRef.current = advance

  // timer fazy
  useEffect(() => {
    if (!state?.phaseEndsAt) return
    const ms = state.phaseEndsAt - Date.now()
    const t = setTimeout(() => advanceRef.current(), Math.max(0, ms))
    return () => clearTimeout(t)
  }, [state?.phase, state?.phaseEndsAt])

  // wszyscy wykonali akcję → koniec fazy przed czasem
  useEffect(() => {
    if (!state || !players) return
    const ids = Object.keys(players)
    const ph = state.phase
    const done = (obj, expected) => expected.length > 0 && expected.every((id) => obj?.[id] != null)

    if (ph === PHASES.CATEGORY_VOTE && done(votes, ids)) advanceRef.current()
    if (ph === PHASES.BET) {
      const ev = state.event
      let expected = ids
      if (ev?.type === EVENTS.REVERSE) {
        // zamienieni obstawiają za siebie nawzajem — zakład ląduje na koncie celu
        expected = ids
      }
      if (done(bets, expected)) advanceRef.current()
    }
    if (ph === PHASES.QUESTION) {
      const expected = state.event?.type === EVENTS.AUCTION && state.event?.winnerId
        ? [state.event.winnerId] : ids
      if (done(answers, expected)) advanceRef.current()
    }
    if (ph === PHASES.EVENT_PICK && done(eventPicks, state.event?.pickers || [])) advanceRef.current()
    if (ph === PHASES.AUDIENCE_BET) {
      const audience = ids.filter((id) => id !== state.duel?.a && id !== state.duel?.b)
      if (done(audienceBets, audience)) advanceRef.current()
    }
    if (ph === PHASES.DUEL_ANSWER && duelAnswers?.[state.duel?.buzzWinner] != null) advanceRef.current()
    if ((ph === PHASES.REVEAL || ph === PHASES.SCOREBOARD) && done(ready, ids)) advanceRef.current()
  }, [state, players, votes, bets, answers, eventPicks, audienceBets, duelAnswers, ready])

  // buzzer: pierwszy klik (po serverTimestamp) wygrywa
  useEffect(() => {
    if (state?.phase !== PHASES.DUEL_BUZZER || !buzzes) return
    const entries = Object.entries(buzzes).filter(([pid]) => pid === state.duel.a || pid === state.duel.b)
    if (!entries.length) return
    entries.sort((a, b) => a[1] - b[1])
    const winner = entries[0][0]
    sfxBuzzer()
    writeState(code, {
      phase: PHASES.DUEL_ANSWER,
      'duel/buzzWinner': winner,
      phaseEndsAt: Date.now() + DUEL_ANSWER_TIME * 1000,
    })
  }, [buzzes, state?.phase, code, state?.duel?.a, state?.duel?.b])

  // dźwięk monety, gdy wpada zakład
  const betCount = bets ? Object.keys(bets).length : 0
  const prevBetCount = useRef(0)
  useEffect(() => {
    if (state?.phase === PHASES.BET && betCount > prevBetCount.current) sfxCoin()
    prevBetCount.current = betCount
  }, [betCount, state?.phase])

  return { state, players: playerList, ranked, quiz, votes, bets, answers,
           eventPicks, audienceBets, ready, presenter, advance, say }
}

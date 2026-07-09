import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { QRCodeSVG } from 'qrcode.react'
import confetti from 'canvas-confetti'
import { createRoom, ensureSampleQuiz, listQuizzes, clearPath } from '../lib/rtdb.js'
import { useGameEngine } from '../lib/gameEngine.js'
import { PHASES, EVENTS, EVENT_META, BET_TIME, QUESTION_TIME, VOTE_TIME, DUEL_ANSWER_TIME, MIN_PLAYERS, DUEL_TARGET } from '../lib/constants.js'
import { Presenter, TimerBar, AvatarChip, Stars } from '../components/shared.jsx'
import { avatarById } from '../lib/avatars.js'
import { setMuted, isMuted } from '../lib/sounds.js'

const PHASE_DURATION = {
  [PHASES.BET]: BET_TIME,
  [PHASES.QUESTION]: QUESTION_TIME,
  [PHASES.CATEGORY_VOTE]: VOTE_TIME,
  [PHASES.DUEL_ANSWER]: DUEL_ANSWER_TIME,
  [PHASES.EVENT_PICK]: 12,
  [PHASES.AUDIENCE_BET]: 15,
  [PHASES.DUEL_BUZZER]: 15,
}

export default function Host() {
  const [code, setCode] = useState(() => sessionStorage.getItem('nq86_host_room') || null)
  const [quizzes, setQuizzes] = useState(null)
  const [quizId, setQuizId] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    ensureSampleQuiz()
      .then(listQuizzes)
      .then((q) => {
        setQuizzes(q)
        setQuizId(Object.keys(q)[0])
      })
      .catch((e) => setError(String(e)))
  }, [])

  const start = async () => {
    try {
      const c = await createRoom(quizId)
      sessionStorage.setItem('nq86_host_room', c)
      setCode(c)
    } catch (e) {
      setError('Nie udało się utworzyć pokoju: ' + e.message)
    }
  }

  if (error) return <HostShell><div className="neon-panel p-8 text-2xl text-neon-red relative z-10">📡 {error}</div></HostShell>
  if (!code) {
    return (
      <HostShell>
        <div className="neon-panel p-10 text-center relative z-10 max-w-lg">
          <h1 className="font-display neon-text-pink text-2xl mb-8">NOWA GRA</h1>
          {quizzes === null ? (
            <p className="text-2xl text-purple-300 animate-pulse">Łączenie z Firebase…</p>
          ) : (
            <>
              <label className="block text-2xl text-purple-200 mb-2">Zestaw pytań:</label>
              <select
                value={quizId || ''}
                onChange={(e) => setQuizId(e.target.value)}
                className="w-full bg-black/60 border border-neon-violet rounded-lg p-3 text-2xl mb-8"
              >
                {Object.entries(quizzes).map(([id, q]) => (
                  <option key={id} value={id}>{q.name}</option>
                ))}
              </select>
              <button onClick={start} className="neon-btn-pink w-full">🎬 Otwórz studio</button>
            </>
          )}
        </div>
      </HostShell>
    )
  }
  return <HostGame code={code} onExit={() => { sessionStorage.removeItem('nq86_host_room'); setCode(null) }} />
}

function HostShell({ children }) {
  return (
    <div className="min-h-screen crt relative flex items-center justify-center p-6">
      <div className="synthwave-grid" />
      {children}
    </div>
  )
}

function HostGame({ code, onExit }) {
  const g = useGameEngine(code)
  const { state, players, ranked, ready, presenter, advance } = g
  const [muted, setMutedUi] = useState(isMuted())
  const [confirmingExit, setConfirmingExit] = useState(false)

  if (!state) {
    return <HostShell><p className="text-3xl text-purple-300 animate-pulse relative z-10">Wczytywanie pokoju {code}…</p></HostShell>
  }

  const ph = state.phase
  const duration = PHASE_DURATION[ph]

  // Usuwa pokój z Firebase i wraca do ekranu tworzenia gry.
  const cleanupAndExit = async () => {
    await clearPath(code, '')
    onExit()
  }

  return (
    <div className="min-h-screen crt relative flex flex-col p-6 gap-4 overflow-hidden">
      <div className="synthwave-grid" />

      {/* Górna belka */}
      <header className="relative z-10 flex items-center justify-between gap-4">
        <div className="font-display text-sm neon-flicker">
          <span className="neon-text-pink">NEON</span> <span className="neon-text-cyan">QUIZ</span>
        </div>
        <div className="flex items-center gap-4">
          {ph !== PHASES.LOBBY && ph !== PHASES.WINNER && (
            <div className="font-display text-xs text-purple-300">
              {state.round ? `RUNDA ${state.round}/3` : ''}{ph.startsWith('duel') || ph === 'audience_bet' ? 'FINAŁ' : ''}
            </div>
          )}
          <div className="font-display text-xs neon-text-cyan">POKÓJ: {code}</div>
          <button
            onClick={() => { setMuted(!muted); setMutedUi(!muted) }}
            className="text-2xl" title="Dźwięk"
          >{muted ? '🔇' : '🔊'}</button>
          {ph !== PHASES.WINNER && (
            <button
              onClick={() => setConfirmingExit(true)}
              className="font-display text-xs text-neon-red/80 hover:text-neon-red transition-colors"
              title="Zakończ grę"
            >
              🚪 ZAKOŃCZ
            </button>
          )}
        </div>
      </header>

      {confirmingExit && (
        <div className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-6">
          <div className="neon-panel border-neon-red p-8 max-w-sm text-center flex flex-col gap-5">
            <p className="text-2xl text-purple-100">Zakończyć grę teraz? Pokój zostanie usunięty, a gracze rozłączeni.</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setConfirmingExit(false)} className="neon-btn-cyan">Anuluj</button>
              <button onClick={cleanupAndExit} className="neon-btn border-neon-red text-neon-red shadow-none">Tak, zakończ</button>
            </div>
          </div>
        </div>
      )}

      {duration && state.phaseEndsAt && (
        <div className="relative z-10"><TimerBar endsAt={state.phaseEndsAt} duration={duration} /></div>
      )}

      {/* Główna scena */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center gap-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={ph + (state.questionIndex ?? '') + (state.duel?.qIndex ?? '')}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            className="w-full max-w-5xl flex flex-col items-center gap-6"
          >
            <HostScene g={g} code={code} />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Dolna belka: prezenter + sterowanie */}
      <footer className="relative z-10 flex items-end justify-between gap-4">
        <Presenter line={presenter.line} mood={presenter.mood} />
        <div className="flex gap-3">
          {ph === PHASES.WINNER && (
            <button onClick={cleanupAndExit} className="neon-btn-cyan">🚪 Nowa gra</button>
          )}
          {ph !== PHASES.WINNER && (
            <button
              onClick={advance}
              disabled={ph === PHASES.LOBBY && players.length < MIN_PLAYERS}
              className="neon-btn-pink disabled:opacity-30"
            >
              {ph === PHASES.LOBBY ? `▶ Start (${players.length}/${MIN_PLAYERS}+ graczy)` : 'Dalej ▶'}
            </button>
          )}
        </div>
      </footer>
    </div>
  )
}

// ==== Sceny poszczególnych faz ====

function HostScene({ g, code }) {
  const { state } = g
  switch (state.phase) {
    case PHASES.LOBBY: return <SceneLobby g={g} code={code} />
    case PHASES.CATEGORY_VOTE: return <SceneVote g={g} />
    case PHASES.BET: return <SceneBet g={g} />
    case PHASES.QUESTION: return <SceneQuestion g={g} />
    case PHASES.REVEAL: return <SceneReveal g={g} />
    case PHASES.SCOREBOARD: return <SceneScoreboard g={g} />
    case PHASES.EVENT: return <SceneEvent g={g} />
    case PHASES.EVENT_PICK: return <SceneEventPick g={g} />
    case PHASES.DUEL_INTRO: return <SceneDuelIntro g={g} />
    case PHASES.AUDIENCE_BET: return <SceneAudienceBet g={g} />
    case PHASES.DUEL_BUZZER:
    case PHASES.DUEL_ANSWER:
    case PHASES.DUEL_RESULT: return <SceneDuel g={g} />
    case PHASES.WINNER: return <SceneWinner g={g} />
    default: return null
  }
}

function SceneLobby({ g, code }) {
  const joinUrl = `${location.origin}${location.pathname}#/play?room=${code}`
  return (
    <div className="w-full grid md:grid-cols-[300px_1fr] gap-8 items-center">
      <div className="neon-panel p-6 flex flex-col items-center gap-4">
        <div className="font-display text-4xl neon-text-amber tracking-widest">{code}</div>
        <div className="bg-white p-3 rounded-lg">
          <QRCodeSVG value={joinUrl} size={180} />
        </div>
        <p className="text-xl text-purple-300 text-center break-all">{joinUrl}</p>
      </div>
      <div className="flex flex-wrap gap-6 justify-center">
        <AnimatePresence>
          {g.players.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ x: 400, opacity: 0, rotate: 12 }}
              animate={{ x: 0, opacity: 1, rotate: 0 }}
              transition={{ type: 'spring', bounce: 0.5, delay: i * 0.05 }}
            >
              <AvatarChip avatarId={p.avatar} nick={p.nick} size="lg" dimmed={!p.connected} />
            </motion.div>
          ))}
        </AnimatePresence>
        {g.players.length === 0 && (
          <p className="text-3xl text-purple-400 animate-pulse">Czekamy na graczy… zeskanujcie kod!</p>
        )}
      </div>
    </div>
  )
}

function SceneVote({ g }) {
  const { state, votes, players } = g
  const tally = {}
  for (const v of Object.values(votes || {})) tally[v] = (tally[v] || 0) + 1
  return (
    <>
      <h2 className="font-display text-xl neon-text-cyan">RUNDA {state.round} — GŁOSUJCIE NA KATEGORIĘ!</h2>
      <div className="grid sm:grid-cols-3 gap-6 w-full">
        {(state.voteOptions || []).map((c, i) => (
          <motion.div
            key={c}
            initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.15, type: 'spring' }}
            className="neon-panel p-6 text-center"
          >
            <div className="text-3xl mb-3">{c}</div>
            <div className="font-display text-2xl neon-text-amber">{tally[c] || 0}</div>
            <div className="text-lg text-purple-400">głosów</div>
          </motion.div>
        ))}
      </div>
      <p className="text-2xl text-purple-300">Zagłosowało: {Object.keys(votes || {}).length}/{players.length}</p>
    </>
  )
}

function SceneBet({ g }) {
  const { state, bets, players } = g
  const ev = state.event
  const isAuction = ev?.type === EVENTS.AUCTION
  return (
    <>
      {ev && <EventBadge type={ev.type} />}
      <h2 className="font-display text-lg neon-text-pink">{isAuction ? '🔨 LICYTACJA PYTANIA' : '🤫 TAJNE ZAKŁADY'}</h2>
      <div className="neon-panel px-10 py-8 text-center">
        <div className="text-2xl text-purple-300 mb-2">Kategoria</div>
        <div className="text-5xl mb-4 neon-text-cyan">{state.question?.category}</div>
        <Stars n={state.question?.difficulty || 1} />
      </div>
      <div className="flex flex-wrap gap-4 justify-center">
        {players.map((p) => (
          <AvatarChip key={p.id} avatarId={p.avatar} nick={p.nick}
            badge={bets?.[p.id] ? '✅' : '…'} dimmed={!bets?.[p.id]} />
        ))}
      </div>
      <p className="text-xl text-purple-400">Widać tylko KTO obstawił — stawki pozostają tajne!</p>
    </>
  )
}

function SceneQuestion({ g }) {
  const { state, answers, players } = g
  const q = state.question
  const ev = state.event
  const [answersVisible, setAnswersVisible] = useState(ev?.type !== EVENTS.BLIND)
  useEffect(() => {
    if (ev?.type !== EVENTS.BLIND) return
    const t = setTimeout(() => setAnswersVisible(true), 5000)
    return () => clearTimeout(t)
  }, [ev?.type])
  const colors = ['border-neon-pink text-neon-pink', 'border-neon-cyan text-neon-cyan', 'border-neon-amber text-neon-amber', 'border-neon-green text-neon-green']
  const letters = ['A', 'B', 'C', 'D']
  const auctionWinner = ev?.type === EVENTS.AUCTION ? players.find((p) => p.id === ev.winnerId) : null
  return (
    <>
      {auctionWinner && (
        <div className="text-2xl neon-text-amber">🔨 Pytanie kupił(a): {auctionWinner.nick} — odpowiada JAKO JEDYNY!</div>
      )}
      <div className="neon-panel px-10 py-6 text-center w-full">
        <div className="text-4xl leading-snug">{q?.text}</div>
      </div>
      <div className="grid sm:grid-cols-2 gap-4 w-full">
        {(q?.answers || []).map((a, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: i % 2 ? 40 : -40 }}
            animate={answersVisible ? { opacity: 1, x: 0 } : { opacity: 0 }}
            transition={{ delay: answersVisible ? i * 0.1 : 0 }}
            className={`neon-panel border-2 ${colors[i]} p-5 text-3xl flex gap-4 items-center`}
          >
            <span className="font-display text-lg">{letters[i]}</span> {answersVisible ? a : '· · ·'}
          </motion.div>
        ))}
      </div>
      {!answersVisible && <div className="text-3xl neon-text-pink animate-pulse">🌑 Odpowiedzi za chwilę…</div>}
      <div className="flex gap-3">
        {players.map((p) => (
          <AvatarChip key={p.id} size="sm" avatarId={p.avatar} badge={answers?.[p.id] ? '⚡' : null}
            dimmed={ev?.type === EVENTS.AUCTION && p.id !== ev.winnerId} />
        ))}
      </div>
    </>
  )
}

function SceneReveal({ g }) {
  const { state, players, ready } = g
  const q = state.question
  const rv = state.reveal
  const [step, setStep] = useState(0) // 0 = pokaz poprawnej, potem stawki po kolei
  useEffect(() => {
    const total = (rv?.order?.length || 0) + 1
    if (step >= total) return
    const t = setTimeout(() => setStep((s) => s + 1), step === 0 ? 2000 : 1800)
    return () => clearTimeout(t)
  }, [step, rv])
  const letters = ['A', 'B', 'C', 'D']
  const didNotAnswer = players.filter((p) => {
    const r = rv?.results?.[p.id]
    return r && r.ok !== null && r.choice == null
  })
  return (
    <>
      <h2 className="font-display text-lg neon-text-amber">WIELKIE ODSŁONIĘCIE</h2>
      <div className="grid sm:grid-cols-2 gap-3 w-full">
        {(q?.answers || []).map((a, i) => {
          // kto wybrał tę odpowiedź — widoczne od razu, razem z poprawną odpowiedzią
          const pickers = players.filter((p) => rv?.results?.[p.id]?.choice === i)
          return (
            <div key={i}
              className={`neon-panel p-4 text-2xl transition-all duration-500 ${
                i === state.correct
                  ? 'border-neon-green shadow-[0_0_25px_rgba(57,255,136,.6)] neon-text-green scale-[1.02]'
                  : 'opacity-30'
              }`}
            >
              <div>
                <span className="font-display text-base mr-3">{letters[i]}</span>{a}
                {i === state.correct && ' ✔'}
              </div>
              {pickers.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {pickers.map((p) => <AvatarChip key={p.id} avatarId={p.avatar} size="sm" />)}
                </div>
              )}
            </div>
          )
        })}
      </div>
      {didNotAnswer.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 text-xl text-purple-400">
          <span>Bez odpowiedzi:</span>
          {didNotAnswer.map((p) => <AvatarChip key={p.id} avatarId={p.avatar} size="sm" dimmed />)}
        </div>
      )}
      <div className="flex flex-wrap gap-4 justify-center w-full">
        {(rv?.order || []).map((pid, i) => {
          const p = players.find((x) => x.id === pid)
          const r = rv.results[pid]
          if (!p || !r) return null
          const revealed = step > i
          return (
            <motion.div
              key={pid}
              animate={revealed ? { scale: [0.7, 1.15, 1] } : {}}
              className={`neon-panel p-4 min-w-[140px] text-center transition-opacity ${revealed ? '' : 'opacity-40'}`}
            >
              <AvatarChip avatarId={p.avatar} nick={p.nick} size="sm" />
              {revealed ? (
                <div className={`font-display text-sm mt-2 ${r.ok ? 'neon-text-green' : 'text-neon-red'}`}>
                  {r.ok ? `+${r.delta}` : r.delta}
                  <div className="text-purple-300 font-body text-lg mt-1">
                    stawka {r.bet}{r.ok ? ` ×${r.mult}` : ' 💥'}
                  </div>
                  <div className="font-body text-lg mt-1 text-purple-300">
                    {r.choice != null ? `odpowiedź ${letters[r.choice]}` : 'brak odpowiedzi'}
                  </div>
                </div>
              ) : (
                <div className="text-3xl mt-2 animate-pulse">❓</div>
              )}
            </motion.div>
          )
        })}
      </div>
      <ReadyCounter ready={ready} total={players.length} />
    </>
  )
}

function SceneScoreboard({ g }) {
  const { ranked, players, ready } = g
  return (
    <>
      <h2 className="font-display text-xl neon-text-cyan">TABLICA WYNIKÓW</h2>
      <div className="w-full max-w-2xl flex flex-col gap-3">
        {ranked.map((p, i) => (
          <motion.div key={p.id} layout layoutId={p.id}
            transition={{ type: 'spring', bounce: 0.3 }}
            className={`neon-panel flex items-center gap-4 px-6 py-3 ${i === 0 ? 'border-neon-amber shadow-[0_0_20px_rgba(255,200,50,.4)]' : ''}`}
          >
            <span className="font-display text-lg w-10 neon-text-amber">{i + 1}.</span>
            <AvatarChip avatarId={p.avatar} size="sm" />
            <span className="text-3xl flex-1">{p.nick}</span>
            {p.streak >= 3 && <span className="text-2xl" title="seria">🔥{p.streak}</span>}
            <motion.span key={p.score} initial={{ scale: 1.4 }} animate={{ scale: 1 }}
              className="font-display text-lg neon-text-cyan">{p.score}</motion.span>
          </motion.div>
        ))}
      </div>
      <ReadyCounter ready={ready} total={players.length} />
    </>
  )
}

// Widoczny na hoście postęp graczy klikających "Dalej" na telefonie —
// gdy wszyscy gotowi, gra przechodzi dalej automatycznie.
function ReadyCounter({ ready, total }) {
  const count = ready ? Object.keys(ready).length : 0
  return <p className="text-xl text-purple-400">Gotowi: {count}/{total}</p>
}

function EventBadge({ type }) {
  const m = EVENT_META[type]
  if (!m) return null
  return (
    <div className="neon-panel border-neon-amber px-5 py-2 text-2xl neon-text-amber">
      {m.emoji} {m.name}
    </div>
  )
}

function SceneEvent({ g }) {
  const m = EVENT_META[g.state.event?.type]
  return (
    <motion.div initial={{ rotateY: 90 }} animate={{ rotateY: 0 }} className="neon-panel border-neon-amber p-12 text-center max-w-2xl">
      <div className="font-display text-sm neon-text-pink mb-6">⚡ CHWILA Z PREZENTEREM ⚡</div>
      <div className="text-7xl mb-4">{m?.emoji}</div>
      <div className="font-display text-xl neon-text-amber mb-6">{m?.name}</div>
      <p className="text-3xl text-purple-200 leading-relaxed">{m?.desc}</p>
    </motion.div>
  )
}

function SceneEventPick({ g }) {
  const { state, players, eventPicks } = g
  const pickers = (state.event?.pickers || []).map((id) => players.find((p) => p.id === id)).filter(Boolean)
  return (
    <>
      <h2 className="font-display text-lg neon-text-amber">📺 KTO STRACI SYGNAŁ?</h2>
      <p className="text-3xl text-purple-200">Cel wybierają: {pickers.map((p) => p.nick).join(' i ')}</p>
      <div className="flex gap-4">
        {pickers.map((p) => (
          <AvatarChip key={p.id} avatarId={p.avatar} nick={p.nick} badge={eventPicks?.[p.id] ? '✅' : '🤔'} />
        ))}
      </div>
    </>
  )
}

function SceneDuelIntro({ g }) {
  const { state, players } = g
  const a = players.find((p) => p.id === state.duel?.a)
  const b = players.find((p) => p.id === state.duel?.b)
  return (
    <>
      <h2 className="font-display text-2xl neon-text-pink neon-flicker">POJEDYNEK POD NEONAMI</h2>
      <div className="flex items-center gap-10">
        <motion.div initial={{ x: -200 }} animate={{ x: 0 }} transition={{ type: 'spring' }}>
          <AvatarChip avatarId={a?.avatar} nick={a?.nick} size="lg" />
        </motion.div>
        <div className="font-display text-4xl neon-text-amber">VS</div>
        <motion.div initial={{ x: 200 }} animate={{ x: 0 }} transition={{ type: 'spring' }}>
          <AvatarChip avatarId={b?.avatar} nick={b?.nick} size="lg" />
        </motion.div>
      </div>
      <p className="text-2xl text-purple-300">Pierwszy z {DUEL_TARGET} punktami zostaje MISTRZEM. Buzzery gotowe!</p>
    </>
  )
}

function SceneAudienceBet({ g }) {
  const { state, players, audienceBets } = g
  const a = players.find((p) => p.id === state.duel?.a)
  const b = players.find((p) => p.id === state.duel?.b)
  const audience = players.filter((p) => p.id !== state.duel?.a && p.id !== state.duel?.b)
  const count = (fid) => Object.values(audienceBets || {}).filter((v) => v === fid).length
  return (
    <>
      <h2 className="font-display text-lg neon-text-cyan">🎰 ZAKŁADY PUBLICZNOŚCI</h2>
      <div className="flex items-center gap-12">
        <div className="text-center">
          <AvatarChip avatarId={a?.avatar} nick={a?.nick} size="lg" />
          <div className="font-display text-2xl neon-text-amber mt-2">{count(state.duel?.a)}</div>
        </div>
        <span className="text-4xl">🆚</span>
        <div className="text-center">
          <AvatarChip avatarId={b?.avatar} nick={b?.nick} size="lg" />
          <div className="font-display text-2xl neon-text-amber mt-2">{count(state.duel?.b)}</div>
        </div>
      </div>
      <p className="text-2xl text-purple-300">
        Publiczność typuje zwycięzcę ({Object.keys(audienceBets || {}).length}/{audience.length}) — trafienie daje punkt prestiżu!
      </p>
    </>
  )
}

function SceneDuel({ g }) {
  const { state, players } = g
  const d = state.duel
  const a = players.find((p) => p.id === d?.a)
  const b = players.find((p) => p.id === d?.b)
  const sA = d?.scores?.[d?.a] || 0
  const sB = d?.scores?.[d?.b] || 0
  const answering = state.phase === PHASES.DUEL_ANSWER ? players.find((p) => p.id === d.buzzWinner) : null
  const audience = players.filter((p) => p.id !== d?.a && p.id !== d?.b)
  const letters = ['A', 'B', 'C', 'D']
  return (
    <>
      <div className="flex items-center gap-8 w-full max-w-3xl">
        <AvatarChip avatarId={a?.avatar} nick={a?.nick} />
        <div className="flex-1">
          <div className="flex justify-between font-display text-2xl mb-1">
            <span className="neon-text-pink">{sA}</span>
            <span className="text-purple-400 text-sm self-center">pytanie {(d?.qIndex || 0) + 1}</span>
            <span className="neon-text-cyan">{sB}</span>
          </div>
          <div className="h-4 rounded-full bg-black/60 border border-purple-700 overflow-hidden flex">
            <motion.div layout className="h-full bg-neon-pink shadow-neon-pink"
              style={{ width: `${(sA / (sA + sB || 1)) * 100}%` }} transition={{ type: 'spring' }} />
            <motion.div layout className="h-full bg-neon-cyan shadow-neon-cyan flex-1" />
          </div>
        </div>
        <AvatarChip avatarId={b?.avatar} nick={b?.nick} />
      </div>

      <div className="neon-panel px-10 py-6 text-center w-full max-w-3xl">
        <div className="text-4xl">{d?.question?.text}</div>
      </div>

      {state.phase === PHASES.DUEL_BUZZER && (
        <div className="font-display text-2xl neon-text-amber animate-pulse">⚡ BUZZERY! Kto pierwszy?!</div>
      )}
      {state.phase === PHASES.DUEL_ANSWER && (
        <div className="text-3xl neon-text-green">🎤 Odpowiada: {answering?.nick} ({DUEL_ANSWER_TIME} s)</div>
      )}
      {state.phase === PHASES.DUEL_RESULT && (
        <div className="grid sm:grid-cols-2 gap-3 w-full max-w-3xl">
          {(d?.question?.answers || []).map((ans, i) => (
            <div key={i} className={`neon-panel p-3 text-2xl ${i === d.lastCorrect ? 'border-neon-green neon-text-green' : 'opacity-40'}`}>
              <span className="font-display text-sm mr-2">{letters[i]}</span>{ans}
            </div>
          ))}
          <div className="sm:col-span-2 text-center text-3xl neon-text-amber">
            Punkt dla: {players.find((p) => p.id === d.lastScorer)?.nick} {d.lastOk ? '🎯' : '(rywal spudłował!)'}
          </div>
        </div>
      )}

      {audience.length > 0 && (
        <div className="flex gap-3 mt-2">
          {audience.map((p) => (
            <motion.div key={p.id}
              animate={state.phase === PHASES.DUEL_RESULT ? { y: [0, -14, 0] } : {}}
              transition={{ repeat: state.phase === PHASES.DUEL_RESULT ? 3 : 0, duration: 0.4 }}
            >
              <AvatarChip avatarId={p.avatar} size="sm" />
            </motion.div>
          ))}
        </div>
      )}
    </>
  )
}

function SceneWinner({ g }) {
  const { state, players } = g
  const winner = players.find((p) => p.id === state.winnerId)
  const a = avatarById(winner?.avatar)
  const typers = players.filter((p) => (p.prestige || 0) > 0).sort((x, y) => y.prestige - x.prestige)
  useEffect(() => {
    const iv = setInterval(() => {
      confetti({ particleCount: 80, spread: 100, origin: { y: 0.4 }, colors: ['#ff2fb3', '#22e0ff', '#ffc832', '#a855f7'] })
    }, 1200)
    return () => clearInterval(iv)
  }, [])
  return (
    <>
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', bounce: 0.5 }}>
        <AvatarChip avatarId={winner?.avatar} size="lg" />
      </motion.div>
      <h1 className="font-display text-2xl sm:text-4xl neon-text-pink neon-flicker text-center leading-relaxed">
        MISTRZ<br /><span className="neon-text-pink">NEON</span> <span className="neon-text-cyan">QUIZ</span>
      </h1>
      <div className="text-5xl" style={{ color: a.color }}>{winner?.nick}</div>
      {typers.length > 0 && (
        <div className="neon-panel p-4 mt-4 text-center">
          <div className="font-display text-xs neon-text-cyan mb-2">🎰 NAJLEPSI TYPERZY</div>
          {typers.map((p) => (
            <div key={p.id} className="text-2xl">{p.nick} — {p.prestige} ⭐</div>
          ))}
        </div>
      )}
    </>
  )
}

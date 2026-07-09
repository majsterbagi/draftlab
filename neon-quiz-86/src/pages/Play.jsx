import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  joinRoom, useRoomState, useRoomPlayers, useDbValue,
  submitVote, submitBet, submitAnswer, submitEventPick, submitAudienceBet,
  submitBuzz, submitDuelAnswer, submitReady,
} from '../lib/rtdb.js'
import {
  PHASES, EVENTS, EVENT_META, MIN_BET, MAX_BET_FRACTION,
  BET_TIME, QUESTION_TIME, VOTE_TIME, DUEL_ANSWER_TIME,
} from '../lib/constants.js'
import { AVATARS, avatarById } from '../lib/avatars.js'
import { AvatarChip, TimerBar } from '../components/shared.jsx'
import { sfxCoin, sfxCorrect, sfxError, sfxBuzzer } from '../lib/sounds.js'

const ERROR_MSG = {
  NO_ROOM: 'Nie ma takiego pokoju. Sprawdź kod!',
  GAME_STARTED: 'Gra już trwa — nie można dołączyć.',
  ROOM_FULL: 'Pokój jest pełny (max 8 graczy).',
  AVATAR_TAKEN: 'Ten awatar jest już zajęty!',
}

export default function Play() {
  const [params] = useSearchParams()
  const [code, setCode] = useState((params.get('room') || '').toUpperCase())
  const [playerId, setPlayerId] = useState(null)

  if (!playerId) {
    return <JoinScreen initialCode={code} onJoined={(c, pid) => { setCode(c); setPlayerId(pid) }} />
  }
  return <PlayerGame code={code} playerId={playerId} />
}

function JoinScreen({ initialCode, onJoined }) {
  const [code, setCode] = useState(initialCode)
  const [nick, setNick] = useState(localStorage.getItem('nq86_nick') || '')
  const [avatar, setAvatar] = useState(null)
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)
  const players = useRoomPlayers(code.length === 4 ? code : null)
  const taken = new Set(Object.values(players || {}).map((p) => p.avatar))

  const join = async () => {
    setError(null); setBusy(true)
    try {
      const { playerId } = await joinRoom(code, { nick, avatar })
      localStorage.setItem('nq86_nick', nick)
      onJoined(code, playerId)
    } catch (e) {
      setError(ERROR_MSG[e.message] || 'Błąd połączenia. Spróbuj ponownie.')
    } finally { setBusy(false) }
  }

  return (
    <div className="safe-area-shell min-h-screen relative flex flex-col items-center justify-center gap-5">
      <div className="synthwave-grid" />
      <h1 className="font-display text-xl relative z-10">
        <span className="neon-text-pink">NEON</span> <span className="neon-text-cyan">QUIZ</span>
      </h1>
      <div className="neon-panel p-6 w-full max-w-sm flex flex-col gap-4 relative z-10">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 4))}
          placeholder="KOD POKOJU"
          className="bg-black/60 border-2 border-neon-cyan rounded-lg p-4 text-center font-display text-xl tracking-[0.5em] text-neon-cyan placeholder:text-purple-700 placeholder:tracking-normal"
        />
        <input
          value={nick}
          onChange={(e) => setNick(e.target.value.slice(0, 16))}
          placeholder="Twój nick"
          className="bg-black/60 border-2 border-neon-violet rounded-lg p-4 text-2xl text-center"
        />
        <div>
          <p className="text-xl text-purple-300 mb-2 text-center">Wybierz awatara:</p>
          <div className="grid grid-cols-4 gap-3">
            {AVATARS.map((a) => {
              const isTaken = taken.has(a.id)
              return (
                <button
                  key={a.id}
                  disabled={isTaken}
                  onClick={() => setAvatar(a.id)}
                  className={`rounded-xl p-2 border-2 text-3xl transition-all ${
                    avatar === a.id ? 'scale-110' : 'opacity-80'
                  } ${isTaken ? 'opacity-20 grayscale' : ''}`}
                  style={{ borderColor: avatar === a.id ? a.color : '#2a1b55', background: avatar === a.id ? `${a.color}33` : 'transparent' }}
                  title={a.name}
                >
                  {a.emoji}
                  <div className="text-xs text-purple-300 font-body">{a.name}</div>
                </button>
              )
            })}
          </div>
        </div>
        {error && <p className="text-neon-red text-xl text-center">⚠ {error}</p>}
        <button
          onClick={join}
          disabled={busy || code.length !== 4 || !nick.trim() || !avatar}
          className="neon-btn-pink disabled:opacity-30"
        >
          {busy ? 'Wchodzę…' : '🎤 Wchodzę do studia!'}
        </button>
      </div>
    </div>
  )
}

function PlayerGame({ code, playerId }) {
  const state = useRoomState(code)
  const players = useRoomPlayers(code)
  const me = players?.[playerId]

  // useDbValue zwraca undefined podczas ładowania, ale null gdy dane naprawdę
  // nie istnieją — skoro dotarliśmy tu po udanym dołączeniu, pokój istniał.
  // Jeśli teraz jest null, to host zakończył grę i usunął pokój.
  if (state === null) {
    return (
      <PhoneShell>
        <div className="text-center">
          <div className="text-7xl mb-4">🚪</div>
          <p className="text-3xl neon-text-pink">Gra została zakończona przez hosta.</p>
          <p className="text-2xl text-purple-300 mt-2">Dziękujemy za grę!</p>
        </div>
      </PhoneShell>
    )
  }
  if (!state || !me) {
    return <PhoneShell><p className="text-2xl text-purple-300 animate-pulse">Łączenie ze studiem…</p></PhoneShell>
  }
  return (
    <PhoneShell me={me} code={code} state={state}>
      <PlayerScene code={code} playerId={playerId} state={state} players={players} me={me} />
    </PhoneShell>
  )
}

const PHONE_PHASE_DURATION = {
  [PHASES.BET]: BET_TIME,
  [PHASES.QUESTION]: QUESTION_TIME,
  [PHASES.CATEGORY_VOTE]: VOTE_TIME,
  [PHASES.DUEL_ANSWER]: DUEL_ANSWER_TIME,
  [PHASES.EVENT_PICK]: 12,
  [PHASES.AUDIENCE_BET]: 15,
  [PHASES.DUEL_BUZZER]: 15,
}

function PhoneShell({ children, me, code, state }) {
  const duration = PHONE_PHASE_DURATION[state?.phase]
  return (
    <div className="safe-area-shell min-h-screen relative flex flex-col gap-3">
      <div className="synthwave-grid" />
      {me && (
        <header className="relative z-10 neon-panel flex items-center gap-3 px-4 py-2">
          <span className="text-2xl">{avatarById(me.avatar).emoji}</span>
          <span className="text-2xl flex-1" style={{ color: avatarById(me.avatar).color }}>{me.nick}</span>
          <span className="font-display text-sm neon-text-amber">{me.score} pkt</span>
        </header>
      )}
      {duration && state?.phaseEndsAt && (
        <div className="relative z-10"><TimerBar endsAt={state.phaseEndsAt} duration={duration} /></div>
      )}
      {/* justify-start + overflow-y-auto — przy dłuższej treści (pytanie + 4 odpowiedzi)
          "justify-center" potrafił wypchnąć górną część (samo pytanie) poza widoczny
          ekran bez możliwości przewinięcia. Wyrównanie do góry + scroll to naprawia. */}
      <main className="relative z-10 flex-1 w-full flex flex-col items-center justify-start gap-4 overflow-y-auto py-2">{children}</main>
      {code && <footer className="relative z-10 text-center text-purple-500 text-lg">pokój {code}</footer>}
    </div>
  )
}

function PlayerScene({ code, playerId, state, players, me }) {
  const qKey = `r${state.round}q${state.questionIndex}`
  const myAnswer = useDbValue(`rooms/${code}/answers/${qKey}/${playerId}`, [qKey])
  // "Dalej" na telefonie — tylko w odsłonięciu i na tablicy wyników; hook
  // musi być wywoływany zawsze (zasady hooków), ścieżka bywa null poza tymi fazami
  const readyPath = (state.phase === PHASES.REVEAL || state.phase === PHASES.SCOREBOARD)
    ? `rooms/${code}/ready` : null
  const ready = useDbValue(readyPath)
  const ev = state.event

  switch (state.phase) {
    case PHASES.LOBBY:
      return (
        <div className="text-center">
          <div className="text-7xl mb-4">{avatarById(me.avatar).emoji}</div>
          <p className="text-3xl neon-text-cyan">Jesteś w studiu!</p>
          <p className="text-2xl text-purple-300 mt-2">Patrz na duży ekran — zaraz zaczynamy…</p>
        </div>
      )

    case PHASES.CATEGORY_VOTE:
      return <VotePanel code={code} playerId={playerId} options={state.voteOptions || []} />

    case PHASES.BET:
      return <BetPanel code={code} playerId={playerId} qKey={qKey} state={state} players={players} />

    case PHASES.QUESTION:
      return <AnswerPanel code={code} playerId={playerId} qKey={qKey} state={state} answered={myAnswer != null} />

    case PHASES.REVEAL: {
      const r = state.reveal?.results?.[playerId]
      const body = !r || r.ok === null
        ? <BigInfo emoji="👀" text="Patrz na duży ekran!" />
        : (
          <div className="text-center">
            <div className="text-7xl mb-3">{r.ok ? '🎉' : '💥'}</div>
            <div className={`font-display text-3xl ${r.ok ? 'neon-text-green' : 'text-neon-red'}`}>
              {r.delta > 0 ? '+' : ''}{r.delta}
            </div>
            <p className="text-2xl text-purple-300 mt-2">
              {r.ok ? `Stawka ${r.bet} × ${r.mult}` : `Stawka ${r.bet} przepadła…`}
            </p>
          </div>
        )
      return (
        <div className="flex flex-col items-center gap-3">
          {body}
          <ReadyButton code={code} playerId={playerId} ready={ready} total={Object.keys(players).length} />
        </div>
      )
    }

    case PHASES.SCOREBOARD: {
      const rank = Object.entries(players).sort((a, b) => b[1].score - a[1].score).findIndex(([id]) => id === playerId) + 1
      return (
        <div className="flex flex-col items-center gap-3">
          <BigInfo emoji={rank === 1 ? '👑' : '📊'} text={`Miejsce ${rank} — ${me.score} pkt`} />
          <ReadyButton code={code} playerId={playerId} ready={ready} total={Object.keys(players).length} />
        </div>
      )
    }

    case PHASES.EVENT: {
      const m = EVENT_META[ev?.type]
      return (
        <div className="neon-panel border-neon-amber p-6 text-center">
          <div className="text-6xl mb-3">{m?.emoji}</div>
          <div className="font-display text-lg neon-text-amber mb-3">{m?.name}</div>
          <p className="text-2xl text-purple-200">{m?.desc}</p>
        </div>
      )
    }

    case PHASES.EVENT_PICK:
      return <GlitchPickPanel code={code} playerId={playerId} state={state} players={players} />

    case PHASES.DUEL_INTRO: {
      const isFinalist = playerId === state.duel?.a || playerId === state.duel?.b
      return <BigInfo emoji={isFinalist ? '🥊' : '📣'} text={isFinalist ? 'Stajesz do POJEDYNKU! Szykuj kciuk na buzzer!' : 'Zostajesz publicznością — zaraz obstawisz zwycięzcę!'} />
    }

    case PHASES.AUDIENCE_BET:
      return <AudienceBetPanel code={code} playerId={playerId} state={state} players={players} />

    case PHASES.DUEL_BUZZER:
    case PHASES.DUEL_ANSWER:
    case PHASES.DUEL_RESULT:
      return <DuelPanel code={code} playerId={playerId} state={state} players={players} />

    case PHASES.WINNER: {
      const won = state.winnerId === playerId
      const winner = players[state.winnerId]
      return (
        <div className="text-center">
          <div className="text-8xl mb-4">{won ? '🏆' : '👏'}</div>
          <p className="font-display text-xl leading-relaxed">
            {won ? <>MISTRZ <span className="neon-text-pink">NEON</span> <span className="neon-text-cyan">QUIZ</span>!</> : <span className="neon-text-pink">{`Wygrywa ${winner?.nick}!`}</span>}
          </p>
          {(me.prestige || 0) > 0 && <p className="text-2xl neon-text-amber mt-3">⭐ Prestiż typera: {me.prestige}</p>}
        </div>
      )
    }

    default:
      return <BigInfo emoji="👀" text="Patrz na duży ekran!" />
  }
}

const BigInfo = ({ emoji, text }) => (
  <div className="text-center">
    <div className="text-7xl mb-4">{emoji}</div>
    <p className="text-3xl text-purple-200 leading-snug">{text}</p>
  </div>
)

// Przycisk "Dalej" po odsłonięciu i na tablicy wyników — gdy wszyscy klikną,
// gra sama przechodzi dalej (patrz efekt "wszyscy gotowi" w gameEngine.js).
// Host zachowuje swój przycisk jako ręczny wentyl bezpieczeństwa.
function ReadyButton({ code, playerId, ready, total }) {
  const count = ready ? Object.keys(ready).length : 0
  const amReady = ready?.[playerId] === true
  if (amReady) {
    return <p className="text-xl text-purple-300 animate-pulse">Gotowi: {count}/{total} — czekamy na resztę…</p>
  }
  return (
    <button onClick={() => submitReady(code, playerId)} className="neon-btn-pink">
      ▶ Dalej
    </button>
  )
}

function VotePanel({ code, playerId, options }) {
  const myVote = useDbValue(`rooms/${code}/votes/${playerId}`)
  return (
    <div className="w-full max-w-sm flex flex-col gap-4">
      <p className="text-2xl text-center neon-text-cyan">Głosuj na kategorię:</p>
      {options.map((c) => (
        <button
          key={c}
          onClick={() => submitVote(code, playerId, c)}
          className={`neon-panel p-5 text-3xl transition-all ${myVote === c ? 'border-neon-green neon-text-green scale-105' : ''}`}
        >
          {c} {myVote === c && '✔'}
        </button>
      ))}
    </div>
  )
}

function BetPanel({ code, playerId, qKey, state, players }) {
  const ev = state.event
  const isAuction = ev?.type === EVENTS.AUCTION
  // "naopak": obstawiam ZA innego gracza — limity liczone z JEGO konta,
  // a zakład zapisuje się pod JEGO id
  const targetId = ev?.type === EVENTS.REVERSE && ev.map?.[playerId] ? ev.map[playerId] : playerId
  const target = players[targetId]
  const myBet = useDbValue(`rooms/${code}/bets/${qKey}/${targetId}`, [qKey, targetId])
  const myBetDone = myBet != null

  const minFrac = state.minBetFraction
  const min = Math.min(minFrac ? Math.ceil(target.score * minFrac) : MIN_BET, target.score)
  const max = Math.max(min, Math.floor(target.score * MAX_BET_FRACTION))
  const [amount, setAmount] = useState(min)
  useEffect(() => { setAmount(min) }, [qKey, min])

  if (myBetDone && !isAuction) return <BigInfo emoji="🤐" text="Zakład przyjęty. Cisza na planie…" />

  return (
    <div className="w-full max-w-sm flex flex-col gap-5 text-center">
      {ev && <div className="text-2xl neon-text-amber">{EVENT_META[ev.type]?.emoji} {EVENT_META[ev.type]?.name}</div>}
      <p className="text-2xl neon-text-pink">
        {isAuction ? 'Twoja oferta w licytacji:' : targetId !== playerId ? `Obstawiasz ZA: ${target.nick}` : 'Twój tajny zakład:'}
      </p>
      <div className="font-display text-4xl neon-text-amber">{amount}</div>
      <input
        type="range" min={min} max={max} step={10} value={amount}
        onChange={(e) => setAmount(Number(e.target.value))}
        className="bet-slider"
      />
      <div className="flex justify-between text-xl text-purple-400">
        <span>min {min}</span><span>max {max}</span>
      </div>
      <button
        onClick={() => { submitBet(code, qKey, targetId, amount); sfxCoin() }}
        className="neon-btn-cyan"
      >
        {myBetDone ? '🔄 Podbij ofertę' : isAuction ? '🔨 Licytuję!' : '🪙 Obstawiam!'}
      </button>
    </div>
  )
}

function AnswerPanel({ code, playerId, qKey, state, answered }) {
  const ev = state.event
  const q = state.question
  const isVictim = ev?.type === EVENTS.GLITCH && ev.victimId === playerId
  const isLockedOut = ev?.type === EVENTS.AUCTION && ev.winnerId !== playerId
  const [visible, setVisible] = useState(ev?.type !== EVENTS.BLIND)
  useEffect(() => {
    if (ev?.type !== EVENTS.BLIND) return
    const t = setTimeout(() => setVisible(true), 5000)
    return () => clearTimeout(t)
  }, [ev?.type])

  // Treść pytania widoczna od razu — tak jak na ekranie hosta.
  // W rundzie "w ciemno" ukryte są tylko ODPOWIEDZI, nie samo pytanie.
  const questionHeader = q?.text && (
    <div className="neon-panel px-5 py-4 text-center w-full max-w-sm">
      <div className="text-2xl leading-snug">{q.text}</div>
    </div>
  )

  if (isLockedOut) {
    return (
      <div className="w-full max-w-sm flex flex-col items-center gap-4">
        {questionHeader}
        <BigInfo emoji="🪑" text="To pytanie kupił ktoś inny. Siedzisz na widowni!" />
      </div>
    )
  }
  if (answered) {
    return (
      <div className="w-full max-w-sm flex flex-col items-center gap-4">
        {questionHeader}
        <BigInfo emoji="⚡" text="Odpowiedź przyjęta!" />
      </div>
    )
  }
  if (!visible) {
    return (
      <div className="w-full max-w-sm flex flex-col items-center gap-4">
        {questionHeader}
        <BigInfo emoji="🌑" text="Runda w ciemno… odpowiedzi za chwilę!" />
      </div>
    )
  }

  const colors = ['#ff2fb3', '#22e0ff', '#ffc832', '#39ff88']
  const letters = ['A', 'B', 'C', 'D']
  const buttons = (
    <div className="w-full max-w-sm grid grid-cols-1 gap-4">
      {(q?.answers || []).map((a, i) => (
        <FleeingButton
          key={i} flee={isVictim && ev.effect === 'flee'}
          onClick={() => submitAnswer(code, qKey, playerId, i)}
          color={colors[i]}
        >
          <span className="font-display text-sm mr-3">{letters[i]}</span>{a}
        </FleeingButton>
      ))}
    </div>
  )
  return (
    <div className="w-full max-w-sm flex flex-col items-center gap-4">
      {questionHeader}
      {isVictim && ev.effect === 'snow' ? (
        <SnowOverlay>{buttons}</SnowOverlay>
      ) : (
        <div className={isVictim ? 'tv-glitch w-full flex justify-center' : 'w-full flex justify-center'}>
          {buttons}
        </div>
      )}
    </div>
  )
}

// Odpowiedzi "uciekające" po ekranie (efekt zakłóceń)
function FleeingButton({ children, onClick, color, flee }) {
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  useEffect(() => {
    if (!flee) return
    const iv = setInterval(() => {
      setOffset({ x: (Math.random() - 0.5) * 120, y: (Math.random() - 0.5) * 40 })
    }, 700)
    return () => clearInterval(iv)
  }, [flee])
  return (
    <motion.button
      animate={flee ? { x: offset.x, y: offset.y } : {}}
      onClick={onClick}
      className="p-5 rounded-xl border-2 text-2xl text-left bg-black/50 active:scale-95"
      style={{ borderColor: color, color, boxShadow: `0 0 10px ${color}66` }}
    >
      {children}
    </motion.button>
  )
}

// Śnieżenie do przetarcia palcem (efekt zakłóceń)
function SnowOverlay({ children }) {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight
    const img = ctx.createImageData(canvas.width, canvas.height)
    for (let i = 0; i < img.data.length; i += 4) {
      const v = Math.random() * 255
      img.data[i] = v; img.data[i + 1] = v; img.data[i + 2] = v; img.data[i + 3] = 235
    }
    ctx.putImageData(img, 0, 0)
    const wipe = (e) => {
      const rect = canvas.getBoundingClientRect()
      const t = e.touches ? e.touches[0] : e
      ctx.globalCompositeOperation = 'destination-out'
      ctx.beginPath()
      ctx.arc(t.clientX - rect.left, t.clientY - rect.top, 34, 0, Math.PI * 2)
      ctx.fill()
    }
    canvas.addEventListener('touchmove', wipe)
    canvas.addEventListener('mousemove', wipe)
    return () => { canvas.removeEventListener('touchmove', wipe); canvas.removeEventListener('mousemove', wipe) }
  }, [])
  return (
    <div className="relative w-full max-w-sm">
      {children}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full rounded-xl touch-none" />
      <p className="absolute -bottom-9 inset-x-0 text-center text-xl neon-text-cyan">📺 Przetrzyj ekran palcem!</p>
    </div>
  )
}

function GlitchPickPanel({ code, playerId, state, players }) {
  const pickers = state.event?.pickers || []
  const myPick = useDbValue(`rooms/${code}/eventPicks/${playerId}`)
  if (!pickers.includes(playerId)) return <BigInfo emoji="😰" text="Ktoś zaraz straci sygnał… oby nie Ty!" />
  const targets = Object.entries(players).filter(([id]) => !pickers.includes(id))
  return (
    <div className="w-full max-w-sm flex flex-col gap-3">
      <p className="text-2xl text-center neon-text-amber">📺 Wybierz ofiarę zakłóceń:</p>
      {targets.map(([id, p]) => (
        <button key={id} onClick={() => submitEventPick(code, playerId, id)}
          className={`neon-panel p-4 text-2xl flex items-center gap-3 ${myPick === id ? 'border-neon-red' : ''}`}>
          <span className="text-3xl">{avatarById(p.avatar).emoji}</span> {p.nick} {myPick === id && '🎯'}
        </button>
      ))}
    </div>
  )
}

function AudienceBetPanel({ code, playerId, state, players }) {
  const d = state.duel
  const myBet = useDbValue(`rooms/${code}/audienceBets/${playerId}`)
  if (playerId === d?.a || playerId === d?.b) {
    return <BigInfo emoji="🥊" text="Publiczność obstawia… a Ty rozgrzewaj kciuki!" />
  }
  return (
    <div className="w-full max-w-sm flex flex-col gap-4 text-center">
      <p className="text-2xl neon-text-cyan">Kto wygra pojedynek?</p>
      {[d?.a, d?.b].map((fid) => {
        const p = players[fid]
        if (!p) return null
        return (
          <button key={fid} onClick={() => submitAudienceBet(code, playerId, fid)}
            className={`neon-panel p-5 text-3xl flex items-center justify-center gap-3 ${myBet === fid ? 'border-neon-green neon-text-green' : ''}`}>
            <span className="text-4xl">{avatarById(p.avatar).emoji}</span> {p.nick} {myBet === fid && '✔'}
          </button>
        )
      })}
      <p className="text-xl text-purple-400">Trafienie = punkt prestiżu ⭐</p>
    </div>
  )
}

function DuelPanel({ code, playerId, state, players }) {
  const d = state.duel
  const isFinalist = playerId === d?.a || playerId === d?.b
  const qi = d?.qIndex || 0
  const myBuzz = useDbValue(`rooms/${code}/buzzes/${qi}/${playerId}`, [qi])
  const colors = ['#ff2fb3', '#22e0ff', '#ffc832', '#39ff88']
  const letters = ['A', 'B', 'C', 'D']

  if (!isFinalist) {
    const sA = d?.scores?.[d?.a] || 0
    const sB = d?.scores?.[d?.b] || 0
    return <BigInfo emoji="📣" text={`${players[d?.a]?.nick} ${sA} : ${sB} ${players[d?.b]?.nick}`} />
  }

  if (state.phase === PHASES.DUEL_BUZZER) {
    return (
      <div className="text-center w-full">
        <p className="text-2xl text-purple-200 mb-6 px-2">{d?.question?.text}</p>
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={() => { if (!myBuzz) { submitBuzz(code, qi, playerId); sfxBuzzer() } }}
          className="w-56 h-56 rounded-full border-8 border-neon-red bg-neon-red/20 font-display text-2xl text-neon-red mx-auto"
          style={{ boxShadow: '0 0 30px rgba(255,59,92,.8), inset 0 0 40px rgba(255,59,92,.4)' }}
        >
          {myBuzz ? '⏳' : 'BUZZ!'}
        </motion.button>
      </div>
    )
  }

  if (state.phase === PHASES.DUEL_ANSWER) {
    if (d.buzzWinner !== playerId) return <BigInfo emoji="😬" text={`Odpowiada ${players[d.buzzWinner]?.nick}…`} />
    return (
      <div className="w-full max-w-sm grid gap-3">
        <p className="text-xl text-center text-purple-200 mb-1">{d?.question?.text}</p>
        <p className="text-2xl text-center neon-text-green mb-1">Szybko! 5 sekund!</p>
        {(d?.question?.answers || []).map((a, i) => (
          <button key={i}
            onClick={() => { submitDuelAnswer(code, qi, playerId, i) }}
            className="p-4 rounded-xl border-2 text-2xl text-left bg-black/50 active:scale-95"
            style={{ borderColor: colors[i], color: colors[i] }}>
            <span className="font-display text-sm mr-3">{letters[i]}</span>{a}
          </button>
        ))}
      </div>
    )
  }

  // DUEL_RESULT
  const gotPoint = d?.lastScorer === playerId
  return <DuelResultInfo gotPoint={gotPoint} />
}

function DuelResultInfo({ gotPoint }) {
  useEffect(() => { (gotPoint ? sfxCorrect : sfxError)() }, [gotPoint])
  return <BigInfo emoji={gotPoint ? '🎯' : '😤'} text={gotPoint ? 'Punkt dla Ciebie!' : 'Punkt dla rywala…'} />
}

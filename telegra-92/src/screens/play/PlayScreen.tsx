import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import Marquee from '../../components/Marquee'
import ConfigWarning from '../../components/ConfigWarning'
import { getPlayerId } from '../../lib/identity'
import { supabaseConfigured } from '../../lib/supabase'
import { connectAsPlayer, sendAction, type RoomConnection } from '../../lib/realtime'
import type { GameState } from '../../lib/types'

/** Telefon gracza: dołączenie do pokoju, potem render stanu rozgłaszanego przez hosta. */
export default function PlayScreen() {
  const [params] = useSearchParams()
  const [code, setCode] = useState(() => (params.get('code') ?? '').toUpperCase().slice(0, 4))
  const [nick, setNick] = useState('')
  const [game, setGame] = useState<GameState | null>(null)
  const [joining, setJoining] = useState(false)
  const connRef = useRef<RoomConnection | null>(null)

  useEffect(() => () => connRef.current?.leave(), [])

  const canJoin = supabaseConfigured && code.length >= 4 && nick.trim().length >= 2

  function join() {
    if (!canJoin || joining) return
    setJoining(true)
    const roomCode = code.toUpperCase()
    const conn = connectAsPlayer(roomCode, setGame)
    connRef.current = conn
    // Ponawiamy zgłoszenie do pierwszego stanu od hosta (subskrypcja może się jeszcze spinać)
    const playerId = getPlayerId()
    const timer = setInterval(() => {
      sendAction(conn, { playerId, type: 'join', payload: { nick: nick.trim() }, sentAt: Date.now() })
    }, 1200)
    const stop = setInterval(() => {
      if (connRef.current !== conn) clearInterval(timer)
    }, 1200)
    conn.channel.on('broadcast', { event: 'state' }, () => {
      clearInterval(timer)
      clearInterval(stop)
    })
  }

  if (game) {
    const me = game.players.find((p) => p.id === getPlayerId())
    return (
      <main className="mx-auto flex min-h-dvh max-w-sm flex-col items-center justify-center gap-8 px-6 text-center">
        <Marquee />
        <h1 className="text-3xl font-extrabold">Jesteś w grze!</h1>
        <div className="w-full rounded-2xl border border-linia bg-panel p-6">
          <p className="text-sm uppercase tracking-[0.2em] text-zgaszony">Pokój {game.roomCode}</p>
          <p className="mt-2 text-2xl font-bold text-neon">{me?.nick ?? nick}</p>
          <p className="mt-4 text-sm text-zgaszony">
            {game.phase.name === 'lobby'
              ? `Patrz na duży ekran — host zaraz zacznie. Graczy: ${game.players.length}`
              : 'Gra trwa…'}
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center gap-6 px-6">
      <header className="text-center">
        <Marquee />
        <h1 className="mt-4 text-3xl font-extrabold">Wejście do lunaparku</h1>
      </header>

      <ConfigWarning />

      <label className="flex flex-col gap-2">
        <span className="text-sm uppercase tracking-[0.2em] text-zgaszony">Kod z ekranu TV</span>
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 4))}
          autoCapitalize="characters"
          autoComplete="off"
          className="rounded-xl border border-linia bg-panel px-4 py-4 text-center text-3xl font-extrabold tracking-[0.4em] text-zarowka outline-none focus:border-zarowka"
          placeholder="KOD"
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-sm uppercase tracking-[0.2em] text-zgaszony">Twój nick</span>
        <input
          value={nick}
          onChange={(e) => setNick(e.target.value.slice(0, 16))}
          autoComplete="off"
          className="rounded-xl border border-linia bg-panel px-4 py-3 text-center text-xl font-bold outline-none focus:border-neon"
          placeholder="np. Królowa Waty"
        />
      </label>

      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={join}
        disabled={!canJoin || joining}
        className="rounded-2xl bg-gradient-to-r from-wata to-zarowka px-8 py-4 text-lg font-extrabold uppercase tracking-widest text-noc shadow-luna disabled:opacity-40 disabled:shadow-none"
      >
        {joining ? 'Wchodzę…' : 'Wchodzę!'}
      </motion.button>
    </main>
  )
}

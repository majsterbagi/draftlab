import { useEffect, useMemo, useRef } from 'react'
import { useMachine } from '@xstate/react'
import { motion } from 'framer-motion'
import Marquee from '../../components/Marquee'
import ConfigWarning from '../../components/ConfigWarning'
import TicketQR from '../../components/TicketQR'
import { DEFAULT_AVATAR, getAvatar, isPlayerAvatar } from '../../lib/avatars'
import { generateRoomCode } from '../../lib/identity'
import { supabaseConfigured } from '../../lib/supabase'
import { broadcastState, connectAsHost, type RoomConnection } from '../../lib/realtime'
import { createSessionMachine } from '../../lib/sessionMachine'

/** Ekran TV: host jest mózgiem gry — trzyma maszynę sesji i rozgłasza stan. */
export default function HostScreen() {
  const roomCode = useMemo(() => generateRoomCode(), [])
  const machine = useMemo(
    () => createSessionMachine(roomCode, { format: 'solo' }),
    [roomCode],
  )
  const [state, send] = useMachine(machine)
  const connRef = useRef<RoomConnection | null>(null)
  // QR prowadzi na /play z wpisanym kodem — telefon musi być w tej samej sieci co dev
  // server (na produkcji to publiczny adres gry)
  const joinUrl = `${window.location.origin}${window.location.pathname}#/play?code=${roomCode}`

  // Kanał pokoju: akcje telefonów → eventy maszyny
  useEffect(() => {
    if (!supabaseConfigured) return
    const conn = connectAsHost(roomCode, (action) => {
      if (action.type === 'join') {
        const { nick, avatar } = action.payload as { nick: string; avatar?: unknown }
        send({
          type: 'PLAYER_JOIN',
          playerId: action.playerId,
          nick,
          avatar: isPlayerAvatar(avatar) ? avatar : DEFAULT_AVATAR,
        })
      }
    })
    connRef.current = conn
    return () => conn.leave()
  }, [roomCode, send])

  // Każda zmiana stanu → broadcast do telefonów
  useEffect(() => {
    if (connRef.current) broadcastState(connRef.current, state.context)
  }, [state.context])

  const { players } = state.context

  return (
    <main className="mx-auto flex min-h-dvh max-w-4xl flex-col gap-10 px-8 py-10">
      <header className="flex items-center justify-between text-sm uppercase tracking-[0.2em] text-zgaszony">
        <span>LUNAPARK</span>
        <span>Lobby</span>
      </header>

      <ConfigWarning />

      <section className="flex flex-wrap items-center justify-center gap-x-16 gap-y-8">
        <div className="flex flex-col items-center gap-6 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-zgaszony">
            Wejdźcie telefonem i wpiszcie kod
          </p>
          <motion.p
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-8xl font-extrabold tracking-[0.15em] text-zarowka"
            style={{ textShadow: '0 0 32px rgba(255,177,61,.45)' }}
          >
            {roomCode}
          </motion.p>
          <Marquee count={9} />
        </div>
        <motion.div initial={{ rotate: -6, opacity: 0 }} animate={{ rotate: -3, opacity: 1 }}>
          <TicketQR url={joinUrl} caption="Zeskanuj i wchodź" />
        </motion.div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-sm uppercase tracking-[0.2em] text-zgaszony">
          Gracze przy bramkach ({players.length})
        </h2>
        {players.length === 0 ? (
          <p className="text-zgaszony">Czekamy na pierwszego śmiałka…</p>
        ) : (
          <ul className="flex flex-wrap gap-3">
            {players.map((p) => (
              <motion.li
                key={p.id}
                initial={{ y: 12, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className={`flex items-center gap-3 rounded-full border py-2 pl-2 pr-5 text-lg font-bold ${
                  p.connected ? 'border-neon text-neon' : 'border-linia text-zgaszony'
                }`}
              >
                <span
                  className="grid h-10 w-10 place-items-center rounded-full bg-kosc/10 text-2xl"
                  aria-label={`Awatar: ${getAvatar(p.avatar).label}`}
                  role="img"
                >
                  {getAvatar(p.avatar).symbol}
                </span>
                <span>{p.nick}</span>
              </motion.li>
            ))}
          </ul>
        )}
      </section>

      <footer className="mt-auto flex justify-center">
        <button
          disabled
          title="Moduł 'Ryzyko i zakłady' powstaje w Etapie 2"
          className="cursor-not-allowed rounded-2xl border-2 border-linia px-10 py-4 text-lg font-extrabold uppercase tracking-widest text-zgaszony"
        >
          Start gry — wkrótce
        </button>
      </footer>
    </main>
  )
}

// Drobne współdzielone komponenty UI
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { avatarById } from '../lib/avatars.js'

// Pasek czasu odliczający do state.phaseEndsAt (ms epoch)
export function TimerBar({ endsAt, duration, onTick }) {
  const [left, setLeft] = useState(() => Math.max(0, (endsAt - Date.now()) / 1000))
  useEffect(() => {
    const iv = setInterval(() => {
      const l = Math.max(0, (endsAt - Date.now()) / 1000)
      setLeft(l)
      onTick?.(l)
    }, 200)
    return () => clearInterval(iv)
  }, [endsAt, onTick])
  const frac = duration ? Math.min(1, left / duration) : 0
  return (
    <div className="w-full h-4 rounded-full bg-black/50 border border-purple-800 overflow-hidden">
      <div
        className="h-full rounded-full transition-[width] duration-200"
        style={{
          width: `${frac * 100}%`,
          background: left < 4 ? '#ff3b5c' : 'linear-gradient(90deg,#22e0ff,#a855f7,#ff2fb3)',
          boxShadow: '0 0 10px rgba(255,47,179,.7)',
        }}
      />
    </div>
  )
}

export function AvatarChip({ avatarId, nick, size = 'md', dimmed = false, badge = null }) {
  const a = avatarById(avatarId)
  const s = size === 'lg' ? 'w-24 h-24 text-5xl' : size === 'sm' ? 'w-10 h-10 text-xl' : 'w-16 h-16 text-3xl'
  return (
    <div className={`flex flex-col items-center gap-1 ${dimmed ? 'opacity-40 grayscale' : ''}`}>
      <div
        className={`${s} rounded-full flex items-center justify-center border-2 relative`}
        style={{ borderColor: a.color, boxShadow: `0 0 10px ${a.color}88`, background: `${a.color}22` }}
      >
        <span>{a.emoji}</span>
        {badge != null && (
          <span className="absolute -top-2 -right-2 bg-black border border-white/40 rounded-full px-1.5 text-sm">
            {badge}
          </span>
        )}
      </div>
      {nick && <span className="text-lg leading-none" style={{ color: a.color }}>{nick}</span>}
    </div>
  )
}

// Wirtualny prezenter: sylwetka + dymek z kwestią
export function Presenter({ line, mood = 'normal' }) {
  return (
    <div className="flex items-end gap-3">
      <motion.div
        animate={mood === 'excited' ? { rotate: [-3, 3, -3], y: [0, -6, 0] } : { y: [0, -3, 0] }}
        transition={{ repeat: Infinity, duration: mood === 'excited' ? 0.5 : 2.4 }}
        className="text-6xl select-none drop-shadow-[0_0_12px_rgba(255,47,179,0.8)]"
        aria-label="Prezenter"
      >
        🕺
      </motion.div>
      <AnimatePresence mode="wait">
        {line && (
          <motion.div
            key={line}
            initial={{ opacity: 0, scale: 0.7, x: -12 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="relative max-w-md bg-white text-black rounded-2xl rounded-bl-none px-4 py-2 text-xl font-semibold shadow-neon-pink"
          >
            {line}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function Stars({ n }) {
  return <span className="neon-text-amber text-2xl tracking-widest">{'★'.repeat(n)}{'☆'.repeat(3 - n)}</span>
}

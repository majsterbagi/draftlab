import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function Home() {
  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center p-6 gap-10">
      <div className="synthwave-grid" />
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', bounce: 0.4 }}
        className="text-center relative z-10"
      >
        <h1 className="font-display text-3xl sm:text-5xl neon-flicker leading-tight">
          <span className="neon-text-pink">NEON</span> <span className="neon-text-cyan">QUIZ</span>
        </h1>
        <p className="text-2xl text-purple-300 mt-4">Teleturniej, w którym blef jest wart punkty</p>
      </motion.div>

      <div className="flex flex-col sm:flex-row gap-5 relative z-10">
        <Link to="/host" className="neon-btn-pink text-center">📺 Prowadzę grę</Link>
        <Link to="/play" className="neon-btn-cyan text-center">📱 Dołączam</Link>
      </div>
      <Link to="/editor" className="relative z-10 text-purple-400 hover:text-neon-amber text-xl underline underline-offset-4">
        ✏️ Edytor zestawów pytań
      </Link>
    </div>
  )
}

import { HashRouter, Routes, Route } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Home from './pages/Home.jsx'
import Host from './pages/Host.jsx'
import Play from './pages/Play.jsx'
import Editor from './pages/Editor.jsx'
import { isConfigMissing } from './lib/firebase.js'

function ConfigMissing() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative">
      <div className="synthwave-grid" />
      <div className="neon-panel max-w-xl p-8 text-center relative z-10">
        <h1 className="font-display text-xl mb-6 leading-relaxed">
          <span className="neon-text-pink">NEON</span> <span className="neon-text-cyan">QUIZ</span>
        </h1>
        <p className="text-2xl neon-text-cyan mb-4">⚠ Brak konfiguracji Firebase</p>
        <p className="text-xl text-purple-200 leading-relaxed">
          Otwórz plik <code className="text-neon-amber">src/firebase-config.js</code> i wklej dane
          swojego projektu z konsoli Firebase (instrukcja krok po kroku w komentarzu pliku
          oraz w README).
        </p>
      </div>
    </div>
  )
}

function OfflineBanner() {
  const [online, setOnline] = useState(navigator.onLine)
  useEffect(() => {
    const on = () => setOnline(true)
    const off = () => setOnline(false)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off) }
  }, [])
  if (online) return null
  return (
    <div className="fixed top-0 inset-x-0 z-[100] bg-neon-red/90 text-white font-display text-xs text-center py-2 tv-glitch">
      📡 BRAK SYGNAŁU — sprawdź internet
    </div>
  )
}

export default function App() {
  if (isConfigMissing) return <ConfigMissing />
  return (
    <HashRouter>
      <OfflineBanner />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/host" element={<Host />} />
        <Route path="/play" element={<Play />} />
        <Route path="/editor" element={<Editor />} />
      </Routes>
    </HashRouter>
  )
}

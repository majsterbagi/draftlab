// Retro-dźwięki syntezowane przez Web Audio API — zero plików audio.
let ctx = null

function ac() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)()
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

function tone({ freq = 440, type = 'square', dur = 0.15, when = 0, vol = 0.18, slideTo = null }) {
  const c = ac()
  const t0 = c.currentTime + when
  const osc = c.createOscillator()
  const gain = c.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, t0)
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur)
  gain.gain.setValueAtTime(vol, t0)
  gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur)
  osc.connect(gain).connect(c.destination)
  osc.start(t0)
  osc.stop(t0 + dur + 0.05)
}

let muted = false
export const setMuted = (m) => { muted = m }
export const isMuted = () => muted

const play = (fn) => { if (!muted) try { fn() } catch { /* autoplay policy — ignoruj */ } }

// Syntezatorowa fanfara (start rundy, zwycięzca)
export const sfxFanfare = () => play(() => {
  const notes = [261.6, 329.6, 392.0, 523.3, 659.3, 784.0]
  notes.forEach((f, i) => tone({ freq: f, type: 'sawtooth', dur: 0.22, when: i * 0.09, vol: 0.14 }))
  tone({ freq: 1046.5, type: 'square', dur: 0.6, when: notes.length * 0.09, vol: 0.12 })
})

// Wrzut monety (postawiony zakład)
export const sfxCoin = () => play(() => {
  tone({ freq: 987.8, type: 'square', dur: 0.08, vol: 0.15 })
  tone({ freq: 1318.5, type: 'square', dur: 0.25, when: 0.08, vol: 0.15 })
})

// Brzęczyk błędu (zła odpowiedź)
export const sfxError = () => play(() => {
  tone({ freq: 160, type: 'sawtooth', dur: 0.35, vol: 0.2, slideTo: 80 })
  tone({ freq: 120, type: 'square', dur: 0.35, when: 0.02, vol: 0.12, slideTo: 60 })
})

// Poprawna odpowiedź
export const sfxCorrect = () => play(() => {
  tone({ freq: 523.3, type: 'square', dur: 0.1, vol: 0.15 })
  tone({ freq: 659.3, type: 'square', dur: 0.1, when: 0.1, vol: 0.15 })
  tone({ freq: 784.0, type: 'square', dur: 0.3, when: 0.2, vol: 0.15 })
})

// Tykanie zegara (ostatnie sekundy)
export const sfxTick = () => play(() => tone({ freq: 880, type: 'square', dur: 0.04, vol: 0.08 }))

// Dramatyczne odsłonięcie stawki
export const sfxReveal = () => play(() => tone({ freq: 220, type: 'sawtooth', dur: 0.4, vol: 0.14, slideTo: 440 }))

// Buzzer w pojedynku
export const sfxBuzzer = () => play(() => {
  tone({ freq: 300, type: 'sawtooth', dur: 0.5, vol: 0.22, slideTo: 250 })
})

// Wjazd gracza do studia
export const sfxWhoosh = () => play(() => tone({ freq: 200, type: 'triangle', dur: 0.35, vol: 0.15, slideTo: 900 }))

// Ogłoszenie wydarzenia specjalnego
export const sfxEvent = () => play(() => {
  tone({ freq: 392, type: 'sawtooth', dur: 0.15, vol: 0.16 })
  tone({ freq: 466.2, type: 'sawtooth', dur: 0.15, when: 0.15, vol: 0.16 })
  tone({ freq: 554.4, type: 'sawtooth', dur: 0.4, when: 0.3, vol: 0.16 })
})

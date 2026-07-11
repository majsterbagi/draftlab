import { Link } from 'react-router-dom'
import Marquee from '../components/Marquee'

export default function Landing() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col items-center justify-center gap-10 px-6 text-center">
      <header className="flex flex-col gap-4">
        <Marquee count={9} />
        <h1 className="text-5xl font-extrabold tracking-tight">LUNAPARK</h1>
        <p className="text-zgaszony">
          Teleturniej na waszym ekranie. Telefony w dłonie — noc jest młoda.
        </p>
      </header>

      <nav className="flex w-full flex-col gap-4">
        <Link
          to="/host"
          className="rounded-2xl bg-gradient-to-r from-wata to-zarowka px-8 py-5 text-xl font-extrabold uppercase tracking-widest text-noc shadow-luna"
        >
          Otwieram lunapark
          <span className="mt-1 block text-xs font-semibold normal-case tracking-normal opacity-70">
            ekran TV / laptop — tu toczy się gra
          </span>
        </Link>
        <Link
          to="/play"
          className="rounded-2xl border-2 border-neon px-8 py-5 text-xl font-extrabold uppercase tracking-widest text-neon"
        >
          Dołączam do gry
          <span className="mt-1 block text-xs font-semibold normal-case tracking-normal text-zgaszony">
            telefon — twój pulpit gracza
          </span>
        </Link>
      </nav>
    </main>
  )
}

import { useMemo } from 'react'
import QRCode from 'qrcode'

/**
 * QR "bilet do lunaparku": kremowy kartonik z perforacją, moduły jak żarówki
 * (kółka), narożne oczka rysowane ręcznie z zaokrągleniem. Moduły muszą zostać
 * ciemne na jasnym tle — odwrócone QR nie skanują się niezawodnie.
 */

const INK = '#171233' // noc — tusz biletu
const PAPER = '#f7f1e4' // kość — karton

interface EyePos {
  x: number
  y: number
}

function buildMatrix(text: string): boolean[][] {
  // 'H' — stylizacja modułów zjada margines dekodowania, oddajemy go korekcją błędów
  const qr = QRCode.create(text, { errorCorrectionLevel: 'H' })
  const size = qr.modules.size
  const data = qr.modules.data
  return Array.from({ length: size }, (_, y) =>
    Array.from({ length: size }, (_, x) => Boolean(data[y * size + x])),
  )
}

function isInEye(x: number, y: number, size: number): boolean {
  const inTL = x < 7 && y < 7
  const inTR = x >= size - 7 && y < 7
  const inBL = x < 7 && y >= size - 7
  return inTL || inTR || inBL
}

export default function TicketQR({ url, caption }: { url: string; caption: string }) {
  const { size, dots, eyes } = useMemo(() => {
    const matrix = buildMatrix(url)
    const n = matrix.length
    const dots: Array<{ x: number; y: number }> = []
    for (let y = 0; y < n; y++) {
      for (let x = 0; x < n; x++) {
        if (matrix[y][x] && !isInEye(x, y, n)) dots.push({ x, y })
      }
    }
    const eyes: EyePos[] = [
      { x: 0, y: 0 },
      { x: n - 7, y: 0 },
      { x: 0, y: n - 7 },
    ]
    return { size: n, dots, eyes }
  }, [url])

  const Q = 4 // quiet zone w modułach
  const view = size + Q * 2

  return (
    <figure className="flex flex-col items-center gap-0">
      {/* górny brzeg biletu z perforacją */}
      <div className="flex w-full justify-between rounded-t-2xl bg-kosc px-3 pt-2" aria-hidden>
        {Array.from({ length: 9 }, (_, i) => (
          <span key={i} className="h-2 w-2 -translate-y-3 rounded-full bg-noc" />
        ))}
      </div>

      <div className="bg-kosc px-4 pb-2 pt-1">
        <svg
          viewBox={`0 0 ${view} ${view}`}
          className="h-44 w-44"
          role="img"
          aria-label={`Kod QR: ${url}`}
        >
          <rect width={view} height={view} fill={PAPER} />
          {/* moduły danych — żarówki (pełna średnica modułu, żeby dekodery je łapały) */}
          {dots.map((d) => (
            <circle
              key={`${d.x}-${d.y}`}
              cx={Q + d.x + 0.5}
              cy={Q + d.y + 0.5}
              r={0.5}
              fill={INK}
            />
          ))}
          {/* oczka — dokładne pokrycie wzorca 7/5/3 z zaokrągleniami */}
          {eyes.map((e, i) => (
            <g key={i}>
              <rect x={Q + e.x} y={Q + e.y} width={7} height={7} rx={1.9} fill={INK} />
              <rect x={Q + e.x + 1} y={Q + e.y + 1} width={5} height={5} rx={1.3} fill={PAPER} />
              <rect x={Q + e.x + 2} y={Q + e.y + 2} width={3} height={3} rx={1.5} fill={INK} />
            </g>
          ))}
        </svg>
      </div>

      <figcaption className="w-full rounded-b-2xl bg-kosc px-4 pb-3 text-center text-[11px] font-bold uppercase tracking-[0.25em] text-noc">
        {caption}
      </figcaption>
    </figure>
  )
}

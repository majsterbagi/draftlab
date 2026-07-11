/** Rządek żarówek marquee — sygnatura Lunaparku pod kulminacjami. */
export default function Marquee({ count = 7 }: { count?: number }) {
  const colors = ['bg-zarowka shadow-luna', 'bg-wata shadow-wata', 'bg-neon']
  return (
    <div className="flex items-center justify-center gap-2" aria-hidden>
      {Array.from({ length: count }, (_, i) => (
        <span key={i} className={`h-2 w-2 rounded-full ${colors[i % colors.length]}`} />
      ))}
    </div>
  )
}

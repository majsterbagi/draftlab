// Ekran startowy hosta: duży tytuł w otoczce flagi w kratkę (jak na mecie),
// wejście do trybu imprezowego albo lokalnego. Pokój tworzy się w tle
// (HostApp), więc QR jest gotowy natychmiast po wejściu do lobby.

const CHECKER = {
  backgroundImage:
    'repeating-conic-gradient(#e8e6da 0% 25%, #181818 0% 50%)',
  backgroundSize: '18px 18px',
};

export default function MenuScreen({ onPlay }) {
  return (
    <div className="min-h-screen flex flex-col text-neutral-200 font-mono overflow-hidden">
      <div className="h-4 sm:h-5" style={CHECKER} />

      <div className="flex-1 flex flex-col items-center justify-center gap-8 px-4">
        <div className="text-center">
          <h1 className="text-5xl sm:text-7xl font-bold tracking-widest text-amber-300 drop-shadow-[0_4px_0_rgba(0,0,0,0.6)]">
            PIXEL KART GP
          </h1>
          <p className="mt-3 text-neutral-400 text-sm sm:text-base">
            komputer to tor · telefony to kierownice
          </p>
        </div>

        <div className="flex flex-col items-center gap-3">
          <button
            onClick={onPlay}
            className="relative px-10 py-4 text-2xl font-bold text-black bg-amber-500 rounded-xl
                       hover:bg-amber-400 active:scale-95 transition-transform shadow-[0_6px_0_#92600a]"
          >
            GRAJ ▶
          </button>
          <a href="#/local" className="text-xs text-neutral-500 hover:text-amber-300 underline">
            tryb lokalny (klawiatura, bez telefonów)
          </a>
        </div>
      </div>

      <div className="h-4 sm:h-5" style={CHECKER} />
    </div>
  );
}

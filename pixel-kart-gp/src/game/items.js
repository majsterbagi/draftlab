// System power-upów: klasyka na start + rubber-banding.
// Zasady własne gry (nie 1:1 z Mario Kart): TARCZA blokuje jedno trafienie
// (pociskiem lub bananem), POCISK leci po linii prostej, BANAN to statyczna
// pułapka. Oba dają krótki "spin" (utrata kontroli) trafionemu kartowi.

export const ITEM_TYPES = {
  boost: { label: 'BOOST', icon: '⚡', color: '#ffcc44' },
  shell: { label: 'POCISK', icon: '🚀', color: '#ff5555' },
  banana: { label: 'BANAN', icon: '🍌', color: '#e8d840' },
  shield: { label: 'TARCZA', icon: '🛡️', color: '#55ddff' },
};

export const CHARGE_BASE = 7;      // s do gotowości wyzwania dla lidera
export const CHARGE_LAST_BONUS = 4; // o tyle szybciej dla ostatniego miejsca
export const CHALLENGE_WINDOW = 1.5; // s na trafienie w moment "ŁAP!"

// Rank 0 = lider, 1 = ostatnie miejsce. Rubber-banding: z tyłu stawki
// dostępne mocniejsze itemy, na czele głównie obronne/neutralne.
function poolForRank(rank) {
  if (rank < 0.34) return ['boost', 'boost', 'shield'];
  if (rank < 0.67) return ['boost', 'banana', 'shield'];
  return ['shell', 'shell', 'banana', 'boost'];
}

export function rollItem(rank) {
  const pool = poolForRank(rank);
  return pool[Math.floor(Math.random() * pool.length)];
}

export function chargeInterval(rank) {
  return CHARGE_BASE - CHARGE_LAST_BONUS * rank;
}

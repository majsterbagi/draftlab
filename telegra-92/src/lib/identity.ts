/** Stała tożsamość urządzenia gracza — przeżywa odświeżenie strony w trakcie gry. */
export function getPlayerId(): string {
  const KEY = 'telegra92:playerId'
  let id = localStorage.getItem(KEY)
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(KEY, id)
  }
  return id
}

const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789' // bez I/L/O/0/1 — czytelne z ekranu TV

export function generateRoomCode(length = 4): string {
  return Array.from(
    crypto.getRandomValues(new Uint32Array(length)),
    (n) => CODE_ALPHABET[n % CODE_ALPHABET.length],
  ).join('')
}

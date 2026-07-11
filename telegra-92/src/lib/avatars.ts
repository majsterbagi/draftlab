export const PLAYER_AVATARS = [
  { id: 'wheel', symbol: '🎡', label: 'Diabelski młyn' },
  { id: 'carousel', symbol: '🎠', label: 'Karuzela' },
  { id: 'coaster', symbol: '🎢', label: 'Kolejka' },
  { id: 'tent', symbol: '🎪', label: 'Namiot' },
  { id: 'popcorn', symbol: '🍿', label: 'Popcorn' },
  { id: 'balloon', symbol: '🎈', label: 'Balon' },
  { id: 'ticket', symbol: '🎟️', label: 'Bilet' },
  { id: 'target', symbol: '🎯', label: 'Strzelnica' },
] as const

export type PlayerAvatar = (typeof PLAYER_AVATARS)[number]['id']

export const DEFAULT_AVATAR: PlayerAvatar = PLAYER_AVATARS[0].id

const STORAGE_KEY = 'lunapark:playerAvatar'

export function isPlayerAvatar(value: unknown): value is PlayerAvatar {
  return PLAYER_AVATARS.some((avatar) => avatar.id === value)
}

export function getAvatar(avatarId: PlayerAvatar) {
  return PLAYER_AVATARS.find((avatar) => avatar.id === avatarId) ?? PLAYER_AVATARS[0]
}

export function getStoredAvatar(): PlayerAvatar {
  const stored = localStorage.getItem(STORAGE_KEY)
  return isPlayerAvatar(stored) ? stored : DEFAULT_AVATAR
}

export function storeAvatar(avatarId: PlayerAvatar): void {
  localStorage.setItem(STORAGE_KEY, avatarId)
}

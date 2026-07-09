// 8 neonowych awatarów retro — emoji + kolor, każdy unikalny w pokoju
export const AVATARS = [
  { id: 'kasetka',   name: 'Kasetka',   emoji: '📼', color: '#ff2fb3' },
  { id: 'pikselak',  name: 'Pikselak',  emoji: '👾', color: '#22e0ff' },
  { id: 'neonka',    name: 'Neonka',    emoji: '💡', color: '#ffc832' },
  { id: 'dyskietka', name: 'Dyskietka', emoji: '💾', color: '#a855f7' },
  { id: 'joystick',  name: 'Joystick',  emoji: '🕹️', color: '#39ff88' },
  { id: 'robocik',   name: 'Robocik',   emoji: '🤖', color: '#ff3b5c' },
  { id: 'discoball', name: 'Kula Disco', emoji: '🪩', color: '#7dd3fc' },
  { id: 'radyjko',   name: 'Radyjko',   emoji: '📻', color: '#fb923c' },
]

export const avatarById = (id) => AVATARS.find((a) => a.id === id) || AVATARS[0]

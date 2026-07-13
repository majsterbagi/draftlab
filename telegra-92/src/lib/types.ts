import type { PlayerAvatar } from './avatars'

// ---- Gracze i pokój ----

export interface Player {
  /** Stały identyfikator urządzenia gracza (localStorage). */
  id: string
  nick: string
  avatar: PlayerAvatar
  /** Pula żetonów — jedna waluta gry (żetony = punkty). */
  chips: number
  connected: boolean
}

export type PlayerFormat = 'solo' | 'teams'

export interface RoomSettings {
  format: PlayerFormat
}

// ---- Fazy sesji (maszyna stanów hosta) ----

export type SessionPhase =
  | { name: 'lobby' }
  | { name: 'module'; moduleId: string; moduleState: unknown }
  | { name: 'summary' }

/**
 * Pełny stan gry rozgłaszany przez hosta do telefonów.
 * Host jest mózgiem gry: telefony tylko renderują ten stan i wysyłają akcje.
 */
export interface GameState {
  roomCode: string
  settings: RoomSettings
  players: Player[]
  phase: SessionPhase
  /** Rośnie przy każdej zmianie — telefony ignorują stan starszy niż już znany. */
  version: number
}

// ---- Akcje graczy ----

export interface ActionEnvelope<T = unknown> {
  playerId: string
  /** Typ akcji interpretowany przez aktywny moduł (lub sesję, np. 'join'). */
  type: string
  payload: T
  sentAt: number
}

// ---- Kontrakt modułów (rundy-klocki platformy) ----

export interface ModuleContext {
  players: Player[]
  settings: RoomSettings
}

/**
 * Każda runda-klocek implementuje ten kontrakt. Host trzyma stan modułu,
 * przepuszcza przez niego akcje graczy i pyta o zakończenie.
 */
export interface GameModule<State = unknown, Config = unknown> {
  id: string
  name: string
  description: string
  /** Stan początkowy modułu dla danego składu graczy i konfiguracji hosta. */
  init(ctx: ModuleContext, config: Config): State
  /** Czysta funkcja: stan + akcja gracza → nowy stan. */
  reduce(state: State, action: ActionEnvelope, ctx: ModuleContext): State
  /** Impuls czasu (timery faz) — wywoływany przez hosta co sekundę. */
  tick?(state: State, ctx: ModuleContext): State
  /** Gdy zwróci wynik, sesja zabiera zmiany żetonów i wraca do playlisty. */
  result(state: State): { chipDelta: Record<string, number> } | null
}

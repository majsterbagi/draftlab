import { assign, setup } from 'xstate'
import type { GameState, Player, RoomSettings } from './types'

/**
 * Maszyna sesji hosta: lobby → moduł → podsumowanie.
 * Kontekstem jest pełny GameState rozgłaszany do telefonów; każda zmiana
 * podbija version, żeby telefony odrzucały nieaktualne broadcasty.
 */

const START_CHIPS = 100

export type SessionEvent =
  | { type: 'PLAYER_JOIN'; playerId: string; nick: string; avatar: Player['avatar'] }
  | { type: 'PLAYER_LEAVE'; playerId: string }
  | { type: 'START_MODULE'; moduleId: string }
  | { type: 'MODULE_FINISHED'; chipDelta: Record<string, number> }
  | { type: 'END_SESSION' }

export function createSessionMachine(roomCode: string, settings: RoomSettings) {
  const initial: GameState = {
    roomCode,
    settings,
    players: [],
    phase: { name: 'lobby' },
    version: 0,
  }

  return setup({
    types: {
      context: {} as GameState,
      events: {} as SessionEvent,
    },
    actions: {
      addPlayer: assign(({ context, event }) => {
        if (event.type !== 'PLAYER_JOIN') return context
        const existing = context.players.find((p) => p.id === event.playerId)
        const players: Player[] = existing
          ? context.players.map((p) =>
              p.id === event.playerId
                ? { ...p, nick: event.nick, avatar: event.avatar, connected: true }
                : p,
            )
          : [
              ...context.players,
              {
                id: event.playerId,
                nick: event.nick,
                avatar: event.avatar,
                chips: START_CHIPS,
                connected: true,
              },
            ]
        return { ...context, players, version: context.version + 1 }
      }),
      markLeft: assign(({ context, event }) => {
        if (event.type !== 'PLAYER_LEAVE') return context
        return {
          ...context,
          players: context.players.map((p) =>
            p.id === event.playerId ? { ...p, connected: false } : p,
          ),
          version: context.version + 1,
        }
      }),
      enterModule: assign(({ context, event }) => {
        if (event.type !== 'START_MODULE') return context
        return {
          ...context,
          phase: { name: 'module' as const, moduleId: event.moduleId, moduleState: null },
          version: context.version + 1,
        }
      }),
      applyResult: assign(({ context, event }) => {
        if (event.type !== 'MODULE_FINISHED') return context
        return {
          ...context,
          players: context.players.map((p) => ({
            ...p,
            chips: p.chips + (event.chipDelta[p.id] ?? 0),
          })),
          phase: { name: 'summary' as const },
          version: context.version + 1,
        }
      }),
    },
  }).createMachine({
    id: 'session',
    context: initial,
    initial: 'lobby',
    states: {
      lobby: {
        on: {
          PLAYER_JOIN: { actions: 'addPlayer' },
          PLAYER_LEAVE: { actions: 'markLeft' },
          START_MODULE: { target: 'module', actions: 'enterModule' },
        },
      },
      module: {
        on: {
          PLAYER_LEAVE: { actions: 'markLeft' },
          MODULE_FINISHED: { target: 'summary', actions: 'applyResult' },
        },
      },
      summary: {
        on: {
          START_MODULE: { target: 'module', actions: 'enterModule' },
          END_SESSION: { target: 'lobby' },
        },
      },
    },
  })
}

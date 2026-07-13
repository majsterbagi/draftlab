import type { RealtimeChannel } from '@supabase/supabase-js'
import { getSupabase } from './supabase'
import type { ActionEnvelope, GameState } from './types'

/**
 * Transport pokoju na kanałach Supabase Realtime (broadcast, bez zapisu do bazy —
 * stan gry jest ulotny; w Postgresie mieszka tylko treść pytań).
 *
 * Host: broadcastState() po każdej zmianie stanu, onAction() od telefonów.
 * Telefon: onState() renderuje, sendAction() zgłasza decyzje gracza.
 */

function roomChannel(code: string): RealtimeChannel {
  return getSupabase().channel(`room:${code}`, {
    config: { broadcast: { self: false } },
  })
}

export interface RoomConnection {
  channel: RealtimeChannel
  leave: () => void
}

export function connectAsHost(
  code: string,
  onAction: (action: ActionEnvelope) => void,
): RoomConnection {
  const channel = roomChannel(code)
  channel
    .on('broadcast', { event: 'action' }, ({ payload }) => onAction(payload as ActionEnvelope))
    .subscribe()
  return { channel, leave: () => void channel.unsubscribe() }
}

export function broadcastState(conn: RoomConnection, state: GameState): void {
  void conn.channel.send({ type: 'broadcast', event: 'state', payload: state })
}

export function connectAsPlayer(
  code: string,
  onState: (state: GameState) => void,
): RoomConnection {
  let lastVersion = -1
  const channel = roomChannel(code)
  channel
    .on('broadcast', { event: 'state' }, ({ payload }) => {
      const state = payload as GameState
      if (state.version > lastVersion) {
        lastVersion = state.version
        onState(state)
      }
    })
    .subscribe()
  return { channel, leave: () => void channel.unsubscribe() }
}

export function sendAction(conn: RoomConnection, action: ActionEnvelope): void {
  void conn.channel.send({ type: 'broadcast', event: 'action', payload: action })
}

// WebRTC DataChannel telefon ↔ host z sygnalizacją przez Firebase RTDB.
// Po sparowaniu input leci P2P (w LAN: pojedyncze ms). Gdy WebRTC nie wstanie
// (np. izolacja AP na routerze), pad przełącza się na fallback przez RTDB.

import { onValue, push, set, remove, update } from 'firebase/database';
import { roomRef } from './lobby.js';

const RTC_CONFIG = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };
const FALLBACK_AFTER_MS = 5000;

// ---------- STRONA PADA (telefon) ----------

export function connectPad(code, playerId, { onStatus, onHostMessage } = {}) {
  const pc = new RTCPeerConnection(RTC_CONFIG);
  const dc = pc.createDataChannel('input', { ordered: false, maxRetransmits: 0 });
  const rtcRef = (path) => roomRef(code, `rtc/${playerId}${path ? '/' + path : ''}`);
  const unsubs = [];
  let mode = 'connecting'; // connecting | webrtc | fallback
  let lastFallbackSend = 0;

  const setMode = (m) => {
    if (mode === m) return;
    mode = m;
    onStatus?.(m);
  };

  dc.onopen = () => setMode('webrtc');
  dc.onclose = () => { if (mode === 'webrtc') setMode('fallback'); };
  dc.onmessage = (e) => {
    try { onHostMessage?.(JSON.parse(e.data)); } catch { /* ignoruj śmieci */ }
  };

  pc.onicecandidate = (e) => {
    if (e.candidate) push(rtcRef('padIce'), e.candidate.toJSON());
  };

  (async () => {
    await remove(rtcRef()); // czyste konto przy ponownym wejściu
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    await set(rtcRef('offer'), { type: offer.type, sdp: offer.sdp });

    unsubs.push(onValue(rtcRef('answer'), async (snap) => {
      if (snap.exists() && !pc.currentRemoteDescription) {
        await pc.setRemoteDescription(snap.val());
      }
    }));
    unsubs.push(onValue(rtcRef('hostIce'), (snap) => {
      snap.forEach((c) => { pc.addIceCandidate(c.val()).catch(() => {}); });
    }));
  })();

  // Po czasie bez połączenia przechodzimy na fallback (input przez RTDB).
  const fallbackTimer = setTimeout(() => {
    if (mode !== 'webrtc') setMode('fallback');
  }, FALLBACK_AFTER_MS);

  // Fallback: stan hosta czytamy z RTDB.
  unsubs.push(onValue(roomRef(code, `padState/${playerId}`), (snap) => {
    if (mode !== 'webrtc' && snap.exists()) onHostMessage?.(snap.val());
  }));

  return {
    get mode() { return mode; },
    sendInput(input) {
      if (mode === 'webrtc' && dc.readyState === 'open') {
        dc.send(JSON.stringify({ t: 'i', ...input }));
      } else if (mode === 'fallback') {
        const now = Date.now();
        if (now - lastFallbackSend > 100) { // 10 Hz wystarcza przy wybaczającej fizyce
          lastFallbackSend = now;
          set(roomRef(code, `players/${playerId}/input`), input).catch(() => {});
        }
      }
    },
    // Zdarzenie jednorazowe (łap przedmiot / użyj) — nie jest częścią pętli inputu,
    // więc idzie osobno: przez DataChannel gdy P2P działa, inaczej push do RTDB
    // (host odbiera przez onChildAdded i sam usuwa wpis po przetworzeniu).
    sendAction(action) {
      if (mode === 'webrtc' && dc.readyState === 'open') {
        dc.send(JSON.stringify({ t: 'a', action }));
      } else {
        push(roomRef(code, `actions/${playerId}`), { action, at: Date.now() }).catch(() => {});
      }
    },
    close() {
      clearTimeout(fallbackTimer);
      unsubs.forEach((u) => u());
      dc.close();
      pc.close();
      remove(rtcRef()).catch(() => {});
    },
  };
}

// ---------- STRONA HOSTA (komputer) ----------

export function createHostRtc(code, { onInput, onPadStatus, onAction } = {}) {
  const peers = new Map(); // playerId -> { pc, dc }
  const unsubs = [];

  // Nowe oferty od padów.
  unsubs.push(onValue(roomRef(code, 'rtc'), (snap) => {
    snap.forEach((child) => {
      const playerId = child.key;
      const offer = child.child('offer').val();
      if (offer && !peers.has(playerId)) acceptPad(playerId, offer);
    });
  }));

  async function acceptPad(playerId, offer) {
    const pc = new RTCPeerConnection(RTC_CONFIG);
    const entry = { pc, dc: null };
    peers.set(playerId, entry);
    const rtcRef = (path) => roomRef(code, `rtc/${playerId}${path ? '/' + path : ''}`);

    pc.ondatachannel = (e) => {
      entry.dc = e.channel;
      entry.dc.onmessage = (ev) => {
        try {
          const msg = JSON.parse(ev.data);
          if (msg.t === 'i') onInput?.(playerId, msg);
          else if (msg.t === 'a') onAction?.(playerId, msg.action);
        } catch { /* ignoruj */ }
      };
      entry.dc.onopen = () => onPadStatus?.(playerId, 'webrtc');
      entry.dc.onclose = () => onPadStatus?.(playerId, 'fallback');
    };
    pc.onicecandidate = (e) => {
      if (e.candidate) push(rtcRef('hostIce'), e.candidate.toJSON());
    };

    await pc.setRemoteDescription(offer);
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    await set(rtcRef('answer'), { type: answer.type, sdp: answer.sdp });

    unsubs.push(onValue(rtcRef('padIce'), (snap) => {
      snap.forEach((c) => { pc.addIceCandidate(c.val()).catch(() => {}); });
    }));
  }

  // Fallback: input przez RTDB od padów bez działającego kanału P2P.
  unsubs.push(onValue(roomRef(code, 'players'), (snap) => {
    snap.forEach((child) => {
      const input = child.child('input').val();
      if (input) onInput?.(child.key, { t: 'i', ...input });
    });
  }));

  // Fallback: akcje (łap/użyj) wpychane przez pady bez P2P — każdy wpis
  // przetwarzamy raz i od razu usuwamy z bazy.
  unsubs.push(onValue(roomRef(code, 'actions'), (snap) => {
    snap.forEach((playerNode) => {
      const playerId = playerNode.key;
      playerNode.forEach((actionNode) => {
        onAction?.(playerId, actionNode.child('action').val());
        remove(actionNode.ref).catch(() => {});
      });
    });
  }));

  let lastRtdbState = 0;
  return {
    // Stan wyścigu do padów: P2P gdzie się da, RTDB (rzadziej) dla reszty.
    sendState(statesByPlayerId) {
      const now = Date.now();
      const rtdbBatch = {};
      let anyFallback = false;
      for (const [playerId, state] of Object.entries(statesByPlayerId)) {
        const peer = peers.get(playerId);
        if (peer?.dc?.readyState === 'open') {
          peer.dc.send(JSON.stringify(state));
        } else {
          anyFallback = true;
          rtdbBatch[`padState/${playerId}`] = state;
        }
      }
      if (anyFallback && now - lastRtdbState > 500) {
        lastRtdbState = now;
        update(roomRef(code), rtdbBatch).catch(() => {});
      }
    },
    close() {
      unsubs.forEach((u) => u());
      peers.forEach(({ pc, dc }) => { dc?.close(); pc.close(); });
      peers.clear();
    },
  };
}

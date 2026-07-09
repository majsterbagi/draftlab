// Klawiatura → inputy kartów (v0.1: gra lokalna na jednym komputerze).
// P1: strzałki + spacja (drift). P2: WASD + lewy Shift.

const BINDINGS = [
  { up: 'ArrowUp', down: 'ArrowDown', left: 'ArrowLeft', right: 'ArrowRight', drift: 'Space' },
  { up: 'KeyW', down: 'KeyS', left: 'KeyA', right: 'KeyD', drift: 'ShiftLeft' },
];

export function createKeyboard() {
  const pressed = new Set();
  const onDown = (e) => {
    if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
      e.preventDefault();
    }
    pressed.add(e.code);
  };
  const onUp = (e) => pressed.delete(e.code);
  window.addEventListener('keydown', onDown);
  window.addEventListener('keyup', onUp);

  return {
    pressed,
    inputFor(playerIdx) {
      const b = BINDINGS[playerIdx];
      if (!b) return { steer: 0, throttle: 0, drift: false };
      return {
        steer: (pressed.has(b.right) ? 1 : 0) - (pressed.has(b.left) ? 1 : 0),
        throttle: (pressed.has(b.up) ? 1 : 0) - (pressed.has(b.down) ? 1 : 0),
        drift: pressed.has(b.drift),
      };
    },
    dispose() {
      window.removeEventListener('keydown', onDown);
      window.removeEventListener('keyup', onUp);
    },
  };
}

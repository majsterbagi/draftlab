// Klawiatura → inputy kartów (v0.1: gra lokalna na jednym komputerze).
// P1: strzałki + spacja (drift) + Enter (przedmiot). P2: WASD + lewy Shift + lewy Ctrl.

const BINDINGS = [
  { up: 'ArrowUp', down: 'ArrowDown', left: 'ArrowLeft', right: 'ArrowRight', drift: 'Space', item: 'Enter' },
  { up: 'KeyW', down: 'KeyS', left: 'KeyA', right: 'KeyD', drift: 'ShiftLeft', item: 'ControlLeft' },
];
const CAPTURED = ['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter'];

export function createKeyboard() {
  const pressed = new Set();
  const itemJustPressed = new Set(); // konsumowane jednorazowo przez itemPressed()
  const onDown = (e) => {
    if (CAPTURED.includes(e.code)) e.preventDefault();
    if (!pressed.has(e.code)) {
      BINDINGS.forEach((b) => { if (b.item === e.code) itemJustPressed.add(e.code); });
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
    // Zwraca true dokładnie raz na wciśnięcie klawisza przedmiotu danego gracza.
    itemPressed(playerIdx) {
      const b = BINDINGS[playerIdx];
      if (!b || !itemJustPressed.has(b.item)) return false;
      itemJustPressed.delete(b.item);
      return true;
    },
    dispose() {
      window.removeEventListener('keydown', onDown);
      window.removeEventListener('keyup', onUp);
    },
  };
}

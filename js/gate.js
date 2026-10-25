// Grown-up maths gates: a big number keypad, and the hard three-question unlock used by the lock screen.

import { el, play } from './ui.js';

const rand = (lo, hi) => lo + Math.floor(Math.random() * (hi - lo + 1));

/** Big on-screen keypad. Calls onSubmit(number) on ✓; returns { node, reset }. */
export function keypad(onSubmit, maxDigits = 4) {
  let entry = '';
  const display = el('div.gate-entry', {}, '?');
  const show = () => { display.textContent = entry || '?'; };
  const pad = el('div.gate-pad', {},
    [1, 2, 3, 4, 5, 6, 7, 8, 9, '⌫', 0, '✓'].map(k => el(`button.gate-key${k === '✓' ? '.ok' : ''}`, {
      'aria-label': k === '⌫' ? 'Delete' : k === '✓' ? 'Enter' : String(k),
      onclick: () => {
        if (k === '⌫') entry = entry.slice(0, -1);
        else if (k === '✓') { if (entry) onSubmit(Number(entry)); return; }
        else if (entry.length < maxDigits) entry += k;
        show();
      },
    }, String(k))));
  return {
    node: el('div.keypad', {}, display, pad),
    reset() { entry = ''; show(); },
    shake() { play(display, 'wiggle'); },
  };
}

/** Three random questions: 2-digit × 1-digit, 2-digit × 2-digit, and a whole-number division. */
function hardSet(previous = []) {
  const make = [
    () => { const a = rand(12, 98), b = rand(3, 9); return { text: `${a} × ${b}`, answer: a * b }; },
    () => { const a = rand(11, 39), b = rand(11, 19); return { text: `${a} × ${b}`, answer: a * b }; },
    () => { const d = rand(6, 15), q = rand(6, 15); return { text: `${d * q} ÷ ${d}`, answer: q }; },
  ];
  return make.map((m, i) => {
    let q = m();
    while (q.text === previous[i]?.text) q = m();   // never the same question twice in a row
    return q;
  });
}

/**
 * The lock-screen gate: all three must be right in a row; a wrong answer starts again with new questions.
 * Returns a node; calls onPass() when solved.
 */
export function hardGate(onPass) {
  let set = hardSet();
  let step = 0;
  const dots = el('div.gate-dots', {}, [0, 1, 2].map(() => el('span')));
  const q = el('p.gate-q');
  const hint = el('p.gate-hint', {}, 'Answer all three to unlock.');
  const pad = keypad(answer => {
    if (answer === set[step].answer) {
      step++;
      if (step === 3) return onPass();
    } else {
      set = hardSet(set);
      step = 0;
      hint.textContent = 'Not quite. Start again with new questions.';
      pad.shake();
    }
    pad.reset();
    render();
  });
  function render() {
    q.textContent = `${set[step].text} =`;
    [...dots.children].forEach((d, i) => d.classList.toggle('done', i < step));
  }
  render();
  return el('div.gate-box', {}, el('h2', {}, 'Grown-ups only'), dots, q, pad.node, hint);
}

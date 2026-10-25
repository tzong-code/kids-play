// Small DOM helpers shared by the app shell and the games.

/** el('button.tool.big', { onclick }, child, child...) */
export function el(spec, props = {}, ...children) {
  const [tag, ...classes] = spec.split('.');
  const node = document.createElement(tag || 'div');
  if (classes.length) node.className = classes.join(' ');
  for (const [k, v] of Object.entries(props || {})) {
    if (k === 'style' && typeof v === 'object') for (const [p, val] of Object.entries(v)) node.style.setProperty(p.replace(/[A-Z]/g, c => '-' + c.toLowerCase()), val);
    else if (k === 'dataset') Object.assign(node.dataset, v);
    else if (k.startsWith('on')) node.addEventListener(k.slice(2), v);
    else if (k in node) node[k] = v;
    else node.setAttribute(k, v);
  }
  for (const c of children.flat()) if (c != null && c !== false) node.append(c);
  return node;
}

/** Replay a one-shot CSS animation class (wiggle, bounce, flash). */
export function play(node, cls = 'wiggle') {
  node.classList.remove(cls);
  void node.offsetWidth;
  node.classList.add(cls);
  node.addEventListener('animationend', () => node.classList.remove(cls), { once: true });
}

/**
 * Parent gesture: hold `node` for `ms` to fire `onDone`. A ring fills while holding;
 * a quick tap only wiggles. Returns a cleanup function.
 */
export function holdToActivate(node, onDone, ms = 2000) {
  node.classList.add('holdable');
  const ring = el('span.hold-ring');
  node.append(ring);
  let timer = null;
  let raf = null;
  let start = 0;
  const reset = () => {
    clearTimeout(timer);
    cancelAnimationFrame(raf);
    timer = raf = null;
    ring.style.setProperty('--p', 0);
    node.classList.remove('holding');
  };
  const tick = () => {
    ring.style.setProperty('--p', Math.min(1, (performance.now() - start) / ms));
    raf = requestAnimationFrame(tick);
  };
  const down = e => {
    e.preventDefault();
    start = performance.now();
    node.classList.add('holding');
    tick();
    timer = setTimeout(() => { reset(); onDone(); }, ms);
  };
  const up = () => {
    if (timer && performance.now() - start < 300) play(node);
    reset();
  };
  node.addEventListener('pointerdown', down);
  node.addEventListener('pointerup', up);
  node.addEventListener('pointerleave', up);
  node.addEventListener('pointercancel', up);
  node.addEventListener('contextmenu', e => e.preventDefault());
  return reset;
}

/** Two-tap inline confirm instead of a modal: first tap arms the button, second acts. */
export function armedButton(spec, idle, armed, onConfirm) {
  let t = null;
  const b = el(spec, {
    onclick: () => {
      if (b.classList.contains('armed')) {
        clearTimeout(t);
        b.classList.remove('armed');
        b.replaceChildren(...[].concat(idle));
        onConfirm();
      } else {
        b.classList.add('armed');
        b.replaceChildren(...[].concat(armed));
        t = setTimeout(() => { b.classList.remove('armed'); b.replaceChildren(...[].concat(idle)); }, 3500);
      }
    },
  }, idle);
  return b;
}

/** Share a File to the iOS share sheet ("Save Image" puts it in Photos); download elsewhere. */
export async function shareFile(file) {
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file] });
      return true;
    } catch (err) {
      if (err.name === 'AbortError') return false;
    }
  }
  const url = URL.createObjectURL(file);
  const a = el('a', { href: url, download: file.name });
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
  return true;
}

// Gigi's idle life: breathing (CSS), blinks every 3–5 s, a tail swish every 6–8 s, the odd ear
// twitch, and after 60 s without a touch she yawns, lies down and sleeps until tapped.

const SLEEP_AFTER = 60000;
const rand = (lo, hi) => lo + Math.random() * (hi - lo);

/**
 * @param svg     the Gigi <svg> element
 * @param hooks   { onSleep(), onWake(), sound }
 * @returns { poke(), wake(), stop(), asleep() }
 */
export function startIdle(svg, hooks) {
  const $ = id => svg.querySelector('#' + id);
  const timers = new Set();
  let sleeping = false;
  let lastTouch = Date.now();
  let zzz = null;

  const later = (fn, ms) => {
    const t = setTimeout(() => { timers.delete(t); fn(); }, ms);
    timers.add(t);
  };

  function blink() {
    if (!sleeping && !svg.classList.contains('gg-busy-eyes')) {
      svg.classList.add('gg-blink');
      setTimeout(() => svg.classList.remove('gg-blink'), 120);
      // Sometimes a quick double blink.
      if (Math.random() < 0.2) later(() => { svg.classList.add('gg-blink'); setTimeout(() => svg.classList.remove('gg-blink'), 110); }, 260);
    }
    later(blink, rand(3000, 5000));
  }

  function swish() {
    if (!sleeping) {
      $('tail').animate(
        [{ transform: 'rotate(0)' }, { transform: 'rotate(-22deg)' }, { transform: 'rotate(14deg)' }, { transform: 'rotate(-8deg)' }, { transform: 'rotate(0)' }],
        { duration: 1100, easing: 'ease-in-out' });
    }
    later(swish, rand(6000, 8000));
  }

  function twitch() {
    if (!sleeping) {
      $('ears').animate([{ transform: 'rotate(0)' }, { transform: 'rotate(-14deg)' }, { transform: 'rotate(6deg)' }, { transform: 'rotate(0)' }],
        { duration: 420, easing: 'ease-out' });
    }
    later(twitch, rand(8000, 14000));
  }

  function checkSleep() {
    if (!sleeping && Date.now() - lastTouch > SLEEP_AFTER) fallAsleep();
    later(checkSleep, 1000);
  }

  function fallAsleep() {
    sleeping = true;
    hooks.sound.yawn();
    svg.classList.add('gg-yawn');
    later(() => {
      svg.classList.remove('gg-yawn');
      svg.classList.add('gg-asleep');
      hooks.onSleep?.();
      snore();
    }, 1400);
  }

  function snore() {
    if (!sleeping) return;
    hooks.sound.snore();
    hooks.zzz?.();
    later(snore, 3200);
  }

  function wake() {
    if (!sleeping) return false;
    sleeping = false;
    svg.classList.remove('gg-asleep');
    svg.classList.add('gg-yawn');
    hooks.sound.yawn();
    // A big stretch as she stands back up.
    $('gigi').animate([{ transform: 'scale(1, 1)' }, { transform: 'scale(.96, 1.07)' }, { transform: 'scale(1.02, .98)' }, { transform: 'scale(1, 1)' }],
      { duration: 900, easing: 'ease-out', delay: 250 });
    later(() => svg.classList.remove('gg-yawn'), 1100);
    hooks.onWake?.();
    return true;
  }

  later(blink, rand(1200, 2500));
  later(swish, rand(3000, 5000));
  later(twitch, rand(5000, 8000));
  later(checkSleep, 1000);

  return {
    /** Any touch: keeps her awake; wakes her if sleeping (returns true if it woke her). */
    poke() {
      lastTouch = Date.now();
      return wake();
    },
    asleep: () => sleeping,
    stop() {
      timers.forEach(clearTimeout);
      timers.clear();
      sleeping = false;
    },
  };
}

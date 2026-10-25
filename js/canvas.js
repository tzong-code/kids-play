// Drawing engine: a square paint layer under an outline layer (colouring pages),
// with brushes, flood fill, emoji stamps, region-based undo/redo and PNG export.
//
// The document is a fixed square whose side is the screen's long edge, centred in the
// stage. Rotating the iPad only changes which part is visible, so nothing is ever lost.

const MAX_BACKING = 2048;      // cap backing pixels per side to keep memory sane on iPad
const UNDO_LIMIT = 30;
const UNDO_BYTES = 120e6;
const STAMP_FONT = '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';

export class Surface {
  /**
   * @param {HTMLElement} stage  element the surface fills (position: relative, overflow hidden)
   * @param {object} opts
   *   side         document side in CSS px (default: screen long edge)
   *   pressure     use Apple Pencil pressure for width
   *   multiTouch   allow pinch-to-resize stamps
   *   fillMode     'region' (page outlines only are walls) or 'color' (classic bucket)
   *   onCommit     called after every undoable change
   *   onStroke     called with (kind, info) for sound/feedback hooks
   */
  constructor(stage, opts = {}) {
    this.stage = stage;
    this.opts = opts;
    // The window's long edge, which stays the same when the iPad rotates.
    this.side = opts.side || Math.max(innerWidth, innerHeight);
    this.scale = Math.min(window.devicePixelRatio || 1, MAX_BACKING / this.side);
    this.px = Math.round(this.side * this.scale);

    this.wrap = document.createElement('div');
    this.wrap.className = 'surface';
    this.wrap.style.width = this.wrap.style.height = this.side + 'px';
    this.paint = makeCanvas(this.px);
    this.lines = makeCanvas(this.px);
    this.lines.classList.add('lines');
    this.wrap.append(this.paint, this.lines);
    stage.append(this.wrap);

    this.pctx = this.paint.getContext('2d');
    this.lctx = this.lines.getContext('2d');
    this.base = makeCanvas(this.px);           // mirror of the last committed state, for undo
    this.bctx = this.base.getContext('2d');

    this.tool = { type: 'brush', brush: 'marker', color: '#e53935', width: 14 };
    this.undoStack = [];
    this.redoStack = [];
    this.lineMask = null;
    this.pageBox = null;
    this.pointers = new Map();
    this.textures = new Map();
    this.penUntil = 0;

    this._bind();
  }

  destroy() {
    this._unbind();
    this.wrap.remove();
    this.undoStack = this.redoStack = [];
  }

  setTool(tool) {
    this._finishPending();
    this.tool = { ...this.tool, ...tool };
  }

  get canUndo() { return this.undoStack.length > 0; }
  get canRedo() { return this.redoStack.length > 0; }
  get isEmpty() { return !this._dirtyEver; }

  // ---------- colouring page outlines ----------

  /** Draw an SVG outline page centred in the visible area. `svgInner` uses viewBox 0 0 100 100. */
  async setPage(svgInner, strokeWidth = 1.2) {
    this.lctx.clearRect(0, 0, this.px, this.px);
    this.lineMask = null;
    this.pageBox = null;
    if (!svgInner) return;
    const r = this.stage.getBoundingClientRect();
    const box = Math.min(r.width, r.height, this.side) * 0.94 * this.scale;
    const x = (this.px - box) / 2, y = (this.px - box) / 2;
    const img = await svgImage(svgInner, strokeWidth, Math.round(box));
    this.lctx.drawImage(img, x, y, box, box);
    this.pageBox = { x, y, size: box };
    const data = this.lctx.getImageData(0, 0, this.px, this.px).data;
    const mask = new Uint8Array(this.px * this.px);
    for (let i = 0, j = 3; i < mask.length; i++, j += 4) mask[i] = data[j] > 110 ? 1 : 0;
    this.lineMask = mask;
  }

  // ---------- load / clear / export ----------

  /** Replace the paint layer with an image (Blob or HTMLImageElement), fitted to the square. */
  async load(source) {
    const img = source instanceof Blob ? await blobImage(source) : source;
    this.pctx.clearRect(0, 0, this.px, this.px);
    const k = Math.min(this.px / img.width, this.px / img.height);
    const w = img.width * k, h = img.height * k;
    this.pctx.drawImage(img, (this.px - w) / 2, (this.px - h) / 2, w, h);
    this.bctx.clearRect(0, 0, this.px, this.px);
    this.bctx.drawImage(this.paint, 0, 0);
    this.undoStack = [];
    this.redoStack = [];
    this._dirtyEver = true;
  }

  clear() {
    this._finishPending();
    this.pctx.clearRect(0, 0, this.px, this.px);
    this._commit({ x: 0, y: 0, w: this.px, h: this.px });
  }

  undo() { this._step(this.undoStack, this.redoStack, 'before'); }
  redo() { this._step(this.redoStack, this.undoStack, 'after'); }

  _step(from, to, key) {
    this._finishPending();
    const e = from.pop();
    if (!e) return;
    this.pctx.putImageData(e[key], e.x, e.y);
    this.bctx.putImageData(e[key], e.x, e.y);
    to.push(e);
    this.opts.onCommit?.();
  }

  /** White background + paint + outlines, at full resolution. */
  composite(size = this.px) {
    const c = makeCanvas(size);
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, size, size);
    ctx.drawImage(this.paint, 0, 0, size, size);
    ctx.drawImage(this.lines, 0, 0, size, size);
    return c;
  }

  paintBlob() { return canvasBlob(this.paint, 'image/png'); }
  imageBlob() { return canvasBlob(this.composite(), 'image/png'); }
  thumbBlob() { return canvasBlob(this.composite(360), 'image/jpeg', 0.82); }
  /** Synchronous PNG file, so the share sheet can open inside the tap's user gesture. */
  imageFileSync(name) { return dataUrlFile(this.composite().toDataURL('image/png'), name); }

  // ---------- input ----------

  _bind() {
    this._down = e => this._onDown(e);
    this._move = e => this._onMove(e);
    this._up = e => this._onUp(e);
    this.wrap.addEventListener('pointerdown', this._down);
    window.addEventListener('pointermove', this._move);
    window.addEventListener('pointerup', this._up);
    window.addEventListener('pointercancel', this._up);
  }

  _unbind() {
    this.wrap.removeEventListener('pointerdown', this._down);
    window.removeEventListener('pointermove', this._move);
    window.removeEventListener('pointerup', this._up);
    window.removeEventListener('pointercancel', this._up);
  }

  _pt(e) {
    const r = this.paint.getBoundingClientRect();
    const k = this.px / r.width;
    const pressure = this.opts.pressure && e.pointerType === 'pen' && e.pressure > 0 ? e.pressure : 0.5;
    return { x: (e.clientX - r.left) * k, y: (e.clientY - r.top) * k, p: pressure };
  }

  _rejectTouch(e) {
    if (e.pointerType !== 'touch') return false;
    // Palm rejection: ignore fingers while (and just after) the Pencil is drawing,
    // and anything with a contact patch far wider than a fingertip.
    if (performance.now() < this.penUntil) return true;
    return Math.max(e.width || 0, e.height || 0) > 70;
  }

  _onDown(e) {
    if (this._rejectTouch(e)) return;
    e.preventDefault();
    if (e.pointerType === 'pen') this.penUntil = Infinity;

    // A second finger only matters for pinching a stamp; otherwise one stroke at a time.
    if (this.pointers.size) {
      if (this.stampDrag && this.opts.multiTouch && this.pointers.size === 1) {
        this.pointers.set(e.pointerId, this._pt(e));
        this.stampDrag.pinch = { dist: this._pinchDist(), size: this.stampDrag.size };
      }
      return;
    }
    this._finishPending();
    this.pointers.set(e.pointerId, this._pt(e));
    const p = this._pt(e);
    const t = this.tool;
    if (t.type === 'brush') this._beginStroke(p, e);
    else if (t.type === 'fill') this._fill(p);
    else if (t.type === 'stamp') this._beginStamp(p, e);
  }

  _onMove(e) {
    if (!this.pointers.has(e.pointerId)) return;
    const events = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
    for (const ev of events.length ? events : [e]) {
      const p = this._pt(ev);
      this.pointers.set(e.pointerId, p);
      if (this.stroke && this.stroke.id === e.pointerId) this._extendStroke(p);
    }
    if (this.stampDrag) this._moveStamp(e);
  }

  _onUp(e) {
    if (!this.pointers.has(e.pointerId)) return;
    this.pointers.delete(e.pointerId);
    if (e.pointerType === 'pen') this.penUntil = performance.now() + 600;
    if (this.stroke && this.stroke.id === e.pointerId) this._endStroke();
    if (this.stampDrag) {
      if (this.pointers.size === 0) this._dropStamp();
      else this.stampDrag.pinch = null;
    }
  }

  // ---------- brushes ----------

  _beginStroke(p, e) {
    const w = this.tool.width * this.scale;
    this.stroke = { id: e.pointerId, pts: [p], dist: 0, base: w, box: box(p, w), pen: e.pointerType === 'pen' };
    this.pctx.save();
    this._style(p, p, this.stroke);
    // A dot, so a single tap leaves a mark.
    const ctx = this.pctx;
    ctx.beginPath();
    ctx.arc(p.x, p.y, this._width(p) / 2, 0, Math.PI * 2);
    ctx.fillStyle = ctx.strokeStyle;
    ctx.fill();
    if (this.tool.brush === 'glitter') this._sparkles(p, p, true);
    this.pctx.restore();
    this.opts.onStroke?.('start', { brush: this.tool.brush });
  }

  _extendStroke(p) {
    const s = this.stroke;
    const pts = s.pts;
    const last = pts[pts.length - 1];
    const d = Math.hypot(p.x - last.x, p.y - last.y);
    if (d < 1.5 * this.scale) return;
    pts.push(p);
    s.dist += d;
    const n = pts.length;
    const a = n > 2 ? mid(pts[n - 3], pts[n - 2]) : pts[0];
    const c = pts[n - 2];
    const b = mid(c, p);
    const ctx = this.pctx;
    ctx.save();
    this._style(c, p, s);
    ctx.lineWidth = this._width(p);
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.quadraticCurveTo(c.x, c.y, b.x, b.y);
    ctx.stroke();
    if (this.tool.brush === 'glitter') this._sparkles(a, b);
    ctx.restore();
    grow(s.box, p, s.base * 2);
    this.opts.onStroke?.('move', { dist: s.dist / this.scale });
  }

  _endStroke() {
    const s = this.stroke;
    const pts = s.pts;
    if (pts.length > 1) {
      // Finish the tail from the last midpoint to the final point.
      const n = pts.length;
      const a = mid(pts[n - 2], pts[n - 1]);
      const b = pts[n - 1];
      const ctx = this.pctx;
      ctx.save();
      this._style(b, b, s);
      ctx.lineWidth = this._width(b);
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
      ctx.restore();
    }
    this.stroke = null;
    this._commit(s.box);
    this.opts.onStroke?.('end', {});
  }

  _width(p) {
    const s = this.stroke;
    if (!s.pen || !this.opts.pressure) return s.base;
    return s.base * (0.35 + 1.3 * p.p);
  }

  _style(a, b, s) {
    const ctx = this.pctx;
    const t = this.tool;
    ctx.lineCap = ctx.lineJoin = 'round';
    ctx.globalCompositeOperation = 'source-over';
    ctx.lineWidth = this._width(b);
    switch (t.brush) {
      case 'rainbow':
        ctx.strokeStyle = `hsl(${(s.dist / this.scale * 0.6) % 360},95%,55%)`;
        break;
      case 'crayon':
        ctx.strokeStyle = this._crayon(t.color);
        break;
      case 'glitter':
        ctx.strokeStyle = t.color;
        ctx.lineWidth = this._width(b) * 0.7;
        break;
      case 'eraser':
        ctx.globalCompositeOperation = 'destination-out';
        ctx.strokeStyle = '#000';
        break;
      default:
        ctx.strokeStyle = t.color;
    }
  }

  /** A grainy pattern in the given colour, so crayon strokes look waxy. */
  _crayon(color) {
    let pat = this.textures.get(color);
    if (pat) return pat;
    const n = 48;
    const c = makeCanvas(n);
    const ctx = c.getContext('2d');
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, n, n);
    const img = ctx.getImageData(0, 0, n, n);
    for (let i = 3; i < img.data.length; i += 4) {
      const r = Math.random();
      img.data[i] = r < 0.12 ? 0 : r < 0.35 ? 150 : 235;
    }
    ctx.putImageData(img, 0, 0);
    pat = this.pctx.createPattern(c, 'repeat');
    this.textures.set(color, pat);
    return pat;
  }

  _sparkles(a, b, burst = false) {
    const ctx = this.pctx;
    const s = this.stroke;
    const len = Math.hypot(b.x - a.x, b.y - a.y);
    const count = burst ? 6 : Math.ceil(len / (6 * this.scale));
    const spread = s.base * 0.9;
    for (let i = 0; i < count; i++) {
      const t = Math.random();
      const x = a.x + (b.x - a.x) * t + (Math.random() - 0.5) * spread * 2;
      const y = a.y + (b.y - a.y) * t + (Math.random() - 0.5) * spread * 2;
      const r = (1 + Math.random() * 2.2) * this.scale;
      ctx.fillStyle = ['#fff', '#fff6b0', '#ffd54f', this.tool.color][(Math.random() * 4) | 0];
      if (Math.random() < 0.25) star(ctx, x, y, r * 2.2);
      else { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); }
      grow(s.box, { x, y }, r * 3);
    }
  }

  // ---------- flood fill ----------

  _fill(p) {
    const W = this.px;
    const x0 = Math.floor(p.x), y0 = Math.floor(p.y);
    if (x0 < 0 || y0 < 0 || x0 >= W || y0 >= W) return;
    const img = this.pctx.getImageData(0, 0, W, W);
    const d = img.data;
    const lines = this.lineMask;
    if (lines && lines[y0 * W + x0]) return;  // tapped right on an outline

    const regionOnly = lines && this.opts.fillMode === 'region';
    const si = (y0 * W + x0) * 4;
    // Compare premultiplied RGBA, so empty paper differs from painted white (stamps, sparkles).
    const sa = d[si + 3] / 255;
    const sr = d[si] * sa, sg = d[si + 1] * sa, sb = d[si + 2] * sa, sA = d[si + 3];
    const diff = i => {
      const j = i * 4, a = d[j + 3] / 255;
      const r = d[j] * a - sr, g = d[j + 1] * a - sg, b = d[j + 2] * a - sb, A = d[j + 3] - sA;
      return r * r + g * g + b * b + A * A;
    };
    const tol = 48 * 48 * 4;
    const open = i => {
      if (lines && lines[i]) return false;
      if (regionOnly) return true;
      return diff(i) <= tol;
    };

    // Scanline flood fill into a mask.
    const mask = new Uint8Array(W * W);
    const stack = [x0, y0];
    let minX = x0, maxX = x0, minY = y0, maxY = y0;
    while (stack.length) {
      const y = stack.pop(), x = stack.pop();
      const row = y * W;
      if (mask[row + x] || !open(row + x)) continue;
      let l = x;
      while (l > 0 && !mask[row + l - 1] && open(row + l - 1)) l--;
      let r = x;
      while (r < W - 1 && !mask[row + r + 1] && open(row + r + 1)) r++;
      for (let i = l; i <= r; i++) mask[row + i] = 1;
      if (l < minX) minX = l;
      if (r > maxX) maxX = r;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
      for (const ny of [y - 1, y + 1]) {
        if (ny < 0 || ny >= W) continue;
        const nrow = ny * W;
        let inRun = false;
        for (let i = l; i <= r; i++) {
          const ok = !mask[nrow + i] && open(nrow + i);
          if (ok && !inRun) { stack.push(i, ny); inRun = true; }
          else if (!ok) inRun = false;
        }
      }
    }

    // Grow the fill a little so it tucks under anti-aliased edges instead of leaving a halo.
    const pad = Math.max(1, Math.round(this.scale * (lines ? 2 : 1)));
    minX = Math.max(0, minX - pad); maxX = Math.min(W - 1, maxX + pad);
    minY = Math.max(0, minY - pad); maxY = Math.min(W - 1, maxY + pad);
    const bw = maxX - minX + 1, bh = maxY - minY + 1;
    const out = new ImageData(bw, bh);
    const [fr, fg, fb] = hexRgb(this.tool.color);
    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        let hit = mask[y * W + x];
        if (!hit) {
          // Dilate only into outline pixels (page) or soft edge pixels (free draw).
          const i = y * W + x;
          const soft = lines ? lines[i] : d[i * 4 + 3] < 250 || !open(i);
          if (soft) {
            outer: for (let dy = -pad; dy <= pad; dy++) {
              const yy = y + dy;
              if (yy < 0 || yy >= W) continue;
              for (let dx = -pad; dx <= pad; dx++) {
                const xx = x + dx;
                if (xx >= 0 && xx < W && mask[yy * W + xx]) { hit = 1; break outer; }
              }
            }
            if (hit && !lines) {
              // Don't eat into a neighbouring solid colour, only blend over its soft rim.
              if (d[i * 4 + 3] >= 250 && diff(i) > 140 * 140 * 4) hit = 0;
            }
          }
        }
        if (hit) {
          const o = ((y - minY) * bw + (x - minX)) * 4;
          out.data[o] = fr; out.data[o + 1] = fg; out.data[o + 2] = fb; out.data[o + 3] = 255;
        }
      }
    }

    // Reveal the fill with a quick expanding circle from the tap point.
    const tmp = makeCanvas(1);
    tmp.width = bw; tmp.height = bh;
    tmp.getContext('2d').putImageData(out, 0, 0);
    const rect = { x: minX, y: minY, w: bw, h: bh };
    const maxR = Math.hypot(Math.max(x0 - minX, maxX - x0), Math.max(y0 - minY, maxY - y0)) + 2;
    const start = performance.now();
    const dur = Math.min(420, 160 + maxR / this.scale * 0.6);
    const draw = r => {
      const ctx = this.pctx;
      ctx.save();
      ctx.beginPath();
      ctx.arc(x0, y0, r, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(tmp, minX, minY);
      ctx.restore();
    };
    const pending = this.pendingFill = {
      finish: () => {
        if (this.pendingFill !== pending) return;
        cancelAnimationFrame(pending.raf);
        clearTimeout(pending.timer);
        draw(maxR);
        this.pendingFill = null;
        this._commit(rect);
      },
    };
    const frame = now => {
      // A frame's timestamp can predate `start`, so clamp at both ends.
      const t = clamp((now - start) / dur, 0, 1);
      draw(maxR * (1 - (1 - t) ** 3));
      if (t < 1) pending.raf = requestAnimationFrame(frame);
      else pending.finish();
    };
    pending.raf = requestAnimationFrame(frame);
    // Frames pause when the app is hidden; make sure the fill still lands and gets saved.
    pending.timer = setTimeout(pending.finish, dur + 150);
    this.opts.onStroke?.('fill', {});
  }

  // ---------- stamps ----------

  _beginStamp(p, e) {
    const el = document.createElement('div');
    el.className = 'stamp-ghost';
    el.textContent = this.tool.glyph;
    this.wrap.append(el);
    this.stampDrag = { el, p, size: this.tool.size || 90, pinch: null };
    this._placeGhost();
    this.opts.onStroke?.('stamp-pick', {});
  }

  _moveStamp(e) {
    const s = this.stampDrag;
    const first = this.pointers.values().next().value;
    if (s.pinch && this.pointers.size >= 2) {
      s.size = clamp(s.pinch.size * (this._pinchDist() / s.pinch.dist), 30, 420);
    } else if (first) {
      s.p = first;
    }
    this._placeGhost();
  }

  _pinchDist() {
    const [a, b] = [...this.pointers.values()];
    return Math.max(1, Math.hypot(a.x - b.x, a.y - b.y));
  }

  _placeGhost() {
    const s = this.stampDrag;
    const k = 1 / this.scale;
    s.el.style.fontSize = s.size + 'px';
    s.el.style.left = s.p.x * k + 'px';
    s.el.style.top = s.p.y * k + 'px';
  }

  _dropStamp() {
    const s = this.stampDrag;
    this.stampDrag = null;
    s.el.remove();
    const size = s.size * this.scale;
    const ctx = this.pctx;
    ctx.save();
    ctx.font = `${size}px ${STAMP_FONT}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.tool.glyph, s.p.x, s.p.y);
    ctx.restore();
    this._commit({ x: s.p.x - size * 0.75, y: s.p.y - size * 0.75, w: size * 1.5, h: size * 1.5 });
    if (this.opts.multiTouch) this.tool.size = s.size;
    this.opts.onStroke?.('stamp', { x: s.p.x / this.scale, y: s.p.y / this.scale, size: s.size });
  }

  // ---------- undo bookkeeping ----------

  _finishPending() {
    this.pendingFill?.finish();
  }

  _commit(r) {
    const x = Math.max(0, Math.floor(r.x)), y = Math.max(0, Math.floor(r.y));
    const w = Math.min(this.px, Math.ceil(r.x + r.w)) - x;
    const h = Math.min(this.px, Math.ceil(r.y + r.h)) - y;
    if (w <= 0 || h <= 0) return;
    const before = this.bctx.getImageData(x, y, w, h);
    const after = this.pctx.getImageData(x, y, w, h);
    this.bctx.putImageData(after, x, y);
    this.undoStack.push({ x, y, before, after, bytes: w * h * 8 });
    this.redoStack = [];
    let bytes = this.undoStack.reduce((n, e) => n + e.bytes, 0);
    while (this.undoStack.length > UNDO_LIMIT || (bytes > UNDO_BYTES && this.undoStack.length > 1)) {
      bytes -= this.undoStack.shift().bytes;
    }
    this._dirtyEver = true;
    this.opts.onCommit?.();
  }
}

// ---------- helpers ----------

function makeCanvas(size) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  return c;
}

const mid = (a, b) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, p: (a.p + b.p) / 2 });
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const box = (p, pad) => ({ x: p.x - pad, y: p.y - pad, w: pad * 2, h: pad * 2 });

function grow(b, p, pad) {
  const x1 = Math.min(b.x, p.x - pad), y1 = Math.min(b.y, p.y - pad);
  const x2 = Math.max(b.x + b.w, p.x + pad), y2 = Math.max(b.y + b.h, p.y + pad);
  b.x = x1; b.y = y1; b.w = x2 - x1; b.h = y2 - y1;
}


function hexRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function star(ctx, x, y, r) {
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    const rr = i % 2 ? r * 0.3 : r;
    ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
  }
  ctx.closePath();
  ctx.fill();
}

export function pageSvg(inner, strokeWidth, size = 100) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="${size}" height="${size}">` +
    `<g fill="none" stroke="#222" stroke-width="${strokeWidth}" stroke-linejoin="round" stroke-linecap="round">${inner}</g></svg>`;
}

function svgImage(inner, strokeWidth, size) {
  const img = new Image();
  img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(pageSvg(inner, strokeWidth, size));
  return img.decode().then(() => img);
}

export function blobImage(blob) {
  const img = new Image();
  const url = URL.createObjectURL(blob);
  img.src = url;
  return img.decode().then(() => { URL.revokeObjectURL(url); return img; });
}

function canvasBlob(canvas, type, quality) {
  return new Promise(res => canvas.toBlob(res, type, quality));
}

export function dataUrlFile(dataUrl, name) {
  const [head, b64] = dataUrl.split(',');
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new File([bytes], name, { type: head.slice(5, head.indexOf(';')) });
}

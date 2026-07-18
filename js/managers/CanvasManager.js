/**
 * CanvasManager - renders the current page and handles all pointer
 * interactions (drag to move, handle drag to resize / rotate, marquee).
 *
 * Rendering strategy: absolutely-positioned <div class="obj"> nodes on the
 * canvas layer; the selection outline + handles are drawn on the SVG
 * overlay layer so they never rotate/scale with the object itself.
 */
class CanvasManager extends BaseManager {
  // Normalised corner radius as a percentage 0-50 (50 = circle/ellipse).
  // Accepts the legacy 'circle' string from older saved documents.
  static radiusPct(obj) {
    if (obj.borderRadius === 'circle') return 50;
    return Math.min(50, Math.max(0, parseFloat(obj.borderRadius) || 0));
  }

  // Override fill/stroke colours by directly rewriting the attributes in
  // the SVG markup string.  Unlike a <style> block (which leaks globally to
  // every SVG in the HTML document when the SVG is inlined), attribute
  // replacement only affects the target SVG.  fill="none" / stroke="none"
  // (transparent regions) are preserved so outline-only elements stay
  // outline-only and don't become solid blocks.  Three storage styles are
  // handled:
  //   1. standalone fill="X" / stroke="X" attributes
  //   2. CSS-in-style: style="fill:X;stroke:Y" (Inkscape exports)
  //   3. elements with no fill at all (SVG default = black) — fill injected
  // Structural/container elements (svg/g/defs/marker/symbol/use/clipPath/
  // mask/pattern/gradient/filter) are excluded from injection.
  static applySvgColor(markup, color) {
    if (!color || !markup) return markup;
    let out = markup;
    // 1. Replace existing fill="X" / fill='X' where X is not "none".
    out = out.replace(/\sfill=(?:"([^"]*)"|'([^']*)')/g, (m, d, s) => {
      const v = (d !== undefined ? d : s).toLowerCase();
      return v === 'none' ? m : ` fill="${color}"`;
    });
    // 2. Replace existing stroke="X" / stroke='X' where X is not "none".
    out = out.replace(/\sstroke=(?:"([^"]*)"|'([^']*)')/g, (m, d, s) => {
      const v = (d !== undefined ? d : s).toLowerCase();
      return v === 'none' ? m : ` stroke="${color}"`;
    });
    // 3. Replace fill:/stroke: CSS properties inside style="..." attributes.
    //    Matches `fill:X` or `;fill:X` (so `fill-opacity:` is NOT matched —
    //    it has a hyphen between `fill` and `:`).  `none` is preserved;
    //    gradient references like `url(#...)` are overridden with the solid
    //    colour, since colorize means single-colour intent.
    out = out.replace(/style="([^"]*)"/g, (m, css) => {
      const newCss = css
        .replace(/(^|;)\s*fill:\s*([^;"}]+)/g, (fm, pre, val) =>
          val.trim().toLowerCase() === 'none' ? fm : `${pre}fill:${color}`)
        .replace(/(^|;)\s*stroke:\s*([^;"}]+)/g, (fm, pre, val) =>
          val.trim().toLowerCase() === 'none' ? fm : `${pre}stroke:${color}`);
      return `style="${newCss}"`;
    });
    // 4. Inject fill="${color}" into drawable shape elements that have no
    //    fill attribute AND no style attribute (they default to black).
    //    Elements with style="..." are handled in step 3; injecting a
    //    presentation attribute alongside style would be overridden by CSS.
    const drawable = 'path|rect|circle|ellipse|line|polyline|polygon';
    out = out.replace(new RegExp(`<(${drawable})\\b([^>]*)>`, 'g'), (m, tag, attrs) => {
      if (/\s(fill|style)=/.test(attrs)) return m;
      return `<${tag} fill="${color}"${attrs}>`;
    });
    return out;
  }

  constructor(app) {
    super(app);
    this.canvasEl = null;
    this.overlayEl = null;
    this.wrapperEl = null;
    this._nodes = new Map();  // id -> element
    this._interaction = null; // active drag/resize state
    this._editing = null;     // active inline-text-edit state, see _beginTextEdit
  }

  init() {
    this.canvasEl = document.getElementById('canvas');
    this.overlayEl = document.getElementById('canvas-overlay');
    this.wrapperEl = document.getElementById('canvas-wrapper');
    this.gridEl = document.getElementById('canvas-grid');

    this.on('document:loaded', () => {this._resizeCanvas(); this.renderAll(); this.renderSelection();});
    this.on('document:restored', () => {this._resizeCanvas(); this.renderAll(); this.renderSelection();});
    this.on('objects:changed', () => {this.renderAll(); this.renderSelection();});
    this.on('object:updated', (o) => {this.renderObject(o); this.renderSelection();});
    this.on('selection:changed', () => this.renderSelection());
    this.on('pages:changed', () => {this.renderAll(); this.renderSelection();});
    this.on('state:changed', ({patch}) => {
      if (patch.currentPageId !== undefined) {this.renderAll(); this.renderSelection();}
      if (patch.gridVisible !== undefined) this._syncGrid();
    });
    this._syncGrid();

    // Bind pointer handling
    this.canvasEl.addEventListener('pointerdown', (e) => this._onCanvasPointerDown(e));
    this.canvasEl.addEventListener('dblclick', (e) => this._onCanvasDblClick(e));
    this.overlayEl.addEventListener('pointerdown', (e) => this._onOverlayPointerDown(e));

    // Deselect when clicking outside canvas on workspace
    document.getElementById('workspace-viewport').addEventListener('pointerdown', (e) => {
      if (e.target.id === 'workspace-viewport' || e.target.id === 'workspace-scene') {
        this.app.selectionManager.clear();
      }
    });
  }

  _resizeCanvas() {
    const doc = this.store.get('document');
    if (!doc) return;
    this.canvasEl.style.width = `${doc.width}px`;
    this.canvasEl.style.height = `${doc.height}px`;
    this.overlayEl.setAttribute('width', doc.width);
    this.overlayEl.setAttribute('height', doc.height);
    this.overlayEl.setAttribute('viewBox', `0 0 ${doc.width} ${doc.height}`);
    this.overlayEl.style.width = `${doc.width}px`;
    this.overlayEl.style.height = `${doc.height}px`;
    this.gridEl.style.width = `${doc.width}px`;
    this.gridEl.style.height = `${doc.height}px`;
    const page = this.app.pageManager.currentPage();
    if (page) this.canvasEl.style.background = page.background;
  }

  _syncGrid() {
    this.gridEl.classList.toggle('visible', this.store.get('gridVisible'));
  }

  renderAll() {
    // Commit any active inline edit before rebuilding, otherwise the
    // contenteditable node would be wiped and the change lost.
    if (this._editing) this._finishTextEdit(true);
    this._resizeCanvas();
    const page = this.app.pageManager.currentPage();
    if (!page) {this.canvasEl.innerHTML = ''; this._nodes.clear(); return;}
    this.canvasEl.innerHTML = '';
    this._nodes.clear();
    const sorted = [...page.objects].sort((a, b) => a.zIndex - b.zIndex);
    sorted.forEach((o) => this.renderObject(o, true));
  }

  renderObject(obj, create = false) {
    // Never re-render the object currently being edited inline — that would
    // overwrite the live contenteditable node and lose the caret / selection.
    if (this._editing && this._editing.id === obj.id) return;
    let el = this._nodes.get(obj.id);
    if (!el) {
      el = document.createElement('div');
      el.className = 'obj';
      el.dataset.id = obj.id;
      this.canvasEl.appendChild(el);
      this._nodes.set(obj.id, el);
    }
    el.style.left = `${obj.x}px`;
    el.style.top = `${obj.y}px`;
    el.style.width = `${obj.width}px`;
    el.style.height = `${obj.height}px`;
    el.style.transform = obj.rotation ? `rotate(${obj.rotation}deg)` : '';
    el.style.opacity = obj.opacity;

    const filters = [];
    if (obj.blur) filters.push(`blur(${obj.blur}px)`);
    if (obj.brightness !== 100) filters.push(`brightness(${obj.brightness}%)`);
    if (obj.contrast !== 100) filters.push(`contrast(${obj.contrast}%)`);
    if (obj.grayscale) filters.push(`grayscale(${obj.grayscale}%)`);
    if (obj.shadow) {
      filters.push(`drop-shadow(${obj.shadow.x || 0}px ${obj.shadow.y || 0}px ${obj.shadow.blur || 0}px ${obj.shadow.color || 'rgba(0,0,0,0.3)'})`);
    }
    el.style.filter = filters.join(' ');

    el.className = `obj obj-${obj.type}` + (obj.locked ? ' locked' : '') + (!obj.visible ? ' hidden' : '');

    if (obj.type === 'image') {
      // Keep the <img> node alive across style-only updates: recreating it on
      // every frame forces the browser to decode the (often data-URL) image
      // again, which is the main source of lag when dragging or adjusting.
      el.style.borderRadius = `${CanvasManager.radiusPct(obj)}%`;
      el.style.overflow = 'hidden';
      if (el._src !== obj.src) {
        el.innerHTML = `<img src="${obj.src}" alt="" draggable="false"
          style="width:100%;height:100%;object-fit:cover;display:block;pointer-events:none" />`;
        el._src = obj.src;
      }
      return;
    }

    // Other types: only touch innerHTML when the content actually changed,
    // so pure move/opacity/filter updates stay cheap.
    const inner = this._renderInner(obj);
    if (el._inner !== inner) {el.innerHTML = inner; el._inner = inner;}
  }

  _renderInner(obj) {
    switch (obj.type) {
      case 'text':
        return `<div class="obj-text" data-id="${obj.id}" style="
          width:100%;height:100%;
          font-family:${obj.fontFamily},sans-serif;
          font-size:${obj.fontSize}px;
          font-weight:${obj.fontWeight};
          font-style:${obj.fontStyle};
          text-decoration:${obj.textDecoration};
          text-align:${obj.textAlign};
          line-height:${obj.lineHeight};
          letter-spacing:${obj.letterSpacing}px;
          color:${obj.color};
          padding:4px;
          white-space:pre-wrap;word-break:break-word;
          display:flex;align-items:center;justify-content:${obj.textAlign === 'center' ? 'center' : obj.textAlign === 'right' ? 'flex-end' : 'flex-start'
          };
        ">${Utils.escapeHtml(obj.text)}</div>`;

      case 'rectangle':
      case 'frame': {
        // borderRadius is a percentage (0-50); 50 turns the rect into an
        // ellipse. rx/ry are computed from the actual size so the roundness
        // looks the same regardless of the object's dimensions.
        const pct = CanvasManager.radiusPct(obj);
        const rw = Math.max(0, obj.width - obj.strokeWidth);
        const rh = Math.max(0, obj.height - obj.strokeWidth);
        return `<svg viewBox="0 0 ${obj.width} ${obj.height}" preserveAspectRatio="none">
          <rect x="${obj.strokeWidth / 2}" y="${obj.strokeWidth / 2}"
            width="${rw}" height="${rh}"
            rx="${(rw * pct) / 100}" ry="${(rh * pct) / 100}"
            fill="${obj.fill}" stroke="${obj.stroke}" stroke-width="${obj.strokeWidth}" />
        </svg>`;
      }

      case 'circle':
        return `<svg viewBox="0 0 ${obj.width} ${obj.height}" preserveAspectRatio="none">
          <ellipse cx="${obj.width / 2}" cy="${obj.height / 2}"
            rx="${Math.max(0, (obj.width - obj.strokeWidth) / 2)}" ry="${Math.max(0, (obj.height - obj.strokeWidth) / 2)}"
            fill="${obj.fill}" stroke="${obj.stroke}" stroke-width="${obj.strokeWidth}" />
        </svg>`;

      case 'triangle':
        return `<svg viewBox="0 0 ${obj.width} ${obj.height}" preserveAspectRatio="none">
          <polygon points="${obj.width / 2},0 ${obj.width},${obj.height} 0,${obj.height}"
            fill="${obj.fill}" stroke="${obj.stroke}" stroke-width="${obj.strokeWidth}" />
        </svg>`;

      case 'star':
        return `<svg viewBox="-1 -1 2 2" preserveAspectRatio="none">
          <polygon points="${this._starPoints(obj.points || 5)}"
            fill="${obj.fill}" stroke="${obj.stroke}" stroke-width="${obj.strokeWidth / 100}" />
        </svg>`;

      case 'polygon':
        return `<svg viewBox="-1 -1 2 2" preserveAspectRatio="none">
          <polygon points="${this._polygonPoints(obj.sides || 6)}"
            fill="${obj.fill}" stroke="${obj.stroke}" stroke-width="${obj.strokeWidth / 100}" />
        </svg>`;

      case 'line':
        return `<svg viewBox="0 0 ${obj.width} ${obj.height}" preserveAspectRatio="none">
          <line x1="0" y1="${obj.height / 2}" x2="${obj.width}" y2="${obj.height / 2}"
            stroke="${obj.stroke || obj.fill}" stroke-width="${Math.max(1, obj.strokeWidth || 2)}" />
        </svg>`;

      case 'arrow':
        return `<svg viewBox="0 0 ${obj.width} ${obj.height}" preserveAspectRatio="none">
          <defs><marker id="ah-${obj.id}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="${obj.stroke || obj.fill}" />
          </marker></defs>
          <line x1="0" y1="${obj.height / 2}" x2="${obj.width - 6}" y2="${obj.height / 2}"
            stroke="${obj.stroke || obj.fill}" stroke-width="${Math.max(1, obj.strokeWidth || 2)}"
            marker-end="url(#ah-${obj.id})" />
        </svg>`;

      case 'qrcode':
        return this.app.pluginManager.render('qrcode', obj) || '';
      case 'barcode':
        return this.app.pluginManager.render('barcode', obj) || '';
      case 'chart':
        return this.app.pluginManager.render('chart', obj) || '';
      case 'table':
        return this.app.pluginManager.render('table', obj) || '';

      case 'svg':
        return CanvasManager.applySvgColor(obj.pluginData?.svg || '', obj.colorize ? obj.color : null);

      default:
        return '';
    }
  }

  _polygonPoints(sides) {
    const pts = [];
    for (let i = 0; i < sides; i++) {
      const a = (Math.PI * 2 * i) / sides - Math.PI / 2;
      pts.push(`${Math.cos(a)},${Math.sin(a)}`);
    }
    return pts.join(' ');
  }

  _starPoints(points) {
    const pts = [];
    const total = points * 2;
    for (let i = 0; i < total; i++) {
      const r = i % 2 === 0 ? 1 : 0.4;
      const a = (Math.PI * 2 * i) / total - Math.PI / 2;
      pts.push(`${r * Math.cos(a)},${r * Math.sin(a)}`);
    }
    return pts.join(' ');
  }

  /* ---------------------------- Selection UI ---------------------------- */

  renderSelection() {
    const ids = this.store.get('selectedIds');
    const page = this.app.pageManager.currentPage();
    if (!page) {this.overlayEl.innerHTML = ''; return;}
    const selected = ids.map((id) => page.objects.find((o) => o.id === id)).filter(Boolean);
    if (!selected.length) {this.overlayEl.innerHTML = ''; return;}

    const svgNS = 'http://www.w3.org/2000/svg';
    this.overlayEl.innerHTML = '';

    selected.forEach((o) => {
      const cx = o.x + o.width / 2, cy = o.y + o.height / 2;
      const g = document.createElementNS(svgNS, 'g');
      g.setAttribute('transform', `rotate(${o.rotation} ${cx} ${cy})`);

      const rect = document.createElementNS(svgNS, 'rect');
      rect.setAttribute('x', o.x); rect.setAttribute('y', o.y);
      rect.setAttribute('width', o.width); rect.setAttribute('height', o.height);
      rect.setAttribute('class', 'selection-outline');
      g.appendChild(rect);

      const HANDLE = 8;
      const positions = {
        tl: [o.x, o.y], tr: [o.x + o.width, o.y],
        bl: [o.x, o.y + o.height], br: [o.x + o.width, o.y + o.height],
        t: [o.x + o.width / 2, o.y], b: [o.x + o.width / 2, o.y + o.height],
        l: [o.x, o.y + o.height / 2], r: [o.x + o.width, o.y + o.height / 2],
      };
      Object.entries(positions).forEach(([key, [px, py]]) => {
        const h = document.createElementNS(svgNS, 'rect');
        h.setAttribute('x', px - HANDLE / 2); h.setAttribute('y', py - HANDLE / 2);
        h.setAttribute('width', HANDLE); h.setAttribute('height', HANDLE);
        h.setAttribute('class', `selection-handle ${key}`);
        h.dataset.role = 'resize'; h.dataset.dir = key; h.dataset.id = o.id;
        g.appendChild(h);
      });

      const rotHandle = document.createElementNS(svgNS, 'circle');
      rotHandle.setAttribute('cx', o.x + o.width / 2);
      rotHandle.setAttribute('cy', o.y - 24);
      rotHandle.setAttribute('r', 6);
      rotHandle.setAttribute('class', 'selection-rotate');
      rotHandle.dataset.role = 'rotate'; rotHandle.dataset.id = o.id;
      const stem = document.createElementNS(svgNS, 'line');
      stem.setAttribute('x1', o.x + o.width / 2); stem.setAttribute('y1', o.y);
      stem.setAttribute('x2', o.x + o.width / 2); stem.setAttribute('y2', o.y - 18);
      stem.setAttribute('stroke', 'var(--primary)'); stem.setAttribute('stroke-width', 1.5);
      g.appendChild(stem); g.appendChild(rotHandle);

      this.overlayEl.appendChild(g);
    });
  }

  /* ---------------------------- Interactions ---------------------------- */

  _canvasPoint(e) {
    const rect = this.canvasEl.getBoundingClientRect();
    const zoom = this.store.get('zoom');
    return {x: (e.clientX - rect.left) / zoom, y: (e.clientY - rect.top) / zoom};
  }

  _onCanvasPointerDown(e) {
    if (this.store.get('spacePressed')) return; // let workspace handle pan
    // While inline text editing is active, let the user position the caret
    // inside the editor without starting a drag or re-entering edit mode.
    if (this._editing && this._editing.textEl.contains(e.target)) return;
    // A click anywhere else commits the current edit before proceeding.
    if (this._editing) this._finishTextEdit(true);

    const target = e.target.closest('.obj');
    if (!target) {
      this.app.selectionManager.clear();
      this._startMarquee(e);
      return;
    }
    const id = target.dataset.id;
    const obj = this.app.objectManager.getById(id);
    if (!obj || obj.locked) return;

    const additive = e.shiftKey || e.ctrlKey || e.metaKey;
    if (!this.store.get('selectedIds').includes(id)) {
      this.app.selectionManager.select([id], additive);
    }

    // Text editing is entered via the dedicated `dblclick` event (see
    // _onCanvasDblClick). Relying on `e.detail === 2` here is unreliable
    // because the drag pointerup handler can interfere with the browser's
    // click-count tracking.
    this._startDrag(e);
  }

  _onCanvasDblClick(e) {
    if (this.store.get('spacePressed')) return;
    if (this._editing) this._finishTextEdit(true);
    const target = e.target.closest('.obj');
    if (!target) return;
    const obj = this.app.objectManager.getById(target.dataset.id);
    if (!obj || obj.type !== 'text' || obj.locked) return;
    this._beginTextEdit(target, obj);
  }

  _onOverlayPointerDown(e) {
    const t = e.target;
    if (!t.dataset || !t.dataset.role) return;
    e.stopPropagation();
    // Commit any in-progress text edit before handling resize / rotate,
    // otherwise the contenteditable node would be destroyed mid-edit.
    if (this._editing) this._finishTextEdit(true);
    if (t.dataset.role === 'resize') this._startResize(e, t.dataset.id, t.dataset.dir);
    else if (t.dataset.role === 'rotate') this._startRotate(e, t.dataset.id);
  }

  _startDrag(e) {
    const start = this._canvasPoint(e);
    const ids = this.store.get('selectedIds');
    const page = this.app.pageManager.currentPage();
    const initial = ids.map((id) => {
      const o = page.objects.find((x) => x.id === id);
      return {id, x: o.x, y: o.y};
    });
    const zoom = this.store.get('zoom');
    // Track whether the pointer actually moved beyond a small threshold.
    // Without this, a plain click (press+release without dragging) would
    // still emit 'objects:changed' → renderAll(), which destroys and
    // recreates every canvas DOM node. That DOM rebuild between the two
    // clicks of a double-click resets the browser's native double-click
    // counter (the original target node is gone), so the second pointerdown
    // arrives with e.detail === 1 instead of 2 and inline text editing
    // never triggers.
    let moved = false;
    const move = (ev) => {
      const pt = this._canvasPoint(ev);
      const dx = pt.x - start.x, dy = pt.y - start.y;
      if (!moved && Math.abs(dx) < 2 && Math.abs(dy) < 2) return;
      moved = true;
      const snap = this.app.snapManager.compute(initial, dx, dy);
      initial.forEach((s) => {
        const o = this.app.objectManager.getById(s.id);
        if (!o) return;
        o.x = s.x + dx + (snap.dx || 0);
        o.y = s.y + dy + (snap.dy || 0);
        this.renderObject(o);
      });
      this.renderSelection();
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      this.app.snapManager.clear();
      if (moved) {
        this.emit('objects:changed', page.objects);
        this.emit('history:push');
      }
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  }

  _startResize(e, id, dir) {
    const obj = this.app.objectManager.getById(id);
    if (!obj) return;
    const start = this._canvasPoint(e);
    const initial = {x: obj.x, y: obj.y, w: obj.width, h: obj.height};
    const move = (ev) => {
      const pt = this._canvasPoint(ev);
      let dx = pt.x - start.x, dy = pt.y - start.y;
      let {x, y, w, h} = initial;
      if (dir.includes('l')) {x = initial.x + dx; w = initial.w - dx;}
      if (dir.includes('r')) {w = initial.w + dx;}
      if (dir.includes('t')) {y = initial.y + dy; h = initial.h - dy;}
      if (dir.includes('b')) {h = initial.h + dy;}
      if (ev.shiftKey) {
        // preserve aspect ratio
        const ratio = initial.w / initial.h;
        if (Math.abs(dx) > Math.abs(dy)) h = w / ratio;
        else w = h * ratio;
      }
      w = Math.max(4, w); h = Math.max(4, h);
      Object.assign(obj, {x, y, width: w, height: h});
      this.renderObject(obj); this.renderSelection();
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      this.emit('history:push');
      this.emit('object:updated', obj);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  }

  _startRotate(e, id) {
    const obj = this.app.objectManager.getById(id);
    if (!obj) return;
    const cx = obj.x + obj.width / 2, cy = obj.y + obj.height / 2;
    const start = this._canvasPoint(e);
    const startAngle = Math.atan2(start.y - cy, start.x - cx);
    const initialRot = obj.rotation;
    const move = (ev) => {
      const pt = this._canvasPoint(ev);
      const angle = Math.atan2(pt.y - cy, pt.x - cx);
      let deg = initialRot + Utils.radToDeg(angle - startAngle);
      if (ev.shiftKey) deg = Math.round(deg / 15) * 15;
      obj.rotation = deg;
      this.renderObject(obj); this.renderSelection();
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      this.emit('history:push');
      this.emit('object:updated', obj);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  }

  _startMarquee(e) {
    const svgNS = 'http://www.w3.org/2000/svg';
    const start = this._canvasPoint(e);
    const rect = document.createElementNS(svgNS, 'rect');
    rect.setAttribute('class', 'selection-marquee');
    this.overlayEl.appendChild(rect);
    const move = (ev) => {
      const pt = this._canvasPoint(ev);
      const x = Math.min(start.x, pt.x), y = Math.min(start.y, pt.y);
      const w = Math.abs(pt.x - start.x), h = Math.abs(pt.y - start.y);
      rect.setAttribute('x', x); rect.setAttribute('y', y);
      rect.setAttribute('width', w); rect.setAttribute('height', h);
    };
    const up = (ev) => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      const pt = this._canvasPoint(ev);
      const x1 = Math.min(start.x, pt.x), x2 = Math.max(start.x, pt.x);
      const y1 = Math.min(start.y, pt.y), y2 = Math.max(start.y, pt.y);
      rect.remove();
      const page = this.app.pageManager.currentPage();
      if (!page) return;
      const hit = page.objects
        .filter((o) => o.visible && !o.locked
          && o.x + o.width >= x1 && o.x <= x2
          && o.y + o.height >= y1 && o.y <= y2)
        .map((o) => o.id);
      if (hit.length) this.app.selectionManager.select(hit);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  }

  // Enter inline text-edit mode for a text object.
  // Triggered by double-click on the object, or by pressing Enter / F2 while
  // a single text object is selected (see ShortcutManager).
  enterTextEditForSelection() {
    const ids = this.store.get('selectedIds');
    if (ids.length !== 1) return;
    const obj = this.app.objectManager.getById(ids[0]);
    const el = this._nodes.get(ids[0]);
    if (el && obj && obj.type === 'text') this._beginTextEdit(el, obj);
  }

  _beginTextEdit(el, obj) {
    // If another object is already being edited, commit it first.
    if (this._editing) this._finishTextEdit(true);

    const textEl = el.querySelector('.obj-text');
    if (!textEl) return;

    // The canvas already displays obj.text verbatim (no template variables),
    // so the editor edits exactly what is shown — true WYSIWYG.
    textEl.innerHTML = Utils.escapeHtml(obj.text || '');
    textEl.setAttribute('contenteditable', 'true');
    textEl.classList.add('editing');
    this._editing = {id: obj.id, obj, textEl, original: obj.text || ''};

    textEl.focus();
    // Select all text so the user can immediately start typing to replace,
    // or press an arrow key / click to place the caret precisely.
    const range = document.createRange();
    range.selectNodeContents(textEl);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);

    textEl.addEventListener('blur', this._onTextEditBlur);
    textEl.addEventListener('keydown', this._onTextEditKey);
  }

  // Bound handlers stored on the instance so they can be removed cleanly.
  _onTextEditBlur = () => this._finishTextEdit(true);

  _onTextEditKey = (ev) => {
    // Escape → cancel, restoring the original text.
    if (ev.key === 'Escape') {
      ev.preventDefault();
      ev.stopPropagation();
      this._finishTextEdit(false);
      return;
    }
    // Ctrl/Cmd+Enter → commit. A plain Enter inserts a newline (default
    // contenteditable behaviour) so multi-line text stays editable inline.
    if ((ev.ctrlKey || ev.metaKey) && ev.key === 'Enter') {
      ev.preventDefault();
      this._finishTextEdit(true);
    }
  };

  // Commit (commit=true) or cancel (commit=false) the active inline edit.
  _finishTextEdit(commit) {
    const ed = this._editing;
    if (!ed) return;
    this._editing = null;

    ed.textEl.removeEventListener('blur', this._onTextEditBlur);
    ed.textEl.removeEventListener('keydown', this._onTextEditKey);
    ed.textEl.removeAttribute('contenteditable');
    ed.textEl.classList.remove('editing');
    ed.textEl.blur();

    if (commit) {
      const newText = ed.textEl.innerText;
      if (newText !== ed.original) {
        // update() emits 'object:updated' → renderObject, which rebuilds
        // the (non-editing) display with resolved variables.
        this.app.objectManager.update(ed.obj.id, {text: newText});
        return;
      }
    }
    // Nothing changed or cancelled — re-render to restore the styled
    // display node (the editor swapped in a contenteditable node).
    this.renderObject(ed.obj);
  }
}

window.CanvasManager = CanvasManager;

/**
 * ObjectManager - creates, updates, deletes canvas objects on the current page.
 * All mutations emit 'objects:changed' so downstream renderers stay in sync.
 */
class ObjectManager extends BaseManager {
  init() {}

  _page() { return this.app.pageManager.currentPage(); }

  create(data) {
    const page = this._page();
    if (!page) return null;
    const doc = this.store.get('document');
    // Position centered on canvas if not provided
    if (data.x === undefined) data.x = (doc.width - (data.width || 200)) / 2;
    if (data.y === undefined) data.y = (doc.height - (data.height || 200)) / 2;
    const obj = new CanvasObject(data);
    obj.zIndex = page.objects.length;
    page.objects.push(obj);
    this.store.set({ selectedIds: [obj.id] });
    this.emit('objects:changed', page.objects);
    this.emit('selection:changed', [obj.id]);
    this.emit('history:push');
    return obj;
  }

  // Property patches emit targeted 'object:updated' events; the heavier
  // 'objects:changed' (full canvas rebuild) is reserved for structural
  // changes such as create / remove / reorder.
  update(id, patch, options = {}) {
    const page = this._page();
    if (!page) return;
    const obj = page.objects.find((o) => o.id === id);
    if (!obj) return;
    Object.assign(obj, patch);
    this.emit('object:updated', obj);
    if (!options.silent) this.emit('history:push');
  }

  updateMany(ids, patch, options = {}) {
    const page = this._page();
    if (!page) return;
    ids.forEach((id) => {
      const o = page.objects.find((x) => x.id === id);
      if (!o) return;
      Object.assign(o, patch);
      this.emit('object:updated', o);
    });
    if (!options.silent) this.emit('history:push');
  }

  remove(ids) {
    const page = this._page();
    if (!page) return;
    const set = new Set(Array.isArray(ids) ? ids : [ids]);
    page.objects = page.objects.filter((o) => !set.has(o.id));
    this.store.set({ selectedIds: [] });
    this.emit('objects:changed', page.objects);
    this.emit('history:push');
  }

  duplicate(ids) {
    const page = this._page();
    if (!page) return;
    const list = (Array.isArray(ids) ? ids : [ids])
      .map((id) => page.objects.find((o) => o.id === id))
      .filter(Boolean);
    const clones = list.map((o) => o.clone());
    clones.forEach((c) => { c.zIndex = page.objects.length; page.objects.push(c); });
    this.store.set({ selectedIds: clones.map((c) => c.id) });
    this.emit('objects:changed', page.objects);
    this.emit('selection:changed', clones.map((c) => c.id));
    this.emit('history:push');
    return clones;
  }

  getById(id) {
    const page = this._page();
    return page?.objects.find((o) => o.id === id);
  }

  bringForward(id) { this._reorder(id, +1); }
  sendBackward(id) { this._reorder(id, -1); }
  bringToFront(id) { this._reorderAbsolute(id, Infinity); }
  sendToBack(id)   { this._reorderAbsolute(id, -Infinity); }

  _reorder(id, delta) {
    const page = this._page();
    if (!page) return;
    const idx = page.objects.findIndex((o) => o.id === id);
    if (idx === -1) return;
    const target = Utils.clamp(idx + delta, 0, page.objects.length - 1);
    const [o] = page.objects.splice(idx, 1);
    page.objects.splice(target, 0, o);
    page.objects.forEach((obj, i) => (obj.zIndex = i));
    this.emit('objects:changed', page.objects);
    this.emit('history:push');
  }

  _reorderAbsolute(id, target) {
    const page = this._page();
    if (!page) return;
    const idx = page.objects.findIndex((o) => o.id === id);
    if (idx === -1) return;
    const [o] = page.objects.splice(idx, 1);
    if (target === Infinity) page.objects.push(o);
    else page.objects.unshift(o);
    page.objects.forEach((obj, i) => (obj.zIndex = i));
    this.emit('objects:changed', page.objects);
    this.emit('history:push');
  }

  alignSelected(mode) {
    const page = this._page();
    const ids = this.store.get('selectedIds');
    if (!page || ids.length === 0) return;
    const doc = this.store.get('document');
    const objs = ids.map((id) => page.objects.find((o) => o.id === id)).filter(Boolean);
    if (objs.length === 1) {
      // Align to canvas
      const o = objs[0];
      if (mode === 'left') o.x = 0;
      if (mode === 'center-h') o.x = (doc.width - o.width) / 2;
      if (mode === 'right') o.x = doc.width - o.width;
      if (mode === 'top') o.y = 0;
      if (mode === 'center-v') o.y = (doc.height - o.height) / 2;
      if (mode === 'bottom') o.y = doc.height - o.height;
    } else {
      const bounds = objs.reduce((acc, o) => ({
        minX: Math.min(acc.minX, o.x),
        maxX: Math.max(acc.maxX, o.x + o.width),
        minY: Math.min(acc.minY, o.y),
        maxY: Math.max(acc.maxY, o.y + o.height),
      }), { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity });
      objs.forEach((o) => {
        if (mode === 'left') o.x = bounds.minX;
        if (mode === 'right') o.x = bounds.maxX - o.width;
        if (mode === 'center-h') o.x = (bounds.minX + bounds.maxX) / 2 - o.width / 2;
        if (mode === 'top') o.y = bounds.minY;
        if (mode === 'bottom') o.y = bounds.maxY - o.height;
        if (mode === 'center-v') o.y = (bounds.minY + bounds.maxY) / 2 - o.height / 2;
      });
      if (mode === 'distribute-h' && objs.length > 2) {
        const sorted = [...objs].sort((a, b) => a.x - b.x);
        const first = sorted[0], last = sorted[sorted.length - 1];
        const gap = (last.x - first.x) / (sorted.length - 1);
        sorted.forEach((o, i) => (o.x = first.x + gap * i));
      }
      if (mode === 'distribute-v' && objs.length > 2) {
        const sorted = [...objs].sort((a, b) => a.y - b.y);
        const first = sorted[0], last = sorted[sorted.length - 1];
        const gap = (last.y - first.y) / (sorted.length - 1);
        sorted.forEach((o, i) => (o.y = first.y + gap * i));
      }
    }
    this.emit('objects:changed', page.objects);
    this.emit('history:push');
  }
}

window.ObjectManager = ObjectManager;

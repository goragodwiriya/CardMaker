/**
 * SelectionManager - tracks selected object IDs and coordinates keyboard
 * nudging + programmatic selection helpers.
 */
class SelectionManager extends BaseManager {
  init() {}

  select(ids, additive = false) {
    const current = this.store.get('selectedIds');
    let next;
    if (additive) {
      const set = new Set(current);
      ids.forEach((id) => (set.has(id) ? set.delete(id) : set.add(id)));
      next = [...set];
    } else {
      next = [...ids];
    }
    this.store.set({ selectedIds: next });
    this.emit('selection:changed', next);
  }

  clear() {
    this.store.set({ selectedIds: [] });
    this.emit('selection:changed', []);
  }

  selectAll() {
    const page = this.app.pageManager.currentPage();
    if (!page) return;
    const ids = page.objects.filter((o) => o.visible && !o.locked).map((o) => o.id);
    this.store.set({ selectedIds: ids });
    this.emit('selection:changed', ids);
  }

  getSelected() {
    const page = this.app.pageManager.currentPage();
    const ids = this.store.get('selectedIds');
    if (!page) return [];
    return ids.map((id) => page.objects.find((o) => o.id === id)).filter(Boolean);
  }

  nudge(dx, dy) {
    const ids = this.store.get('selectedIds');
    if (!ids.length) return;
    const page = this.app.pageManager.currentPage();
    ids.forEach((id) => {
      const o = page.objects.find((x) => x.id === id);
      if (o && !o.locked) { o.x += dx; o.y += dy; }
    });
    this.emit('objects:changed', page.objects);
  }
}

window.SelectionManager = SelectionManager;

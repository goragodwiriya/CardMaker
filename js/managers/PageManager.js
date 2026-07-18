/**
 * PageManager - CRUD operations for pages.
 */
class PageManager extends BaseManager {
  init() {}

  currentPage() {
    const doc = this.store.get('document');
    const id = this.store.get('currentPageId');
    if (!doc) return null;
    return doc.pages.find((p) => p.id === id) || doc.pages[0];
  }

  addPage(afterId) {
    const doc = this.store.get('document');
    if (!doc) return null;
    const page = new Page({ name: `หน้า ${doc.pages.length + 1}` });
    const idx = afterId ? doc.pages.findIndex((p) => p.id === afterId) : doc.pages.length - 1;
    doc.pages.splice(idx + 1, 0, page);
    this.store.set({ currentPageId: page.id, selectedIds: [] });
    this.emit('pages:changed', doc.pages);
    this.emit('history:push');
    return page;
  }

  removePage(id) {
    const doc = this.store.get('document');
    if (!doc || doc.pages.length <= 1) return;
    const idx = doc.pages.findIndex((p) => p.id === id);
    if (idx === -1) return;
    doc.pages.splice(idx, 1);
    const next = doc.pages[Math.min(idx, doc.pages.length - 1)];
    this.store.set({ currentPageId: next.id, selectedIds: [] });
    this.emit('pages:changed', doc.pages);
    this.emit('history:push');
  }

  duplicatePage(id) {
    const doc = this.store.get('document');
    if (!doc) return;
    const page = doc.pages.find((p) => p.id === id);
    if (!page) return;
    const clone = new Page(page.toJSON());
    clone.id = Utils.uid('page');
    clone.name = page.name + ' (สำเนา)';
    clone.objects.forEach((o) => (o.id = Utils.uid('obj')));
    const idx = doc.pages.findIndex((p) => p.id === id);
    doc.pages.splice(idx + 1, 0, clone);
    this.store.set({ currentPageId: clone.id });
    this.emit('pages:changed', doc.pages);
    this.emit('history:push');
  }

  reorderPage(id, newIndex) {
    const doc = this.store.get('document');
    if (!doc) return;
    const idx = doc.pages.findIndex((p) => p.id === id);
    if (idx === -1) return;
    const [p] = doc.pages.splice(idx, 1);
    doc.pages.splice(newIndex, 0, p);
    this.emit('pages:changed', doc.pages);
    this.emit('history:push');
  }

  selectPage(id) {
    this.store.set({ currentPageId: id, selectedIds: [] });
    this.emit('pages:changed', this.store.get('document').pages);
  }

  renamePage(id, name) {
    const doc = this.store.get('document');
    const page = doc?.pages.find((p) => p.id === id);
    if (!page) return;
    page.name = name;
    this.emit('pages:changed', doc.pages);
  }
}

window.PageManager = PageManager;

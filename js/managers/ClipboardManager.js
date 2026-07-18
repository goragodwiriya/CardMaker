/**
 * ClipboardManager - copy/cut/paste using an in-memory clipboard, plus
 * "paste style" which applies visual properties from the clipboard onto
 * currently selected objects.
 */
class ClipboardManager extends BaseManager {
  init() {}

  copy() {
    const objs = this.app.selectionManager.getSelected();
    if (!objs.length) return;
    this.store.set({ clipboard: objs.map((o) => o.toJSON()) });
    this.emit('toast', { message: 'คัดลอกวัตถุแล้ว', type: 'success' });
  }

  cut() {
    this.copy();
    const ids = this.store.get('selectedIds');
    this.app.objectManager.remove(ids);
  }

  paste() {
    const clip = this.store.get('clipboard');
    if (!clip || !clip.length) return;
    const page = this.app.pageManager.currentPage();
    const newIds = [];
    clip.forEach((data) => {
      const clone = Utils.deepClone(data);
      clone.id = Utils.uid('obj');
      clone.x += 20; clone.y += 20;
      clone.zIndex = page.objects.length;
      const obj = new CanvasObject(clone);
      page.objects.push(obj);
      newIds.push(obj.id);
    });
    this.store.set({ selectedIds: newIds });
    this.emit('objects:changed', page.objects);
    this.emit('history:push');
  }

  pasteStyle() {
    const clip = this.store.get('clipboard');
    if (!clip || !clip.length) return;
    const style = clip[0];
    const styleKeys = ['fill','stroke','strokeWidth','borderRadius','opacity','shadow',
      'fontFamily','fontSize','fontWeight','fontStyle','textDecoration','textAlign',
      'lineHeight','letterSpacing','color'];
    const patch = {};
    styleKeys.forEach((k) => { if (style[k] !== undefined) patch[k] = style[k]; });
    this.app.objectManager.updateMany(this.store.get('selectedIds'), patch);
    this.emit('toast', { message: 'วางสไตล์แล้ว', type: 'success' });
  }
}

window.ClipboardManager = ClipboardManager;

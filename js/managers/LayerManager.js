/**
 * LayerManager - renders the layer list for the current page and supports
 * lock/hide/rename/reorder via drag & drop.
 */
class LayerManager extends BaseManager {
  init() {
    this.container = null;
  }

  attach(el) { this.container = el; this.render(); }

  render() {
    if (!this.container) return;
    const page = this.app.pageManager.currentPage();
    if (!page) { this.container.innerHTML = ''; return; }
    const selected = new Set(this.store.get('selectedIds'));

    // Render newest (top-of-stack) first
    const list = [...page.objects].sort((a, b) => b.zIndex - a.zIndex);
    this.container.innerHTML = list.map((o) => `
      <div class="layer-item ${selected.has(o.id) ? 'selected' : ''}" data-id="${o.id}" draggable="true">
        <div class="layer-thumb">${this._thumbIcon(o)}</div>
        <div class="layer-name" title="${Utils.escapeHtml(o.name)}">${Utils.escapeHtml(o.name)}</div>
        <div class="layer-actions">
          <button class="layer-btn" data-act="visible" title="${o.visible ? 'ซ่อน' : 'แสดง'}">${o.visible ? '👁' : '⌀'}</button>
          <button class="layer-btn" data-act="lock" title="${o.locked ? 'ปลดล็อค' : 'ล็อค'}">${o.locked ? '🔒' : '🔓'}</button>
        </div>
      </div>`).join('');

    this.container.querySelectorAll('.layer-item').forEach((el) => {
      const id = el.dataset.id;
      el.addEventListener('click', (e) => {
        if (e.target.closest('.layer-btn')) return;
        this.app.selectionManager.select([id], e.shiftKey || e.ctrlKey);
      });
      el.querySelector('[data-act="visible"]').addEventListener('click', (e) => {
        e.stopPropagation();
        const o = this.app.objectManager.getById(id);
        this.app.objectManager.update(id, { visible: !o.visible });
      });
      el.querySelector('[data-act="lock"]').addEventListener('click', (e) => {
        e.stopPropagation();
        const o = this.app.objectManager.getById(id);
        this.app.objectManager.update(id, { locked: !o.locked });
      });

      el.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/layer-id', id);
      });
      el.addEventListener('dragover', (e) => e.preventDefault());
      el.addEventListener('drop', (e) => {
        e.preventDefault();
        const from = e.dataTransfer.getData('text/layer-id');
        this._reorder(from, id);
      });
    });
  }

  _thumbIcon(o) {
    const icons = {
      text: 'T', image: '🖼', rectangle: '▭', circle: '○', triangle: '△',
      star: '★', polygon: '⬡', line: '/', arrow: '→', qrcode: '▚',
      barcode: '‖', table: '▤', chart: '📊', group: '⧉',
    };
    return icons[o.type] || '◆';
  }

  _reorder(fromId, toId) {
    if (fromId === toId) return;
    const page = this.app.pageManager.currentPage();
    const from = page.objects.findIndex((o) => o.id === fromId);
    const to = page.objects.findIndex((o) => o.id === toId);
    if (from === -1 || to === -1) return;
    const [item] = page.objects.splice(from, 1);
    page.objects.splice(to, 0, item);
    page.objects.forEach((o, i) => (o.zIndex = i));
    this.emit('objects:changed', page.objects);
    this.emit('history:push');
  }
}

window.LayerManager = LayerManager;

/**
 * ContextMenuManager - right-click menu on canvas objects.
 */
class ContextMenuManager extends BaseManager {
  init() {
    this.menu = document.getElementById('context-menu');
    document.getElementById('canvas').addEventListener('contextmenu', (e) => {
      const t = e.target.closest('.obj');
      if (!t) return;
      e.preventDefault();
      const id = t.dataset.id;
      if (!this.store.get('selectedIds').includes(id)) {
        this.app.selectionManager.select([id]);
      }
      this.open(e.clientX, e.clientY);
    });
    document.addEventListener('click', () => this.close());
    document.addEventListener('scroll', () => this.close(), true);
  }

  open(x, y) {
    const ids = this.store.get('selectedIds');
    const items = [
      {label: 'คัดลอก', shortcut: 'Ctrl+C', act: () => this.app.clipboardManager.copy()},
      {label: 'ตัด', shortcut: 'Ctrl+X', act: () => this.app.clipboardManager.cut()},
      {label: 'วาง', shortcut: 'Ctrl+V', act: () => this.app.clipboardManager.paste()},
      {label: 'ทำสำเนา', shortcut: 'Ctrl+D', act: () => this.app.objectManager.duplicate(ids)},
    ];
    // Offer inline text editing when exactly one text object is selected.
    if (ids.length === 1) {
      const obj = this.app.objectManager.getById(ids[0]);
      if (obj && obj.type === 'text' && !obj.locked) {
        items.push({sep: true});
        items.push({label: 'แก้ไขข้อความ', shortcut: 'F2', act: () => this.app.canvasManager.enterTextEditForSelection()});
      }
    }
    items.push(
      {sep: true},
      {label: 'เลื่อนไปข้างหน้า', act: () => ids.forEach((id) => this.app.objectManager.bringForward(id))},
      {label: 'เลื่อนไปข้างหลัง', act: () => ids.forEach((id) => this.app.objectManager.sendBackward(id))},
      {label: 'เลื่อนไปหน้าสุด', act: () => ids.forEach((id) => this.app.objectManager.bringToFront(id))},
      {label: 'เลื่อนไปหลังสุด', act: () => ids.forEach((id) => this.app.objectManager.sendToBack(id))},
      {sep: true},
      {label: 'ลบ', shortcut: 'Delete', act: () => this.app.objectManager.remove(ids)},
    );
    this.menu.innerHTML = items.map((it) => it.sep
      ? `<div class="context-menu-sep"></div>`
      : `<button data-act="${it.label}">${it.label}${it.shortcut ? `<span class="shortcut">${it.shortcut}</span>` : ''}</button>`
    ).join('');
    this.menu.querySelectorAll('button').forEach((btn, i) => {
      const item = items.filter((it) => !it.sep)[i];
      btn.addEventListener('click', () => {item.act(); this.close();});
    });
    this.menu.style.left = `${x}px`;
    this.menu.style.top = `${y}px`;
    this.menu.hidden = false;
  }

  close() {this.menu.hidden = true;}
}

window.ContextMenuManager = ContextMenuManager;

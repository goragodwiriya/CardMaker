/**
 * ShortcutManager - global keyboard shortcuts.
 */
class ShortcutManager extends BaseManager {
  init() {
    window.addEventListener('keydown', (e) => this._onKey(e));
  }

  _onKey(e) {
    const tag = document.activeElement.tagName;
    const inEditable = ['INPUT', 'TEXTAREA', 'SELECT'].includes(tag) || document.activeElement.isContentEditable;
    const mod = e.ctrlKey || e.metaKey;

    if (mod && e.key.toLowerCase() === 'z' && !e.shiftKey) {e.preventDefault(); this.app.historyManager.undo(); return;}
    if (mod && (e.key.toLowerCase() === 'y' || (e.key.toLowerCase() === 'z' && e.shiftKey))) {
      e.preventDefault(); this.app.historyManager.redo(); return;
    }
    if (inEditable) return;

    // Enter / F2: enter inline text-edit mode for a single selected text object.
    if (e.key === 'Enter' || e.key === 'F2') {
      const ids = this.store.get('selectedIds');
      if (ids.length === 1) {
        const obj = this.app.objectManager.getById(ids[0]);
        if (obj && obj.type === 'text') {
          e.preventDefault();
          this.app.canvasManager.enterTextEditForSelection();
        }
      }
      return;
    }

    if (mod && e.key.toLowerCase() === 'a') {e.preventDefault(); this.app.selectionManager.selectAll(); return;}
    if (mod && e.key.toLowerCase() === 'c') {e.preventDefault(); this.app.clipboardManager.copy(); return;}
    if (mod && e.key.toLowerCase() === 'x') {e.preventDefault(); this.app.clipboardManager.cut(); return;}
    if (mod && e.key.toLowerCase() === 'v') {e.preventDefault(); this.app.clipboardManager.paste(); return;}
    if (mod && e.key.toLowerCase() === 'd') {e.preventDefault(); this.app.objectManager.duplicate(this.store.get('selectedIds')); return;}
    if (mod && e.key.toLowerCase() === 's') {e.preventDefault(); document.getElementById('btn-save').click(); return;}
    if (mod && e.key === '=') {e.preventDefault(); this.app.workspaceManager.zoomIn(); return;}
    if (mod && e.key === '-') {e.preventDefault(); this.app.workspaceManager.zoomOut(); return;}
    if (mod && e.key === '0') {e.preventDefault(); this.app.workspaceManager.zoomToFit(); return;}

    if (e.key === 'Delete' || e.key === 'Backspace') {
      const ids = this.store.get('selectedIds');
      if (ids.length) {e.preventDefault(); this.app.objectManager.remove(ids);}
      return;
    }
    if (e.key === 'Escape') {this.app.selectionManager.clear(); return;}

    // Arrow nudge
    const step = e.shiftKey ? 10 : 1;
    if (e.key === 'ArrowLeft') {this.app.selectionManager.nudge(-step, 0); e.preventDefault();}
    if (e.key === 'ArrowRight') {this.app.selectionManager.nudge(+step, 0); e.preventDefault();}
    if (e.key === 'ArrowUp') {this.app.selectionManager.nudge(0, -step); e.preventDefault();}
    if (e.key === 'ArrowDown') {this.app.selectionManager.nudge(0, +step); e.preventDefault();}
  }
}

window.ShortcutManager = ShortcutManager;

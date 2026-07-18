/**
 * HistoryManager - undo/redo via full-state snapshots.
 * Snapshots are taken on discrete transactions (create, delete, transform-end,
 * property change) so mid-drag intermediate frames don't flood the stack.
 */
class HistoryManager extends BaseManager {
  constructor(app) {
    super(app);
    this.stack = [];
    this.pointer = -1;
    this.max = 100;
    this._suspended = false;
  }

  init() {
    this.on('history:push', () => this.push());
    this.on('document:loaded', () => this.reset());
  }

  reset() {
    this.stack = [];
    this.pointer = -1;
    this.push();
  }

  push() {
    if (this._suspended) return;
    const doc = this.store.get('document');
    if (!doc) return;
    const snapshot = JSON.stringify(doc.toJSON());
    // Trim tail if we branched
    this.stack = this.stack.slice(0, this.pointer + 1);
    this.stack.push(snapshot);
    if (this.stack.length > this.max) this.stack.shift();
    this.pointer = this.stack.length - 1;
    this.emit('history:changed', { canUndo: this.canUndo(), canRedo: this.canRedo() });
  }

  canUndo() { return this.pointer > 0; }
  canRedo() { return this.pointer < this.stack.length - 1; }

  undo() {
    if (!this.canUndo()) return;
    this.pointer--;
    this._restore(this.stack[this.pointer]);
  }

  redo() {
    if (!this.canRedo()) return;
    this.pointer++;
    this._restore(this.stack[this.pointer]);
  }

  _restore(snapshot) {
    this._suspended = true;
    const data = JSON.parse(snapshot);
    const doc = new Document(data);
    this.store.set({ document: doc, selectedIds: [] });
    this.emit('document:restored', doc);
    this.emit('history:changed', { canUndo: this.canUndo(), canRedo: this.canRedo() });
    this._suspended = false;
  }

  suspend() { this._suspended = true; }
  resume() { this._suspended = false; }
}

window.HistoryManager = HistoryManager;

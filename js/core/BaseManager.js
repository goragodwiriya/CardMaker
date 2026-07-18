/**
 * BaseManager - shared parent for all managers.
 * Managers get access to the app instance (which exposes eventBus, store,
 * and sibling managers) so we honour the open/closed principle: subclasses
 * only override init() and register their own listeners.
 */
class BaseManager {
  constructor(app) {
    this.app = app;
    this.eventBus = app.eventBus;
    this.store = app.store;
    this._unsubs = [];
  }

  on(event, handler) {
    this._unsubs.push(this.eventBus.on(event, handler));
  }

  emit(event, payload) {this.eventBus.emit(event, payload);}

  destroy() {
    this._unsubs.forEach((u) => u());
    this._unsubs = [];
  }

  init() { /* override in subclasses */}
}

window.BaseManager = BaseManager;

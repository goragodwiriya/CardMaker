/**
 * Store - central reactive state accessed by all managers.
 * Emits state:changed via EventBus on updates.
 */
class Store {
  constructor(eventBus) {
    this.eventBus = eventBus;
    this.state = {
      document: null,        // Document instance
      currentPageId: null,
      selectedIds: [],
      zoom: 1,
      panX: 0,
      panY: 0,
      theme: 'light',
      spacePressed: false,
      activeTool: 'select',
      clipboard: null,
      guides: [],
      snapEnabled: true,
      gridVisible: false,
      rulersVisible: false,
    };
  }

  get(key) { return this.state[key]; }

  set(patch) {
    Object.assign(this.state, patch);
    this.eventBus.emit('state:changed', { patch, state: this.state });
  }
}

window.Store = Store;

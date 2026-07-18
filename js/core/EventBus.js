/**
 * EventBus - simple pub/sub used throughout the application to
 * decouple managers from each other.
 */
class EventBus {
  constructor() {
    this._listeners = new Map();
  }

  on(event, handler) {
    if (!this._listeners.has(event)) this._listeners.set(event, new Set());
    this._listeners.get(event).add(handler);
    return () => this.off(event, handler);
  }

  once(event, handler) {
    const off = this.on(event, (payload) => {
      off();
      handler(payload);
    });
    return off;
  }

  off(event, handler) {
    const set = this._listeners.get(event);
    if (set) set.delete(handler);
  }

  emit(event, payload) {
    const set = this._listeners.get(event);
    if (!set) return;
    // Copy to allow handlers to unsubscribe safely
    Array.from(set).forEach((h) => {
      try { h(payload); } catch (err) { console.error('[EventBus]', event, err); }
    });
  }

  clear() { this._listeners.clear(); }
}

window.EventBus = EventBus;

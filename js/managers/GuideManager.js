/**
 * GuideManager - user-added ruler guides. Stub for future expansion.
 */
class GuideManager extends BaseManager {
  init() {}

  addGuide(orientation, position) {
    const guides = this.store.get('guides');
    guides.push({ orientation, position, id: Utils.uid('guide') });
    this.store.set({ guides: [...guides] });
  }

  removeGuide(id) {
    this.store.set({ guides: this.store.get('guides').filter((g) => g.id !== id) });
  }

  clearGuides() {
    this.store.set({ guides: [] });
  }
}

window.GuideManager = GuideManager;

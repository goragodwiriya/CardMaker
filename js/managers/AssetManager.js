/**
 * AssetManager - in-memory asset library. Stub for future expansion.
 */
class AssetManager extends BaseManager {
  init() { this.assets = []; }
  add(a) { this.assets.push({ id: Utils.uid('asset'), ...a }); return this.assets.at(-1); }
  list(category) { return category ? this.assets.filter((a) => a.category === category) : this.assets; }
  remove(id) { this.assets = this.assets.filter((a) => a.id !== id); }
}
window.AssetManager = AssetManager;

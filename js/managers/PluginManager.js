/**
 * PluginManager - lightweight registry allowing new object types to be
 * added without modifying core.
 *
 * Contract: plugin.name (string), plugin.render(obj) -> HTML string.
 * Optional plugin.init(app) called after registration.
 */
class PluginManager extends BaseManager {
  init() {
    this.plugins = new Map();
  }

  register(plugin) {
    if (!plugin || !plugin.name || typeof plugin.render !== 'function') {
      console.warn('[PluginManager] invalid plugin', plugin);
      return;
    }
    this.plugins.set(plugin.name, plugin);
    if (typeof plugin.init === 'function') plugin.init(this.app);
    this.emit('plugin:registered', plugin.name);
  }

  unregister(name) { this.plugins.delete(name); }

  render(name, obj) {
    const p = this.plugins.get(name);
    if (!p) return '';
    try { return p.render(obj); }
    catch (err) { console.error(`[Plugin ${name}]`, err); return ''; }
  }

  list() { return [...this.plugins.keys()]; }
}

window.PluginManager = PluginManager;

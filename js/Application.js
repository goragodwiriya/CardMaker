/**
 * Application - composition root that wires all managers together.
 * Managers depend on each other only through `this.app.<name>` so they can
 * be swapped, mocked, or extended by plugins.
 */
class Application {
  constructor() {
    this.eventBus = new EventBus();
    this.store = new Store(this.eventBus);
  }

  boot() {
    // Instantiate managers (order matters for cross-references)
    this.historyManager    = new HistoryManager(this);
    this.documentManager   = new DocumentManager(this);
    this.pageManager       = new PageManager(this);
    this.objectManager     = new ObjectManager(this);
    this.layerManager      = new LayerManager(this);
    this.selectionManager  = new SelectionManager(this);
    this.clipboardManager  = new ClipboardManager(this);
    this.snapManager       = new SnapManager(this);
    this.guideManager      = new GuideManager(this);
    this.fontManager       = new FontManager(this);
    this.assetManager      = new AssetManager(this);
    this.templateManager   = new TemplateManager(this);
    this.pluginManager     = new PluginManager(this);
    this.canvasManager     = new CanvasManager(this);
    this.workspaceManager  = new WorkspaceManager(this);
    this.propertyManager   = new PropertyManager(this);
    this.sidebarManager    = new SidebarManager(this);
    this.toolbarManager    = new ToolbarManager(this);
    this.contextMenuManager= new ContextMenuManager(this);
    this.shortcutManager   = new ShortcutManager(this);
    this.importManager     = new ImportManager(this);
    this.exportManager     = new ExportManager(this);

    // Init in dependency order
    [
      this.historyManager, this.pluginManager,
      this.pageManager, this.objectManager, this.selectionManager,
      this.clipboardManager, this.snapManager, this.guideManager,
      this.fontManager, this.assetManager, this.templateManager,
      this.layerManager, this.canvasManager, this.workspaceManager,
      this.propertyManager, this.sidebarManager, this.toolbarManager,
      this.contextMenuManager, this.shortcutManager,
      this.importManager, this.exportManager,
    ].forEach((m) => m.init());

    // Register built-in plugins
    [QRCodePlugin, BarcodePlugin, ChartPlugin, TablePlugin].forEach((p) =>
      this.pluginManager.register(p));

    // Global toast handler
    this.eventBus.on('toast', ({ message, type = 'info' }) => this._toast(message, type));

    // Auto-save
    setInterval(() => this.documentManager.saveToLocalStorage(), 30000);

    // Boot document last so all listeners are attached
    this.documentManager.init();

    // Restore theme
    const savedTheme = localStorage.getItem('canvas-studio:theme');
    if (savedTheme) document.documentElement.setAttribute('data-theme', savedTheme);
  }

  _toast(message, type) {
    const c = document.getElementById('toast-container');
    const t = document.createElement('div');
    t.className = `toast ${type}`;
    t.textContent = message;
    c.appendChild(t);
    setTimeout(() => { t.style.opacity = '0'; t.style.transition = 'opacity 0.3s'; }, 2500);
    setTimeout(() => t.remove(), 3000);
  }
}

window.Application = Application;

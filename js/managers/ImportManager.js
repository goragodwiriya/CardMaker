/**
 * ImportManager - JSON / SVG / image / CSV import routines.
 */
class ImportManager extends BaseManager {
  init() {}

  async importJSON(file) {
    const text = await Utils.readFileAsText(file);
    this.app.documentManager.loadFromJSON(text);
  }

  async importImage(file) {
    const url = await Utils.readFileAsDataURL(file);
    return this.app.objectManager.create({ type: 'image', src: url, width: 400, height: 400 });
  }

  async importSVG(file) {
    const text = await Utils.readFileAsText(file);
    return this.app.objectManager.create({
      type: 'svg', width: 300, height: 300, pluginData: { svg: text },
    });
  }

  async importCSV(file) {
    const text = await Utils.readFileAsText(file);
    return text.trim().split('\n').map((r) => r.split(','));
  }
}
window.ImportManager = ImportManager;

/**
 * Page - single design page inside a document.
 */
class Page {
  constructor(data = {}) {
    this.id = data.id || Utils.uid('page');
    this.name = data.name || 'หน้า';
    this.background = data.background || '#ffffff';
    this.objects = (data.objects || []).map((o) =>
      o instanceof CanvasObject ? o : new CanvasObject(o),
    );
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      background: this.background,
      objects: this.objects.map((o) => o.toJSON()),
    };
  }
}

window.Page = Page;

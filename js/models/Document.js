/**
 * Document - top level design container. Holds pages and canvas size.
 */
class Document {
  constructor(data = {}) {
    this.id = data.id || Utils.uid('doc');
    this.name = data.name || 'งานออกแบบไม่มีชื่อ';
    this.width = data.width ?? 800;
    this.height = data.height ?? 600;
    this.unit = data.unit || 'px';
    this.pages = (data.pages && data.pages.length
      ? data.pages
      : [{ name: 'หน้า 1' }]).map((p) => (p instanceof Page ? p : new Page(p)));
    this.createdAt = data.createdAt || Date.now();
    this.updatedAt = data.updatedAt || Date.now();
    this.variables = data.variables || {};
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      width: this.width,
      height: this.height,
      unit: this.unit,
      pages: this.pages.map((p) => p.toJSON()),
      createdAt: this.createdAt,
      updatedAt: Date.now(),
      variables: this.variables,
    };
  }
}

window.Document = Document;

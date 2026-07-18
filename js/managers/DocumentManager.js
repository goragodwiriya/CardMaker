/**
 * DocumentManager - create / open / save documents.
 */
class DocumentManager extends BaseManager {
  static PRESETS = [
    { key: 'a4',            name: 'A4',              w: 2480, h: 3508, category: 'print' },
    { key: 'a5',            name: 'A5',              w: 1748, h: 2480, category: 'print' },
    { key: 'letter',        name: 'Letter',          w: 2550, h: 3300, category: 'print' },
    { key: 'business',      name: 'นามบัตร',         w: 1050, h: 600,  category: 'print' },
    { key: 'poster',        name: 'โปสเตอร์',        w: 2000, h: 3000, category: 'print' },
    { key: 'flyer',         name: 'ใบปลิว',          w: 1400, h: 2000, category: 'print' },
    { key: 'banner',        name: 'แบนเนอร์',        w: 3000, h: 1000, category: 'print' },
    { key: 'funeral-card',  name: 'การ์ดงานศพ',      w: 1500, h: 2100, category: 'funeral' },
    { key: 'funeral-poster',name: 'โปสเตอร์งานศพ',   w: 2000, h: 3000, category: 'funeral' },
    { key: 'facebook',      name: 'Facebook Post',   w: 1200, h: 630,  category: 'social' },
    { key: 'instagram',     name: 'Instagram',       w: 1080, h: 1080, category: 'social' },
    { key: 'line',          name: 'LINE',            w: 1040, h: 1040, category: 'social' },
    { key: 'tiktok',        name: 'TikTok',          w: 1080, h: 1920, category: 'social' },
  ];

  init() {
    // Create default document
    this.newDocument(800, 600, 'งานออกแบบไม่มีชื่อ');
  }

  newDocument(width = 800, height = 600, name = 'งานออกแบบไม่มีชื่อ') {
    const doc = new Document({ width, height, name });
    this.store.set({
      document: doc,
      currentPageId: doc.pages[0].id,
      selectedIds: [],
      zoom: 1, panX: 0, panY: 0,
    });
    this.emit('document:loaded', doc);
    return doc;
  }

  loadFromJSON(json) {
    try {
      const data = typeof json === 'string' ? JSON.parse(json) : json;
      const doc = new Document(data);
      this.store.set({
        document: doc,
        currentPageId: doc.pages[0]?.id,
        selectedIds: [],
      });
      this.emit('document:loaded', doc);
      this.emit('toast', { message: 'เปิดไฟล์สำเร็จ', type: 'success' });
      return doc;
    } catch (err) {
      this.emit('toast', { message: 'ไม่สามารถเปิดไฟล์ได้', type: 'error' });
      throw err;
    }
  }

  saveToJSON() {
    const doc = this.store.get('document');
    if (!doc) return null;
    return doc.toJSON();
  }

  saveToLocalStorage() {
    const data = this.saveToJSON();
    if (!data) return;
    try {
      localStorage.setItem('canvas-studio:autosave', JSON.stringify(data));
    } catch (e) { /* quota */ }
  }

  loadFromLocalStorage() {
    try {
      const raw = localStorage.getItem('canvas-studio:autosave');
      if (!raw) return false;
      this.loadFromJSON(raw);
      return true;
    } catch (e) { return false; }
  }

  renameDocument(name) {
    const doc = this.store.get('document');
    if (!doc) return;
    doc.name = name;
    this.emit('document:changed', doc);
  }
}

window.DocumentManager = DocumentManager;

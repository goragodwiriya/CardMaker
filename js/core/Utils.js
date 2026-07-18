/**
 * Utility helpers - pure functions used across the app.
 */
const Utils = {
  uid(prefix = 'id') {
    return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  },

  clamp(v, min, max) { return Math.max(min, Math.min(max, v)); },

  deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.map(Utils.deepClone);
    const out = {};
    for (const k in obj) out[k] = Utils.deepClone(obj[k]);
    return out;
  },

  debounce(fn, wait = 200) {
    let t;
    return function (...args) {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(this, args), wait);
    };
  },

  throttle(fn, wait = 16) {
    let last = 0, timer = null, lastArgs;
    return function (...args) {
      const now = Date.now();
      lastArgs = args;
      if (now - last >= wait) {
        last = now;
        fn.apply(this, args);
      } else if (!timer) {
        timer = setTimeout(() => {
          timer = null; last = Date.now();
          fn.apply(this, lastArgs);
        }, wait - (now - last));
      }
    };
  },

  degToRad(d) { return (d * Math.PI) / 180; },
  radToDeg(r) { return (r * 180) / Math.PI; },

  rotatePoint(px, py, cx, cy, angleDeg) {
    const r = Utils.degToRad(angleDeg);
    const cos = Math.cos(r), sin = Math.sin(r);
    const dx = px - cx, dy = py - cy;
    return { x: cx + dx * cos - dy * sin, y: cy + dx * sin + dy * cos };
  },

  hexToRgba(hex, a = 1) {
    if (!hex) return `rgba(0,0,0,${a})`;
    const h = hex.replace('#', '');
    const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
    const n = parseInt(full, 16);
    return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
  },

  escapeHtml(s) {
    return String(s ?? '').replace(/[&<>"']/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    }[c]));
  },

  downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 0);
  },

  downloadText(text, filename, mime = 'text/plain') {
    Utils.downloadBlob(new Blob([text], { type: mime }), filename);
  },

  readFileAsText(file) {
    return new Promise((res, rej) => {
      const r = new FileReader();
      r.onload = () => res(r.result);
      r.onerror = rej;
      r.readAsText(file);
    });
  },

  readFileAsDataURL(file) {
    return new Promise((res, rej) => {
      const r = new FileReader();
      r.onload = () => res(r.result);
      r.onerror = rej;
      r.readAsDataURL(file);
    });
  },

  // Thai date formatting
  formatThaiDate(date) {
    if (!(date instanceof Date)) date = new Date(date);
    if (isNaN(date)) return '';
    const months = ['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน',
                    'กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear() + 543}`;
  },

  calculateAge(birth, death) {
    const b = new Date(birth), d = death ? new Date(death) : new Date();
    if (isNaN(b) || isNaN(d)) return 0;
    let age = d.getFullYear() - b.getFullYear();
    const m = d.getMonth() - b.getMonth();
    if (m < 0 || (m === 0 && d.getDate() < b.getDate())) age--;
    return age;
  },

  // AABB of rotated rect
  getBoundingBox(x, y, w, h, rotation = 0) {
    if (!rotation) return { x, y, width: w, height: h };
    const cx = x + w / 2, cy = y + h / 2;
    const corners = [
      Utils.rotatePoint(x, y, cx, cy, rotation),
      Utils.rotatePoint(x + w, y, cx, cy, rotation),
      Utils.rotatePoint(x + w, y + h, cx, cy, rotation),
      Utils.rotatePoint(x, y + h, cx, cy, rotation),
    ];
    const xs = corners.map((c) => c.x), ys = corners.map((c) => c.y);
    const minX = Math.min(...xs), maxX = Math.max(...xs);
    const minY = Math.min(...ys), maxY = Math.max(...ys);
    return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
  },
};

window.Utils = Utils;

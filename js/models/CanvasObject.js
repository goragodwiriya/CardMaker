/**
 * CanvasObject - data model for anything placed on the canvas.
 * The class is intentionally generic; specialised behaviour lives in the
 * managers that render / edit these objects.
 */
class CanvasObject {
  constructor(data = {}) {
    this.id = data.id || Utils.uid('obj');
    this.type = data.type || 'rectangle'; // rectangle|circle|triangle|star|polygon|line|arrow|text|image|svg|qrcode|barcode|table|chart|frame|group
    this.name = data.name || CanvasObject.defaultName(this.type);
    this.x = data.x ?? 0;
    this.y = data.y ?? 0;
    this.width = data.width ?? 100;
    this.height = data.height ?? 100;
    this.rotation = data.rotation ?? 0;
    this.opacity = data.opacity ?? 1;
    this.locked = data.locked ?? false;
    this.visible = data.visible ?? true;
    this.zIndex = data.zIndex ?? 0;

    // Fill / stroke
    this.fill = data.fill ?? '#6366f1';
    this.stroke = data.stroke ?? 'transparent';
    this.strokeWidth = data.strokeWidth ?? 0;
    this.borderRadius = data.borderRadius ?? 0;

    // Effects
    this.shadow = data.shadow || null;   // {x,y,blur,color}
    this.blur = data.blur || 0;
    this.brightness = data.brightness ?? 100;
    this.contrast = data.contrast ?? 100;
    this.grayscale = data.grayscale ?? 0;

    // Text-specific
    this.text = data.text ?? '';
    this.fontFamily = data.fontFamily ?? 'Sarabun';
    this.fontSize = data.fontSize ?? 32;
    this.fontWeight = data.fontWeight ?? 400;
    this.fontStyle = data.fontStyle ?? 'normal';
    this.textDecoration = data.textDecoration ?? 'none';
    this.textAlign = data.textAlign ?? 'left';
    this.lineHeight = data.lineHeight ?? 1.4;
    this.letterSpacing = data.letterSpacing ?? 0;
    this.color = data.color ?? '#111827';

    // Image-specific
    this.src = data.src ?? '';

    // SVG-specific: when colorize is true, the SVG's fill/stroke colours are
    // overridden by `color` (preserving fill="none" / stroke="none" regions).
    this.colorize = data.colorize ?? false;

    // Shape sub-type params (polygon sides, star points, etc)
    this.sides = data.sides ?? 6;
    this.points = data.points ?? 5;

    // Plugin data payload
    this.pluginData = data.pluginData || null;

    // Group children (ids)
    this.children = data.children || [];
  }

  static defaultName(type) {
    const names = {
      rectangle: 'สี่เหลี่ยม', circle: 'วงกลม', triangle: 'สามเหลี่ยม',
      star: 'ดาว', polygon: 'รูปหลายเหลี่ยม', line: 'เส้น', arrow: 'ลูกศร',
      text: 'ข้อความ', image: 'รูปภาพ', svg: 'SVG', qrcode: 'QR Code',
      barcode: 'บาร์โค้ด', table: 'ตาราง', chart: 'กราฟ', frame: 'กรอบ', group: 'กลุ่ม',
    };
    return names[type] || 'วัตถุ';
  }

  clone() {
    const data = this.toJSON();
    data.id = Utils.uid('obj');
    data.x += 20; data.y += 20;
    return new CanvasObject(data);
  }

  toJSON() {
    const out = {};
    for (const k in this) {
      if (Object.prototype.hasOwnProperty.call(this, k)) out[k] = Utils.deepClone(this[k]);
    }
    return out;
  }
}

window.CanvasObject = CanvasObject;

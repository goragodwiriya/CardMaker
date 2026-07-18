/**
 * PropertyManager - renders and wires the right sidebar properties for the
 * current selection.
 */
class PropertyManager extends BaseManager {
  init() {
    this.container = document.getElementById('properties-panel');
    this._suppressRender = false; // true while a change originates from this panel's live inputs
    this.on('selection:changed', () => this.render());
    this.on('object:updated', () => {if (!this._suppressRender) this.render();});
    this.on('objects:changed', () => this.render());
    this.on('document:loaded', () => this.render());
    this.on('document:restored', () => this.render());
  }

  render() {
    const objs = this.app.selectionManager.getSelected();
    if (objs.length === 0) {
      this.container.innerHTML = this._renderCanvasProps();
      this._bindCanvasProps();
      return;
    }
    const o = objs[0];
    this.container.innerHTML = this._renderObjectProps(o, objs.length);
    this._bindObjectProps(o);
  }

  _renderCanvasProps() {
    const doc = this.store.get('document');
    const page = this.app.pageManager.currentPage();
    if (!doc || !page) return '';
    return `
      <div class="prop-group">
        <h4>คุณสมบัติแคนวาส</h4>
        <div class="prop-row"><span class="prop-label">กว้าง</span>
          <input class="prop-input" type="number" id="p-cw" value="${doc.width}" /></div>
        <div class="prop-row"><span class="prop-label">สูง</span>
          <input class="prop-input" type="number" id="p-ch" value="${doc.height}" /></div>
        <div class="prop-row"><span class="prop-label">พื้นหลัง</span>
          <input class="prop-color" type="color" id="p-cbg" value="${page.background}" />
          <input class="prop-input" type="text" id="p-cbg-t" value="${page.background}" /></div>
      </div>
      <div class="prop-group">
        <h4>ตัวช่วยจัดตำแหน่ง</h4>
        <div class="btn-group">
          <button id="p-snap" class="${this.store.get('snapEnabled') ? 'active' : ''}">Snap</button>
          <button id="p-grid" class="${this.store.get('gridVisible') ? 'active' : ''}">Grid</button>
        </div>
      </div>`;
  }

  _bindCanvasProps() {
    const doc = this.store.get('document');
    const page = this.app.pageManager.currentPage();
    const cw = this.container.querySelector('#p-cw');
    const ch = this.container.querySelector('#p-ch');
    if (cw) cw.addEventListener('change', () => {doc.width = +cw.value || doc.width; this.emit('document:loaded', doc); this.emit('history:push');});
    if (ch) ch.addEventListener('change', () => {doc.height = +ch.value || doc.height; this.emit('document:loaded', doc); this.emit('history:push');});
    const bg = this.container.querySelector('#p-cbg');
    const bgt = this.container.querySelector('#p-cbg-t');
    const applyBg = (v) => {page.background = v; this.emit('objects:changed', page.objects); this.emit('history:push');};
    if (bg) bg.addEventListener('input', () => {bgt.value = bg.value; applyBg(bg.value);});
    if (bgt) bgt.addEventListener('change', () => applyBg(bgt.value));
    const snap = this.container.querySelector('#p-snap');
    if (snap) snap.addEventListener('click', () => {
      this.store.set({snapEnabled: !this.store.get('snapEnabled')}); this.render();
    });
    const grid = this.container.querySelector('#p-grid');
    if (grid) grid.addEventListener('click', () => {
      this.store.set({gridVisible: !this.store.get('gridVisible')}); this.render();
    });
  }

  _renderObjectProps(o, count) {
    const isText = o.type === 'text';
    const isImage = o.type === 'image';
    const isSvg = o.type === 'svg';
    const hasFill = ['rectangle', 'circle', 'triangle', 'star', 'polygon', 'frame'].includes(o.type);

    return `
      ${count > 1 ? `<div style="padding:8px 12px;background:var(--primary-soft);color:var(--primary);border-radius:8px;margin-bottom:12px;font-size:12px">เลือก ${count} วัตถุ</div>` : ''}
      <div class="prop-group">
        <h4>ตำแหน่งและขนาด</h4>
        <div class="prop-row"><span class="prop-label">X</span>
          <input class="prop-input" type="number" data-key="x" value="${Math.round(o.x)}" /></div>
        <div class="prop-row"><span class="prop-label">Y</span>
          <input class="prop-input" type="number" data-key="y" value="${Math.round(o.y)}" /></div>
        <div class="prop-row"><span class="prop-label">กว้าง</span>
          <input class="prop-input" type="number" data-key="width" value="${Math.round(o.width)}" /></div>
        <div class="prop-row"><span class="prop-label">สูง</span>
          <input class="prop-input" type="number" data-key="height" value="${Math.round(o.height)}" /></div>
        <div class="prop-row"><span class="prop-label">หมุน</span>
          <input class="prop-input" type="number" data-key="rotation" value="${Math.round(o.rotation)}" /></div>
        <div class="prop-row"><span class="prop-label">โปร่งใส</span>
          <input class="prop-slider" type="range" min="0" max="1" step="0.01" data-key="opacity" value="${o.opacity}" />
          <span class="prop-val" style="font-size:11px;min-width:32px;text-align:right">${Math.round(o.opacity * 100)}%</span></div>
      </div>

      <div class="prop-group">
        <h4>การจัดวาง</h4>
        <div class="btn-group" style="margin-bottom:6px">
          <button data-align="left" title="ชิดซ้าย">⇤</button>
          <button data-align="center-h" title="กึ่งกลางแนวนอน">↔</button>
          <button data-align="right" title="ชิดขวา">⇥</button>
          <button data-align="top" title="ชิดบน">⤒</button>
          <button data-align="center-v" title="กึ่งกลางแนวตั้ง">↕</button>
          <button data-align="bottom" title="ชิดล่าง">⤓</button>
        </div>
        <div class="btn-group">
          <button data-align="distribute-h" title="กระจายแนวนอน">|||</button>
          <button data-align="distribute-v" title="กระจายแนวตั้ง">≡</button>
          <button data-order="front" title="เลื่อนไปหน้าสุด">▲▲</button>
          <button data-order="forward" title="เลื่อนขึ้น">▲</button>
          <button data-order="backward" title="เลื่อนลง">▼</button>
          <button data-order="back" title="เลื่อนไปหลังสุด">▼▼</button>
        </div>
      </div>

      ${isText ? `
      <div class="prop-group">
        <h4>ข้อความ</h4>
        <div class="prop-row">
          <textarea class="prop-input" data-key="text" rows="3">${Utils.escapeHtml(o.text)}</textarea>
        </div>
        <div class="prop-row"><span class="prop-label">ฟอนต์</span>
          <select class="prop-select" data-key="fontFamily">
            ${this.app.fontManager.listGroups().map((g) => `<optgroup label="${g.label}">
              ${g.fonts.map((f) => `<option value="${f}" style="font-family:'${f}'" ${o.fontFamily === f ? 'selected' : ''}>${f}</option>`).join('')}
            </optgroup>`).join('')}
          </select>
        </div>
        <div class="prop-row"><span class="prop-label">ขนาด</span>
          <input class="prop-input" type="number" data-key="fontSize" value="${o.fontSize}" /></div>
        <div class="prop-row"><span class="prop-label">สี</span>
          <input class="prop-color" type="color" data-key="color" value="${this._toHex(o.color)}" />
          <input class="prop-input" type="text" data-key="color" value="${o.color}" /></div>
        <div class="prop-row">
          <div class="btn-group">
            <button data-toggle="fontWeight" data-val="700" class="${o.fontWeight >= 700 ? 'active' : ''}"><b>B</b></button>
            <button data-toggle="fontStyle" data-val="italic" class="${o.fontStyle === 'italic' ? 'active' : ''}"><i>I</i></button>
            <button data-toggle="textDecoration" data-val="underline" class="${o.textDecoration === 'underline' ? 'active' : ''}"><u>U</u></button>
          </div>
        </div>
        <div class="prop-row">
          <div class="btn-group">
            <button data-set="textAlign" data-val="left" class="${o.textAlign === 'left' ? 'active' : ''}">⇤</button>
            <button data-set="textAlign" data-val="center" class="${o.textAlign === 'center' ? 'active' : ''}">↔</button>
            <button data-set="textAlign" data-val="right" class="${o.textAlign === 'right' ? 'active' : ''}">⇥</button>
            <button data-set="textAlign" data-val="justify" class="${o.textAlign === 'justify' ? 'active' : ''}">≡</button>
          </div>
        </div>
        <div class="prop-row"><span class="prop-label">ระยะบรรทัด</span>
          <input class="prop-slider" type="range" min="0.8" max="3" step="0.05" data-key="lineHeight" value="${o.lineHeight}" />
          <span class="prop-val" style="font-size:11px">${o.lineHeight}</span></div>
        <div class="prop-row"><span class="prop-label">ระยะตัวอักษร</span>
          <input class="prop-slider" type="range" min="-5" max="30" step="0.5" data-key="letterSpacing" value="${o.letterSpacing}" />
          <span class="prop-val" style="font-size:11px">${o.letterSpacing}</span></div>
      </div>` : ''}

      ${hasFill ? `
      <div class="prop-group">
        <h4>สีและเส้นขอบ</h4>
        <div class="prop-row"><span class="prop-label">เติม</span>
          <input class="prop-color" type="color" data-key="fill" value="${this._toHex(o.fill)}" />
          <input class="prop-input" type="text" data-key="fill" value="${o.fill}" /></div>
        <div class="prop-row"><span class="prop-label">เส้นขอบ</span>
          <input class="prop-color" type="color" data-key="stroke" value="${this._toHex(o.stroke)}" />
          <input class="prop-input" type="number" data-key="strokeWidth" value="${o.strokeWidth}" style="max-width:60px" /></div>
        ${['rectangle', 'frame'].includes(o.type) ? this._radiusRow(o) : ''}
      </div>` : ''}

      ${isSvg ? `
      <div class="prop-group">
        <h4>สี</h4>
        <div class="prop-row">
          <button class="btn btn-ghost" style="width:100%;border:1px solid var(--border)" data-action="toggle-colorize">${o.colorize ? 'ใช้สีต้นฉบับ' : 'กำหนดสีเดียว'}</button>
        </div>
        ${o.colorize ? `
        <div class="prop-row"><span class="prop-label">สี</span>
          <input class="prop-color" type="color" data-key="color" value="${this._toHex(o.color)}" />
          <input class="prop-input" type="text" data-key="color" value="${o.color}" /></div>
        ` : ''}
      </div>` : ''}

      ${isImage ? `
      <div class="prop-group">
        <h4>ปรับแต่งรูปภาพ</h4>
        ${this._radiusRow(o)}
        <div class="prop-row"><span class="prop-label">สว่าง</span>
          <input class="prop-slider" type="range" min="0" max="200" data-key="brightness" value="${o.brightness}" />
          <span class="prop-val" style="font-size:11px">${o.brightness}</span></div>
        <div class="prop-row"><span class="prop-label">คมชัด</span>
          <input class="prop-slider" type="range" min="0" max="200" data-key="contrast" value="${o.contrast}" />
          <span class="prop-val" style="font-size:11px">${o.contrast}</span></div>
        <div class="prop-row"><span class="prop-label">เบลอ</span>
          <input class="prop-slider" type="range" min="0" max="20" step="0.5" data-key="blur" value="${o.blur}" />
          <span class="prop-val" style="font-size:11px">${o.blur}</span></div>
        <div class="prop-row"><span class="prop-label">ขาวดำ</span>
          <input class="prop-slider" type="range" min="0" max="100" data-key="grayscale" value="${o.grayscale}" />
          <span class="prop-val" style="font-size:11px">${o.grayscale}%</span></div>
        <div class="prop-row">
          <button class="btn btn-ghost" style="width:100%;border:1px solid var(--border)" data-action="replace-image">เปลี่ยนรูปภาพ</button>
        </div>
      </div>` : ''}

      <div class="prop-group">
        <h4>เงา</h4>
        <div class="prop-row">
          <button class="btn btn-ghost" style="width:100%;border:1px solid var(--border)" data-action="toggle-shadow">${o.shadow ? 'ปิดเงา' : 'เพิ่มเงา'}</button>
        </div>
        ${o.shadow ? `
        <div class="prop-row"><span class="prop-label">X</span><input class="prop-input" type="number" data-shadow="x" value="${o.shadow.x || 0}" /></div>
        <div class="prop-row"><span class="prop-label">Y</span><input class="prop-input" type="number" data-shadow="y" value="${o.shadow.y || 4}" /></div>
        <div class="prop-row"><span class="prop-label">Blur</span><input class="prop-input" type="number" data-shadow="blur" value="${o.shadow.blur || 8}" /></div>
        <div class="prop-row"><span class="prop-label">สี</span><input class="prop-color" type="color" data-shadow="color" value="${this._toHex(o.shadow.color || '#00000066')}" /></div>
        ` : ''}
      </div>

      <div class="prop-group">
        <h4>เลเยอร์</h4>
        <div class="prop-row"><span class="prop-label">ชื่อ</span>
          <input class="prop-input" type="text" data-key="name" value="${Utils.escapeHtml(o.name)}" /></div>
        <div class="btn-group">
          <button data-action="lock" class="${o.locked ? 'active' : ''}">${o.locked ? 'ปลดล็อค' : 'ล็อค'}</button>
          <button data-action="visible" class="${!o.visible ? 'active' : ''}">${o.visible ? 'ซ่อน' : 'แสดง'}</button>
          <button data-action="duplicate">ทำสำเนา</button>
          <button data-action="delete" style="color:var(--danger)">ลบ</button>
        </div>
      </div>
    `;
  }

  _bindObjectProps(o) {
    const ids = this.store.get('selectedIds');
    // Simple inputs. Range/color inputs update live on 'input' — the panel is
    // NOT re-rendered during those (it would destroy the slider mid-drag);
    // only the value label next to the slider is refreshed in place.
    this.container.querySelectorAll('[data-key]').forEach((el) => {
      const key = el.dataset.key;
      const live = el.type === 'range' || el.type === 'color';
      el.addEventListener(live ? 'input' : 'change', () => {
        let value = el.value;
        if (el.type === 'number' || el.type === 'range') value = parseFloat(value);
        else if (el.tagName === 'SELECT' && value !== '' && !isNaN(value)) value = parseFloat(value);
        this._suppressRender = live;
        this.app.objectManager.updateMany(ids, {[key]: value}, {silent: live});
        this._suppressRender = false;
        if (live) {
          const label = el.parentElement.querySelector('.prop-val');
          if (label) label.textContent = this._formatVal(key, value);
        }
      });
      if (live) el.addEventListener('change', () => this.emit('history:push'));
    });
    // Toggle buttons (bold/italic/underline)
    this.container.querySelectorAll('[data-toggle]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const key = btn.dataset.toggle, val = btn.dataset.val;
        const current = o[key];
        const patch = {[key]: current === val || (key === 'fontWeight' && current >= 700) ? (key === 'fontWeight' ? 400 : 'normal') : val};
        this.app.objectManager.updateMany(ids, patch);
      });
    });
    this.container.querySelectorAll('[data-set]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.app.objectManager.updateMany(ids, {[btn.dataset.set]: btn.dataset.val});
      });
    });
    this.container.querySelectorAll('[data-align]').forEach((btn) => {
      btn.addEventListener('click', () => this.app.objectManager.alignSelected(btn.dataset.align));
    });
    this.container.querySelectorAll('[data-order]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const map = {front: 'bringToFront', forward: 'bringForward', backward: 'sendBackward', back: 'sendToBack'};
        ids.forEach((id) => this.app.objectManager[map[btn.dataset.order]](id));
      });
    });
    this.container.querySelectorAll('[data-shadow]').forEach((el) => {
      el.addEventListener('input', () => {
        const s = o.shadow || {x: 0, y: 4, blur: 8, color: 'rgba(0,0,0,0.4)'};
        s[el.dataset.shadow] = el.type === 'color' ? el.value : (parseFloat(el.value) || 0);
        this.app.objectManager.update(o.id, {shadow: {...s}});
      });
    });
    this.container.querySelectorAll('[data-action]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const act = btn.dataset.action;
        if (act === 'lock') this.app.objectManager.update(o.id, {locked: !o.locked});
        if (act === 'visible') this.app.objectManager.update(o.id, {visible: !o.visible});
        if (act === 'duplicate') this.app.objectManager.duplicate(ids);
        if (act === 'delete') this.app.objectManager.remove(ids);
        if (act === 'toggle-shadow') {
          this.app.objectManager.update(o.id, {
            shadow: o.shadow ? null : {x: 0, y: 4, blur: 8, color: 'rgba(0,0,0,0.35)'},
          });
        }
        if (act === 'toggle-colorize') {
          this.app.objectManager.update(o.id, {colorize: !o.colorize});
        }
        if (act === 'replace-image') {
          const input = document.getElementById('file-input-image');
          input.dataset.replaceId = o.id;
          input.click();
        }
      });
    });
  }

  _formatVal(key, v) {
    if (key === 'opacity') return `${Math.round(v * 100)}%`;
    if (key === 'grayscale') return `${v}%`;
    if (key === 'borderRadius') return v >= 50 ? 'วงกลม' : `${v}%`;
    return String(v);
  }

  // Shared corner-radius slider (percent, 50 = circle/ellipse) so every
  // object type that supports border-radius behaves identically.
  _radiusRow(o) {
    const pct = CanvasManager.radiusPct(o);
    return `<div class="prop-row"><span class="prop-label">มุมโค้ง</span>
      <input class="prop-slider" type="range" min="0" max="50" data-key="borderRadius" value="${pct}" />
      <span class="prop-val" style="font-size:11px">${this._formatVal('borderRadius', pct)}</span></div>`;
  }

  _toHex(c) {
    if (!c) return '#000000';
    if (c.startsWith('#')) return c.length === 4
      ? '#' + c.slice(1).split('').map((x) => x + x).join('')
      : c.slice(0, 7);
    const m = c.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (m) return '#' + [m[1], m[2], m[3]].map((n) => (+n).toString(16).padStart(2, '0')).join('');
    return '#000000';
  }
}

window.PropertyManager = PropertyManager;

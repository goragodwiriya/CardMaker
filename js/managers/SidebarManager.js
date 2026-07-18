/**
 * SidebarManager - renders left sidebar panels (templates, upload, text,
 * shapes, icons, images, backgrounds, qr, barcode, tables, charts, layers).
 */
class SidebarManager extends BaseManager {
  init() {
    this.container = document.getElementById('sidebar-panels');
    this.currentPanel = 'templates';
    document.querySelectorAll('.nav-item').forEach((btn) => {
      btn.addEventListener('click', () => this.showPanel(btn.dataset.panel));
    });
    this.showPanel('templates');

    // Global drag-drop image
    document.addEventListener('dragover', (e) => e.preventDefault());
    document.addEventListener('drop', (e) => {
      if (e.target.closest('#workspace-viewport') || e.target.closest('.upload-zone')) {
        e.preventDefault();
        [...e.dataTransfer.files].forEach((f) => this._handleFile(f));
      }
    });

    // File inputs
    document.getElementById('file-input-image').addEventListener('change', (e) => {
      const input = e.target;
      const replaceId = input.dataset.replaceId;
      [...input.files].forEach(async (f, i) => {
        const url = await Utils.readFileAsDataURL(f);
        if (replaceId && i === 0) {
          this.app.objectManager.update(replaceId, {src: url});
          delete input.dataset.replaceId;
        } else {
          this.app.objectManager.create({type: 'image', src: url, width: 300, height: 300});
        }
      });
      input.value = '';
    });
    document.getElementById('file-input-json').addEventListener('change', async (e) => {
      const f = e.target.files[0]; if (!f) return;
      const text = await Utils.readFileAsText(f);
      this.app.documentManager.loadFromJSON(text);
      e.target.value = '';
    });

    this.on('objects:changed', () => {if (this.currentPanel === 'layers') this._renderLayers();});
    this.on('selection:changed', () => {if (this.currentPanel === 'layers') this._renderLayers();});
    this.on('object:updated', Utils.throttle(() => {
      if (this.currentPanel === 'layers') this._renderLayers();
    }, 150));
  }

  async _handleFile(f) {
    if (f.type.startsWith('image/')) {
      const url = await Utils.readFileAsDataURL(f);
      this.app.objectManager.create({type: 'image', src: url, width: 300, height: 300});
    } else if (f.name.endsWith('.json')) {
      const text = await Utils.readFileAsText(f);
      this.app.documentManager.loadFromJSON(text);
    } else if (f.name.endsWith('.svg')) {
      const text = await Utils.readFileAsText(f);
      this.app.objectManager.create({type: 'svg', width: 300, height: 300, pluginData: {svg: text}});
    }
  }

  showPanel(name) {
    this.currentPanel = name;
    document.querySelectorAll('.nav-item').forEach((b) =>
      b.classList.toggle('active', b.dataset.panel === name));
    const renderers = {
      templates: () => this._renderTemplates(),
      upload: () => this._renderUpload(),
      text: () => this._renderText(),
      shapes: () => this._renderShapes(),
      icons: () => this._renderIcons(),
      images: () => this._renderImages(),
      backgrounds: () => this._renderBackgrounds(),
      qrcode: () => this._renderQR(),
      barcode: () => this._renderBarcode(),
      tables: () => this._renderTables(),
      charts: () => this._renderCharts(),
      layers: () => this._renderLayers(),
    };
    (renderers[name] || (() => {}))();
  }

  _renderTemplates() {
    const tpls = this.app.templateManager.list();
    this.container.innerHTML = `
      <h3 class="panel-title">เทมเพลต</h3>
      <div class="panel-section">
        <div class="grid-2" id="tpl-grid">
          ${tpls.map((t) => `
            <div class="template-card" data-key="${t.key}">
              <div class="template-preview" style="background-image:url(${t.thumb})"></div>
              <div class="template-name">${t.name}</div>
            </div>`).join('')}
        </div>
      </div>`;
    this.container.querySelectorAll('[data-key]').forEach((el) => {
      el.addEventListener('click', () => this.app.templateManager.apply(el.dataset.key));
    });
  }

  _renderUpload() {
    this.container.innerHTML = `
      <h3 class="panel-title">อัปโหลด</h3>
      <div class="upload-zone" id="upload-zone">
        <div class="upload-icon">⇧</div>
        <div>คลิกหรือลากไฟล์มาที่นี่</div>
        <div style="font-size:11px;margin-top:4px;color:var(--text-subtle)">รองรับ PNG, JPEG, SVG</div>
      </div>
      <div class="panel-section" style="margin-top:16px">
        <button class="btn" style="width:100%;border:1px solid var(--border)" id="open-json">เปิดไฟล์ JSON</button>
      </div>`;
    const zone = this.container.querySelector('#upload-zone');
    zone.addEventListener('click', () => document.getElementById('file-input-image').click());
    zone.addEventListener('dragover', (e) => {e.preventDefault(); zone.classList.add('dragover');});
    zone.addEventListener('dragleave', () => zone.classList.remove('dragover'));
    zone.addEventListener('drop', () => zone.classList.remove('dragover'));
    this.container.querySelector('#open-json').addEventListener('click', () =>
      document.getElementById('file-input-json').click());
  }

  _renderText() {
    const presets = [
      {label: 'หัวเรื่องใหญ่', size: 72, weight: 700},
      {label: 'หัวเรื่องรอง', size: 48, weight: 600},
      {label: 'ข้อความปกติ', size: 24, weight: 400},
      {label: 'ข้อความเล็ก', size: 16, weight: 400},
    ];
    this.container.innerHTML = `
      <h3 class="panel-title">เพิ่มข้อความ</h3>
      <div class="panel-section">
        ${presets.map((p) => `
          <button class="btn" style="width:100%;text-align:left;padding:14px;margin-bottom:6px;border:1px solid var(--border);font-weight:${p.weight};font-size:${Math.min(p.size / 2.5, 20)}px" data-size="${p.size}" data-weight="${p.weight}">
            ${p.label}
          </button>`).join('')}
      </div>`;
    this.container.querySelectorAll('[data-size]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.app.objectManager.create({
          type: 'text', text: 'พิมพ์ข้อความที่นี่',
          width: 400, height: btn.dataset.size * 1.5 * 1,
          fontSize: +btn.dataset.size, fontWeight: +btn.dataset.weight,
        });
      });
    });
  }

  _renderShapes() {
    const shapes = [
      {type: 'rectangle', label: 'สี่เหลี่ยม', svg: '<rect x="10" y="10" width="80" height="60" fill="#6366f1"/>'},
      {type: 'circle', label: 'วงกลม', svg: '<circle cx="50" cy="50" r="40" fill="#ec4899"/>'},
      {type: 'triangle', label: 'สามเหลี่ยม', svg: '<polygon points="50,10 90,90 10,90" fill="#10b981"/>'},
      {type: 'star', label: 'ดาว', svg: '<polygon points="50,10 61,40 92,40 67,58 76,90 50,72 24,90 33,58 8,40 39,40" fill="#f59e0b"/>'},
      {type: 'polygon', label: 'หกเหลี่ยม', svg: '<polygon points="50,10 85,30 85,70 50,90 15,70 15,30" fill="#3b82f6"/>'},
      {type: 'line', label: 'เส้น', svg: '<line x1="10" y1="50" x2="90" y2="50" stroke="#111" stroke-width="4"/>'},
      {type: 'arrow', label: 'ลูกศร', svg: '<line x1="10" y1="50" x2="80" y2="50" stroke="#111" stroke-width="4"/><polygon points="80,40 92,50 80,60" fill="#111"/>'},
    ];
    this.container.innerHTML = `
      <h3 class="panel-title">รูปทรง</h3>
      <div class="panel-section">
        <div class="grid-3">
          ${shapes.map((s) => `<div class="shape-tile" data-type="${s.type}" title="${s.label}"><svg viewBox="0 0 100 100">${s.svg}</svg></div>`).join('')}
        </div>
      </div>`;
    this.container.querySelectorAll('[data-type]').forEach((el) => {
      el.addEventListener('click', () => {
        const type = el.dataset.type;
        this.app.objectManager.create({
          type, width: type === 'line' || type === 'arrow' ? 300 : 200,
          height: type === 'line' || type === 'arrow' ? 20 : 200,
        });
      });
    });
  }

  _renderIcons() {
    const icons = ['★', '♥', '☀', '☁', '☂', '☎', '✈', '✉', '✎', '✓', '✗', '⚡', '⚙', '⚑', '⚓', '♪', '♫', '☕', '☘', '☯', '♻', '☂', '⌚', '⌘'];
    this.container.innerHTML = `
      <h3 class="panel-title">ไอคอน</h3>
      <div class="panel-section"><div class="grid-4">
        ${icons.map((i) => `<div class="shape-tile" data-icon="${i}"><span style="font-size:28px">${i}</span></div>`).join('')}
      </div></div>`;
    this.container.querySelectorAll('[data-icon]').forEach((el) => {
      el.addEventListener('click', () => {
        this.app.objectManager.create({
          type: 'text', text: el.dataset.icon, fontSize: 120,
          width: 160, height: 160, textAlign: 'center', color: '#111827',
        });
      });
    });
  }

  // Stock images shown in the panel. Add more by appending a path here.
  static STOCK_IMAGES = [
    'images/bg1.png',
    'images/bg2.png',
    'svg/corner/1517055.svg',
    'svg/corner/2452543.svg',
    'svg/corner/1532689740.svg',
    'svg/corner/2452542.svg',
    'svg/corner/2452541.svg',
    'svg/corner/LeafyCorner.svg',
    'svg/frame/34697.svg',
    'svg/frame/36977.svg',
    'svg/frame/41062.svg',
    'svg/frame/146280.svg',
    'svg/frame/146918.svg',
    'svg/frame/147322.svg',
    'svg/frame/147541.svg',
    'svg/frame/961631.svg',
    'svg/frame/1210511.svg',
    'svg/frame/1502906.svg',
    'svg/frame/1935087.svg',
    'svg/frame/2465448.svg',
    'svg/frame/2465482.svg',
    'svg/frame/2479783.svg',
    'svg/frame/1210512.svg',
    'svg/frame/1210513.svg',
    'svg/photo/1254528.svg',
    'svg/photo/1301807.svg',
    'svg/photo/1321370.svg',
    'svg/photo/1321372.svg',
    'svg/photo/2286588.svg',
    'svg/photo/3285612.svg',
    'svg/photo/3285611.svg',
    'svg/photo/3285610.svg',
    'svg/photo/tischnummer_oval.svg',
    'svg/photo/tischnummer_rund.svg',
  ];

  _renderImages() {
    this.container.innerHTML = `
      <h3 class="panel-title">รูปภาพ</h3>
      <p style="font-size:12px;color:var(--text-muted);margin-bottom:10px">คลิกเพื่อวางลงในแคนวาส หรือกด "อัปโหลด" ในเมนูข้าง</p>
      <div class="grid-2">
        ${SidebarManager.STOCK_IMAGES.map((src) => `<div class="shape-tile" style="background-image:url('${src}');" data-src="${src}"></div>`).join('')}
      </div>`;
    this.container.querySelectorAll('[data-src]').forEach((el) => {
      el.addEventListener('click', () => {
        this.app.objectManager.create({type: 'image', src: el.dataset.src, width: 300, height: 300});
      });
    });
  }

  _renderBackgrounds() {
    const colors = ['#ffffff', '#f5f6f8', '#111827', '#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#000000', '#fef3c7', '#dbeafe', '#fce7f3'];
    this.container.innerHTML = `
      <h3 class="panel-title">พื้นหลัง</h3>
      <div class="grid-4">
        ${colors.map((c) => `<div class="shape-tile" style="background:${c};border:1px solid var(--border)" data-color="${c}"></div>`).join('')}
      </div>`;
    this.container.querySelectorAll('[data-color]').forEach((el) => {
      el.addEventListener('click', () => {
        const page = this.app.pageManager.currentPage();
        page.background = el.dataset.color;
        this.emit('objects:changed', page.objects);
        this.emit('history:push');
      });
    });
  }

  _renderQR() {
    this.container.innerHTML = `
      <h3 class="panel-title">QR Code</h3>
      <div class="prop-row"><input class="prop-input" id="qr-data" placeholder="ใส่ข้อความหรือ URL" value="https://example.com" /></div>
      <button class="btn btn-primary" id="qr-add" style="width:100%;margin-top:8px">เพิ่ม QR Code</button>`;
    this.container.querySelector('#qr-add').addEventListener('click', () => {
      const data = this.container.querySelector('#qr-data').value || 'https://example.com';
      this.app.objectManager.create({type: 'qrcode', width: 200, height: 200, pluginData: {data}});
    });
  }

  _renderBarcode() {
    this.container.innerHTML = `
      <h3 class="panel-title">บาร์โค้ด</h3>
      <div class="prop-row"><input class="prop-input" id="bc-data" placeholder="ตัวเลขหรือข้อความ" value="1234567890" /></div>
      <button class="btn btn-primary" id="bc-add" style="width:100%;margin-top:8px">เพิ่มบาร์โค้ด</button>`;
    this.container.querySelector('#bc-add').addEventListener('click', () => {
      const data = this.container.querySelector('#bc-data').value || '1234567890';
      this.app.objectManager.create({type: 'barcode', width: 300, height: 100, pluginData: {data}});
    });
  }

  _renderTables() {
    this.container.innerHTML = `
      <h3 class="panel-title">ตาราง</h3>
      <div class="prop-row"><span class="prop-label">แถว</span><input class="prop-input" type="number" id="t-rows" value="3" /></div>
      <div class="prop-row"><span class="prop-label">คอลัมน์</span><input class="prop-input" type="number" id="t-cols" value="3" /></div>
      <button class="btn btn-primary" id="t-add" style="width:100%;margin-top:8px">เพิ่มตาราง</button>`;
    this.container.querySelector('#t-add').addEventListener('click', () => {
      const rows = +this.container.querySelector('#t-rows').value || 3;
      const cols = +this.container.querySelector('#t-cols').value || 3;
      this.app.objectManager.create({
        type: 'table', width: cols * 100, height: rows * 40,
        pluginData: {rows, cols, cells: Array(rows).fill(0).map(() => Array(cols).fill(''))},
      });
    });
  }

  _renderCharts() {
    this.container.innerHTML = `
      <h3 class="panel-title">กราฟ</h3>
      <div class="grid-2">
        ${['bar', 'line', 'pie', 'area'].map((k) => `<div class="tile" data-chart="${k}"><div class="tile-icon">${{bar: '📊', line: '📈', pie: '🥧', area: '📉'}[k]}</div>${{bar: 'แท่ง', line: 'เส้น', pie: 'วงกลม', area: 'พื้นที่'}[k]}</div>`).join('')}
      </div>`;
    this.container.querySelectorAll('[data-chart]').forEach((el) => {
      el.addEventListener('click', () => {
        this.app.objectManager.create({
          type: 'chart', width: 400, height: 300,
          pluginData: {kind: el.dataset.chart, data: [10, 30, 20, 50, 40]},
        });
      });
    });
  }

  _renderLayers() {
    this.container.innerHTML = `<h3 class="panel-title">เลเยอร์</h3><div class="layer-list" id="layer-list"></div>`;
    this.app.layerManager.attach(this.container.querySelector('#layer-list'));
  }
}

window.SidebarManager = SidebarManager;

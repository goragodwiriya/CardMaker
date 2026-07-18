/**
 * ToolbarManager - top toolbar buttons + status bar + page tabs + theme.
 */
class ToolbarManager extends BaseManager {
  init() {
    // Top toolbar
    document.getElementById('btn-new').addEventListener('click', () => this._newDocDialog());
    document.getElementById('btn-open').addEventListener('click', () =>
      document.getElementById('file-input-json').click());
    document.getElementById('btn-save').addEventListener('click', () => {
      const data = this.app.documentManager.saveToJSON();
      Utils.downloadText(JSON.stringify(data, null, 2), `${data.name || 'design'}.json`, 'application/json');
      this.emit('toast', { message: 'บันทึกไฟล์ JSON แล้ว', type: 'success' });
    });
    document.getElementById('btn-undo').addEventListener('click', () => this.app.historyManager.undo());
    document.getElementById('btn-redo').addEventListener('click', () => this.app.historyManager.redo());
    document.getElementById('btn-theme').addEventListener('click', () => this._toggleTheme());

    // Export dropdown
    const dd = document.querySelector('.dropdown');
    document.getElementById('btn-export').addEventListener('click', (e) => {
      e.stopPropagation(); dd.classList.toggle('open');
    });
    document.addEventListener('click', () => dd.classList.remove('open'));
    document.getElementById('export-menu').addEventListener('click', (e) => {
      const btn = e.target.closest('[data-export]');
      if (btn) this.app.exportManager.export(btn.dataset.export);
    });

    // Doc title
    const title = document.getElementById('doc-title');
    title.addEventListener('change', () => this.app.documentManager.renameDocument(title.value));
    this.on('document:loaded', (d) => { title.value = d.name; this._renderStatus(); this._renderTabs(); });
    this.on('document:restored', (d) => { title.value = d.name; this._renderStatus(); this._renderTabs(); });
    this.on('document:changed', (d) => { title.value = d.name; });
    this.on('pages:changed', () => this._renderTabs());
    this.on('state:changed', ({ patch }) => {
      if ('zoom' in patch || 'currentPageId' in patch) { this._renderStatus(); this._renderTabs(); }
    });
    this.on('selection:changed', () => this._renderStatus());
    this.on('objects:changed', () => this._renderStatus());

    // Status bar zoom
    document.getElementById('zoom-in').addEventListener('click', () => this.app.workspaceManager.zoomIn());
    document.getElementById('zoom-out').addEventListener('click', () => this.app.workspaceManager.zoomOut());
    document.getElementById('zoom-fit').addEventListener('click', () => this.app.workspaceManager.zoomToFit());

    // Mouse position
    document.getElementById('workspace-viewport').addEventListener('mousemove', Utils.throttle((e) => {
      const c = document.getElementById('canvas').getBoundingClientRect();
      const zoom = this.store.get('zoom');
      const x = Math.round((e.clientX - c.left) / zoom);
      const y = Math.round((e.clientY - c.top) / zoom);
      document.getElementById('status-mouse').textContent = `X: ${x}, Y: ${y}`;
    }, 32));

    // Modal
    document.getElementById('modal-close').addEventListener('click', () => this.closeModal());
    document.getElementById('modal-overlay').addEventListener('click', (e) => {
      if (e.target.id === 'modal-overlay') this.closeModal();
    });
  }

  _renderStatus() {
    const zoom = this.store.get('zoom');
    document.getElementById('zoom-display').textContent = `${Math.round(zoom * 100)}%`;
    const doc = this.store.get('document');
    if (doc) document.getElementById('status-size').textContent = `ขนาดแคนวาส: ${doc.width} × ${doc.height}`;
    const sel = this.store.get('selectedIds');
    document.getElementById('status-selection').textContent =
      sel.length ? `เลือก ${sel.length} วัตถุ` : 'ไม่มีวัตถุที่เลือก';
  }

  _renderTabs() {
    const doc = this.store.get('document');
    const tabs = document.getElementById('page-tabs');
    if (!doc) { tabs.innerHTML = ''; return; }
    const cur = this.store.get('currentPageId');
    tabs.innerHTML = doc.pages.map((p, i) => `
      <button class="page-tab ${p.id === cur ? 'active' : ''}" data-id="${p.id}">
        <span>${i + 1}. ${Utils.escapeHtml(p.name)}</span>
        ${doc.pages.length > 1 ? `<span class="page-close" data-close="${p.id}">×</span>` : ''}
      </button>`).join('') + `<button class="page-add" id="page-add">+ เพิ่มหน้า</button>`;
    tabs.querySelectorAll('.page-tab').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        if (e.target.dataset.close) this.app.pageManager.removePage(e.target.dataset.close);
        else this.app.pageManager.selectPage(btn.dataset.id);
      });
    });
    tabs.querySelector('#page-add').addEventListener('click', () => this.app.pageManager.addPage());
  }

  _toggleTheme() {
    const cur = document.documentElement.getAttribute('data-theme') || 'light';
    const next = cur === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', next);
    this.store.set({ theme: next });
    localStorage.setItem('canvas-studio:theme', next);
  }

  openModal(title, bodyHtml) {
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-body').innerHTML = bodyHtml;
    document.getElementById('modal-overlay').hidden = false;
  }
  closeModal() { document.getElementById('modal-overlay').hidden = true; }

  _newDocDialog() {
    const presets = DocumentManager.PRESETS;
    this.openModal('สร้างเอกสารใหม่', `
      <div class="preset-grid">
        ${presets.map((p) => `
          <div class="preset-card" data-key="${p.key}">
            <div class="preset-thumb" style="aspect-ratio:${p.w}/${p.h}"></div>
            <div class="preset-name">${p.name}</div>
            <div class="preset-dim">${p.w} × ${p.h}</div>
          </div>`).join('')}
      </div>
      <div class="custom-size">
        <div class="field"><label>กว้าง (px)</label><input class="prop-input" type="number" id="cd-w" value="1080" /></div>
        <div class="field"><label>สูง (px)</label><input class="prop-input" type="number" id="cd-h" value="1080" /></div>
        <button class="btn btn-primary" id="cd-create">สร้าง</button>
      </div>`);
    const body = document.getElementById('modal-body');
    body.querySelectorAll('[data-key]').forEach((el) => {
      el.addEventListener('click', () => {
        const p = presets.find((x) => x.key === el.dataset.key);
        this.app.documentManager.newDocument(p.w, p.h, p.name);
        this.closeModal();
      });
    });
    body.querySelector('#cd-create').addEventListener('click', () => {
      const w = +body.querySelector('#cd-w').value || 800;
      const h = +body.querySelector('#cd-h').value || 600;
      this.app.documentManager.newDocument(w, h);
      this.closeModal();
    });
  }
}

window.ToolbarManager = ToolbarManager;

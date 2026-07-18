/**
 * WorkspaceManager - infinite workspace with zoom + pan.
 * The scene translates on pan and scales on zoom; the canvas is centered
 * inside the scene.
 */
class WorkspaceManager extends BaseManager {
  init() {
    this.viewport = document.getElementById('workspace-viewport');
    this.scene = document.getElementById('workspace-scene');

    this.on('document:loaded', () => this.zoomToFit());
    this.on('document:restored', () => this._applyTransform());
    this.on('state:changed', ({ patch }) => {
      if ('zoom' in patch || 'panX' in patch || 'panY' in patch) this._applyTransform();
    });

    // Wheel zoom / pan
    this.viewport.addEventListener('wheel', (e) => {
      e.preventDefault();
      if (e.ctrlKey || e.metaKey) {
        this._zoomAt(e.clientX, e.clientY, e.deltaY < 0 ? 1.1 : 0.9);
      } else {
        this.store.set({
          panX: this.store.get('panX') - e.deltaX,
          panY: this.store.get('panY') - e.deltaY,
        });
      }
    }, { passive: false });

    // Spacebar pan
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space' && !e.repeat &&
          !['INPUT','TEXTAREA'].includes(document.activeElement.tagName) &&
          !document.activeElement.isContentEditable) {
        e.preventDefault();
        this.store.set({ spacePressed: true });
        this.viewport.classList.add('space-down');
      }
    });
    window.addEventListener('keyup', (e) => {
      if (e.code === 'Space') {
        this.store.set({ spacePressed: false });
        this.viewport.classList.remove('space-down');
      }
    });

    // Middle-button / space-pan
    this.viewport.addEventListener('pointerdown', (e) => {
      const isPan = e.button === 1 || (e.button === 0 && this.store.get('spacePressed'));
      if (!isPan) return;
      e.preventDefault();
      this.viewport.classList.add('panning');
      const startX = e.clientX, startY = e.clientY;
      const px = this.store.get('panX'), py = this.store.get('panY');
      const move = (ev) => {
        this.store.set({ panX: px + (ev.clientX - startX), panY: py + (ev.clientY - startY) });
      };
      const up = () => {
        this.viewport.classList.remove('panning');
        window.removeEventListener('pointermove', move);
        window.removeEventListener('pointerup', up);
      };
      window.addEventListener('pointermove', move);
      window.addEventListener('pointerup', up);
    });

    // Touch pinch
    this._touchDist = null;
    this.viewport.addEventListener('touchstart', (e) => {
      if (e.touches.length === 2) {
        const [a, b] = e.touches;
        this._touchDist = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
      }
    });
    this.viewport.addEventListener('touchmove', (e) => {
      if (e.touches.length === 2 && this._touchDist) {
        const [a, b] = e.touches;
        const d = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
        const factor = d / this._touchDist;
        this._touchDist = d;
        this._zoomAt((a.clientX + b.clientX) / 2, (a.clientY + b.clientY) / 2, factor);
      }
    });
  }

  _applyTransform() {
    const zoom = this.store.get('zoom');
    const px = this.store.get('panX');
    const py = this.store.get('panY');
    this.scene.style.transform = `translate(${px}px, ${py}px) scale(${zoom})`;
    this.emit('workspace:transform', { zoom, panX: px, panY: py });
  }

  _zoomAt(clientX, clientY, factor) {
    const zoom = this.store.get('zoom');
    const newZoom = Utils.clamp(zoom * factor, 0.05, 8);
    const px = this.store.get('panX'), py = this.store.get('panY');
    const rect = this.viewport.getBoundingClientRect();
    // Point in scene coords before zoom
    const cx = clientX - rect.left - rect.width / 2 - px;
    const cy = clientY - rect.top - rect.height / 2 - py;
    const scale = newZoom / zoom;
    this.store.set({
      zoom: newZoom,
      panX: px - cx * (scale - 1),
      panY: py - cy * (scale - 1),
    });
  }

  zoomIn() { this._zoomFromCenter(1.2); }
  zoomOut() { this._zoomFromCenter(0.8); }
  zoomTo(z) {
    this.store.set({ zoom: Utils.clamp(z, 0.05, 8) });
  }

  _zoomFromCenter(factor) {
    const rect = this.viewport.getBoundingClientRect();
    this._zoomAt(rect.left + rect.width / 2, rect.top + rect.height / 2, factor);
  }

  zoomToFit(padding = 80) {
    const doc = this.store.get('document');
    if (!doc) return;
    const rect = this.viewport.getBoundingClientRect();
    const z = Math.min(
      (rect.width - padding * 2) / doc.width,
      (rect.height - padding * 2) / doc.height,
      2,
    );
    this.store.set({ zoom: z, panX: 0, panY: 0 });
  }
}

window.WorkspaceManager = WorkspaceManager;

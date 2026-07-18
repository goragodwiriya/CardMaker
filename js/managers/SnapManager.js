/**
 * SnapManager - computes snap deltas while dragging objects.
 * Snaps to canvas edges, canvas center, and other object edges/centers.
 */
class SnapManager extends BaseManager {
  constructor(app) {
    super(app);
    this.threshold = 6; // canvas-space pixels
    this._guides = [];
  }

  init() {}

  compute(initial, dx, dy) {
    if (!this.store.get('snapEnabled')) return { dx: 0, dy: 0 };
    const doc = this.store.get('document');
    const page = this.app.pageManager.currentPage();
    if (!doc || !page) return { dx: 0, dy: 0 };

    const movingIds = new Set(initial.map((i) => i.id));
    const targets = page.objects.filter((o) => !movingIds.has(o.id) && o.visible);
    // Snap first moving object
    const s = initial[0];
    const o = this.app.objectManager.getById(s.id);
    if (!o) return { dx: 0, dy: 0 };
    const nx = s.x + dx, ny = s.y + dy;
    const w = o.width, h = o.height;

    const vLines = [0, doc.width / 2, doc.width];
    const hLines = [0, doc.height / 2, doc.height];
    targets.forEach((t) => {
      vLines.push(t.x, t.x + t.width / 2, t.x + t.width);
      hLines.push(t.y, t.y + t.height / 2, t.y + t.height);
    });

    let snapDx = 0, snapDy = 0, gV = null, gH = null;
    const check = (movingEdge, lines, edgeType) => {
      for (const line of lines) {
        if (Math.abs(movingEdge - line) < this.threshold) {
          return { snap: line - movingEdge, line, edgeType };
        }
      }
      return null;
    };

    let res;
    if ((res = check(nx, vLines, 'l'))) { snapDx = res.snap; gV = res.line; }
    else if ((res = check(nx + w / 2, vLines, 'c'))) { snapDx = res.snap; gV = res.line; }
    else if ((res = check(nx + w, vLines, 'r'))) { snapDx = res.snap; gV = res.line; }

    if ((res = check(ny, hLines, 't'))) { snapDy = res.snap; gH = res.line; }
    else if ((res = check(ny + h / 2, hLines, 'm'))) { snapDy = res.snap; gH = res.line; }
    else if ((res = check(ny + h, hLines, 'b'))) { snapDy = res.snap; gH = res.line; }

    this._drawGuides(gV, gH);
    return { dx: snapDx, dy: snapDy };
  }

  _drawGuides(vx, hy) {
    const overlay = document.getElementById('canvas-overlay');
    overlay.querySelectorAll('.snap-guide').forEach((el) => el.remove());
    const doc = this.store.get('document');
    if (!doc) return;
    const svgNS = 'http://www.w3.org/2000/svg';
    if (vx !== null && vx !== undefined) {
      const l = document.createElementNS(svgNS, 'line');
      l.setAttribute('class', 'snap-guide');
      l.setAttribute('x1', vx); l.setAttribute('y1', 0);
      l.setAttribute('x2', vx); l.setAttribute('y2', doc.height);
      overlay.appendChild(l);
    }
    if (hy !== null && hy !== undefined) {
      const l = document.createElementNS(svgNS, 'line');
      l.setAttribute('class', 'snap-guide');
      l.setAttribute('x1', 0); l.setAttribute('y1', hy);
      l.setAttribute('x2', doc.width); l.setAttribute('y2', hy);
      overlay.appendChild(l);
    }
  }

  clear() {
    document.getElementById('canvas-overlay')
      .querySelectorAll('.snap-guide').forEach((el) => el.remove());
  }
}

window.SnapManager = SnapManager;

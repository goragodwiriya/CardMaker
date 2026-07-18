/**
 * ChartPlugin - renders bar / line / pie / area charts as SVG.
 */
(function () {
  const COLORS = ['#6366f1','#ec4899','#10b981','#f59e0b','#3b82f6','#ef4444','#8b5cf6','#14b8a6'];

  const ChartPlugin = {
    name: 'chart',
    render(obj) {
      const p = obj.pluginData || {};
      const kind = p.kind || 'bar';
      const data = p.data && p.data.length ? p.data : [10, 30, 20, 50, 40];
      const W = 400, H = 300, pad = 30;
      const max = Math.max(...data, 1);

      if (kind === 'pie') {
        const total = data.reduce((a, b) => a + b, 0);
        let a0 = -Math.PI / 2;
        const cx = W / 2, cy = H / 2, r = Math.min(W, H) / 2 - 20;
        const paths = data.map((v, i) => {
          const a1 = a0 + (v / total) * Math.PI * 2;
          const x0 = cx + r * Math.cos(a0), y0 = cy + r * Math.sin(a0);
          const x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
          const large = a1 - a0 > Math.PI ? 1 : 0;
          const d = `M${cx},${cy} L${x0},${y0} A${r},${r} 0 ${large} 1 ${x1},${y1} Z`;
          a0 = a1;
          return `<path d="${d}" fill="${COLORS[i % COLORS.length]}"/>`;
        }).join('');
        return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet" style="background:#fff">${paths}</svg>`;
      }

      const barW = (W - pad * 2) / data.length;
      const scale = (v) => (v / max) * (H - pad * 2);

      if (kind === 'bar') {
        const bars = data.map((v, i) => {
          const h = scale(v);
          return `<rect x="${pad + i * barW + 4}" y="${H - pad - h}" width="${barW - 8}" height="${h}" fill="${COLORS[i % COLORS.length]}" rx="4"/>`;
        }).join('');
        return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet" style="background:#fff">
          <line x1="${pad}" y1="${H - pad}" x2="${W - pad}" y2="${H - pad}" stroke="#ccc"/>
          ${bars}</svg>`;
      }

      const pts = data.map((v, i) => [pad + i * barW + barW / 2, H - pad - scale(v)]);
      const path = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0]},${p[1]}`).join(' ');

      if (kind === 'line') {
        const dots = pts.map((p, i) => `<circle cx="${p[0]}" cy="${p[1]}" r="4" fill="${COLORS[i % COLORS.length]}"/>`).join('');
        return `<svg viewBox="0 0 ${W} ${H}" style="background:#fff">
          <line x1="${pad}" y1="${H - pad}" x2="${W - pad}" y2="${H - pad}" stroke="#ccc"/>
          <path d="${path}" fill="none" stroke="#6366f1" stroke-width="3"/>${dots}</svg>`;
      }
      // area
      const area = `${path} L${pts.at(-1)[0]},${H - pad} L${pts[0][0]},${H - pad} Z`;
      return `<svg viewBox="0 0 ${W} ${H}" style="background:#fff">
        <path d="${area}" fill="rgba(99,102,241,0.3)"/>
        <path d="${path}" fill="none" stroke="#6366f1" stroke-width="3"/></svg>`;
    },
  };
  window.ChartPlugin = ChartPlugin;
})();

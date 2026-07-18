/**
 * TablePlugin - renders a simple editable-looking table as SVG.
 */
(function () {
  const TablePlugin = {
    name: 'table',
    render(obj) {
      const p = obj.pluginData || {};
      const rows = p.rows || 3, cols = p.cols || 3;
      const cells = p.cells || Array(rows).fill(0).map(() => Array(cols).fill(''));
      const W = obj.width, H = obj.height;
      const cw = W / cols, ch = H / rows;
      let out = '';
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          out += `<rect x="${c * cw}" y="${r * ch}" width="${cw}" height="${ch}" fill="${r === 0 ? '#f5f6f8' : '#fff'}" stroke="#e5e7eb"/>`;
          const text = (cells[r] && cells[r][c]) || '';
          if (text) out += `<text x="${c * cw + 8}" y="${r * ch + ch / 2 + 4}" font-size="14" fill="#111">${text}</text>`;
        }
      }
      return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">${out}</svg>`;
    },
  };
  window.TablePlugin = TablePlugin;
})();

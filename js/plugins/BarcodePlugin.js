/**
 * BarcodePlugin - simple Code 128 (subset B) barcode renderer.
 * For the demo we implement a compact Code 39 (uppercase A-Z, 0-9, plus a few
 * symbols) since it's dramatically shorter to define patterns for.
 */
(function () {
  const CODE39 = {
    '0':'nnnwwnwnn','1':'wnnwnnnnw','2':'nnwwnnnnw','3':'wnwwnnnnn','4':'nnnwwnnnw',
    '5':'wnnwwnnnn','6':'nnwwwnnnn','7':'nnnwnnwnw','8':'wnnwnnwnn','9':'nnwwnnwnn',
    'A':'wnnnnwnnw','B':'nnwnnwnnw','C':'wnwnnwnnn','D':'nnnnwwnnw','E':'wnnnwwnnn',
    'F':'nnwnwwnnn','G':'nnnnnwwnw','H':'wnnnnwwnn','I':'nnwnnwwnn','J':'nnnnwwwnn',
    'K':'wnnnnnnww','L':'nnwnnnnww','M':'wnwnnnnwn','N':'nnnnwnnww','O':'wnnnwnnwn',
    'P':'nnwnwnnwn','Q':'nnnnnnwww','R':'wnnnnnwwn','S':'nnwnnnwwn','T':'nnnnwnwwn',
    'U':'wwnnnnnnw','V':'nwwnnnnnw','W':'wwwnnnnnn','X':'nwnnwnnnw','Y':'wwnnwnnnn',
    'Z':'nwwnwnnnn','-':'nwnnnnwnw','.':'wwnnnnwnn',' ':'nwwnnnwnn','*':'nwnnwnwnn',
  };

  const BarcodePlugin = {
    name: 'barcode',
    render(obj) {
      const raw = String(obj.pluginData?.data || '1234567890').toUpperCase();
      const text = '*' + raw.replace(/[^0-9A-Z\-\. ]/g, '') + '*';
      const narrow = 2, wide = 5, gap = 2;
      let x = 0;
      const rects = [];
      let totalWidth = 0;
      for (const ch of text) {
        const pat = CODE39[ch] || CODE39['*'];
        for (let i = 0; i < 9; i++) {
          const w = pat[i] === 'w' ? wide : narrow;
          if (i % 2 === 0) rects.push(`<rect x="${x}" y="0" width="${w}" height="60" fill="#000"/>`);
          x += w;
        }
        x += gap;
      }
      totalWidth = x;
      const label = `<text x="${totalWidth/2}" y="76" text-anchor="middle" font-family="monospace" font-size="10" fill="#000">${raw}</text>`;
      return `<svg viewBox="0 0 ${totalWidth} 80" preserveAspectRatio="xMidYMid meet" style="background:#fff">${rects.join('')}${label}</svg>`;
    },
  };
  window.BarcodePlugin = BarcodePlugin;
})();

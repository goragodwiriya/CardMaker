/**
 * QRCodePlugin - pure-JS QR code generator (byte mode, error correction L).
 * Uses a compact implementation of Reed-Solomon + module placement.
 */
(function () {
  // Standard QR polynomial arithmetic in GF(256)
  const EXP = new Uint8Array(512), LOG = new Uint8Array(256);
  (function () {
    let x = 1;
    for (let i = 0; i < 255; i++) { EXP[i] = x; LOG[x] = i; x <<= 1; if (x & 0x100) x ^= 0x11d; }
    for (let i = 255; i < 512; i++) EXP[i] = EXP[i - 255];
  })();
  const gfMul = (a, b) => (a === 0 || b === 0) ? 0 : EXP[LOG[a] + LOG[b]];

  function rsGenPoly(nsym) {
    let g = [1];
    for (let i = 0; i < nsym; i++) {
      const ng = new Array(g.length + 1).fill(0);
      for (let j = 0; j < g.length; j++) {
        ng[j] ^= gfMul(g[j], 1);
        ng[j + 1] ^= gfMul(g[j], EXP[i]);
      }
      g = ng;
    }
    return g;
  }
  function rsEncode(data, nsym) {
    const gen = rsGenPoly(nsym);
    const buf = data.concat(new Array(nsym).fill(0));
    for (let i = 0; i < data.length; i++) {
      const coef = buf[i];
      if (coef !== 0) for (let j = 0; j < gen.length; j++) buf[i + j] ^= gfMul(gen[j], coef);
    }
    return buf.slice(data.length);
  }

  // Version 1-10 capacity for byte mode / L
  // We'll auto-pick smallest version. Table for versions 1-10 L byte capacity:
  const BYTE_CAPACITY_L = [17,32,53,78,106,134,154,192,230,271];
  const EC_L_CODEWORDS = [7,10,15,20,26,18,20,24,30,18]; // Simplified: single block per version 1-9; version 10 uses 2 blocks — handled coarsely
  const TOTAL_CODEWORDS = [26,44,70,100,134,172,196,242,292,346];

  function pickVersion(len) {
    for (let v = 1; v <= 10; v++) if (BYTE_CAPACITY_L[v - 1] >= len) return v;
    return 10; // clamp
  }

  function encodeByte(str, version) {
    const utf8 = new TextEncoder().encode(str);
    const bits = [];
    const push = (val, n) => { for (let i = n - 1; i >= 0; i--) bits.push((val >> i) & 1); };
    push(0b0100, 4); // byte mode
    const cci = version < 10 ? 8 : 16;
    push(utf8.length, cci);
    utf8.forEach((b) => push(b, 8));
    push(0, 4); // terminator (up to 4 bits)
    while (bits.length % 8) bits.push(0);
    const bytes = [];
    for (let i = 0; i < bits.length; i += 8) {
      let v = 0;
      for (let j = 0; j < 8; j++) v = (v << 1) | bits[i + j];
      bytes.push(v);
    }
    const totalData = TOTAL_CODEWORDS[version - 1] - EC_L_CODEWORDS[version - 1];
    const padPattern = [0xEC, 0x11];
    let pi = 0;
    while (bytes.length < totalData) { bytes.push(padPattern[pi]); pi ^= 1; }
    const ec = rsEncode(bytes, EC_L_CODEWORDS[version - 1]);
    return bytes.concat(ec);
  }

  function makeMatrix(version, codewords) {
    const size = 17 + version * 4;
    const m = Array.from({ length: size }, () => new Int8Array(size).fill(-1));
    // Finder patterns
    const placeFinder = (r, c) => {
      for (let dr = -1; dr <= 7; dr++) for (let dc = -1; dc <= 7; dc++) {
        const rr = r + dr, cc = c + dc;
        if (rr < 0 || cc < 0 || rr >= size || cc >= size) continue;
        const on = (dr >= 0 && dr <= 6 && (dc === 0 || dc === 6)) ||
                   (dc >= 0 && dc <= 6 && (dr === 0 || dr === 6)) ||
                   (dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4);
        m[rr][cc] = on ? 1 : 0;
      }
    };
    placeFinder(0, 0); placeFinder(0, size - 7); placeFinder(size - 7, 0);
    // Timing patterns
    for (let i = 8; i < size - 8; i++) {
      m[6][i] = i % 2 === 0 ? 1 : 0;
      m[i][6] = i % 2 === 0 ? 1 : 0;
    }
    // Dark module
    m[size - 8][8] = 1;
    // Reserve format info
    for (let i = 0; i <= 8; i++) { if (m[8][i] === -1) m[8][i] = 0; if (m[i][8] === -1) m[i][8] = 0; }
    for (let i = 0; i < 8; i++) { m[size - 1 - i][8] = 0; m[8][size - 1 - i] = 0; }

    // Data placement - zigzag
    const bits = [];
    codewords.forEach((b) => { for (let i = 7; i >= 0; i--) bits.push((b >> i) & 1); });
    let col = size - 1, bitIdx = 0, up = true;
    while (col > 0) {
      if (col === 6) col--;
      for (let i = 0; i < size; i++) {
        const r = up ? size - 1 - i : i;
        for (let c = 0; c < 2; c++) {
          const cc = col - c;
          if (m[r][cc] === -1) {
            let bit = bitIdx < bits.length ? bits[bitIdx++] : 0;
            // Mask pattern 0: (r+c)%2 == 0
            if ((r + cc) % 2 === 0) bit ^= 1;
            m[r][cc] = bit;
          }
        }
      }
      col -= 2; up = !up;
    }

    // Format info (EC L=01, mask 000) - precomputed sequence for L/mask0
    const FORMAT_L0 = [1,1,1,0,1,1,1,1,1,0,0,0,1,0,0];
    // Around top-left
    for (let i = 0; i < 6; i++) m[8][i] = FORMAT_L0[i];
    m[8][7] = FORMAT_L0[6]; m[8][8] = FORMAT_L0[7]; m[7][8] = FORMAT_L0[8];
    for (let i = 9; i < 15; i++) m[14 - i][8] = FORMAT_L0[i];
    // Around top-right & bottom-left
    for (let i = 0; i < 8; i++) m[8][size - 1 - i] = FORMAT_L0[i];
    for (let i = 0; i < 7; i++) m[size - 7 + i][8] = FORMAT_L0[8 + i];
    return m;
  }

  const QRCodePlugin = {
    name: 'qrcode',
    render(obj) {
      const data = obj.pluginData?.data || 'https://example.com';
      try {
        const version = pickVersion(new TextEncoder().encode(data).length);
        const codewords = encodeByte(data, version);
        const m = makeMatrix(version, codewords);
        const size = m.length;
        const cell = 100 / size;
        let rects = '';
        for (let r = 0; r < size; r++) for (let c = 0; c < size; c++) {
          if (m[r][c] === 1) rects += `<rect x="${c * cell}" y="${r * cell}" width="${cell}" height="${cell}" fill="#000"/>`;
        }
        return `<svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" style="background:#fff">${rects}</svg>`;
      } catch (err) {
        return `<div style="display:grid;place-items:center;height:100%;background:#fee;color:#900;font-size:12px">QR error</div>`;
      }
    },
  };
  window.QRCodePlugin = QRCodePlugin;
})();

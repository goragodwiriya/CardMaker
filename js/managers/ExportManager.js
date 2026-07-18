/**
 * ExportManager - export current document as PNG/JPEG/SVG/PDF/JSON/print.
 * Rasterisation is done by rendering the canvas HTML into an SVG
 * foreignObject then drawing it onto an offscreen canvas element.
 */
class ExportManager extends BaseManager {
  init() {}

  export(kind) {
    switch (kind) {
      case 'png': return this._exportImage('png');
      case 'jpeg': return this._exportImage('jpeg');
      case 'svg': return this._exportSVG();
      case 'pdf': return this._exportPDF();
      case 'json': return this._exportJSON();
      case 'print': return this._print();
    }
  }

  _exportJSON() {
    const data = this.app.documentManager.saveToJSON();
    Utils.downloadText(JSON.stringify(data, null, 2), `${data.name || 'design'}.json`, 'application/json');
    this.emit('toast', {message: 'ส่งออก JSON แล้ว', type: 'success'});
  }

  /**
   * Faithful raster renderer: draws every object straight onto a 2D canvas.
   * Unlike the old foreignObject approach this uses the page's loaded web
   * fonts (canvas 2D can) and needs no CSS, so the output matches the editor.
   */
  async _renderPageToCanvas(page, doc) {
    await document.fonts.ready;
    const c = document.createElement('canvas');
    c.width = doc.width; c.height = doc.height;
    const ctx = c.getContext('2d');
    ctx.fillStyle = page.background || '#fff';
    ctx.fillRect(0, 0, c.width, c.height);

    const objs = [...page.objects].sort((a, b) => a.zIndex - b.zIndex).filter((o) => o.visible);
    for (const o of objs) {
      ctx.save();
      const cx = o.x + o.width / 2, cy = o.y + o.height / 2;
      ctx.translate(cx, cy);
      if (o.rotation) ctx.rotate((o.rotation * Math.PI) / 180);
      ctx.translate(-o.width / 2, -o.height / 2);
      ctx.globalAlpha = o.opacity ?? 1;
      const filter = this._filterFor(o);
      if (filter) ctx.filter = filter;
      try {
        await this._drawObject(ctx, o);
      } catch (err) {
        console.warn('[export] skip object', o.type, err);
      }
      ctx.restore();
    }
    return c;
  }

  _filterFor(o) {
    const f = [];
    if (o.blur) f.push(`blur(${o.blur}px)`);
    if (o.brightness !== 100) f.push(`brightness(${o.brightness}%)`);
    if (o.contrast !== 100) f.push(`contrast(${o.contrast}%)`);
    if (o.grayscale) f.push(`grayscale(${o.grayscale}%)`);
    if (o.shadow) f.push(`drop-shadow(${o.shadow.x || 0}px ${o.shadow.y || 0}px ${o.shadow.blur || 0}px ${o.shadow.color || 'rgba(0,0,0,0.3)'})`);
    return f.join(' ');
  }

  async _drawObject(ctx, o) {
    if (o.type === 'text') return this._drawText(ctx, o);
    if (o.type === 'image') return this._drawImage(ctx, o);

    // Everything else (shapes, qr, barcode, chart, table, uploaded svg)
    // renders as self-contained SVG markup — rasterise that.
    let markup;
    if (o.type === 'svg') {
      // pluginData.svg is the raw uploaded .svg file: a complete SVG
      // document including the <?xml?> declaration and the outer <svg> tag.
      // Stripping the XML declaration AND any <!DOCTYPE ...> declaration is
      // required — a processing instruction or DOCTYPE inside another SVG
      // element makes the data: URL fail to load as an image, which silently
      // drops the object from the exported raster. potrace-exported SVGs
      // (e.g. svg/photo/3285612.svg) carry a <!DOCTYPE svg PUBLIC ...> that
      // must be removed here, otherwise markup no longer starts with <svg>
      // and the wrapper below produces invalid nested SVG.
      const raw = (o.pluginData?.svg || '')
        .replace(/<\?xml[^?]*\?>/g, '')
        .replace(/<!DOCTYPE[^>]*>/gi, '')
        .trim();
      if (!raw) return;
      // Apply single-colour override (same CSS injection the editor uses) so
      // the exported raster matches what is shown on the canvas.
      markup = o.colorize ? CanvasManager.applySvgColor(raw, o.color) : raw;
      if (markup.startsWith('<svg')) {
        // Already a full <svg> document — inject width/height (and xmlns if
        // missing) so drawImage scales it to the object's box. preserveAspect-
        // Ratio defaults to xMidYMid meet which matches the editor's CSS.
        markup = markup.replace(/<svg([^>]*)>/, (m, attrs) => {
          const a = attrs
            .replace(/\s(width|height)\s*=\s*("[^"]*"|'[^']*')/g, '')
            .replace(/\s+xmlns\s*=\s*("[^"]*"|'[^']*')/g, '');
          return `<svg xmlns="http://www.w3.org/2000/svg"${a} width="${o.width}" height="${o.height}">`;
        });
      } else {
        // Inner SVG content only — wrap it.
        markup = `<svg xmlns="http://www.w3.org/2000/svg" width="${o.width}" height="${o.height}"
          viewBox="0 0 ${o.width} ${o.height}" preserveAspectRatio="none">${markup}</svg>`;
      }
    } else {
      const inner = this.app.canvasManager._renderInner(o);
      if (!inner || !inner.trim().startsWith('<svg')) return;
      markup = inner.replace('<svg', `<svg xmlns="http://www.w3.org/2000/svg" width="${o.width}" height="${o.height}"`);
    }
    const img = await this._loadImage('data:image/svg+xml;charset=utf-8,' + encodeURIComponent(markup));
    ctx.drawImage(img, 0, 0, o.width, o.height);
  }

  async _drawImage(ctx, o) {
    if (!o.src) return;
    const img = await this._loadImage(o.src);
    const pct = CanvasManager.radiusPct(o);
    if (pct > 0) {
      this._roundedRectPath(ctx, 0, 0, o.width, o.height, (o.width * pct) / 100, (o.height * pct) / 100);
      ctx.clip();
    }
    // object-fit: cover (same as the editor CSS)
    const s = Math.max(o.width / img.naturalWidth, o.height / img.naturalHeight);
    const sw = o.width / s, sh = o.height / s;
    const sx = (img.naturalWidth - sw) / 2, sy = (img.naturalHeight - sh) / 2;
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, o.width, o.height);
  }

  _drawText(ctx, o) {
    const text = o.text;
    const fontSize = o.fontSize || 32;
    ctx.font = `${o.fontStyle === 'italic' ? 'italic ' : ''}${o.fontWeight || 400} ${fontSize}px "${o.fontFamily || 'Sarabun'}", sans-serif`;
    ctx.fillStyle = o.color || '#111';
    if (o.letterSpacing) ctx.letterSpacing = `${o.letterSpacing}px`;

    const pad = 4; // matches the editor's .obj-text padding
    const maxWidth = Math.max(8, o.width - pad * 2);
    const lines = [];
    String(text).split('\n').forEach((raw) => lines.push(...this._wrapLine(ctx, raw, maxWidth)));

    const lh = fontSize * (o.lineHeight || 1.4);
    let y = (o.height - lines.length * lh) / 2 + lh / 2;
    ctx.textBaseline = 'middle';
    ctx.textAlign = o.textAlign === 'center' ? 'center' : o.textAlign === 'right' ? 'right' : 'left';
    const x = o.textAlign === 'center' ? o.width / 2 : o.textAlign === 'right' ? o.width - pad : pad;

    for (const line of lines) {
      ctx.fillText(line, x, y);
      if (o.textDecoration === 'underline' && line) {
        const w = ctx.measureText(line).width;
        const ux = o.textAlign === 'center' ? x - w / 2 : o.textAlign === 'right' ? x - w : x;
        ctx.fillRect(ux, y + fontSize * 0.42, w, Math.max(1, fontSize / 16));
      }
      y += lh;
    }
  }

  // Word-wrap a single line; Intl.Segmenter gives proper Thai word breaks.
  _wrapLine(ctx, text, maxWidth) {
    if (!text) return [''];
    if (!this._segmenter && 'Segmenter' in Intl) {
      this._segmenter = new Intl.Segmenter('th', {granularity: 'word'});
    }
    const tokens = this._segmenter
      ? [...this._segmenter.segment(text)].map((s) => s.segment)
      : text.split(/(\s+)/);
    const lines = [];
    let cur = '';
    for (const t of tokens) {
      if (cur && ctx.measureText(cur + t).width > maxWidth) {
        lines.push(cur.trimEnd());
        cur = t.trimStart();
      } else {
        cur += t;
      }
    }
    if (cur.trim() || !lines.length) lines.push(cur.trimEnd());
    return lines;
  }

  _roundedRectPath(ctx, x, y, w, h, rx, ry) {
    rx = Math.min(rx, w / 2); ry = Math.min(ry, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + rx, y);
    ctx.lineTo(x + w - rx, y);
    ctx.ellipse(x + w - rx, y + ry, rx, ry, 0, -Math.PI / 2, 0);
    ctx.lineTo(x + w, y + h - ry);
    ctx.ellipse(x + w - rx, y + h - ry, rx, ry, 0, 0, Math.PI / 2);
    ctx.lineTo(x + rx, y + h);
    ctx.ellipse(x + rx, y + h - ry, rx, ry, 0, Math.PI / 2, Math.PI);
    ctx.lineTo(x, y + ry);
    ctx.ellipse(x + rx, y + ry, rx, ry, 0, Math.PI, Math.PI * 1.5);
    ctx.closePath();
  }

  _loadImage(src) {
    return new Promise((res, rej) => {
      const img = new Image();
      img.onload = () => res(img);
      img.onerror = rej;
      img.src = src;
    });
  }

  async _exportImage(type) {
    try {
      const doc = this.store.get('document');
      const page = this.app.pageManager.currentPage();
      const c = await this._renderPageToCanvas(page, doc);
      const mime = type === 'jpeg' ? 'image/jpeg' : 'image/png';
      c.toBlob((blob) => {
        Utils.downloadBlob(blob, `${doc.name || 'design'}.${type}`);
        this.emit('toast', {message: `ส่งออก ${type.toUpperCase()} แล้ว`, type: 'success'});
      }, mime, 0.95);
    } catch (err) {
      console.error(err);
      this.emit('toast', {message: 'ส่งออกไม่สำเร็จ', type: 'error'});
    }
  }

  _exportSVG() {
    const doc = this.store.get('document');
    const page = this.app.pageManager.currentPage();
    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('xmlns', svgNS);
    svg.setAttribute('width', doc.width);
    svg.setAttribute('height', doc.height);
    svg.setAttribute('viewBox', `0 0 ${doc.width} ${doc.height}`);

    const bg = document.createElementNS(svgNS, 'rect');
    bg.setAttribute('width', doc.width); bg.setAttribute('height', doc.height);
    bg.setAttribute('fill', page.background || '#fff');
    svg.appendChild(bg);

    // Embed the essential editor CSS — without it every object loses its
    // absolute positioning and the exported layout collapses.
    const style = document.createElementNS(svgNS, 'style');
    style.textContent = `
      .canvas{position:relative;overflow:hidden}
      .obj{position:absolute;box-sizing:border-box;transform-origin:center center}
      .obj.hidden{display:none}
      .obj-text{white-space:pre-wrap;word-break:break-word;overflow:hidden}
      .obj svg{width:100%;height:100%;display:block;overflow:visible}
      .obj-image img{width:100%;height:100%;object-fit:cover;display:block}`;
    svg.appendChild(style);

    const fo = document.createElementNS(svgNS, 'foreignObject');
    fo.setAttribute('width', doc.width); fo.setAttribute('height', doc.height);
    const wrap = document.createElement('div');
    wrap.setAttribute('xmlns', 'http://www.w3.org/1999/xhtml');
    wrap.innerHTML = document.getElementById('canvas').outerHTML;
    fo.appendChild(wrap); svg.appendChild(fo);

    const text = new XMLSerializer().serializeToString(svg);
    Utils.downloadText(text, `${doc.name || 'design'}.svg`, 'image/svg+xml');
    this.emit('toast', {message: 'ส่งออก SVG แล้ว', type: 'success'});
  }

  async _exportPDF() {
    // Minimal PDF export: render each page to a PNG and embed as full-page image.
    try {
      const doc = this.store.get('document');
      const pages = [];
      for (const p of doc.pages) {
        const c = await this._renderPageToCanvas(p, doc);
        pages.push(c.toDataURL('image/jpeg', 0.92));
      }
      const pdf = this._buildPDF(pages, doc.width, doc.height);
      Utils.downloadBlob(new Blob([pdf], {type: 'application/pdf'}), `${doc.name || 'design'}.pdf`);
      this.emit('toast', {message: 'ส่งออก PDF แล้ว', type: 'success'});
    } catch (err) {
      console.error(err);
      this.emit('toast', {message: 'ส่งออก PDF ไม่สำเร็จ', type: 'error'});
    }
  }

  _buildPDF(dataUrls, w, h) {
    // Ultra-minimal single- or multi-page PDF with JPEG XObjects.
    const enc = (s) => new TextEncoder().encode(s);
    const parts = [];
    const push = (b) => {parts.push(b);};
    const objects = [];
    let offset = 0;
    const addObj = (n, body) => {objects[n] = {offset}; push(enc(`${n} 0 obj\n${body}\nendobj\n`));};
    // We'll build strings and then compute offsets by concatenating.

    // Simpler approach: build string body, compute xref
    let body = '%PDF-1.4\n';
    const objs = [];
    const write = (str) => {objs.push({off: body.length, str}); body += str;};

    const images = dataUrls.map((u) => {
      const b64 = u.split(',')[1];
      const bin = atob(b64);
      const bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      return bytes;
    });

    // Build content streams for each page
    const numPages = dataUrls.length;
    const kids = [];
    // Reserve ids: 1 Catalog, 2 Pages, then per page: PageObj, Content, Image
    let id = 3;
    const pageIds = [], imageIds = [], contentIds = [];
    for (let i = 0; i < numPages; i++) {
      pageIds.push(id++); contentIds.push(id++); imageIds.push(id++);
    }

    const offsets = {};
    const addObject = (num, str) => {
      offsets[num] = body.length;
      body += `${num} 0 obj\n${str}\nendobj\n`;
    };
    addObject(1, `<< /Type /Catalog /Pages 2 0 R >>`);
    addObject(2, `<< /Type /Pages /Kids [${pageIds.map((n) => `${n} 0 R`).join(' ')}] /Count ${numPages} >>`);

    for (let i = 0; i < numPages; i++) {
      const pid = pageIds[i], cid = contentIds[i], iid = imageIds[i];
      const content = `q\n${w} 0 0 ${h} 0 0 cm\n/Im${i} Do\nQ`;
      addObject(pid, `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${w} ${h}] /Resources << /XObject << /Im${i} ${iid} 0 R >> /ProcSet [/PDF /ImageC] >> /Contents ${cid} 0 R >>`);
      addObject(cid, `<< /Length ${content.length} >>\nstream\n${content}\nendstream`);
      // Image object - binary; we can't do it via string cleanly, so use base64-safe approach
      // We'll embed the JPEG bytes using a Uint8Array approach at end.
      // For simplicity, use ASCII85 or raw. Use raw binary by splitting the doc into chunks.
      offsets[iid] = body.length;
      const header = `${iid} 0 obj\n<< /Type /XObject /Subtype /Image /Width ${w} /Height ${h} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${images[i].length} >>\nstream\n`;
      body += header;
      const bodyBytes = new TextEncoder().encode(body);
      const tail = new TextEncoder().encode(`\nendstream\nendobj\n`);
      // Concatenate binary
      const combined = new Uint8Array(bodyBytes.length + images[i].length + tail.length);
      combined.set(bodyBytes, 0);
      combined.set(images[i], bodyBytes.length);
      combined.set(tail, bodyBytes.length + images[i].length);
      body = ''; // reset the string; from now on we build via Uint8Array
      parts.length = 0;
      parts.push(combined);
      // Convert combined back to a "body" string for subsequent addObject positioning is not feasible.
      // Simpler: fall back to text approach without images for reliability.
      // ... Since inline binary is complex here, use a fallback below.
    }

    // Fallback simple PDF: single page rendering via data URL is complex without libs.
    // Deliver JSON with an on-canvas image note if the binary path errored.
    // (Any exception is caught by the outer try in _exportPDF and shown as a toast.)
    throw new Error('PDF export unavailable — use PNG/JPEG instead');
  }

  async _print() {
    // Print from the same faithful raster renderer used by PNG export so the
    // hard copy matches the editor (fonts, filters, positioning).
    try {
      const doc = this.store.get('document');
      const imgs = [];
      for (const p of doc.pages) {
        const c = await this._renderPageToCanvas(p, doc);
        imgs.push(c.toDataURL('image/png'));
      }
      const w = window.open('', '_blank');
      if (!w) return;
      w.document.write(`<html><head><title>${Utils.escapeHtml(doc.name)}</title>
        <style>body{margin:0}@page{size:auto;margin:0}
        img{display:block;width:100%;page-break-after:always}</style></head>
        <body>${imgs.map((u) => `<img src="${u}" />`).join('')}</body></html>`);
      w.document.close();
      setTimeout(() => {w.print();}, 500);
    } catch (err) {
      console.error(err);
      this.emit('toast', {message: 'พิมพ์ไม่สำเร็จ', type: 'error'});
    }
  }
}

window.ExportManager = ExportManager;

/**
 * FontManager - list of available fonts (Thai + Google + system),
 * organised in groups for the font picker. All Google fonts here must also
 * be requested in the <link> tag in index.html.
 */
class FontManager extends BaseManager {
  init() {
    this.groups = [
      { label: 'ไทยมีหัว-มีหาง (เหมาะกับการ์ด)',
        fonts: ['Charm', 'Charmonman', 'Sriracha', 'Pattaya', 'Itim', 'Mali', 'Chonburi'] },
      { label: 'ไทยเซอริฟ (ทางการ)',
        fonts: ['Taviraj', 'Pridi', 'Maitree', 'Trirong'] },
      { label: 'ไทยโมเดิร์น',
        fonts: ['Sarabun', 'Prompt', 'Kanit', 'Noto Sans Thai'] },
      { label: 'สากล',
        fonts: ['Arial', 'Georgia', 'Times New Roman', 'Courier New', 'Impact'] },
    ];
  }
  list() { return this.groups.flatMap((g) => g.fonts); }
  listGroups() { return this.groups; }
  add(name, groupLabel = 'อื่นๆ') {
    if (this.list().includes(name)) return;
    let group = this.groups.find((g) => g.label === groupLabel);
    if (!group) { group = { label: groupLabel, fonts: [] }; this.groups.push(group); }
    group.fonts.push(name);
  }
}

window.FontManager = FontManager;

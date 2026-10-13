// Building blocks for redesign.html v9. Every element of the design is one function here, so each copy on the page is identical.
export const I = (id, label) => label
  ? `<svg class="i" role="img" aria-label="${label}"><use href="#i-${id}"/></svg>`
  : `<svg class="i" aria-hidden="true"><use href="#i-${id}"/></svg>`;

export const CATS = {
  trav: ['Ceļošana un daba', 'mount'], dance: ['Dejas', 'dance'], hobby: ['Hobiji un aizraušanās', 'hobby'],
  comm: ['Kopiena un vide', 'comm'], pol: ['Kustības un politika', 'pol'], pets: ['Mājdzīvnieki', 'pets'],
  art: ['Māksla un kultūra', 'art'], music: ['Mūzika', 'music'], rel: ['Reliģija un garīgums', 'rel'],
  social: ['Sociālās aktivitātes', 'social'], games: ['Spēles', 'games'], sport: ['Sports un fitness', 'sport'],
  family: ['Vecāki un ģimene', 'family'], well: ['Veselība un labsajūta', 'well'], sci: ['Zinātne un izglītība', 'edu'],
};
export const catName = (k) => CATS[k][0];
export const catIco = (k) => `<svg aria-hidden="true"><use href="#i-${CATS[k][1]}"/></svg>`;
export const cv = (k) => `--c:var(--k-${k})`;
export const biedri = (n) => `${n} ${n % 10 === 1 && n % 100 !== 11 ? 'biedrs' : 'biedri'}`;
export const el = (name) => `<!-- el:${name} -->`;

// ── Small labels (source: Identity → Small tags and category label)
export const cat = (k) => `<span class="rd-cat" style="${cv(k)}">${catName(k)}</span>`;
export const catLine = (k, subs) => `<span class="rd-catl">${cat(k)}${subs ? `<span class="rd-sub">${subs}</span>` : ''}</span>`;
export const pill = (text, kind) => {
  if (kind === 'eju') return `<span class="rd-pill">${I('check')}Eju</span>`;
  if (kind === 'out') return `<span class="rd-pill out">${text}</span>`;
  return `<span class="rd-pill">${text}</span>`;
};
export const st = (kind, text) => {
  const t = text ?? { ag: 'Agreed', lk: 'Liked', op: 'Open', pr: 'Proposal' }[kind];
  return `<span class="rd-st ${kind}">${t}</span>`;
};

// ── Groups (sample data)
export const G = {
  zs: { name: 'Jelgavas pensionāru nūjošanas un pastaigu biedrība «Zaļais solis»', short: '«Zaļais solis»', cat: 'sport', subs: 'Nūjošana, Pastaigas', city: 'Jelgava', n: 48, ph: 'nordic', next: 'piektd., 16. okt.', nextFull: 'piektd., 16. okt., 10:00 pie Lielupes promenādes', text: 'Katru piektdienu nūjojam pa Jelgavas promenādēm un parkiem. Piedalīties var ikviens, nūjas var aizņemties.' },
  rn: { name: 'Rīta nūjošana pie Lielupes', cat: 'sport', subs: 'Nūjošana', city: 'Jelgava', n: 12, ph: 'river', ask: 'Gaidām iesācējus' },
  sk: { name: 'Jelgavas skrējēji', cat: 'sport', subs: 'Skriešana', city: 'Jelgava', n: 21, next: 'pirmd., 12. okt.' },
  vb: { name: 'Jelgavas volejbola draugi', cat: 'sport', subs: 'Volejbols', city: 'Jelgava', n: 15, ask: 'Meklējam vēl divus spēlētājus' },
  fb: { name: 'Svētdienas futbols Pārlielupē', cat: 'sport', subs: 'Futbols', city: 'Jelgava', n: 22, next: 'svētd., 11. okt.' },
  gt: { name: 'Galda teniss Jelgavā', cat: 'sport', subs: 'Galda teniss', city: 'Jelgava', n: 7 },
  pg: { name: 'Pārgājieni', cat: 'trav', subs: 'Pārgājieni, Kempings', city: 'Rīga', n: 3, ph: 'bog', next: 'sestd., 17. okt.' },
  vz: { name: 'Vēja zirdžiņš', cat: 'dance', subs: 'Tautas dejas', city: 'Jelgava', n: 26, ph: 'dance' },
  gs: { name: 'Galda spēļu vakari', cat: 'games', subs: 'Galda spēles, Lomu spēles', city: 'Jelgava', n: 8, ph: 'games', ask: 'Meklējam ceturto spēlētāju' },
  sp: { name: 'Spēļu klubs «Kauliņš»', cat: 'games', subs: 'Galda spēles', city: 'Jelgava', n: 31, ask: 'Meklējam spēlētājus «Katanai»' },
  sh: { name: 'Šaha stūrītis', cat: 'games', subs: 'Šahs', city: 'Jelgava', n: 5, ask: 'Gaidām iesācējus' },
  rs: { name: 'Rīgas šaha vakari', cat: 'games', subs: 'Šahs', city: 'Rīga', n: 34 },
  ts: { name: 'Tukuma šaha klubs', cat: 'games', subs: 'Šahs', city: 'Tukums', n: 9 },
  ls: { name: 'Liepājas šahisti', cat: 'games', subs: 'Šahs', city: 'Liepāja', n: 12 },
};

// ── Group card, desktop (source: Discovery → Group card and group row)
export const groupCard = (g, o = {}) => {
  const note = g.ask ? `<div class="note">${g.ask}</div>` : g.next ? `<div class="note">${I('cal')}Nākamā tikšanās: ${g.next}</div>` : '';
  const pic = g.ph ? `<div class="pic ph ph-${g.ph}" role="img" aria-label="Grupas attēls"></div>` : `<div class="pic">${catIco(g.cat)}</div>`;
  return `${el('group-card')}<div class="rd-gc${o.sel ? ' sel' : ''}" style="${cv(g.cat)}">${pic}<div class="in"><b class="clamp2">${g.name}</b>${catLine(g.cat, g.subs)}<span class="meta">${g.city} · ${biedri(g.n)}</span></div>${note}</div>`;
};
export const createCard = () => `${el('create-card')}<div class="rd-gc add"><span class="addi">${I('plus')}</span><b>Izveidot jaunu grupu</b><p>šajā kategorijā</p></div>`;
export const cards = (list, extra = '') => `<div class="rd-gcards">${list.map((g) => typeof g === 'string' ? g : groupCard(g)).join('')}${extra}</div>`;

// ── Group row: phones and every compact list (source: Discovery → Group card and group row)
export const groupRow = (g, o = {}) => `${el('group-row')}<div class="rd-gr" style="${cv(g.cat)}"><span class="t"><b class="clamp2">${o.hl ?? g.name}</b><small><span class="a">${catName(g.cat)} · ${g.subs}</span><span class="b">&nbsp;· ${g.city} · ${biedri(g.n)}${o.extra ? ` · ${o.extra}` : ''}</span></small>${o.count ? `<span class="rd-cnt">${o.count}</span>` : ''}</span>${o.pill ?? ''}<span class="mk">${catIco(g.cat)}</span></div>`;
export const createRow = () => `${el('create-row')}<div class="rd-gr add"><span class="t"><b>Izveidot jaunu grupu</b><small>šajā kategorijā</small></span><span class="mk">${I('plus')}</span></div>`;
export const rows = (html) => `<div class="rd-grl">${html}</div>`;

// ── Event row (source: Event → Event row)
/** The quiet word on the right of an event row when you can't simply say "Eju" (Still open 8). */
export const EV_STATE = { req: 'Pieteikšanās', full: 'Pilns', closed: 'Slēgts' };
export const ev = (e, o = {}) => {
  const ct = [o.noCity ? '' : e.city, EV_STATE[e.state] ? `<span class="es">${EV_STATE[e.state]}</span>` : ''].filter(Boolean).join(' · ');
  const tag = e.eju === 'gaida' ? pill('Gaida', 'out') : pill('', 'eju');
  const second = o.noSecond ? '' : `<span class="sl"><a>${e.group}</a><span>· ${catName(e.cat)}</span><span class="rd-sub">· ${e.sub}</span></span>`;
  return `${el('event-row')}<div class="rd-er${e.sel ? ' sel' : ''}${o.noSecond ? ' one' : ''}" style="${cv(e.cat)}"><span class="tm">${e.time}</span><span class="dt"></span><b>${e.name}</b><span class="ct">${ct}</span>${e.eju ? `<span class="tmb">${tag}</span>` : ''}${second}</div>`;
};
/** A plain text link for optional steps ("Rādīt nākamo nedēļu"): no pill, no arrow (13 Oct). */
export const textLink = (t, cls = '') => `${el('text-link')}<span class="rd-tl${cls ? ` ${cls}` : ''}">${t}</span>`;
export const dayh = (t) => `<div class="rd-dayh">${t}</div>`;
/** days: [[heading, [events]]]. */
export const evList = (days, o = {}) => `<div class="rd-evl${o.flat ? ' flat' : ''}">${days.map(([h, list]) => `${dayh(h)}<div class="rd-evg${o.cols ? ' cols' : ''}">${list.map((e) => ev(e, o)).join('')}</div>`).join('')}${o.more ? textLink(o.more, 'nextw') : ''}</div>`;

// ── Headers (source: Header and navigation)
/** The search bar is a plain field (13 Oct): no place, no tags. A tap or click opens the search at once. */
export const searchIdle = () => `${el('search-bar')}<span class="rd-search">${I('search')}<span class="ph">Meklē grupu vai nodarbi…</span></span>`;
/** The search bar while typing, in the open search. */
export const searchOpen = (q = '', o = {}) => `${el('search-bar')}<span class="rd-search open">${I('search')}<span class="q">${q}${o.done ? '' : '<span class="caret"></span>'}</span>${o.x ? `<span class="x">${I('x', 'Notīrīt')}</span>` : ''}</span>`;
/** The language switch: visible in the header on every page; the list is short and takes more languages later. */
export const langSw = (open = false) => `${el('language-switch')}<span class="rd-lang${open ? ' open' : ''}" role="button" aria-haspopup="listbox" aria-label="Valoda: latviešu">LV${I('down')}</span>`;
export const langList = () => `${el('language-list')}<div class="rd-menu rd-langl" role="listbox" aria-label="Valoda"><span class="rd-mi on" role="option" aria-selected="true">${I('check')}Latviešu<small>LV</small></span><span class="rd-mi" role="option" aria-selected="false"><i class="sp"></i>English<small>EN</small></span></div>`;
export const hdr = (o = {}) => {
  const search = o.search ?? searchIdle();
  if (o.signedOut) return `${el('header-desktop')}<div class="rd-hdr"><span class="rd-logo">Ejam&nbsp;<em>kopā</em></span>${search}${langSw(o.lang)}<span class="rd-btn p sm">Ienākt</span></div>`;
  const on = (k) => (o.on === k ? ' on' : '');
  return `${el('header-desktop')}<div class="rd-hdr"><span class="rd-logo">Ejam&nbsp;<em>kopā</em></span>${search}${langSw(o.lang)}${o.admin ? `<span class="rd-ico${on('shield')}" aria-label="Administrēšana">${I('shield')}</span>` : ''}<span class="rd-ico${on('msg')}" aria-label="Ziņas, 2 nelasītas">${I('msg')}<span class="dot"></span></span><span class="rd-ico${on('bell')}" aria-label="Paziņojumi, 3 jauni">${I('bell')}<span class="dot"></span></span><span class="rd-av${on('av')}" role="img" aria-label="Tavs attēls"></span></div>`;
};
export const phdr = (o = {}) => {
  const on = (k) => (o.on === k ? ' on' : '');
  return `${el('header-phone')}<div class="rd-hdr ph"><span class="rd-logo">Ejam&nbsp;<em>kopā</em></span><span class="sp"></span>${langSw(o.lang)}<span class="rd-ico${on('search')}" aria-label="Meklēt">${I('search')}</span>${o.admin ? `<span class="rd-ico${on('shield')}" aria-label="Administrēšana">${I('shield')}</span>` : ''}<span class="rd-ico${on('bell')}" aria-label="Paziņojumi, 3 jauni">${I('bell')}<span class="dot"></span></span><span class="rd-av${on('av')}" role="img" aria-label="Tavs attēls"></span></div>`;
};
export const navb = (on) => {
  const it = (k, icon, label, badge) => `<span${on === k ? ' class="on" aria-current="page"' : ''}>${I(icon)}${label}${badge ? `<em>${badge}</em>` : ''}</span>`;
  return `${el('bottom-bar')}<div class="rd-navb">${it('atklat', 'search', 'Atklāt')}${it('grupas', 'users', 'Grupas')}<span class="add" role="link" aria-label="Izveidot grupu">${I('plus')}</span>${it('zinas', 'msg', 'Ziņas', 2)}${it('es', 'user', 'Es')}</div>`;
};
/** Slim footer: discovery and reading pages only (About, Privacy); none on group, own-area or admin pages. */
export const foot = () => `${el('footer')}<footer class="rd-foot"><span class="rd-logo">Ejam&nbsp;<em>kopā</em></span><span class="m">Atrodi savējos, augam kopā.</span><span class="ln"><a>Par mums</a><a>Privātums</a></span></footer>`;
export const profileMenu = () => `${el('profile-menu')}<div class="rd-menu" role="menu" aria-label="Profila izvēlne"><span class="rd-mi">${I('user')}Mans profils</span><span class="rd-mi">${I('users')}Manas grupas<em>3</em></span><span class="rd-mi">${I('plus')}Izveidot grupu</span><span class="sep"></span><span class="rd-mi">${I('settings')}Iestatījumi</span><span class="rd-mi">${I('logout')}Iziet</span></div>`;
export const shieldMenu = () => `${el('shield-menu')}<div class="rd-menu" role="menu" aria-label="Administrēšana"><span class="rd-mi">${I('note')}Atsauksmju režīms<small>Izslēgts</small></span><span class="rd-mi">${I('globe')}Tulkošanas režīms<small>Izslēgts</small></span><span class="sep"></span><span class="rd-mi">${I('shield')}Administrēšanas panelis${I('arrow')}</span></div>`;

// ── Buttons
export const btn = (t, k = 'p', sm = false) => `<span class="rd-btn ${k}${sm ? ' sm' : ''}">${t}</span>`;
export const lnk = (t) => `<span class="rd-lnk">${t}${I('arrow')}</span>`;

// ── Filters (source: Discovery → The filter row)
export const placeChip = (place = 'Jelgava', open = false) => `<span class="rd-fc${open ? ' open' : ''}">${I('pin')}<b>${place}</b>${I('down')}</span>`;
export const subChip = (n, open = false) => `<span class="rd-fc${n ? ' set' : ''}${open ? ' open' : ''}">Apakškategorija${n ? `<em>${n}</em>` : ''}${I('down')}</span>`;
export const catChip = (k, open = false) => k
  ? `<span class="rd-fc set${open ? ' open' : ''}">${cat(k)}${I('down')}</span>`
  : `<span class="rd-fc${open ? ' open' : ''}">${I('grid')}Kategorija${I('down')}</span>`;
export const dateGroup = (o = {}) => {
  const q = ['Šodien', 'Rīt', 'Šonedēļ', 'Nedēļas nogalē'].map((d) => `<span role="radio" aria-checked="${!o.range && d === (o.on ?? 'Šonedēļ')}"${!o.range && d === (o.on ?? 'Šonedēļ') ? ' class="on"' : ''}>${d}</span>`).join('');
  const last = o.range ? `<span class="on${o.open ? ' open' : ''}" role="radio" aria-checked="true">${I('cal')}${o.range}</span>` : `<span class="${o.open ? 'open' : ''}" role="radio" aria-checked="false" aria-label="Izvēlēties datumus">${I('cal')}</span>`;
  return `<span class="rd-dq" role="radiogroup" aria-label="Datums">${q}${last}</span>`;
};
export const dateChip = (v = 'Šonedēļ', open = false) => `<span class="rd-fc${v !== 'Šonedēļ' ? ' set' : ''}${open ? ' open' : ''}">${I('clock')}<b>${v}</b>${I('down')}</span>`;
export const sw = (view = 'grupas') => `<span class="rd-sw" role="tablist" aria-label="Saturs"><span${view === 'grupas' ? ' class="on"' : ''} role="tab" aria-selected="${view === 'grupas'}">Grupas</span><span${view === 'pasakumi' ? ' class="on"' : ''} role="tab" aria-selected="${view === 'pasakumi'}">Pasākumi</span></span>`;
/** Desktop: place, sub-category (after a category), date choices (Pasākumi), switch at the right end. */
export const frow = (o = {}) => {
  const f = [placeChip(o.place, o.open === 'place')];
  if (o.cat) f.push(subChip(o.sub, o.open === 'sub'));
  if (o.view === 'pasakumi') f.push(dateGroup({ range: o.range, open: o.open === 'date' }));
  return `${el('filter-row-desktop')}<div class="rd-frow"><div class="fs">${f.join('')}</div>${sw(o.view)}</div>`;
};
/** Phone: one row that scrolls sideways; the switch stays pinned at the right. */
export const frowPh = (o = {}) => {
  const f = [placeChip(o.place, o.open === 'place'), catChip(o.cat, o.open === 'cat')];
  if (o.cat) f.push(subChip(o.sub, o.open === 'sub'));
  if (o.view === 'pasakumi') f.push(dateChip(o.date ?? 'Šonedēļ', o.open === 'date'));
  return `${el('filter-row-phone')}<div class="rd-frow ph"><div class="fs scx">${f.join('')}</div>${sw(o.view)}</div>`;
};
/** A category as a chip in the search (13 Oct): the same chip as the phone's category filter; chosen = dark outline and ×. */
export const catToggle = (k, on = false) => `<span class="rd-fc${on ? ' set' : ''}" style="${cv(k)}">${cat(k)}${on ? I('x', 'Noņemt') : ''}</span>`;
/** The chip row at the top of the open search: the place chip (the place list, set from the page's filter), then the categories that match. */
export const searchChips = (o = {}) => `${el('search-chips')}<div class="rd-schips${o.ph ? ' ph' : ''}"><div class="fs${o.ph ? ' scx' : ''}">${placeChip(o.place, o.open)}${(o.cats ?? []).map(([k, on]) => catToggle(k, on)).join('')}</div></div>`;
/** The chosen-filters line, only when something is chosen. items: [text, catKey?, isCategory?] */
export const sel = (items, o = {}) => items.length === 0 ? '' : `${el('chosen-line')}<div class="rd-sel${o.ph ? ' ph scx' : ''}">${items.map(([t, k, isCat]) => `<span class="rd-x${isCat ? ' cat' : ''}"${k ? ` style="${cv(k)}"` : ''}>${t}${I('x', 'Noņemt')}</span>`).join('')}<span class="rd-clr">Notīrīt visu</span></div>`;

// ── Category drawer (source: Discovery → The category drawer)
const ORDER = ['trav', 'dance', 'hobby', 'comm', 'pol', 'pets', 'art', 'music', 'rel', 'social', 'games', 'sport', 'family', 'well', 'sci'];
export const cats = (counts, o = {}) => {
  const total = ORDER.reduce((s, k) => s + (counts[k] ?? 0), 0);
  const row = (k) => `<span class="ci${o.on === k ? ' on' : ''}${(counts[k] ?? 0) === 0 ? ' zero' : ''}" style="${cv(k)}" title="${catName(k)}"><span class="ic">${catIco(k)}</span><span class="nm">${catName(k)}</span><span class="n">${counts[k] ?? 0}</span></span>`;
  return `${el('category-drawer')}<div class="rd-cats${o.fold ? ' fold' : ''}" aria-label="Kategorijas"><div class="cl-h"><b>Kategorijas</b><span class="tg" title="${o.fold ? 'Atvērt' : 'Sakļaut'}">${I(o.fold ? 'right' : 'left')}</span></div><div class="find">${I('search')}<span>Meklēt kategoriju</span></div><span class="ci${o.on ? '' : ' on'}" style="--c:var(--fg)" title="Visas"><span class="ic"><svg aria-hidden="true"><use href="#i-all"/></svg></span><span class="nm">Visas</span><span class="n">${total}</span></span>${ORDER.map(row).join('')}</div>`;
};

// ── Drop-down lists (source: Discovery → Drop-downs, open)
const find = (placeholder, typed) => typed
  ? `<span class="rd-find typed">${I('search')}<span class="q">${typed}<span class="caret"></span></span></span>`
  : `<span class="rd-find">${I('search')}${placeholder}</span>`;
const tick = (on) => `<span class="rd-cb${on ? ' on' : ''}">${on ? I('check') : ''}</span>`;
export const NF = 'Nekas nav atrasts.';
export const PLACES = [['Jelgava', 23], ['Ozolnieki', 3], ['Rīga', 196], ['Liepāja', 31], ['Daugavpils', 27], ['Tukums', 9]];
export const placeList = (o = {}) => {
  const ticked = o.ticked ?? [];
  let body;
  if (o.typed === 'Ērgļi') body = `<p class="rd-nf">${NF}</p><p class="rd-nf sm">Jaunu vietu var ieteikt, veidojot grupu; to apstiprina administratori.</p>`;
  else if (o.typed) body = [['<em class="hl">Je</em>lgava', 23, 'Jelgava'], ['<em class="hl">Je</em>lgavas novads', 4], ['<em class="hl">Jē</em>kabpils', 6]].map(([t, n, k]) => `<span class="rd-opt${ticked.includes(k) ? ' on' : ''}" role="option" aria-selected="${ticked.includes(k)}">${tick(ticked.includes(k))}<span>${t}</span><span class="n">${n}</span></span>`).join('');
  else body = `<span class="rd-opt all${ticked.length === 0 ? ' on' : ''}" role="option" aria-selected="${ticked.length === 0}">Visur<span class="n">412</span></span><span class="sep"></span>${PLACES.map(([c, n]) => `<span class="rd-opt${ticked.includes(c) ? ' on' : ''}" role="option" aria-selected="${ticked.includes(c)}">${tick(ticked.includes(c))}${c}<span class="n">${n}</span></span>`).join('')}`;
  return `${el('place-list')}<div class="rd-list" role="listbox" aria-multiselectable="true" aria-label="Vieta">${find('Meklēt pilsētu', o.typed)}${body}</div>`;
};
export const subList = (o = {}) => {
  const all = [['Nūjošana', 2], ['Pastaigas', 1], ['Skriešana', 1], ['Volejbols', 1], ['Futbols', 1], ['Galda teniss', 1], ['Peldēšana', 0]];
  const ticked = o.ticked ?? [];
  let body;
  if (o.typed === 'pe') body = `<span class="rd-opt zero" role="option" aria-selected="false">${tick(false)}<span><em class="hl">Pe</em>ldēšana</span><span class="n">0</span></span>`;
  else if (o.typed) body = `<p class="rd-nf">${NF}</p>`;
  else body = all.map(([s, n]) => `<span class="rd-opt${ticked.includes(s) ? ' on' : ''}${n === 0 ? ' zero' : ''}" role="option" aria-selected="${ticked.includes(s)}">${tick(ticked.includes(s))}${s}<span class="n">${n}</span></span>`).join('');
  return `${el('sub-list')}<div class="rd-list" role="listbox" aria-multiselectable="true" aria-label="Apakškategorija">${find('Meklēt apakškategoriju', o.typed)}${body}</div>`;
};
export const catSearch = (typed) => {
  let body;
  if (typed === 'mū') body = `<span class="rd-opt" style="${cv('music')}"><span class="ki">${catIco('music')}</span><span><em class="hl">Mū</em>zika</span><span class="n">3</span></span>`;
  else if (typed === 'nūj') body = `<span class="rd-opt" style="${cv('sport')}"><span class="ki">${catIco('sport')}</span><span>Sports un fitness → <em class="hl">Nūj</em>ošana</span><span class="n">2</span></span>`;
  else body = `<p class="rd-nf">${NF}</p><span class="rd-opt add">${I('plus')}Ieteikt jaunu kategoriju: „${typed}”</span>`;
  return `${el('category-search')}<div class="rd-list" role="listbox" aria-label="Kategorijas">${find('Meklēt kategoriju', typed === 'mū' || typed === 'nūj' ? `<em class="hl">${typed}</em>` : typed)}${body}</div>`;
};
/** The date picker: quick choices on top, a month below; the button says how many events the choice gives. */
export const calendar = () => {
  const d = (n, c = '') => `<span${c ? ` class="${c}"` : ''}>${n}</span>`;
  const past = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => d(n, 'past')).join('');
  return `${el('date-picker')}<div class="rd-list rd-cal" role="dialog" aria-label="Datums"><div class="q"><span>Šodien</span><span>Rīt</span><span>Šonedēļ</span><span>Nedēļas nogalē</span></div><div class="mh">${I('left', 'Iepriekšējais mēnesis')}<span>2026. gada oktobris</span>${I('right', 'Nākamais mēnesis')}</div><div class="g" role="grid" aria-label="Oktobris"><span class="wd">P</span><span class="wd">O</span><span class="wd">T</span><span class="wd">C</span><span class="wd">Pk</span><span class="wd">S</span><span class="wd">Sv</span><span></span><span></span><span></span>${past}${d(11, 'td')}${d(12)}${d(13)}${d(14)}${d(15, 's')}${d(16, 'rg')}${d(17, 'rg')}${d(18, 'e')}${[19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31].map((n) => d(n)).join('')}</div><div class="f"><span>Ceturtd., 15. – svētd., 18. okt.</span>${btn('Rādīt 23', 'p', true)}</div></div>`;
};
/** The day strip over an event list. */
export const dayStrip = (selDay = 11, o = {}) => {
  const days = [['Sv', 11], ['P', 12], ['O', 13], ['T', 14], ['C', 15], ['Pk', 16], ['S', 17]];
  const none = o.none ?? [];
  return `${el('day-strip')}<div class="rd-ds" aria-label="Dienas"><div class="h"><b>Oktobris 2026</b><span>Šodien</span></div><div class="g">${days.map(([w, n]) => `<span class="${[n === selDay ? 'sel' : '', n === 11 && selDay !== 11 ? 'td' : '', none.includes(n) ? 'no' : ''].filter(Boolean).join(' ')}"${n === selDay ? ' aria-current="date"' : ''}><small>${w}</small><b>${n}</b><i></i></span>`).join('')}</div></div>`;
};

// ── Panels (source: Group → The opened card; Event → The event panel)
export const groupPanel = (g, o = {}) => `${el('group-panel')}<aside class="rd-pnl${o.sheet ? ' sheet' : ''}" style="${cv(g.cat)}" aria-label="Grupas ātrais skats">${o.sheet ? '<span class="grab"></span>' : ''}<div class="pic ph ph-${g.ph}" role="img" aria-label="Grupas attēls"><span class="x" aria-label="Aizvērt">${I('x')}</span></div><div class="bd"><h3>${g.name}</h3>${catLine(g.cat, g.subs)}<span class="facts">${g.city} · ${biedri(g.n)}</span><p class="note">${I('cal')}Nākamā tikšanās: ${g.nextFull}</p><p>${g.text}</p>${btn('Sazināties')}${lnk('Atvērt grupas lapu')}</div></aside>`;
/** What the event panel and page say when you can't simply say "Eju" (Still open 8). */
export const EV_NOTE = {
  req: 'Organizators apstiprina, kas piedalīsies.',
  full: 'Pasākums ir pilns. Vari pieteikties gaidīšanas sarakstā.',
  closed: 'Pieteikšanās ir slēgta.',
};
/** The join line of an event: the note (if any), then the button and "Visa informācija" on one line. */
const evAct = (o, more) => {
  const b = { req: btn('Pieteikties', 'p', true), full: btn('Pieteikties gaidīšanas sarakstā', 'p', true), closed: '' }[o.state] ?? btn('Eju', 'p', true);
  return `${EV_NOTE[o.state] ? `<p class="es">${EV_NOTE[o.state]}</p>` : ''}<div class="act">${b}${more}</div>`;
};
/** Who is going: faces and a name for signed-in viewers, only the number for visitors (13 Oct). */
const going = (o) => o.out ? '<span class="going">12 iet</span>' : '<span class="going"><span class="faces"><i></i><i></i><i></i></span>Ilze un vēl 11 iet</span>';
export const eventPanel = (o = {}) => `${el('event-panel')}<aside class="rd-pnl${o.sheet ? ' sheet' : ''}" style="${cv('dance')}" aria-label="Pasākuma ātrais skats">${o.sheet ? '<span class="grab"></span>' : ''}<div class="pic ph ph-dance" role="img" aria-label="Pasākuma attēls"><span class="x" aria-label="Aizvērt">${I('x')}</span></div><div class="bd"><h3>Deju koncerts</h3>${catLine('dance', 'Tautas dejas')}<span class="facts">${I('cal')}Svētd., 11. okt. 17:00–19:00</span><span class="facts">${I('pin')}Liepāja, Latviešu biedrības nams, Rožu iela 5</span><p>Tautas deju kolektīvu rudens koncerts. Uzstājas četri kolektīvi no Zemgales un Kurzemes, pēc koncerta var palikt uz kopīgu danci. Ieeja bez maksas.</p>${going(o)}${evAct(o, lnk('Visa informācija'))}<span class="org">Rīko <a>Vēja zirdžiņš</a> · Jelgava</span></div></aside>`;
/** The event's own page (proposal, 13 Oct): the panel's content in full, inside the group's frame. */
export const eventPage = (o = {}) => `${el('event-page')}<article class="rd-evp" style="${cv('dance')}"><div class="pic ph ph-dance" role="img" aria-label="Pasākuma attēls"></div><div class="bd"><h3>Deju koncerts</h3>${catLine('dance', 'Tautas dejas')}<span class="facts">${I('cal')}<span>Svētd., 11. okt. 17:00–19:00 <a>Pievienot kalendāram</a></span></span><span class="facts">${I('pin')}<span>Liepāja, Latviešu biedrības nams, Rožu iela 5 <a>Atvērt kartē</a></span></span><p>Tautas deju kolektīvu rudens koncerts. Uzstājas četri kolektīvi no Zemgales un Kurzemes, pēc koncerta var palikt uz kopīgu danci. Ieeja bez maksas.</p><div class="imp"><b>Svarīga informācija</b><p>Ieeja no Rožu ielas puses. Dejotājiem līdzi ērtus apavus.</p></div>${going(o)}${evAct(o, `<span class="rd-lnk q">${I('share')}Dalīties</span>`)}</div>${o.team ? `<div class="rd-box2 org">${el('event-organiser')}<div class="bh">Rīkotājiem</div><div class="ln"><span>Iet <b>12</b></span><span>Pieteikumi <b>0</b></span><span>Gaidīšanas sarakstā <b>0</b></span></div><div class="row">${btn('Labot', 's', true)}${btn('Slēgt pieteikšanos', 's', true)}${btn('Dzēst', 's', true)}</div></div>` : ''}</article>`;

// ── The contact form (source: Group → One button: Sazināties)
export const contactDialog = (o = {}) => o.sent
  ? `${el('contact-dialog')}<div class="rd-dlg" role="dialog" aria-label="Nosūtīts"><b class="h">Nosūtīts</b><p>Atbildes būs sadaļā Ziņas.</p><div class="row">${btn('Atvērt sarunu')}</div></div>`
  : `${el('contact-dialog')}<div class="rd-dlg" role="dialog" aria-label="${o.closed || o.off ? 'Sazināties ar grupu' : 'Pieteikties grupā'} ${G.zs.short}"><b class="h">${o.closed || o.off ? 'Sazināties ar grupu' : 'Pieteikties grupā'} ${G.zs.short}</b><p>${o.closed || o.off ? 'Uzraksti grupas organizatoriem.' : 'Pastāsti organizatoriem, kāpēc vēlies pievienoties un ko meklē.'} Atbildes būs sadaļā Ziņas.</p><span class="rd-ta">Sveiki! Gribētu nākt nūjot piektdien, vai nūjas tiešām var aizņemties?</span>${o.closed ? '' : `<span class="rd-tgl"><span>Vēlos pievienoties grupai</span><span class="k${o.off ? '' : ' on'}" role="switch" aria-checked="${!o.off}"></span></span>`}<div class="row">${btn('Atcelt', 's', true)}${btn('Nosūtīt', 'p', true)}</div></div>`;

// ── Group page parts (source: Group → The group page)
export const gpic = (g, size) => g.ph
  ? `<span class="rd-gpic ph ph-${g.ph}${size ? ` ${size}` : ''}" role="img" aria-label="Grupas attēls"></span>`
  : `<span class="rd-gpic${size ? ` ${size}` : ''}">${catIco(g.cat)}</span>`;
export const gban = (g, o = {}) => `${el('group-banner')}<div class="rd-gban${o.low ? ' low' : ''}" style="${cv(g.cat)}"><div class="gid">${gpic(g, o.low ? 'md' : '')}<div class="t"><h3>${g.name}</h3><div class="sig">${catLine(g.cat, g.subs)}<span class="q">${g.city} · ${biedri(g.n)}</span></div></div><div class="acts">${o.role === 'visitor' ? btn('Sazināties') : o.role === 'pending' ? `<span class="rd-btn s">${I('check')}Pieteikums nosūtīts</span>${btn('Atvērt sarunu', 'q')}` : ''}<span class="rd-btn s more" aria-label="Vairāk">${I('dots')}</span></div></div></div>`;
export const gbar = (g, o = {}) => `${el('group-bar-phone')}<div class="rd-gbar" style="${cv(g.cat)}"><span class="mbtn" aria-label="Grupas lapas">${I('menu')}</span>${gpic(g, 'sm')}<span class="t"><b>${g.name}</b><small><span class="a"><i class="kd"></i>${catName(g.cat)}</span><span class="b">&nbsp;· ${g.city} · ${biedri(g.n)}</span></small></span><span class="mbtn q" aria-label="Vairāk">${I('dots')}</span>${o.role === 'visitor' ? `<span class="act">${btn('Sazināties', 'p', true)}</span>` : ''}</div>`;
export const gnav = (items, on) => `${el('group-menu')}<nav class="rd-gnav" aria-label="Grupas lapas">${items.map(([k, icon, label, badge]) => `<span${k === on ? ' class="on"' : ''}>${I(icon)}${label}${badge ? `<em>${badge}</em>` : ''}</span>`).join('')}</nav>`;
export const GPAGES = { info: ['info', 'note', 'Informācija'], jaun: ['jaun', 'list', 'Jaunumi'], pas: ['pas', 'cal', 'Pasākumi'], bied: ['bied', 'users', 'Biedri'], iest: ['iest', 'settings', 'Iestatījumi'] };
/** A page's parts as tabs; `act` (the team's one action, e.g. "Jauns ieraksts") sits at the right end. */
export const tabs = (list, on, label, act = '') => {
  const t = `<div class="rd-tabs" role="tablist" aria-label="${label}">${list.map((x) => `<span${x === on ? ' class="on"' : ''} role="tab" aria-selected="${x === on}">${x}</span>`).join('')}</div>`;
  return act ? `<div class="rd-tabr">${t}${act}</div>` : t;
};
/** The group's "…" menu: your role first (a line, not a button), then what you can do. */
export const groupMore = (role = 'member') => {
  const mi = (icon, t) => `<span class="rd-mi" role="menuitem">${I(icon)}${t}</span>`;
  const head = { member: 'Tu esi šīs grupas biedrs', pending: 'Tavs pieteikums gaida atbildi', visitor: '' }[role];
  const items = role === 'pending'
    ? [mi('x', 'Atsaukt pieteikumu'), '<span class="sep"></span>', mi('share', 'Dalīties'), mi('flag', 'Ziņot par grupu')]
    : role === 'member'
      ? [mi('msg', 'Rakstīt komandai'), mi('share', 'Dalīties'), mi('flag', 'Ziņot par grupu'), '<span class="sep"></span>', mi('logout', 'Pamest grupu')]
      : [mi('share', 'Dalīties'), mi('flag', 'Ziņot par grupu')];
  return `${el('group-more-menu')}<div class="rd-menu" role="menu" aria-label="Vairāk">${head ? `<span class="rd-mhd">${head}</span>` : ''}${items.join('')}</div>`;
};
/** Social links: quiet text links at the end of Informācija (13 Oct). */
export const socLinks = (list) => `${el('social-links')}<p class="rd-soc">${list.map((t) => `<a>${t}</a>`).join('')}</p>`;
/** A member on Biedri: face, name, since when, the role tag; the team gets "…" on each row. */
export const memberRow = (m, o = {}) => `${el('member-row')}<div class="rd-mr"><span class="av">${m.name[0]}</span><span class="t"><b>${m.name}</b><small>${m.since}</small></span>${m.role ? pill(m.role) : ''}${o.team ? `<span class="mbtn q" aria-label="Darbības ar biedru">${I('dots')}</span>` : ''}</div>`;
export const memberMenu = () => `${el('member-menu')}<div class="rd-menu" role="menu" aria-label="Darbības ar biedru"><span class="rd-mi">${I('msg')}Sūtīt ziņu</span><span class="rd-mi">${I('user')}Skatīt profilu</span><span class="sep"></span><span class="rd-mi">${I('shield')}Iecelt par moderatoru</span><span class="rd-mi">${I('x')}Izslēgt no grupas</span></div>`;
/** A Jaunumi item. In a feed: the group (a link) and its category; on the group's own page: who wrote it and when. */
export const annItem = (a, o = {}) => `${el('announcement-item')}<div class="rd-fi"><span class="w">${I('list')}${o.own ? `<span>${a.by} · ${a.when}</span>${o.team ? `<span class="mbtn q" aria-label="Vairāk">${I('dots')}</span>` : ''}` : `<a>${a.group}</a>${cat(a.k)}<span>· ${a.when}</span>`}</span><b>${a.title}</b>${a.text ? `<p>${a.text}</p>` : ''}</div>`;

// ── Own area (source: Your own area)
export const phd = () => `${el('person-header')}<div class="rd-phd"><span class="rd-bigav" role="img" aria-label="Ilzes attēls"></span><span class="t"><b>Ilze Kalniņa</b><small>Jelgava · 3 grupas</small></span></div>`;
export const ownMenu = (on) => {
  const it = [['profils', 'user', 'Mans profils'], ['grupas', 'users', 'Manas grupas', 3], ['zinas', 'msg', 'Ziņas', 2], ['pazin', 'bell', 'Paziņojumi', 3], ['iest', 'settings', 'Iestatījumi']];
  return `${el('own-menu')}<nav class="rd-gnav" aria-label="Tava vieta">${it.map(([k, icon, label, badge]) => `<span${k === on ? ' class="on"' : ''}>${I(icon)}${label}${badge ? `<em>${badge}</em>` : ''}</span>`).join('')}</nav>`;
};
export const ownBar = () => `${el('own-bar-phone')}<div class="rd-gbar"><span class="mbtn" aria-label="Tavas vietas lapas">${I('menu')}</span><span class="rd-bigav sm" role="img" aria-label="Ilzes attēls"></span><span class="t"><b>Ilze Kalniņa</b><small>Jelgava · 3 grupas</small></span></div>`;

// ── Notifications (source: Your own area → Paziņojumi)
export const ntItem = (n) => `${el('notification-item')}<div class="rd-nti${n.u ? ' u' : ''}" style="${cv(n.cat)}"><span class="ic">${I(n.icon)}</span><div class="b"><p class="w">${n.w}</p>${n.q ? `<p class="q">${n.q}</p>` : `<p class="q">${catLine(n.cat, n.sub)}</p>`}</div><span class="tm">${n.tm}${n.u ? '<i class="dot" role="img" aria-label="Nelasīts"></i>' : ''}</span></div>`;
export const NT = {
  anna: { u: 1, cat: 'trav', icon: 'userplus', w: '<b>Līga</b> pieteicās grupā <a>Pārgājieni</a>', q: '“Sveiki! Gribētu iet līdzi uz Ķemeru purvu.”', tm: '12 min' },
  ok: { u: 1, cat: 'dance', icon: 'check', w: 'Tavs pieteikums grupā <a>Vēja zirdžiņš</a> ir apstiprināts', sub: 'Tautas dejas', tm: '2 h' },
  ev3: { u: 1, cat: 'dance', icon: 'cal', w: '<b>3 jauni pasākumi</b> grupā <a>Vēja zirdžiņš</a>', q: 'Tautas deju mēģinājums otrd., 20. okt. un vēl divi', tm: '3 h' },
  marta: { cat: 'trav', icon: 'list', w: '<b>Marta</b> publicēja jaunumu grupā <a>Pārgājieni</a>', q: '“Ķemeru takai jauna tikšanās vieta”', tm: 'Vakar' },
  kem: { cat: 'trav', icon: 'cal', w: 'Jauns pasākums grupā <a>Pārgājieni</a>: Ķemeru purva taka, sestd., 17. okt.', sub: 'Pārgājieni', tm: 'Vakar' },
};

// ── Conversations (source: Your own area → Ziņas)
export const cvRow = (c) => `${el('conversation-row')}<div class="rd-cvi${c.u ? ' u' : ''}${c.on ? ' on' : ''}">${c.g ? `<span class="av g" style="${cv(c.g)}">${catIco(c.g)}</span>` : `<span class="av">${c.name[0]}</span>`}<span class="t"><b>${c.name}</b><span class="l">${c.last}</span>${c.g ? `<span class="q">${catLine(c.g, c.sub)}</span>` : c.shared ? `<span class="q">${I('users')}${c.shared}</span>` : ''}</span><span class="tm">${c.tm}${c.u ? '<i class="dot" role="img" aria-label="Nelasīts"></i>' : ''}</span></div>`;
export const CV = [
  { u: 1, g: 'dance', sub: 'Tautas dejas', name: 'Vēja zirdžiņš', last: 'Juris: Līdzi ērtus apavus!', tm: '12 min' },
  { u: 1, name: 'Anna', last: 'Vai šodien brauksi uz koncertu?', shared: 'Vēja zirdžiņš, Pārgājieni', tm: '2 h' },
  { g: 'games', sub: 'Galda spēles, Lomu spēles', name: 'Galda spēļu vakari', last: 'Paldies, drīz atbildēsim!', tm: 'Vakar' },
  { name: 'Marta', last: 'Paldies par sarunu!', shared: 'Pārgājieni', tm: 'Vakar' },
  { name: 'Pēteris', last: 'Labi, tiekamies!', tm: 'Pirmd.' },
];

// ── Frames
export const desk = (inner, w = 1000, cls = '') => `<div class="rd-desk${cls ? ` ${cls}` : ''}"><div class="in" style="--dw:${w}px">${inner}</div></div>`;
export const mob = (inner, cls = '') => `<div class="rd-mob${cls ? ` ${cls}` : ''}">${inner}</div>`;
export const shot = (cap, status, inner, flex = '') => `<div class="rd-shot"${flex ? ` style="flex:${flex}"` : ''}><div class="cap"><span>${cap}</span>${status ?? ''}</div>${inner}</div>`;
export const shots = (...s) => `<div class="rd-shots">${s.join('')}</div>`;

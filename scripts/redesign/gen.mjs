// docs/development/redesign.html is generated from here (npm run redesign:build); never hand-edit the HTML.
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { CSS, CSS_FIX } from './css.mjs';
import * as P from './parts.mjs';
import { liveSection } from './live.mjs';
const { I, G, st, cat, catLine, catName, catIco, cv, pill, biedri } = P;

// The admin page parses the meta with redesignMetaSchema (lib/validations/development.ts) and fails on a breach: check its limits here.
const META = JSON.parse(readFileSync(new URL('../../docs/development/redesign.meta.json', import.meta.url), 'utf8'));
const metaErr = [META.changes.length > 30 && `changes has ${META.changes.length} items (max 30)`, ...META.changes.map((c, i) => c.length > 300 && `changes[${i}] has ${c.length} characters (max 300)`)].filter(Boolean);
if (metaErr.length) { console.error(`redesign.meta.json breaks the page's schema:\n  ${metaErr.join('\n  ')}`); process.exit(1); }

const OUT = process.argv[2] ?? fileURLToPath(new URL('../../docs/development/redesign.html', import.meta.url));
const fmt = new Intl.DateTimeFormat('lv', { weekday: 'short', day: 'numeric', month: 'short' });
const cap1 = (s) => s[0].toUpperCase() + s.slice(1);
/** Day heading in the browser's Latvian format; m is 1-based. */
const dh = (m, d, prefix) => { const s = fmt.format(new Date(2026, m - 1, d)); return prefix ? `${prefix} · ${s}` : cap1(s); };

// ── Sample events
const E = {
  fb: { time: '10:00', cat: 'sport', name: 'Svētdienas futbols', city: 'Jelgava', group: 'Svētdienas futbols Pārlielupē', sub: 'Futbols', ds: 'Spēlējam 5 pret 5, komandas sadalām uz vietas.' },
  vb: { time: '18:00', cat: 'sport', name: 'Volejbols sporta hallē', city: 'Jelgava', group: 'Jelgavas volejbola draugi', sub: 'Volejbols', ds: 'Jauktas komandas, visi līmeņi, bumbas ir.' },
  rn1: { time: '07:30', cat: 'sport', name: 'Rīta nūjošana', city: 'Jelgava', group: 'Rīta nūjošana pie Lielupes', sub: 'Nūjošana', ds: 'Aplis ap Pils salu, apmēram 5 km lēnā tempā.' },
  sk: { time: '19:00', cat: 'sport', name: 'Skrējiens gar Driksu', city: 'Jelgava', group: 'Jelgavas skrējēji', sub: 'Skriešana', ds: 'Iesildīšanās pie tilta, tad 5 km gar upi.' },
  gt: { time: '18:30', cat: 'sport', name: 'Galda tenisa vakars', city: 'Jelgava', group: 'Galda teniss Jelgavā', sub: 'Galda teniss', ds: 'Divi galdi, raketes var aizņemties.' },
  rn2: { time: '07:30', cat: 'sport', name: 'Ceturtdienas nūjošana', city: 'Jelgava', group: 'Rīta nūjošana pie Lielupes', sub: 'Nūjošana', eju: 1, ds: 'Aplis ap Pils salu, apmēram 5 km lēnā tempā.' },
  zs: { time: '10:00', cat: 'sport', name: 'Nūjošana pa promenādi', city: 'Jelgava', group: '«Zaļais solis»', sub: 'Nūjošana', ds: 'Pa promenādi līdz Lielupes tiltam un atpakaļ.' },
  kem: { time: '10:00', cat: 'trav', name: 'Ķemeru purva taka', city: 'Ķemeri', group: 'Pārgājieni', sub: 'Pārgājieni', eju: 1, ds: '3 stundas pa laipām, līdzi ūdens un ērti apavi.' },
  vzm: { time: '19:00', cat: 'dance', name: 'Tautas deju mēģinājums', city: 'Jelgava', group: 'Vēja zirdžiņš', sub: 'Tautas dejas', ds: 'Gatavojamies koncertam Liepājā, līdzi ērtus apavus.' },
  koncert: { time: '17:00', cat: 'dance', name: 'Deju koncerts', city: 'Liepāja', group: 'Vēja zirdžiņš', sub: 'Tautas dejas', ds: 'Tautas deju kolektīvu rudens koncerts, ieeja bez maksas.' },
  spv: { time: '18:00', cat: 'games', name: 'Spēļu <em class="hl">vak</em>ars bibliotēkā', city: 'Jelgava', group: 'Galda spēļu vakari', sub: 'Galda spēles', ds: 'Galda spēles sākuma līmenī, spēles nodrošinām mēs.' },
  gauja: { time: '09:30', cat: 'trav', name: 'Gaujas krasts līdz Velnalai', city: 'Sigulda', group: 'Pārgājieni', sub: 'Pārgājieni', ds: 'Gar smilšakmens atsegumiem līdz Velnalai, 14 km.' },
  terv: { time: '10:00', cat: 'trav', name: 'Tērvetes meža takas', city: 'Tērvete', group: 'Pārgājieni', sub: 'Pārgājieni', ds: 'Meža takas, der arī bērniem, apmēram 8 km.' },
};
// ── Sample announcements (Jaunumi)
const ANN = {
  kem: { k: 'trav', group: 'Pārgājieni', by: 'Marta', when: 'vakar', title: 'Ķemeru takai jauna tikšanās vieta', text: 'Satiekamies pie Ķemeru stacijas, nevis apmeklētāju centrā. Vilciens no Rīgas 8:52.' },
  vz: { k: 'dance', group: 'Vēja zirdžiņš', by: 'Anna', when: 'sestd.', title: 'Koncerts Liepājā 18. oktobrī', text: 'Brauksim ar autobusu no Jelgavas 13:00.' },
  plan: { k: 'trav', group: 'Pārgājieni', by: 'Ilze', when: '28. sept.', title: 'Rudens maršruti', text: 'Oktobrī ejam Ķemeros, Siguldā un Tērvetē. Ja zini vēl kādu labu taku, raksti.' },
};
const kemNoEju = { ...E.kem, eju: 0 };
// The page's "today" is Monday 12 October 2026, so "Šonedēļ" (Monday to Sunday) is the 12th to the 18th.
const jelgSportDays = [[dh(10, 12, 'Šodien'), [E.rn1, E.sk]], [dh(10, 13, 'Rīt'), [E.vb, E.gt]], [dh(10, 15), [E.rn2]], [dh(10, 16), [E.zs]], [dh(10, 18), [E.fb]]];
const jelgSportFromTue = [[dh(10, 13), [E.vb, E.gt]], [dh(10, 15), [E.rn2]], [dh(10, 16), [E.zs]], [dh(10, 18), [E.fb]]];
const myDays = [[dh(10, 15), [E.rn2]], [dh(10, 17), [E.kem]], [dh(10, 20), [E.vzm]]];
const pgDays = [[dh(10, 17), [E.kem]], [dh(10, 25), [E.gauja]], [dh(11, 8), [E.terv]]];

const sportCounts = { trav: 3, dance: 2, hobby: 1, comm: 0, pol: 0, pets: 1, art: 2, music: 3, rel: 0, social: 2, games: 3, sport: 6, family: 1, well: 3, sci: 0 };
const sportEvCounts = { trav: 2, dance: 3, hobby: 1, comm: 1, pol: 0, pets: 0, art: 2, music: 4, rel: 0, social: 1, games: 2, sport: 7, family: 1, well: 2, sci: 0 };

const shot = P.shot, shots = P.shots;
/** The filter states used on the page: Jelgava · Sports un fitness, with or without Nūjošana and Pastaigas. */
const J = ['Jelgava'];
const fSport = { places: J, cat: 'sport' };
const fSport2 = { places: J, cat: 'sport', subs: ['Nūjošana', 'Pastaigas'] };

// ════════════════ Building blocks used more than once on the page
const discDeskGrupas = () => P.desk(`${P.hdr()}<div class="rd-disc">${P.cats(sportCounts, { on: 'sport' })}<div class="rd-pg">${P.frow({ ...fSport2, view: 'grupas' })}${P.cards([G.zs, G.rn], P.createCard())}</div></div>`, 1040);
const discPhGrupas = () => P.mob(`${P.phdr()}<div class="rd-pg">${P.frowPh({ ...fSport, view: 'grupas' })}${P.rows([G.zs, G.rn, G.sk, G.vb, G.fb, G.gt].map((g) => P.groupRow(g)).join('') + P.createRow())}</div>${P.navb('atklat')}`);

// ════════════════ Sections
const intro = `<header class="intro">
  <span class="badge">Discussion only · nothing is being built from this page</span>
  <!--rd-meta-->
  <h1>Ejam kopā: the new look</h1>
  <p>Round nine. The page is rebuilt around what you have agreed. It opens with the <b>agreed rules</b>, one line per element, then follows the way a person meets the site: the identity, the header and navigation, discovery, search, a group, an event, your own area, pop-ups, admin. Each element is drawn in full in one place; everywhere else it appears exactly the same, or the text points to it. Your answers of 12 October are applied everywhere: one "Sazināties" button, one filter row with the Grupas / Pasākumi switch at its right end, two-line group rows on phones, one place list with "Visur", a shorter profile menu and one phone header.</p>
  <p><b>New in 9.2:</b> your answers of 13 October (the redesign ships in parts; the language switch stays in the header; screens not drawn follow the rules; the event's place, faces, withdrawing a request, no "Mani pasākumi", social links), four screens drawn from the rules (the event page, Biedri, a group's Jaunumi, Mans profils), questions 4 and 8 redone as pictures, and near the end, everything from comparing this page with the live site. <b>9.3</b> (after a review): Still open is down to 18 real questions; what the Handbook or this page already decides is answered in the comparison instead. <b>9.4:</b> your notes of 13 October: the + leaves the header (the bottom bar on phones, the profile menu on desktop); the search bar is a plain field that opens the search at once, with the place and the categories as chips inside it; the overlaps in the filter row are fixed in its one template; the sub-category only once a category is chosen; the date choices on one line; no arrows on the day strip; "Rādīt nākamo nedēļu" as a text link; "Citur". <b>9.5</b> (after a review): on phones the Grupas | Pasākumi switch has a line of its own and the filter buttons wrap below it, so nothing is cut or faded any more.</p>
  <p><b>New in 9.6:</b> your decisions of 13 October on the filter. One line: "Kur", "Tēma", on Pasākumi the date choices (no "Rīt"), the switch; each button shows its choice and clears with a small ×, so the separate chosen line is gone. Under it, once a Tēma is chosen, the "Veids" chips on one line with "+3" for the rest. Also: the day strip's month between ‹ and ›; a toast after "Sazināties"; "Atbildēt" on a join request; event rows with their short description again, the same row on the group page; and two drawings for "Rādīt visus rezultātus" (Still open, 1).</p>
  <p><b>New in 9.7:</b> your notes and decisions of 13 October, afternoon. Approved and recorded as such in the Agreed rules: the filter line, "+3" opening the Veids list (so no separate "Veids" button and no limit of eight), the search's look and its theme chips, and "Pieteikums nosūtīts" with "Atvērt sarunu" after asking to join. Pasākumi opens on "Šonedēļ"; "Šodien" looks chosen only once tapped. Weeks start on Monday and weekends are tinted in every day strip and calendar (the page's "today" is now Monday 12 October, so the sample dates are real). The calendar is a month only. Your question on choosing a theme in the search is answered under <a href="#q-theme">Search</a>.</p>
  <p><b>New in 9.8, the design freeze:</b> your notes of 13 October, evening. Approved: one theme at a time in the search (<a href="#AP-06">AP-06</a>) and "Rādīt visus rezultātus" as discovery with the search word as a chip (<a href="#AP-07">AP-07</a>; the results page is dropped). Agreed: every text field shows its limit as a counter (<a href="#AR-71">AR-71</a>); a group's image fills its banner, also on the event page (<a href="#AR-70">AR-70</a>); "Sazināties" with the chat icon on join requests; "Eju" lines up with the time. Every rule and approval now has a stable id for the build plan, and the parts R1–R12 ship one by one without a feature switch.</p>
  <p class="legend"><span>${st('ag')} you agreed or approved it</span><span>${st('lk')} you liked it; small details may still move</span><span>${st('op')} not decided yet</span><span>${st('pr')} my suggestion, not asked for</span></p>
  <ul class="toc"><li><a href="#h-rules">Agreed rules</a></li><li><a href="#h-open">Still open</a></li><li><a href="#h-id">Identity</a></li><li><a href="#h-shell">Header and navigation</a></li><li><a href="#h-disc">Discovery</a></li><li><a href="#h-search">Search</a></li><li><a href="#h-group">A group</a></li><li><a href="#h-event">An event</a></li><li><a href="#h-me">Your own area</a></li><li><a href="#h-pop">Pop-ups and panels</a></li><li><a href="#h-admin">Admin</a></li><li><a href="#h-live">Compared with the live app</a></li><li><a href="#h-notes">Note index</a></li></ul>
</header>`;

// ── Ledger
// Every ledger line has a stable id (AR-NN) and every owner approval inside a line its own (AP-NN), shown on the page and usable
// as an anchor (#AR-23, #AP-01), so the build plan can name them. Never renumber: a new line or approval takes the next free number.
const L = (id, el, rule, s, where, whereText) => `<div class="r" id="${id}"><b>${el}<a class="rid" href="#${id}">${id}</a></b><span>${rule}</span><span>${s}</span><span><a href="#${where}">${whereText}</a></span></div>`;
/** An owner approval of one specific element: its id, the note, and exactly what was approved. */
const apv = (id, note, what) => `<span class="rd-apv" id="${id}"><a class="rid" href="#${id}">${id}</a> Approved 13 Oct${note ? ` (${note})` : ''}: ${what}</span>`;
const gh = (t) => `<div class="gh">${t}</div>`;
const ledger = `<section aria-labelledby="h-rules">
  <h2 id="h-rules">Agreed rules</h2>
  <p class="lead">One line per element: the rule as it stands now, its status, and the section where it is drawn in full. If a drawing anywhere on the page disagrees with a line here, the line wins and the drawing is a mistake. Each line has a stable id (AR-01 …) and each of your approvals inside a line its own (AP-01 …): the build plan names them, and they are never renumbered.</p>
  <div class="rd-ledger">
  ${gh('Identity')}
  ${L('AR-01', 'Identity first, released in parts', 'No screen is redesigned before the identity is settled. The redesign doesn\'t ship as one release: it ships in twelve logical parts (R1–R12), one by one, each finished and releasable on its own. No feature switch: each part goes live when it is released (13 Oct, at the design freeze).', st('ag', 'Agreed 13 Oct'), 'live-order', 'Build order')}
  ${L('AR-02', 'Screens not drawn here', 'A screen this page doesn\'t draw is built from the decisions on it: the same parts, words and frames. The most important ones are drawn: the event page, Biedri, a group\'s Jaunumi, Mans profils.', st('ag', 'Agreed 13 Oct'), 'live-screens', 'Every live screen')}
  ${L('AR-03', 'Logo', 'Wordmark "Ejam&nbsp;<em>kopā</em>" in Literata, "kopā" in italic, two overlapping round circles (two people). The circles alone are the small icon.', st('ag'), 'h-id', 'Identity')}
  ${L('AR-04', 'Site colour', 'Sūna #4B5E3B with a neutral background tuned to it. More themes later, in Admin → Dizains.', st('ag'), 'h-id', 'Identity')}
  ${L('AR-05', 'Category colours', 'Fifteen named earth tones (Paparde … Medus); brighter dark-mode tones, at least 7:1. Editable in Admin → Dizains → Kategoriju krāsas.', st('ag'), 'h-id', 'Identity')}
  ${L('AR-06', 'Colour means category', 'Category colour only on dots, icons, tints, the group banner and the picture fallback; never on site buttons. The site colour only on site buttons and links.', st('ag'), 'h-id', 'Identity')}
  ${L('AR-07', 'Fonts', 'Literata for headings and the logo; Commissioner for all text; human notes in small italic Commissioner, in the site colour.', st('ag'), 'h-id', 'Identity')}
  ${L('AR-08', 'Shapes and labels', 'Soft corners, pill buttons, no borders, thin dividing lines. The dot belongs to the category only; city and size are plain quiet text.', st('ag'), 'h-id', 'Identity')}
  ${L('AR-09', 'Small tags', '"Eju" (with a tick), "Īpašnieks", "Mod", and an outlined "Gaida" (a request to a group or an event, or a waiting list). Capital first letter, never clickable; a plain member gets none.', st('ag'), 'h-id', 'Identity')}
  ${L('AR-10', 'Words and numbers', 'Sentence case everywhere, never all capitals. Faces of who is coming instead of "0 apstiprināti" (signed-in viewers only; visitors see "12 iet").', st('ag'), 'h-id', 'Identity')}
  ${L('AR-11', 'Dates', 'Event dates carry the weekday, in the Latvian short form ("Svētd., 18. okt. 17:00"), 24-hour time, the viewer\'s time zone. Weeks start on Monday, and Saturday and Sunday look different in every day strip and calendar (13 Oct). The weekend look is a soft tint (build plan OD-16).', st('ag', 'Agreed 13 Oct'), 'h-disc', 'Discovery → Pasākumi')}
  ${gh('Header and navigation')}
  ${L('AR-12', 'Desktop header', 'Logo (to discovery), the search bar (a plain field; a click opens the search), the language switch, the shield (admins only), messages (opens the drawer), bell (opens the list), your picture (opens the profile menu). No +: "Izveidot grupu" is in the profile menu. The same in admin.', st('ag', 'Agreed 13 Oct'), 'h-shell', 'Header and navigation')}
  ${L('AR-13', 'Phone header', 'The same on every page: logo, the language switch, search icon, shield (admins only), bell, your picture. No +: it is in the bottom bar. Messages are "Ziņas" in the bottom bar.', st('ag', 'Agreed 13 Oct'), 'h-shell', 'Header and navigation')}
  ${L('AR-14', 'Profile menu', 'Mans profils, Manas grupas (with the count of what is new), Izveidot grupu, Iestatījumi, Iziet; the same menu on every screen. No Ziņas, no Paziņojumi, no light/dark switch. On phones "Izveidot grupu" also stays in this menu, next to the bottom bar\'s + (it follows from "the same menu on every screen", agreed 13 Oct; build plan OD-04 dropped for that reason).', st('ag', 'Agreed 13 Oct'), 'h-shell', 'Header and navigation')}
  ${L('AR-15', 'Language switch', 'Visible in the header on every page, desktop and phones, signed in or not; never hidden in Iestatījumi. "LV ▾" opens a short list (Latviešu, English), built so more languages fit later.', st('ag', 'Agreed 13 Oct'), 'h-shell', 'Header and navigation')}
  ${L('AR-16', 'Footer', 'A slim footer (logo, one line, Par mums, Privātums) on discovery and reading pages only; none on group, own-area or admin pages.', st('ag', 'Agreed 13 Oct'), 'h-shell', 'Header and navigation')}
  ${L('AR-17', 'Light and dark', 'Only in Iestatījumi (Gaišs, Tumšs, Kā ierīcē).', st('ag'), 'h-me', 'Your own area')}
  ${L('AR-18', 'Admin shield menu', 'Atsauksmju režīms, Tulkošanas režīms, Administrēšanas panelis. Built; the live link still reads "Admina panelis" and becomes "Administrēšanas panelis".', st('ag'), 'h-admin', 'Admin')}
  ${L('AR-19', 'Bottom bar (phones)', 'Atklāt, Grupas, + (Izveidot grupu), Ziņas, Es. Admin pages keep it.', st('ag', 'Agreed 13 Oct'), 'h-shell', 'Header and navigation')}
  ${L('AR-20', 'Where Grupas and Es lead', '"Grupas" opens Manas grupas, "Es" opens Mans profils; on a group page the bottom-bar tab you came from stays marked (Atklāt if you came from discovery, Grupas if from Manas grupas).', st('ag', 'Agreed 13 Oct, build plan OD-02'), 'h-open', 'Still open, 2')}
  ${L('AR-21', 'Navigation rule', 'Two levels: an area\'s pages and a page\'s parts; one runs across, the other down, never two look-alike rows. Groups and your own area: pages down the left (a ☰ drawer on phones), parts across. Admin: sections across (sticky), pages down the left. No label repeats the chosen item.', st('ag'), 'h-shell', 'Header and navigation')}
  ${gh('Discovery')}
  ${L('AR-22', 'The page', 'No title or explanation above the list, no "Rāda:", no events strip on Grupas. Vertical space matters.', st('ag'), 'h-disc', 'Discovery')}
  ${L('AR-23', 'Filter line, desktop', 'Line 1, always one line: [📍 Kur ▾] [Tēma ▾], on Pasākumi the date choices (Šodien, Šonedēļ, Nedēļas nogalē, the calendar; no "Rīt"), then "Notīrīt visu" (only when two or more things are chosen) and the switch at the right end. Each button shows its choice ("Jelgava", "Jelgava +1", "Sports un fitness"), has a maximum width and cuts a long name with "…"; a small × on a chosen button clears it. No "Kad" label. ' + apv('AP-01', 'cmv6emof5', 'the drawing "two cities and a range": "Jelgava +1", "Sports un fitness", Šodien · Šonedēļ · Nedēļas nogalē, the range "15.–18. okt." with ×, "Notīrīt visu", the switch.'), st('ag', 'Approved 13 Oct'), 'h-disc', 'Discovery')}
  ${L('AR-24', '"Šodien" and "Šonedēļ"', 'Pasākumi opens on "Šonedēļ" (Monday to Sunday). "Šodien" looks chosen only after it is tapped; it is not marked just because the list starts today (13 Oct).', st('ag', 'Agreed 13 Oct'), 'h-disc', 'Discovery')}
  ${L('AR-25', 'Veids chips (line 2)', 'Only once a Tēma is chosen: its Veidi (sub-categories) as chips on ONE line, the chosen first (tinted, with ×), then as many as fit, then a "+N" chip ("+3") with the count of the rest. "+N" is the way into the Veids list (search, tick boxes, several at once, like the Kur and Tēma lists); there is no separate "Veids" button and no limit of 8 (your note cmv6em8xp is answered by your later note cmv6ev8az). ' + apv('AP-02', 'cmv6ev8az', '"+3" at the end of the Veids line opens the Veids list.'), st('ag', 'Approved 13 Oct'), 'h-disc', 'Discovery')}
  ${L('AR-26', 'Grupas | Pasākumi', 'A small two-part switch at the right end of the filter line (on phones, a full-width line of its own above the filter buttons): it changes the content, it doesn\'t filter it, so it looks unlike the filters. You liked it again on 13 October.', st('ag'), 'h-disc', 'Discovery')}
  ${L('AR-27', 'Filter line, phones', 'The Grupas | Pasākumi switch on its own full-width line; under it Kur, Tēma and on Pasākumi the date button, on one line: a long name gives way with "…". Then the Veids chips, with "Notīrīt visu" at their end. Nothing wraps, fades or scrolls sideways.', st('ag', 'Agreed 13 Oct'), 'h-disc', 'Discovery')}
  ${L('AR-28', 'No chosen line', 'The buttons show what is chosen, so there is no separate line of chosen filters anywhere (13 Oct). "Notīrīt visu" appears only when two or more things are chosen.', st('ag', 'Agreed 13 Oct'), 'h-disc', 'Discovery')}
  ${L('AR-29', 'Events filter like groups', 'Tēma and Veids filter events exactly as they filter groups, on every screen with events.', st('ag'), 'h-disc', 'Discovery')}
  ${L('AR-30', 'Category drawer', 'All fifteen, alphabetical, icon and count, empty ones greyed; folds to an icon rail on desktop, a sheet on phones (the "Tēma" button); a search field on top that also finds Veidi. On desktop the drawer and the Tēma button show the same choice.', st('lk'), 'h-disc', 'Discovery')}
  ${L('AR-31', 'Veids list', '"Veids" (the word for a sub-category, 13 Oct): opened from "+N" on the Veids line; the search "Meklēt veidu" on top, counts, tick boxes, several at once, empty ones greyed, no "Visas" line. Approved with "+3" (<a href="#AP-02">AP-02</a>).', st('ag', 'Approved 13 Oct'), 'h-disc', 'Discovery')}
  ${L('AR-32', 'Place list', 'One list for the Kur button on the filter line and in the search. First line a plain "Visur" (show all, no tick box), then cities with tick boxes and counts, several at once. You liked it again on 13 October.', st('ag'), 'h-disc', 'Discovery')}
  ${L('AR-33', 'No results in a list', '"Nekas nav atrasts." in the category, sub-category and place lists; a second line only where there is something to do.', st('ag'), 'h-disc', 'Discovery')}
  ${L('AR-34', 'Group card (desktop)', 'Name, category and sub-categories first, city · members as quiet text, the "Ko meklējam?" note or the next meeting; the photo on the right, about a fifth of the width (at most 84 px); no photo = category colour and icon.', st('lk', 'Liked 13 Oct'), 'h-disc', 'Discovery')}
  ${L('AR-35', '"Ko meklējam?"', 'An optional group field, up to 60 characters, shown as the card\'s note; when empty, the card shows the next meeting.', st('ag'), 'h-disc', 'Discovery')}
  ${L('AR-36', 'Group row (phones)', 'Two lines like an event: the name (up to two lines), then one quiet line "category · sub-categories · city · N biedri". No photo: the category colour and icon sit where the photo is on desktop.', st('ag'), 'h-disc', 'Discovery')}
  ${L('AR-37', 'Create card', 'At the end of a chosen category, also when it is empty: the same + as the bottom bar, "Izveidot jaunu grupu", "šajā kategorijā", quiet.', st('ag'), 'h-disc', 'Discovery')}
  ${L('AR-38', 'Citur', 'The label is just "Citur" (13 Oct). On Discovery only, under fewer than five results for a chosen city and topic: the same topic in other cities, nearest first.', st('lk'), 'h-disc', 'Discovery')}
  ${L('AR-39', 'Day strip', 'Your idea: seven days over the event list, the chosen day filled, today outlined, a dot on days with events; a day is tapped directly. The week runs Monday to Sunday; Saturday and Sunday on a soft tint (13 Oct; build plan OD-16). Its header: the month in the middle, ‹ and › at the two ends move the shown week; no "Šodien" link there (13 Oct).', st('ag', 'Agreed 13 Oct, build plan OD-15, OD-16'), 'h-disc', 'Discovery')}
  ${L('AR-40', 'Date picker', 'The calendar button opens a month only: no quick choices inside, they are on the filter line (13 Oct). Monday first, Saturday and Sunday look different (a soft tint), the arrows right next to the month\'s name; one day or a range. On phones, where the filter line has one date button, it opens a sheet with the quick choices above this calendar.', st('lk', 'Liked 13 Oct'), 'h-disc', 'Discovery')}
  ${gh('Search')}
  ${L('AR-41', 'Search', 'The search bar is a plain field, with no place or tags in it; a tap or click opens the search at once. At its top, a row of chips: the Kur button (the place list: "Visur" and tick boxes, set from the page\'s filter), then the matching themes as choice chips, the same chips as the Veids line; the results below (groups as group rows, events as event rows). ' + apv('AP-03', 'cmv6f2pzd', 'this look, on the drawing "1 · “sp” typed".'), st('ag', 'Approved 13 Oct'), 'h-search', 'Search')}
  ${L('AR-42', 'Search theme chips', 'A tap on a theme chip chooses it: tinted, with ×, and the results narrow to that theme at once; the field keeps what you typed and you stay in the search. ' + apv('AP-04', 'cmv6f3f72', 'the drawing "2 · “Spēles” chosen": the chosen theme chip tinted with ×, the results narrowed to it.') + ' ' + apv('AP-06', 'cmv6hyozx', 'one theme at a time, like the Tēma button: once one is chosen, the other theme chips step aside until × brings them back; "Rādīt visus rezultātus" takes the chosen theme along as the Tēma on discovery.'), st('ag', 'Approved 13 Oct'), 'q-theme', 'Search')}
  ${L('AR-43', '"Rādīt visus rezultātus"', 'Opens discovery, filtered: the search word is the first chip on the filter line (“sp” ×, × returns to plain discovery); above the list one line "Atbilst arī:" with the matching themes and types as choice chips, then "+N"; a tap on one chooses that Tēma or Veids in place of the word; the place is kept. ' + apv('AP-07', 'cmv6hzhwv', 'Proposal A, the drawings "A · Desktop" and "A · Phone": discovery with the chip “sp” × on the filter line and the "Atbilst arī:" line.') + ' B, a results page of its own, was declined.', st('ag', 'Approved 13 Oct'), 'q-all', 'Search → "Rādīt visus rezultātus"')}
  ${gh('A group')}
  ${L('AR-44', 'Opened card', 'A click keeps you on discovery: a panel from the right over the dimmed list (a sheet on phones); the address is the group\'s page. Inside: photo, name, category and sub-categories, city · members, next meeting, short text, "Sazināties", "Atvērt grupas lapu".', st('ag'), 'h-group', 'A group')}
  ${L('AR-45', 'Sazināties', 'One button, "Sazināties", wherever a group can be contacted. Its form has a switch "Vēlos pievienoties grupai" (on while the group takes members), so the same message can also ask to join. No separate join button. After "Nosūtīt" the form closes and a short toast says "Ziņa nosūtīta": no second dialog, no "Atvērt sarunu" link (13 Oct).', st('ag', 'Agreed 13 Oct'), 'h-group', 'A group')}
  ${L('AR-46', 'Pending', 'After asking to join: "Pieteikums nosūtīts" and "Atvērt sarunu" in place of the button. "Atsaukt pieteikumu" in the group\'s "…" menu and on the Tavi pieteikumi row (13 Oct). ' + apv('AP-05', '', '"Pieteikums nosūtīts" (with a tick) and "Atvērt sarunu" in place of "Sazināties" after asking to join.'), st('ag', 'Approved 13 Oct'), 'h-group', 'A group')}
  ${L('AR-70', 'Group banner: the group\'s image', 'When a group has chosen an image, it fills the whole banner as its background, on every page with the banner (Informācija, the other pages, the event page), with a dark shade from below so the name, the category line and "city · members" read in white. Without an image, the banner keeps the category tint and the category icon as its mark (your notes cmv6i2emw, cmv6i5y4x). Every group banner, with or without an image, on every page, has the one height of the Pasākumi banner, 96 px (your notes cmv6kou7h, cmv6kp4us, 13 Oct). The shade, the white text and the same on the phone bar are agreed too (build plan OD-08).', st('ag', 'Agreed 13 Oct, build plan OD-08'), 'g-banner', 'A group → the banner')}
  ${L('AR-47', 'Group page, desktop', 'The coloured header with the group\'s image (<a href="#AR-70">AR-70</a>), name, category and sub-categories, city · members, "…"; the same height on every page. Pages down the left (Informācija, Jaunumi, Pasākumi, Biedri, and Iestatījumi for the team), a page\'s parts as tabs.', st('lk'), 'h-group', 'A group')}
  ${L('AR-48', 'Group page, phones', 'The bar keeps the signals (the mark or, with an image, the image behind the bar, agreed under AR-70; name, category · city · members, "…") and "Sazināties" for visitors as an icon-only chat button labelled "Sazināties" ' + apv('AP-08', '', 'on the phone group bar, "Sazināties" for visitors is an icon-only chat button (accessible label "Sazināties"), so the group name stays fully readable in the single 64 px bar.') + ' (the bar is one 64 px height and never wraps); pages in the ☰ drawer, parts stay tabs.', st('ag'), 'h-group', 'A group')}
  ${L('AR-49', 'Visitors', 'Members-only things are hidden, not greyed: Jaunumi, Biedri, members-only parts and events.', st('ag'), 'h-group', 'A group')}
  ${L('AR-50', 'Informācija extras', 'Social links as quiet text links at the end of Informācija, not in the header. Member faces only on Biedri.', st('ag', 'Agreed 13 Oct'), 'h-group', 'A group')}
  ${L('AR-51', 'The "…" menu', 'Your role as a line, then: Rakstīt komandai, Dalīties, Ziņot par grupu, Pamest grupu (members); Atsaukt pieteikumu (while waiting). Team tools stay in Iestatījumi.', st('ag', 'Agreed 13 Oct, build plan OD-09, OD-10, OD-11'), 'h-group', 'A group')}
  ${L('AR-52', 'Join requests', 'Biedri → Pieteikumi: each request with its message and "Sazināties" (with the chat icon), "Noraidīt", "Apstiprināt". "Sazināties" opens the conversation with that person, because a join request already is one (13 Oct; the word "Sazināties" in place of "Atbildēt", your note cmv6i33tb).', st('ag', 'Agreed 13 Oct'), 'h-group', 'A group')}
  ${L('AR-53', 'Biedri, Jaunumi','Biedri: member rows with face, name, since when, role tag; the team gets "…" per row. Jaunumi: items with who wrote them; the team\'s "Jauns ieraksts" at the right end of the tabs; Aktuālie and Arhīvs.', st('ag', 'Agreed 13 Oct, build plan OD-24'), 'h-group', 'A group')}
  ${gh('An event')}
  ${L('AR-54', 'Event row', 'One row everywhere. Line one: time, category dot, name, city (left out when one city is chosen). Line two, smaller: the group (a link), category, sub-category; left out on the group\'s own pages, and nothing else is. Last line: the short description, muted, one line, cut with "…" (13 Oct). "Eju" sits under the time, left-aligned with it: the tag\'s tick starts where the time\'s first digit starts (your notes cmv6i3mrq, cmv6i4n7c). Day headings; two columns on wide screens; a week, then "Rādīt nākamo nedēļu" as a plain text link.', st('lk', 'Liked, changed 13 Oct'), 'h-event', 'An event')}
  ${L('AR-55', 'Event panel', 'Like the group panel: dot, category and sub-category on one line, when, where, text, who is going, "Eju" and "Visa informācija" on one line, who organises it. Faces and names only for signed-in viewers; visitors see "12 iet" (13 Oct).', st('lk'), 'h-event', 'An event')}
  ${L('AR-56', 'Events you can\'t simply join', 'Approval, full with a waiting list, sign-ups closed: a quiet word on the row, the panel\'s button names the step, "Gaida" after you ask.', st('ag', 'Agreed 13 Oct, build plan OD-18'), 'q-states', 'Still open, 8')}
  ${L('AR-57', 'Events away from home', 'An event has its own place, and lists filter by the event\'s place: a required city from the list, filled in with the group\'s city, plus a free address. Online events get "Tiešsaistē", shown under "Visur".', st('ag', 'Agreed 13 Oct'), 'h-event', 'An event')}
  ${L('AR-58', 'A group\'s Pasākumi', 'Gaidāmie and Pagājušie only; no "Mani pasākumi" tab (your events are in Manas grupas and marked "Eju" in every list). The team\'s "Izveidot pasākumu" at the right end of the tabs. The rows are the event rows used everywhere, with their description; only line two is left out (13 Oct).', st('ag', 'Agreed 13 Oct'), 'h-group', 'A group')}
  ${L('AR-59', 'Event page', 'The panel\'s content in full, inside the group\'s frame; calendar, map, share, "Svarīga informācija"; the team\'s "Rīkotājiem" box. The group banner above it carries the group\'s image as its background (<a href="#AR-70">AR-70</a>, agreed). An event without an image of its own shows no picture on its page, because the group\'s image is already in the banner (the panel, outside the group\'s frame, falls back to the group\'s image).', st('ag', 'Agreed 13 Oct, build plan OD-23'), 'h-event', 'An event')}
  ${gh('Your own area')}
  ${L('AR-60', 'Own area', 'One space for one person, like a group: your picture and name on top; Mans profils, Manas grupas, Ziņas, Paziņojumi down the left (a ☰ drawer on phones). You will still review it.', st('ag'), 'h-me', 'Your own area')}
  ${L('AR-61', 'Manas grupas', 'Drawn once. Sections as a horizontal menu: Tuvākie pasākumi (rows with the group/category line), Jaunumi (with the category), Tavas grupas (with role tags), Tavi pieteikumi (quieter, apart, with "Atsaukt pieteikumu"). It ends; nothing is suggested.', st('ag'), 'h-me', 'Your own area')}
  ${L('AR-62', 'The team\'s waiting requests', 'No "Jārīkojas" section; "2 pieteikumi" on that group\'s row in Tavas grupas.', st('ag', 'Agreed 13 Oct, build plan OD-21'), 'q-team', 'Still open, 9')}
  ${L('AR-63', 'Mans profils', 'What others see: about you, places, since when, your groups with your role; "Labot profilu" opens the form in place.', st('ag', 'Agreed 13 Oct, build plan OD-25, OD-26'), 'h-me', 'Your own area')}
  ${L('AR-64', 'Ziņas', 'The messages icon opens a drawer from the right on any page; the full page is Ziņas in your own area. Group rows show the category and sub-categories; personal rows the groups you share.', st('ag'), 'h-me', 'Your own area')}
  ${L('AR-65', 'Paziņojumi', 'The bell opens a compact list (admins also get an Administrācija tab); "Skatīt visus" opens Paziņojumi in your own area. On phones the bell opens that page full-screen, as agreed for phones before. The group name is a link.', st('ag'), 'h-me', 'Your own area')}
  ${L('AR-66', 'Empty states', 'An outline icon, one sentence, at most one action ("Pagaidām kluss").', st('lk'), 'h-me', 'Your own area')}
  ${gh('Pop-ups and forms')}
  ${L('AR-67', 'Pop-up rule', 'Dialogs in the middle: dim and a light 1.5 px blur. Side panels, sheets and drawers: dim only. Click outside, Esc, × and Back close them.', st('lk'), 'h-pop', 'Pop-ups and panels')}
  ${L('AR-71', 'Text limits', 'Every text field with a limit shows it, everywhere on the site: a quiet counter under the field\'s right end, "' + P.counterText(P.CONTACT_MSG.length) + '" (what you wrote / the limit; a message\'s limit is ' + P.counterText(null) + ' characters, MESSAGE_MAX_LENGTH). Your note cmv6i0m55. In the last tenth before the limit the counter turns to the warning colour; past it, it says by how much, in red, and "Nosūtīt" waits until the text is shorter.', st('ag', 'Agreed 13 Oct, build plan OD-05'), 'g-contact', 'A group → Sazināties')}
  ${gh('Admin')}
  ${L('AR-68', 'Admin frame', 'The site\'s header and bottom bar. Sections across a sticky top row: Moderācija, Struktūra, Vietne, Komanda, Izstrāde; pages down the left; a one-page section uses the full width; phones: one drawer.', st('ag'), 'h-admin', 'Admin')}
  ${L('AR-69', 'Admin → Dizains', 'Vietne → Dizains with Krāsas, Kategoriju krāsas and Fonti; preview for yourself, then publish.', st('ag'), 'h-admin', 'Admin')}
  </div>
</section>`;

// ── Still open
const open = `<section aria-labelledby="h-open">
  <h2 id="h-open">Still open ${st('ag', 'Agreed 13 Oct')}</h2>
  <p class="lead">Only real questions. On 13 October you agreed to the default of every one (build plan OD-01…OD-27); they are kept here with their numbers. Question 1 was settled on 13 October (A); its number stays so the others keep theirs. Questions 2–7 are from round nine (7 now also covers reporting an event); 8–18 came from comparing this page with the live site (<a href="#h-live">Compared with the live app</a>). Your answers of 13 October are in the Agreed rules.</p>
  <ol class="rd-qs">
    <li><b>"Rādīt visus rezultātus"</b> ${st('ag', 'Settled 13 Oct: A')}<p>You approved A, discovery filtered with the search word as a chip (<a href="#AP-07">AP-07</a>); B, a results page, was declined. The number stays so the other questions keep theirs. <a href="#q-all">Search → "Rādīt visus rezultātus"</a>.</p></li>
    <li><b>The bottom bar: where "Grupas" and "Es" lead, and which tab a group page marks</b> ${st('ag', 'Settled 13 Oct, build plan OD-02')}<p><i>Agreed: "Grupas" opens Manas grupas, "Es" opens Mans profils; on a group page the tab you came from stays marked</i> (Atklāt from discovery, Grupas from Manas grupas), as phone apps do.</p></li>
    <li><b>Where does Iestatījumi live?</b> ${st('ag', 'Settled 13 Oct, build plan OD-03')}<p>The profile menu links to it, and light/dark is there. <i>Agreed: the fifth page of your own area</i>, last in its menu, like a group's Iestatījumi.</p></li>
    <li><b>The end of the group list</b> ${st('ag', 'Settled 13 Oct, build plan OD-13')}<p>Events end with "Rādīt nākamo nedēļu"; groups have no rule. <i>Agreed: 24 cards, then "Rādīt vēl"</i>, no endless scrolling (Handbook: calm, not sticky).</p></li>
    <li><b>The place for someone we don't know</b> ${st('ag', 'Settled 13 Oct, build plan OD-14')}<p>Signed out, we know nothing. <i>Agreed: start on "Visur" and ask "Kur tu esi?" once, above the results; keep the answer on the device; never guess from the internet address.</i> Signed in: the profile city.</p></li>
    <li><b>When is a notification read?</b> ${st('ag', 'Settled 13 Oct, build plan OD-22')}<p>You said you would decide later. <i>Agreed: when you tap it</i>, as today.</p></li>
    <li><b>Reporting people and events</b> ${st('ag', 'Settled 13 Oct, build plan OD-11')}<p>Today only groups can be reported. <i>Agreed: later, both together, as a second tab in Moderācija → Sūdzības; until then "Ziņot par grupu" in the group's "…" menu.</i></p></li>
    <li><b>Events you can't simply join: how do they look?</b> ${st('ag', 'Settled 13 Oct, build plan OD-18')}<p><i>Agreed: one quiet word on the row ("Pieteikšanās" or "Pilns"), a button that names the step, and the outlined "Gaida" tag after you ask.</i> Some events need the organiser's approval, some are full and have a waiting list. Pictures: <a href="#q-states">An event → Events you can't simply join</a>.</p></li>
    <li><b>Waiting join requests for the group team</b> ${st('ag', 'Settled 13 Oct, build plan OD-21')}<p><i>Agreed: no separate section; "2 pieteikumi" on that group's row in Tavas grupas, and a tap opens Biedri → Pieteikumi.</i> Today Manas grupas starts with a "Jārīkojas" list: the groups you help run where someone waits for an answer. Pictures: <a href="#q-team">Your own area → Waiting join requests</a>.</p></li>
    <li><b>Where do you change your profile?</b> ${st('ag', 'Settled 13 Oct, build plan OD-26')}<p>Today "Labot profilu" is a page of its own; Mans profils is new. <i>Agreed: "Labot profilu" on Mans profils opens the form in place (name, picture, about you, places, the three privacy switches); Iestatījumi keeps Izskats, and later your account.</i></p></li>
    <li><b>Private groups</b> ${st('ag', 'Settled 13 Oct, build plan OD-07')}<p>Today a group can be private (the create form says "Privāta", settings say "Tikai biedriem"): it is left out of discovery and search, and people join by invitation or approval. The page never shows one. <i>Agreed: keep that, with one word everywhere, "Tikai biedriem"; someone with the link sees Informācija and "Sazināties" like any visitor, and the quiet line under the name ends with "Tikai biedriem".</i></p></li>
    <li><b>The full word behind "Mod"</b> ${st('ag', 'Settled 13 Oct, build plan OD-01')}<p>Today the role reads "Grupas moderators". <i>Agreed: the tag stays "Mod"; lists and menus say "Moderators"; "grupas komanda" means the owner and the moderators together, as in the Handbook.</i></p></li>
    <li><b>Members-only events, seen by members</b> ${st('ag', 'Settled 13 Oct, build plan OD-19')}<p>Visitors don't see them (agreed). <i>Agreed: members see them like any event; "Tikai biedriem" is a quiet line in the panel and on the event page, not on the row. Someone who follows a link without being a member gets one sentence and "Sazināties".</i></p></li>
    <li><b>How a member writes to the group's team</b> ${st('ag', 'Settled 13 Oct, build plan OD-10')}<p>Today from the "all members" pop-up on Informācija, which goes. <i>Agreed: "Rakstīt komandai" in the group's "…" menu (drawn in <a href="#h-group">A group</a>); it opens the same conversation as "Sazināties".</i></p></li>
    <li><b>Asking "are you sure?" for steps that can be undone</b> ${st('ag', 'Settled 13 Oct, build plan OD-06')}<p>Deleting for good already has its rule (the Handbook: our own dialog in the middle, naming the thing; never the browser's box). Open are the smaller steps that can be undone, which today use the browser's box or a dialog. <i>Agreed: a small pop-over at the button for leaving a group and removing a member.</i></p></li>
    <li><b>Deleting your account</b> ${st('ag', 'Settled 13 Oct, build plan OD-27')}<p>It doesn't exist today, and the page doesn't mention it. <i>Agreed: "Dzēst kontu" at the end of Iestatījumi, with a dialog; built before real people use the site.</i></p></li>
    <li><b>"Ko meklējam?" in one language or two</b> ${st('ag', 'Settled 13 Oct, build plan OD-12')}<p><i>Agreed: one short text, as the team writes it, not one per language</i> (a group's longer texts keep their LV | EN versions, as today).</p></li>
    <li><b>The four new drawings</b> ${st('ag', 'Settled 13 Oct, build plan OD-23, OD-24, OD-25')}<p>The event page, Biedri, a group's Jaunumi and Mans profils were drawn on 13 October from the rules (first marked Proposal). <i>Agreed: build them as drawn; small details are reviewed on the test site.</i></p></li>
  </ol>
</section>`;

// ── Identity
const krow = (k, light, dark) => `<div class="rd-krow" style="${cv(k)}"><span class="ki">${catIco(k)}</span><span>${catName(k)}</span><span class="kbox" style="--x:${light}"><i></i>Gaišā</span><span class="kbox" style="--x:${dark}"><i></i>Tumšā</span><span class="aa">AA ✓</span></div>`;
const KC = [['trav', 'Paparde', '#10B981', '#4F7330', '5.5', '#7BBF40', '8.0'], ['dance', 'Pīlādzis', '#F43F5E', '#A9452C', '5.9', '#E09B8A', '7.9'], ['hobby', 'Smiltsērkšķis', '#F97316', '#A55A12', '5.2', '#DB9F66', '7.8'], ['comm', 'Egle', '#22C55E', '#2F6A45', '6.4', '#44C172', '7.8'], ['pol', 'Kūdra', '#EF4444', '#57493D', '8.7', '#B8AA9D', '7.9'], ['pets', 'Lazda', '#84CC16', '#7A5E40', '6.0', '#C1A78B', '7.8'], ['art', 'Virsis', '#D946EF', '#7A4790', '6.7', '#CA9CDE', '7.9'], ['music', 'Mellene', '#6366F1', '#57479A', '7.6', '#AFA3E0', '7.8'], ['rel', 'Akmens', '#64748B', '#586474', '6.0', '#A0ACBA', '7.7'], ['social', 'Brūklene', '#EC4899', '#A53A50', '6.3', '#DD98A6', '7.8'], ['games', 'Plūme', '#8B5CF6', '#8C3F72', '6.8', '#DB94C3', '7.7'], ['sport', 'Rudzupuķe', '#3B82F6', '#3B55A0', '7.0', '#98A9DD', '7.7'], ['family', 'Ezers', '#0EA5E9', '#2B6489', '6.4', '#7BB2D6', '7.8'], ['well', 'Kadiķis', '#14B8A6', '#2E6B6F', '6.1', '#47BAC2', '7.7'], ['sci', 'Medus', '#F59E0B', '#86650E', '5.4', '#D0A535', '7.8']];
const identity = `<section aria-labelledby="h-id">
  <h2 id="h-id">Identity</h2>
  <p class="lead">Literata for headings and the logo, Commissioner for everything else. Soft corners, thin dividing lines, quiet labels. Colour from nature on a neutral background. Small labels are defined here once; every card, row and panel uses them as they are.</p>
  <div class="rd-boxes">
    <div class="rd-box"><span class="lbl">Logo ${st('ag')}</span><span class="wm">Ejam&nbsp;<em>kopā</em></span><div class="row"><span class="rd-logo">Ejam&nbsp;<em>kopā</em></span><span class="wm-ic" role="img" aria-label="Mazā ikona"></span></div><p class="why">"kopā" in italic, two overlapping circles for two people; the circles alone are the small icon.</p></div>
    <div class="rd-box"><span class="lbl">Site colour ${st('ag')}</span><div class="row"><span class="sw" style="--s:#4B5E3B"></span><span><b>Sūna (moss)</b><br><span class="why">#4B5E3B · muted olive</span></span></div><p class="why">For site buttons and links only. Later, Admin → Dizains → Krāsas can change it and add themes.</p></div>
    <div class="rd-box"><span class="lbl">Shapes and labels ${st('ag')}</span><div class="row">${P.btn('Sazināties')}${P.btn('Atcelt', 's')}</div><div class="row">${cat('dance')}<span class="rd-sub">Jelgava · ${biedri(12)}</span></div><p class="why">Pill buttons, no borders. The dot belongs to the category; city and size are plain quiet text.</p></div>
    <div class="rd-box wide"><span class="lbl">Type · Literata headings, Commissioner text ${st('ag')}</span><p class="spec-h">Meklē bundzinieku Jelgavā</p><p class="spec-b">Glāžšķūņa rūķīši dzērumā čiepj Baha koncertflīģeļu vākus. Tiekamies otrdienās 19:00 Ģimnāzijas ielā, iesācēji gaidīti.</p><p class="spec-i">Nākamā tikšanās: sestd., 17. okt.</p><p class="why">The human notes (next meeting, "Ko meklējam?") are the text font, smaller, in italic, in the site colour.</p></div>
    <div class="rd-box"><span class="lbl">Small tags ${st('ag')}</span><div class="row">${pill('', 'eju')}${pill('Īpašnieks')}${pill('Mod')}${pill('Gaida', 'out')}</div><p class="why">Short facts about you: "Eju" on an event you are going to (under its time), your role on a group, "Gaida" (outlined, a status) on a request. Never clickable; a plain member gets none.</p></div>
    <div class="rd-box wide"><span class="lbl">Category and sub-categories ${st('ag')}</span>${catLine('sport', 'Nūjošana, Pastaigas')}<p class="why">The dot and the name in the category colour's role, then all sub-categories, smaller and quieter. Used as it is on cards, rows, panels, the group header, notifications and conversations. In a group row the category is plain quiet text, because the colour is already in the mark next to it; in the phone group bar, where the group's image can sit behind the text, a small dot carries the colour.</p></div>
    <div class="rd-box"><span class="lbl">Words and numbers ${st('ag')}</span><p class="why">Sentence case everywhere, also on tags, never all capitals. Faces of who is coming ("Ilze un vēl 11 iet") instead of "0 apstiprināti". Dates in the Latvian short form with the weekday: "Svētd., 18. okt. 17:00".</p></div>
  </div>
  <h3>Category colours: fifteen earth tones ${st('ag')}</h3>
  <p class="lead">Each is a darker, calmer cousin of today's hue, so a category keeps roughly the colour people know. The number in each chip is the contrast ratio of its text: white on the light tone (all pass AA, 4.5:1), near-black on the dark tone (all pass AAA, 7:1). They are edited in Admin → Dizains → Kategoriju krāsas (<a href="#h-admin">Admin</a>).</p>
  <div class="ktab" role="table" aria-label="Kategoriju krāsas"><div role="row"><span></span><span class="kh">Category · name of the tone</span><span class="kh hx">Today</span><span class="kh">Light theme</span><span class="kh">Dark theme</span></div>
  ${KC.map(([k, n, today, l, lr, d, dr]) => `<div role="row" style="${cv(k)}"><span class="ki">${catIco(k)}</span><span>${catName(k)} <small>· ${n}</small></span><small class="hx">${today}</small><span class="kch l" style="background:${l}">${l} · ${lr}</span><span class="kch d" style="background:${d}">${d} · ${dr}</span></div>`).join('\n  ')}
  </div>
  <p class="why"><b>Where the colours show.</b> Category colour only on dots, icons, soft tints, the group banner and the picture fallback; the site colour (Sūna) only on site buttons and links. Paparde and Sūna are both green, but they never sit in the same role.</p>
</section>`;

// ── Shell
const shell = `<section aria-labelledby="h-shell">
  <h2 id="h-shell">Header and navigation</h2>
  <p class="lead">The header and the bottom bar are the same on every page, admin included. The person in these drawings, Ilze, is not a site admin, so her header has no shield; the admin drawings in <a href="#h-admin">Admin</a> show it. Messages and the bell open quick views from anywhere; their full pages are in your own area. The language switch, "LV ▾", is in the header on every page, signed in or not (your answer of 13 October: several languages are used in Latvia).</p>
  ${shots(
    shot('Desktop · signed in', st('ag', 'Agreed 13 Oct'), P.desk(P.hdr(), 760), '1 1 760px'),
    shot('Desktop · site admin: the shield, left of messages', st('ag', 'Agreed 13 Oct'), P.desk(P.hdr({ admin: true }), 760), '1 1 760px'),
    shot('Desktop · signed out', st('ag', 'Agreed 13 Oct'), P.desk(P.hdr({ signedOut: true }), 760), '1 1 760px'),
  )}
  ${shots(
    shot('Phone · signed in', st('ag', 'Agreed 13 Oct'), P.mob(P.phdr())),
    shot('Phone · site admin', st('ag', 'Agreed 13 Oct'), P.mob(P.phdr({ admin: true }))),
    shot('Phone · bottom bar', st('ag', 'Agreed 13 Oct'), P.mob(P.navb('atklat'))),
  )}
  <p class="why"><b>No + in the header</b> (your answer of 13 October: the phone header was too crowded). On phones the + sits in the middle of the bottom bar (Atklāt, Grupas, +, Ziņas, Es) and opens "Izveidot grupu". Desktop has no bottom bar, so there "Izveidot grupu" is a line in the profile menu. <b>The search bar</b> is a plain field: a click opens the search at once (<a href="#h-search">Search</a>).</p>
  <p class="why"><b>Phones.</b> The search icon opens the same search full-screen. The bell opens Paziņojumi of your own area full-screen (you agreed a full-screen list on phones earlier). Messages are "Ziņas" in the bottom bar, with the unread count on it. In the bottom bar, "Grupas" opens Manas grupas and "Es" opens Mans profils (agreed 13 Oct, <a href="#AR-20">AR-20</a>); on the pages of your own area the bar marks the matching tab (Manas grupas → Grupas, Ziņas → Ziņas, the rest → Es).</p>
  <h3>The language switch ${st('ag', 'Agreed 13 Oct')}</h3>
  <p class="lead">Always visible, never hidden in Iestatījumi. It shows the language you read in, short ("LV"), and opens a short list with each language written in its own words. Today the list has Latviešu and English; it is built so more languages can be added later without changing the header. On phones it sits right after the logo, before the search icon.</p>
  ${shots(
    shot('"LV ▾" opens a short list', st('ag'), `<div style="display:grid;gap:6px;justify-items:end;width:240px;max-width:100%">${P.desk(`<div class="rd-hdr" style="justify-content:flex-end">${P.langSw(true)}</div>`, 120)}${P.langList()}</div>`, '0 1 240px'),
    `<div class="rd-shot" style="flex:1 1 300px;max-width:460px"><p class="why"><b>What changes with the language:</b> the site's own words, dates and numbers. What people wrote (group texts, events, messages) stays as written; where a text exists only in another language, the small "Latviski" / "In English" label stays, as today, with no automatic translation. Signed in, the choice is kept on your account; signed out, on the device.</p></div>`,
  )}

  <h3>The footer ${st('ag', 'Agreed 13 Oct')}</h3>
  <p class="lead">A slim footer only on discovery and on reading pages (Par mums, Privātums): the logo, one line about the site, and the two links. Group pages, your own area and admin have none; they end with their content. On phones it sits above the bottom bar, at the very end of the page.</p>
  ${shots(
    shot('Desktop · end of discovery', st('ag'), P.desk(P.foot(), 760), '1 1 760px'),
    shot('Phone · end of discovery', st('ag'), P.mob(P.foot() + P.navb('atklat'))),
  )}

  ${shots(
    shot('Your picture opens the profile menu', st('ag', 'Agreed 13 Oct'),P.profileMenu(), '0 1 260px'),
    shot('The shield opens the admin menu (admins only)', st('ag'), P.shieldMenu(), '0 1 260px'),
  )}
  <p class="why"><b>The profile menu</b> has five lines, the same on every screen. "Manas grupas" counts what is new in your groups since you last looked. "Izveidot grupu" is here because desktop has no bottom bar (13 October). On phones the line stays too, so the menu is the same everywhere; the + in the bottom bar is the main way there (agreed, AR-14). Ziņas and Paziņojumi are not repeated here: they have their own icons in the header, and their full pages are in your own area. Light and dark live only in Iestatījumi.</p>
  <h3>The navigation rule ${st('ag')}</h3>
  <div class="rd-rule"><ol>
    <li><b>Two levels:</b> an area's pages (a group's pages, your own area's pages, admin's sections) and a page's parts (Par mums · Kā notiek pirmā tikšanās · Praktiski; Gaidāmie · Pagājušie; admin's pages). A page with parts of its own in admin (Dizains, Rokasgrāmata) opens them indented in the same list, never as a third menu.</li>
    <li><b>One level runs across, the other down.</b> Never two rows across, stacked, and never two lists down, side by side.</li>
    <li><b>Groups and your own area:</b> pages down the left, parts across as tabs. <b>Admin:</b> five sections across the top (sticky), their pages down the left.</li>
    <li><b>Phones:</b> the pages go into a drawer from the left, opened by ☰ in the bar; the parts stay as tabs. Admin's many pages sit in the same drawer, under their section.</li>
    <li><b>No repeated labels:</b> the chosen item already says where you are. On phones, where the menu is in the drawer, the page's name stands over its tabs.</li>
  </ol></div>
  <p class="why">Drawn in full: a group in <a href="#h-group">A group</a>, your own area in <a href="#h-me">Your own area</a>, admin in <a href="#h-admin">Admin</a>.</p>
</section>`;

// ── Discovery
const crop = (inner, w) => `<div class="rd-crop">${w ? `<div style="min-width:${w}px;display:grid;gap:8px">${inner}</div>` : inner}</div>`;
/** A filter line with one list open under its button. */
const dropAt = (row, list, at) => `<div class="rd-drop" style="--at:${at}px">${row}${list}</div>`;
const alt = (letter, title, status, text, src, mock) => `<div class="rd-alt"><div class="ah"><b>${letter} · ${title}</b>${status}</div>${mock}<p>${text}</p><p class="src"><b>Seen at:</b> ${src}</p></div>`;
const filterCBtn = (n) => `<span class="rd-fc set">${I('sliders')}Filtri<em>${n}</em></span>`;

const discovery = `<section aria-labelledby="h-disc">
  <h2 id="h-disc">Discovery</h2>
  <p class="lead">Groups and events in one place, with the category drawer on the left. Under the header there is one filter line, "Kur" and "Tēma" with the Grupas | Pasākumi switch at its right end; once a Tēma is chosen, a second line with its Veidi. The buttons show what is chosen, so there is no other line. Everything below is built from the parts drawn further down in this section.</p>
  ${shots(shot('Desktop · Grupas · Jelgava · Sports un fitness → Nūjošana, Pastaigas', st('ag', 'Agreed 13 Oct'), discDeskGrupas(), '1 1 100%'))}
  ${shots(
    shot('Phone · Grupas · Jelgava · Sports un fitness', st('ag', 'Agreed 13 Oct'), discPhGrupas()),
    `<div class="rd-shot" style="flex:1 1 300px;max-width:440px"><p class="why"><b>Twice as many groups on a phone.</b> As you asked: two lines per group, like an event. Six groups and the "create" row fit where three cards fitted before. The photo and the note stay on desktop; on the phone the category colour and icon sit where the photo is, so the category still shows at a glance.</p><p class="why"><b>Above the list</b> there is only the filter. The search is the icon in the header, so the page doesn't spend a line on it.</p></div>`,
  )}

  <h3>The filter line ${st('ag', 'Agreed 13 Oct')}</h3>
  <p class="lead">Your decisions of 13 October. <b>Line 1</b> is always one line: "Kur" (with a pin), "Tēma", on Pasākumi the date choices, and the Grupas | Pasākumi switch at the right end, a small tray with the chosen half raised, so it reads as "what am I looking at", not as one more filter. Each button shows its choice once picked: "Kur" becomes "Jelgava", several cities "Jelgava +1", "Tēma" becomes "Sports un fitness" with its dot. A chosen button has a dark outline and a small × that clears it; it has a maximum width, and a longer name is cut with "…". "Notīrīt visu" appears at the end of the line only when two or more things are chosen. <b>Line 2</b> appears once a Tēma is chosen: its Veidi as chips on one line, the chosen first (tinted, with ×), then as many as fit, then "+3" for the rest, which opens the Veids list with its search. There is no separate line of chosen filters any more: the buttons already say it.</p>
  ${shots(
    shot('Desktop · Grupas · your own city only: one line', st('ag', 'Agreed 13 Oct'), crop(P.frow({ places: J, view: 'grupas' }), 900), '1 1 100%'),
    shot('Desktop · Grupas · nothing chosen', st('ag', 'Agreed 13 Oct'), crop(P.frow({ view: 'grupas' }), 900), '1 1 100%'),
    shot('Desktop · Grupas · Sports un fitness → Nūjošana, Pastaigas', st('ag', 'Agreed 13 Oct'), crop(P.frow({ ...fSport2, view: 'grupas' }), 900), '1 1 100%'),
    shot('Desktop · Pasākumi · Sports un fitness, any Veids', st('ag', 'Agreed 13 Oct'), crop(P.frow({ ...fSport, view: 'pasakumi' }), 900), '1 1 100%'),
    shot('Desktop · Pasākumi · two cities and a range from the calendar', st('ag', 'Approved 13 Oct'), crop(P.frow({ places: ['Jelgava', 'Ozolnieki'], cat: 'sport', view: 'pasakumi', range: '15.–18. okt.' }), 900), '1 1 100%'),
  )}
  ${shots(
    shot('Phone · Grupas · nothing chosen', st('ag', 'Agreed 13 Oct'), P.mob(`<div class="rd-pg">${P.frowPh({ view: 'grupas' })}</div>`)),
    shot('Phone · Pasākumi · Sports un fitness → Nūjošana', st('ag', 'Agreed 13 Oct'), P.mob(`<div class="rd-pg">${P.frowPh({ ...fSport, subs: ['Nūjošana'], view: 'pasakumi' })}</div>`)),
    `<div class="rd-shot" style="flex:1 1 300px;max-width:440px"><p class="why"><b>On phones</b> the switch keeps its full-width line (a phone is too narrow for the switch and the buttons together). Under it Kur, Tēma and, on Pasākumi, one date button sit on one line; when they don't fit, the longest name gives way first ("Sports u…"), so nothing wraps. The Veids line follows, with "Notīrīt visu" at its end. Your note asked for one line: this is the line, checked at 375 px.</p><p class="why"><b>What counts as chosen.</b> The place, the Tēma, each Veids and a date other than "Šonedēļ" (where Pasākumi starts). Clearing the Tēma also clears its Veidi. "Notīrīt visu" returns to the start. <b>"Šodien"</b> stays: it is the way back to today. Pasākumi opens on "Šonedēļ" (Monday to Sunday); "Šodien" looks chosen only after you tap it (your decision of 13 October).</p></div>`,
  )}

  <h3>The drop-downs, open</h3>
  <p class="lead">You liked all three on 13 October. Each filter opens a short list under it (30 px buttons, 13 px rows). The search field is the first line of the list; counts show what a choice gives; empty choices stay in the list, greyed. On phones the same lists open as a sheet from the bottom. The Veids list opens from "+3" on the second line; its search reads "Meklēt veidu". The calendar is a month only (your note of 13 October: Šodien, Šonedēļ and Nedēļas nogalē are already on the filter line, so they are not repeated inside it); the week starts on Monday, Saturday and Sunday are tinted, and the arrows sit right next to the month's name. <b>"+3" opens the Veids list</b> (search, tick boxes, several at once, like the Kur list); you approved it on 13 October, so there is no separate "Veids" button and no limit of eight.</p>
  ${shots(
    shot('Kur · several cities ticked: "Jelgava +1"', st('ag', 'Agreed · liked 13 Oct'), crop(dropAt(P.frow({ view: 'grupas', places: ['Jelgava', 'Ozolnieki'], open: 'place' }), P.placeList({ ticked: ['Jelgava', 'Ozolnieki'] }), 0), 560), '0 1 580px'),
    shot('Veids · "+3" opened · two ticked', st('ag', 'Approved 13 Oct'), crop(dropAt(P.frow({ ...fSport2, view: 'grupas', open: 'sub', fit: 4 }), P.subList({ ticked: ['Nūjošana', 'Pastaigas'] }), 140), 560), '0 1 580px'),
    shot('The calendar button · a range · a month only', st('lk', 'Liked; changed 13 Oct'), crop(dropAt(P.frow({ ...fSport, view: 'pasakumi', range: '15.–18. okt.', open: 'date' }), P.calendar(), 360), 900), '1 1 100%'),
  )}
  ${shots(
    shot('Kur · "je" typed', st('ag'), P.placeList({ ticked: ['Jelgava'], typed: '<em class="hl">je</em>' }), '0 1 260px'),
    shot('Kur · no match', st('ag'), P.placeList({ typed: 'Ērgļi' }), '0 1 260px'),
    shot('Veids · "pe" typed', st('ag', 'Approved 13 Oct'), P.subList({ typed: 'pe' }), '0 1 260px'),
    shot('Phone · the place list as a sheet', st('ag'), P.mob(`<div class="rd-stage" style="height:440px"><div class="rd-pg">${P.frowPh({ view: 'grupas', places: ['Jelgava', 'Ozolnieki'], open: 'place' })}</div><div class="rd-scrim"></div><div class="rd-pnl sheet" style="position:absolute;left:0;right:0;bottom:0;z-index:2;padding:0 8px 10px"><span class="grab"></span>${P.placeList({ ticked: ['Jelgava', 'Ozolnieki'] })}</div></div>`)),
  )}
  <p class="why"><b>The place list</b> is one list for the Kur button here and in the search (<a href="#h-search">Search</a>). Several cities stay possible: the button reads "Jelgava +1", "Jelgava +2". Its first line, "Visur", is a plain "show all" with no tick box: choosing it clears the ticks and the button reads "Kur" again. <b>No results</b> reads "Nekas nav atrasts." in every list; the place list adds how a missing city gets added, and the category search offers to suggest a new one.</p>

  <h3>The category drawer ${st('lk')}</h3>
  <p class="lead">All fifteen, always, alphabetical, with icon and count; empty ones greyed. It folds to an icon rail on desktop (Pasākumi below shows it folded); on phones the "Tēma" button opens the same list as a sheet. On desktop the drawer and the "Tēma" button are two ways to the same choice: the button says what is chosen when the drawer is folded or scrolled away. The search field on top narrows the list and also finds Veidi. When nothing matches, the list says so and offers to suggest the word as a new category; the suggestion goes to the admins (Struktūra → Kategorijas).</p>
  ${shots(
    shot('"mū" typed', st('lk'), P.catSearch('mū'), '0 1 260px'),
    shot('"nūj" typed: a sub-category', st('lk'), P.catSearch('nūj'), '0 1 260px'),
    shot('No match', st('ag'), P.catSearch('makšķerēšana'), '0 1 260px'),
  )}

  <h3>Group card and group row</h3>
  <p class="lead">Two shapes for a group, and only two. <b>The card</b> is for desktop discovery. <b>The row</b> is for phones and for every short list of groups (search, "Citur", Tavas grupas), so a group looks the same wherever it is listed in brief.</p>
  ${shots(
    shot('Card · photo, next meeting', st('lk', 'Liked 13 Oct'), `<div style="width:420px;max-width:100%">${P.groupCard(G.zs)}</div>`, '0 1 420px'),
    shot('Card · "Ko meklējam?" note', st('lk', 'Liked 13 Oct'), `<div style="width:420px;max-width:100%">${P.groupCard(G.rn)}</div>`, '0 1 420px'),
    shot('Card · no photo: category colour and icon', st('lk', 'Liked 13 Oct'), `<div style="width:420px;max-width:100%">${P.groupCard(G.sk)}</div>`, '0 1 420px'),
    shot('Create card, at the end of a chosen category', st('ag'), `<div style="width:420px;max-width:100%">${P.createCard()}</div>`, '0 1 420px'),
  )}
  ${shots(
    shot('Row · phones and short lists', st('ag'), `<div style="width:340px;max-width:100%">${P.rows(P.groupRow(G.zs) + P.groupRow(G.rn) + P.createRow())}</div>`, '0 1 340px'),
    shot('Row · with your role (Tavas grupas)', st('ag'), `<div style="width:340px;max-width:100%">${P.rows(P.groupRow(G.pg, { pill: pill('Īpašnieks') }))}</div>`, '0 1 340px'),
  )}
  <p class="why"><b>"Ko meklējam?"</b> is an optional group field of up to 60 characters, written by the team ("Meklējam bundzinieku"). When it is empty, the card shows the next meeting with a small calendar icon, so the two kinds of note are told apart. <b>The photo</b> takes about a fifth of the card, at most 84 px; the name gets two lines. <b>The row</b> has no photo and no note: the name (up to two lines), one quiet line, and the category's colour and icon on the right, where the card has its photo. The quiet line stays one line: on a narrow phone the sub-categories are cut short first ("…"), so the city and the member count, which matter most, always show (Handbook: "Find your people at a glance"). The name may take two lines.</p>
  <p class="credits">Photos from Wikimedia Commons, free licences: folk dance ensemble "Dzintariņš", Rīga, by Richardmaackphotography (CC BY 4.0); Ķemeru purva laipa by Jolanta Liva (CC BY-SA 4.0); Nordic walking group by Vijay.shivu (CC BY-SA 4.0); people playing a board game, Wikimania 2026, by Tohaomg (CC0); Lielupe promenade by Igors Jefimovs (CC BY 3.0).</p>

  <h3>Pasākumi: the same filters, events as rows</h3>
  <p class="lead">The same drawer, the same filter line with the date choices added. Tēma and Veids filter events exactly as they filter groups. The rows are the event rows from <a href="#h-event">An event</a>; with one city chosen they leave the city out.</p>
  ${shots(shot('Desktop · Pasākumi · Jelgava · Sports un fitness · drawer folded', st('ag', 'Agreed; day strip open'), P.desk(`${P.hdr()}<div class="rd-disc fold">${P.cats(sportEvCounts, { on: 'sport', fold: true })}<div class="rd-pg">${P.frow({ ...fSport, view: 'pasakumi' })}${P.dayStrip(12, { none: [14, 17] })}${P.evList(jelgSportDays, { noCity: true, cols: true, more: 'Rādīt nākamo nedēļu' })}</div></div>`, 1040), '1 1 100%'))}
  ${shots(
    shot('Phone · Pasākumi · Jelgava · Sports un fitness · Tuesday tapped', st('ag', 'Agreed; day strip open'), P.mob(`${P.phdr()}<div class="rd-pg">${P.frowPh({ ...fSport, view: 'pasakumi' })}${P.dayStrip(13, { none: [14, 17] })}${P.evList(jelgSportFromTue, { noCity: true })}</div>${P.navb('atklat')}`)),
    `<div class="rd-shot" style="flex:1 1 300px;max-width:460px">
      <div class="cap"><span>The day strip</span>${st('ag')}</div>
      <p class="why">Your idea, drawn: seven days, Monday to Sunday (your note of 13 October: the week starts on Monday), Saturday and Sunday on a soft tint because weekends are when most things happen (agreed), the chosen day filled in Sūna, today outlined, a small dot on days with events; days without events are greyed. A tap jumps the list to that day. On top, the month in the middle with ‹ and › at the two ends: they move the shown week back and forth (your note of 13 October; the "Šodien" link there is gone, because "Šodien" on the filter line already brings you back). Another week also comes from the calendar button or from "Rādīt nākamo nedēļu" under the list, a plain text link; on phones a swipe also moves a week. It sits under the filter row and scrolls away with the list. The dot is the site colour, because a day mixes categories. Not reviewed yet.</p>
      <div class="cap"><span>The date picker</span>${st('lk', 'Liked 13 Oct')}</div>
      <p class="why">The calendar button opens a month, Monday first, with Saturday and Sunday tinted (drawn above under "The drop-downs, open"); the quick choices are not repeated inside it, they are on the filter line (your note of 13 October). One tap picks a day, a second tap a range; the button says how many events that gives ("Rādīt 23"). The range then reads on the filter line ("15.–18. okt.") with its small ×. You liked it on 13 October. On phones (agreed 13 Oct, build plan OD-17), where the filter line has one date button, that button opens a sheet with the quick choices on top and the same month below; the calendar itself stays a month only.</p>
    </div>`,
  )}

  <h3>Few results: "Citur" ${st('lk')}</h3>
  <p class="lead">On Discovery only. When a city is chosen and it has fewer than five results for the chosen category or sub-category, the list goes on with the same topic in other cities, nearest first, as group rows with the distance. The label is just "Citur" (13 October).</p>
  ${shots(shot('Desktop · Grupas · Jelgava · Spēles → Šahs', st('lk'), P.desk(`<div class="rd-pg">${P.frow({ places: J, cat: 'games', subs: ['Šahs'], view: 'grupas' })}${P.cards([G.sh])}<div class="rd-ctx"><h4>Citur</h4><small>Šahs · vēl 3 grupas</small></div><div style="max-width:440px">${P.rows(P.groupRow(G.rs, { extra: '42 km' }) + P.groupRow(G.ts, { extra: '50 km' }) + P.groupRow(G.ls, { extra: '160 km' }))}</div></div>`, 820), '1 1 820px'))}

  <h3>More compact: three options from other sites ${st('ag', 'Settled 13 Oct: A')}</h3>
  <p class="lead">Your note: the header and filters still take too much room; look at what other sites do. I looked at Meetup, Airbnb, Booking, Google's Material filter chips, SAP's filter bar and Baymard's filter research. Three ways that fit us, recommended first. You chose A on 12 October and refined it on 13 October (the filter line above); B and C stay here as a record. Before the first card, round eight used about 190 px on desktop (header, tabs, filters, "Izvēlēts").</p>
  <div class="rd-alts">
    ${alt('A', 'One row of small drop-downs, the switch at its end', st('ag', 'Your choice, refined 13 Oct'), 'What you chose, made smaller and refined on 13 October: 30 px buttons that show their choice, the switch at the right end, no chosen line; the Veids chips only once a Tēma is chosen. About 120 px before the first card with a Tēma, about 95 px without.', 'Meetup\'s Find page keeps date, type, distance and category as one row of small drop-downs at the top of the results (help.meetup.com); Baymard\'s testing shows people need the overview of applied filters (baymard.com, "applied filters").', crop(P.hdr() + `<div class="rd-pg">${P.frow({ ...fSport, view: 'pasakumi' })}</div>`, 900))}
    ${alt('B', 'The place lives only in the search field', st('pr', 'Withdrawn 13 Oct'), 'No longer possible: since 13 October the search bar is a plain field and the place is a chip inside the open search, so the row keeps its place button. Kept only as a record. The idea was: the place tag in the search already says where you look, so the row drops its place button. The row gets shorter, not lower; on phones the first thing in the scrolling row is the category. The cost: the place is set in one spot only, in the header.', 'Airbnb keeps one search input pinned at the top, and the place is part of it (goodui.org, Booking vs Airbnb mobile).', crop(P.hdr() + `<div class="rd-pg"><div class="rd-frow"><div class="fs">${P.temaChip('sport')}${P.dateGroup()}</div>${P.sw('pasakumi')}</div></div>`, 900))}
    ${alt('C', 'One "Filtri" button, the chosen filters in the same row', st('pr', 'Not chosen (A, 12 Oct)'), 'Everything except the switch goes behind one button with a count; it opens a panel (a sheet on phones). What is chosen sits as removable chips in the same row, so there is no second line at all: about 95 px before the first card. The cost: you can\'t see the choices until you open it, which Baymard found makes the range of a catalogue harder to judge.', 'Google\'s Material filter chips and SAP Fiori\'s filter bar keep filters in one sideways row, with a chip that opens a bottom sheet; shops use a "Filter (2)" button with a count (baymard.com, "horizontal filtering").', crop(P.hdr() + `<div class="rd-pg"><div class="rd-frow"><div class="fs">${filterCBtn(2)}<span class="rd-x">Jelgava${I('x', 'Noņemt')}</span><span class="rd-x cat" style="${cv('sport')}">Sports un fitness${I('x', 'Noņemt')}</span></div>${P.sw('pasakumi')}</div></div>`, 900))}
  </div>
</section>`;

// ── Search
/** The open search: the chip row at the top, the results below (13 Oct). */
const spModal = (chips, inner) => `<div class="rd-spw"><div class="rd-spl">${chips}${inner}</div></div>`;
const spSp = () => `<span class="rd-sph">Grupas</span>${P.groupRow(G.gs, { hl: 'Galda <em class="hl">sp</em>ēļu vakari' })}${P.groupRow(G.sp, { hl: '<em class="hl">Sp</em>ēļu klubs «Kauliņš»' })}<span class="rd-sph">Pasākumi</span>${P.evList([[dh(10, 13), [{ ...E.spv, name: '<em class="hl">Sp</em>ēļu vakars bibliotēkā' }]]], { flat: true, noCity: true })}`;
const spCats = [['games'], ['sport']];
/** A third Jelgava group that matches "sp", for "Rādīt visus rezultātus". */
const GSD = { name: 'Sporta deju pāri', cat: 'dance', subs: 'Sporta dejas', city: 'Jelgava', n: 14, ask: 'Meklējam deju partneri' };
const spHl = { gs: 'Galda <em class="hl">sp</em>ēļu vakari', sp: '<em class="hl">Sp</em>ēļu klubs «Kauliņš»', sd: '<em class="hl">Sp</em>orta deju pāri' };
/** Option A: the themes and types that match the search word, as choice chips above the list (one line, then "+N"). */
const spMatch = (fit, counts = true) => {
  const all = [['Spēles', 'games', 1, 3], ['Sports un fitness', 'sport', 1, 6], ['Galda spēles', 'games', 0, 2], ['Lomu spēles', 'games', 0, 1], ['Kāršu spēles', 'games', 0, 1], ['Sporta dejas', 'dance', 0, 1]];
  return `${P.el('search-matches')}<div class="rd-vl" role="group" aria-label="Atbilst arī"><span class="lbl">Atbilst arī:</span>${all.slice(0, fit).map(([t, k, dot, n]) => P.optChip(t, { k, dot, n: counts ? n : null })).join('')}${all.length > fit ? P.moreChip(all.length - fit, false, 'tēmas un veidi') : ''}</div>`;
};
const search = `<section aria-labelledby="h-search">
  <h2 id="h-search">Search ${st('ag', 'Approved 13 Oct')}</h2>
  <p class="lead">Your notes of 13 October. The search bar is a plain field: no place and no tags in it. A tap or click on it opens the search at once. At the top of the open search sits a row of chips: first the Kur button, the same as on the filter line (it opens the place list, "Visur" and tick boxes, and starts with the page's place, "Kur" when nothing is chosen); then the themes that match what you type, as the same choice chips as the Veids line. A click on a theme chooses it (tinted, with ×) and the results narrow; it doesn't navigate away. The results are below: groups as group rows, events as event rows.</p>
  ${shots(
    shot('1 · "sp" typed', st('ag', 'Approved 13 Oct'), P.desk(P.hdr({ search: P.searchOpen('sp') }) + spModal(P.searchChips({ places: J, cats: spCats }), `${spSp()}<span class="rd-spm">Vēl 14 rezultāti citās pilsētās · <u>meklēt visur</u></span><span class="rd-spa">Rādīt visus rezultātus${I('arrow')}</span>`), 760), '1 1 760px'),
    shot('2 · "Spēles" chosen, "vak" typed', st('ag', 'Approved 13 Oct'), P.desk(P.hdr({ search: P.searchOpen('vak') }) + spModal(P.searchChips({ places: J, cats: [['games', true]] }), `<span class="rd-sph">Grupas · Spēles</span>${P.groupRow(G.gs, { hl: 'Galda spēļu <em class="hl">vak</em>ari' })}<span class="rd-sph">Pasākumi · Spēles</span>${P.evList([[dh(10, 13), [E.spv]]], { flat: true, noCity: true })}<span class="rd-spa">Rādīt visus rezultātus (2)${I('arrow')}</span>`), 760), '1 1 760px'),
  )}
  <div class="rd-rule" id="q-theme"><p><b>Your question: "How would the categories be selected?"</b> (on drawing 1, 13 October). You approved the look of 1 and the chips of 2; this is how one gets from 1 to 2.</p><ol>
    <li><b>The chips come from the word.</b> While you type, the themes whose name or Veidi match the word ("sp": Spēles, Sports un fitness) appear after the Kur button, quiet (not chosen). Nothing is chosen for you.</li>
    <li><b>A tap or click chooses one.</b> The chip turns tinted with a × (drawing 2), the results narrow to that theme at once, and the field keeps what you typed, so you can go on typing ("vak"). You stay in the search; nothing opens.</li>
    <li><b>× or a second tap</b> clears it, and the results widen again. Clearing the word never clears the place.</li>
  </ol><p>${st('ag', 'Approved 13 Oct')} <b>One theme at a time</b>, like the Tēma button on the filter line: once one is chosen, the other theme chips step aside (as in drawing 2) and come back with ×. "Rādīt visus rezultātus" takes the chosen theme along as the Tēma on discovery. You agreed on 13 October (<a href="#AP-06">AP-06</a>).</p></div>
  ${shots(
    shot('3 · No place chosen: "Kur", clicked', st('lk'), P.desk(P.hdr({ search: P.searchOpen('') }) + spModal(P.searchChips({ open: true }), `<div class="rd-drop">${P.placeList()}</div>`), 560), '1 1 560px'),
    shot('4 · Phone · the search, full-screen', st('ag'), P.mob(`<div class="rd-sbar"><span class="mbtn q" aria-label="Atpakaļ">${I('left')}</span>${P.searchOpen('sp')}</div><div class="rd-spl ph">${P.searchChips({ ph: 1, places: J, cats: spCats })}${spSp()}<span class="rd-spa">Rādīt visus rezultātus${I('arrow')}</span></div>`)),
    `<div class="rd-shot" style="flex:1 1 260px;max-width:420px"><p class="why"><b>The Kur button</b> is always first in the row, with a pin, like on the filter line. Ticking cities narrows the results at once; "Visur" clears them. With an empty field the search shows your recent searches and the themes. Removing a theme chip never removes the place.</p><p class="why"><b>On phones</b> the search icon in the header opens the same search full-screen; the chip row wraps onto a second line when the matching themes don't fit (the filter line itself never wraps), and the place list opens as a sheet.</p></div>`,
  )}

  <h3 id="q-all">"Rādīt visus rezultātus": discovery, filtered ${st('ag', 'Approved 13 Oct')}</h3>
  <p class="lead">Your note of 13 October: if "show all results" is discovery, the search word should be a filter chip there, and the other things the search found (themes, types, events) must not get lost. You approved this way, A, on 13 October (<a href="#AP-07">AP-07</a>). It starts from "sp" in Jelgava. The other way drawn in 9.6, B, a results page of its own, was declined.</p>
  <p class="why"><b>Discovery, filtered.</b> The search word becomes the first chip on the filter line, “sp” ×, next to Kur and Tēma; × removes it and you are back on plain discovery. Above the list, one line "Atbilst arī:" with the themes and types that match the word, as the same choice chips as the Veids line; "+2" opens the rest. A tap on one chooses that Tēma or Veids in place of the word. The switch shows the matching groups or events. You stay on the page you know, with the drawer and every filter.</p>
  ${shots(
    shot('Desktop · discovery with the chip “sp” × on the filter line', st('ag', 'Approved 13 Oct'), P.desk(`<div class="rd-url">ejam.lumm.eu/lv?q=sp&amp;vieta=jelgava</div>${P.hdr()}<div class="rd-disc">${P.cats({ games: 2, dance: 1 })}<div class="rd-pg">${P.frow({ q: 'sp', places: J, view: 'grupas' })}${spMatch(4)}${P.cards([P.groupCard({ ...G.gs, name: spHl.gs }), P.groupCard({ ...G.sp, name: spHl.sp }), P.groupCard({ ...GSD, name: spHl.sd })])}</div></div>`, 1040), '1 1 100%'),
  )}
  ${shots(
    shot('Phone · the same', st('ag', 'Approved 13 Oct'), P.mob(`${P.phdr()}<div class="rd-pg">${P.frowPh({ q: 'sp', places: J, view: 'grupas' })}${spMatch(1, false)}${P.rows(P.groupRow(G.gs, { hl: spHl.gs }) + P.groupRow(G.sp, { hl: spHl.sp }) + P.groupRow(GSD, { hl: spHl.sd }))}</div>${P.navb('atklat')}`)),
    `<div class="rd-shot" style="flex:1 1 300px;max-width:440px"><p class="why"><b>The place is kept:</b> "Kur" stays Jelgava, and "Vēl 14 rezultāti citās pilsētās" from the open search is one tap on "Visur". With a theme chosen in the search, discovery opens with that Tēma and its Veids line instead of the "Atbilst arī:" line.</p></div>`,
  )}
</section>`;

// ── Group
const gStageDesk = () => P.desk(`<div class="rd-url">ejam.lumm.eu/lv/sports-un-fitness/group/zalais-solis</div>${P.hdr()}<div class="rd-stage" style="height:640px"><div class="rd-disc">${P.cats(sportCounts, { on: 'sport' })}<div class="rd-pg">${P.frow({ ...fSport2, view: 'grupas' })}${P.cards([P.groupCard(G.zs, { sel: 1 }), G.rn], P.createCard())}</div></div><div class="rd-scrim"></div>${P.groupPanel(G.zs)}</div>`, 1040);
const gStagePh = () => P.mob(`<div class="rd-stage" style="height:700px">${P.phdr()}<div class="rd-pg">${P.frowPh({ ...fSport, view: 'grupas' })}${P.rows(P.groupRow(G.zs) + P.groupRow(G.rn) + P.groupRow(G.sk))}</div><div class="rd-scrim"></div>${P.groupPanel(G.zs, { sheet: 1 })}</div>`);
const memberPages = [P.GPAGES.info, P.GPAGES.jaun, P.GPAGES.pas, P.GPAGES.bied];
const teamPages = [P.GPAGES.info, P.GPAGES.jaun, P.GPAGES.pas, ['bied', 'users', 'Biedri', 2], P.GPAGES.iest];
const pgSoc = () => P.socLinks(['Facebook', 'Instagram']);
const MEMBERS = [{ name: 'Ilze Kalniņa', since: 'kopš 2025. gada marta', role: 'Īpašnieks' }, { name: 'Marta Ozola', since: 'kopš 2025. gada aprīļa', role: 'Mod' }, { name: 'Anna Bērziņa', since: 'kopš 2026. gada jūnija' }];
const group = `<section aria-labelledby="h-group">
  <h2 id="h-group">A group</h2>
  <p class="lead">From a card to the group: the opened card, the one "Sazināties" button and its form, then the group's pages. The sample group for the pages is Pārgājieni.</p>

  <h3>The opened card ${st('ag')}</h3>
  <p class="lead">A click on a card keeps you on discovery: a panel from the right over the dimmed list on desktop, a sheet from the bottom on phones. The address becomes the group's page, so it can be shared. A click outside, Esc, × or Back closes it, and the list stays where it was. This is the panel; the pop-up drawings elsewhere show this same panel.</p>
  ${shots(shot('Desktop · the panel over the list', st('ag'), gStageDesk(), '1 1 100%'))}
  ${shots(shot('Phone · the same panel as a sheet', st('ag'), gStagePh()), `<div class="rd-shot" style="flex:1 1 300px;max-width:440px"><p class="why"><b>Inside:</b> the photo with ×, the name, category and sub-categories, city · members, the next meeting, the short text, then "Sazināties" and "Atvērt grupas lapu" for anyone who wants to read more. "Sazināties" opens the form below on top of the panel, so nobody has to load another page first.</p></div>`)}

  <h3 id="g-contact">One button: "Sazināties" ${st('ag')}</h3>
  <p class="lead">Your decision of 12 October: wherever a group can be reached (the opened card, the group header, the phone group bar), there is one button, "Sazināties". Its form has a switch, "Vēlos pievienoties grupai". While the group takes new members the switch is on, so the same short message also asks to join, and the form's title says so ("Pieteikties grupā …"); switched off, it is only a message ("Sazināties ar grupu …"). When the group takes no new members, the switch isn't there. There is no separate join button.</p>
  <p class="why"><b>The live site today</b> already has this form, with the switch, the changing title and the same texts. Three things differ and change with the redesign: the group header's button still reads "Pieteikties" while a group takes members (it will always read "Sazināties"); after asking, it shows "Pieprasīts" with a × to cancel (it will show "Pieteikums nosūtīts" and "Atvērt sarunu", as the Handbook says); and the send button reads "Sūtīt pieprasījumu" or "Sūtīt ziņu" (it will read "Nosūtīt": buttons name the result). <b>After sending</b> (your note of 13 October) the form simply closes and a short toast says "Ziņa nosūtīta": nobody answers that fast, so there is no second dialog and no "Atvērt sarunu" link; the answer arrives in Ziņas, and the bell says so.</p>
  ${shots(
    shot('The form · the group takes members: switch on', st('ag'), P.contactDialog(), '0 1 420px'),
    shot('The form · switch off: only a message', st('ag'), P.contactDialog({ off: 1 }), '0 1 420px'),
    shot('The form · the group takes no members', st('ag'), P.contactDialog({ closed: 1 }), '0 1 420px'),
    shot('After "Nosūtīt": the form closes, a short toast', st('ag', 'Agreed 13 Oct'), `<div style="display:grid;justify-items:center;padding:18px 0;width:420px;max-width:100%">${P.toast('Ziņa nosūtīta')}</div>`, '0 1 420px'),
  )}
  <p class="why"><b>The counter</b> (your note of 13 October, for every form on the site): under each text field with a limit, at its right end, quiet, "${P.counterText(P.CONTACT_MSG.length)}": what you wrote and the limit, so nobody is surprised at "Nosūtīt". A message, also one that asks to join, may have ${P.counterText(null)} characters, as in the live app. Near the limit and past it:</p>
  ${shots(
    shot('The counter · in the last tenth', st('ag'), `<div class="rd-dlg"><span class="rd-taw"><span class="rd-ta long">${P.CONTACT_MSG} ${'Esmu nūjojusi jau trīs gadus, parasti pa Pils salu un gar Lielupi. '.repeat(3)}…</span>${P.fieldCounter(1874)}</span></div>`, '0 1 420px'),
    shot('The counter · past the limit: "Nosūtīt" waits', st('ag'), `<div class="rd-dlg"><span class="rd-taw"><span class="rd-ta long">${P.CONTACT_MSG} ${'Esmu nūjojusi jau trīs gadus, parasti pa Pils salu un gar Lielupi. '.repeat(3)}…</span>${P.fieldCounter(2013)}</span><div class="row">${P.btn('Atcelt', 's', true)}<span class="rd-btn p sm" aria-disabled="true" style="opacity:.45">Nosūtīt</span></div></div>`, '0 1 420px'),
  )}
  <div class="rd-roles">
    <div><b>Signed out</b><span>${P.btn('Sazināties', 'p', true)} → the sign-in pop-up; afterwards the form opens where you were.</span></div>
    <div><b>Signed in</b><span>${P.btn('Sazināties', 'p', true)}</span></div>
    <div><b>Asked to join</b><span><span class="rd-btn s sm">${I('check')}Pieteikums nosūtīts</span> ${P.btn('Atvērt sarunu', 'q', true)} · "Atsaukt pieteikumu" in the "…" menu.</span></div>
    <div><b>Member</b><span>No button; your role and "Rakstīt komandai" are in the "…" menu.</span></div>
    <div><b>Group team</b><span>No button; Iestatījumi in the group's menu, Pieteikumi as a tab on Biedri.</span></div>
  </div>
  <p class="why">As the Handbook's "Who sees what" says (updated to this one-button flow). The answer comes to Ziņas, in one conversation with the group's team.</p>

  <h3>The "…" menu ${st('ag', 'Agreed 13 Oct')}</h3>
  <p class="lead">Next to the group's name, in the header and the phone bar. Your role comes first, as a line rather than a button; then what you can do. These are today's actions, gathered in one place; "Atsaukt pieteikumu" is your answer of 13 October. The team's tools (Iestatījumi, handing over the group) stay in Iestatījumi.</p>
  ${shots(
    shot('Member', st('ag'), P.groupMore('member'), '0 1 260px'),
    shot('Asked to join, still waiting', st('ag', 'Agreed 13 Oct'), P.groupMore('pending'), '0 1 260px'),
    shot('Not a member', st('ag'), P.groupMore('visitor'), '0 1 260px'),
  )}
  <p class="why"><b>"Rakstīt komandai"</b> opens the same conversation with the team as "Sazināties" (today members do this from the "all members" pop-up, which goes; settled, build plan OD-10). "Pamest grupu" asks once more before it acts.</p>

  <h3>The group's pages</h3>
  <p class="lead">The coloured header, as you liked it: the name, category and sub-categories, then city · members as plain quiet text. When the group has chosen an image, it is the whole banner's background (your notes of 13 October); without one, the banner keeps the category tint with the category icon as its mark. Every page's banner is the same height (<a href="#AR-70">AR-70</a>). The pages run down the left, a page's parts are tabs. Visitors see only Informācija and the public events; Jaunumi, Biedri and members-only parts are hidden, not greyed. Events are the same event rows as everywhere, with their short description; only the line naming the group is left out, because every event here is this group's (your notes of 13 October: the rows looked cramped and different).</p>
  <h3 id="g-banner">The banner: with the group's image and without ${st('ag', 'Agreed 13 Oct')}</h3>
  <p class="why">The image fills the banner; a dark shade rises from the bottom so the name and the lines under it read in white over any photo. The shade, the white text and, on phones, the same treatment for the group bar are agreed (build plan OD-08); every banner is the one height, 96 px (<a href="#AR-70">AR-70</a>). Without an image nothing changes: the category tint and icon.</p>
  ${shots(
    shot('Desktop · banner · the group has an image (Pārgājieni)', st('ag', 'Agreed 13 Oct'), P.desk(P.gban(G.pg, { role: 'visitor' }), 1000), '1 1 100%'),
    shot('Desktop · banner · no image: category tint and icon (Jelgavas skrējēji)', st('ag', 'Agreed 13 Oct'), P.desk(P.gban(G.sk, { role: 'visitor' }), 1000), '1 1 100%'),
  )}
  ${shots(
    shot('Desktop · banner · with an image, on a team page', st('ag', 'Agreed 13 Oct'), P.desk(P.gban(G.pg, { role: 'team' }), 1000), '1 1 100%'),
    shot('Desktop · banner · no image, on a team page', st('ag', 'Agreed 13 Oct'), P.desk(P.gban(G.sk, { role: 'team' }), 1000), '1 1 100%'),
  )}
  ${shots(
    shot('Phone · group bar · with an image', st('ag'), P.mob(P.gbar(G.pg, { role: 'visitor' }))),
    shot('Phone · group bar · no image', st('ag'), P.mob(P.gbar(G.sk, { role: 'visitor' }))),
  )}
  ${shots(shot('Desktop · Informācija · signed in, not a member', st('lk', 'Liked header'), P.desk(`${P.hdr()}${P.gban(G.pg, { role: 'visitor' })}<div class="rd-frame">${P.gnav([P.GPAGES.info, P.GPAGES.pas], 'info')}<div class="rd-main">${P.tabs(['Par mums', 'Kā notiek pirmā tikšanās', 'Praktiski'], 'Par mums', 'Informācijas daļas')}<div class="rd-art"><p>Pārgājieni pa Latvijas takām un dabas vietām. Ejam lēnā tempā, ar pauzēm, un vienmēr sagaidām jaunus cilvēkus. Parasti tiekamies sestdienās, reizi divās nedēļās; maršrutus izvēlamies kopā.</p></div><div class="rd-box2"><div class="bh">Nākamais pasākums<span>Visi${I('arrow')}</span></div>${P.evList([[dh(10, 17), [kemNoEju]]], { flat: true, noSecond: true })}</div>${pgSoc()}</div></div>`, 1000), '1 1 100%'))}
  ${shots(shot('Desktop · Pasākumi · group team', st('ag'), P.desk(`${P.hdr()}${P.gban(G.pg, { role: 'team' })}<div class="rd-frame">${P.gnav(teamPages, 'pas')}<div class="rd-main">${P.tabs(['Gaidāmie', 'Pagājušie'], 'Gaidāmie', 'Pasākumi', P.btn('Izveidot pasākumu', 's', true))}${P.evList(pgDays, { noSecond: true })}</div></div>`, 1000), '1 1 100%'))}
  ${shots(shot('Desktop · Biedri → Pieteikumi · group team: where the asks arrive', st('ag'), P.desk(`${P.hdr()}${P.gban(G.pg, { role: 'team' })}<div class="rd-frame">${P.gnav(teamPages, 'bied')}<div class="rd-main">${P.tabs(['Biedri', 'Pieteikumi 2'], 'Pieteikumi 2', 'Biedri')}<div class="rd-rows"><div class="rd-req"><span><b>Līga</b> · pirms 12 min<br>“Sveiki! Gribētu iet līdzi uz Ķemeru purvu.”</span>${P.btn(`${I('msg')}Sazināties`, 'q', true)}${P.btn('Noraidīt', 's', true)}${P.btn('Apstiprināt', 'p', true)}</div><div class="rd-req"><span><b>Kārlis</b> · vakar<br>“Esmu jauns Rīgā, meklēju kompāniju.”</span>${P.btn(`${I('msg')}Sazināties`, 'q', true)}${P.btn('Noraidīt', 's', true)}${P.btn('Apstiprināt', 'p', true)}</div></div></div></div>`, 1000), '1 1 100%'))}
  <p class="why">Every ask arrives here with its message, and in Ziņas as a conversation with the team. <b>"Sazināties"</b>, with the chat icon (your notes of 13 October: first "Atbildēt", then the one word used everywhere for writing to someone), opens that conversation, so the team can ask something before deciding; in the live app a join request already is a conversation. The request stays here until it is approved or declined.</p>
  ${shots(shot('Desktop · Biedri · group team, one member\'s "…" open', st('ag', 'Agreed 13 Oct'), P.desk(`${P.hdr()}${P.gban(G.pg, { role: 'team' })}<div class="rd-frame">${P.gnav(teamPages, 'bied')}<div class="rd-main">${P.tabs(['Biedri', 'Pieteikumi 2'], 'Biedri', 'Biedri')}<div class="rd-pop-at"><div class="rd-rows rd-mrl">${MEMBERS.map((m) => P.memberRow(m, { team: 1 })).join('')}</div>${P.memberMenu()}</div></div></div>`, 1000), '1 1 100%'))}
  <p class="why"><b>Biedri</b> (drawn now, from the rules): one row per member with the face, the name, since when, and the role tag; a plain member has none. Members see the list; the team also gets "…" on each row (Sūtīt ziņu, Skatīt profilu, Iecelt par moderatoru, Izslēgt no grupas). Member faces appear only here, not on Informācija (13 October).</p>
  ${shots(shot('Desktop · Jaunumi · group team', st('ag', 'Agreed 13 Oct'), P.desk(`${P.hdr()}${P.gban(G.pg, { role: 'team' })}<div class="rd-frame">${P.gnav(teamPages, 'jaun')}<div class="rd-main">${P.tabs(['Aktuālie', 'Arhīvs'], 'Aktuālie', 'Jaunumi', P.btn('Jauns ieraksts', 's', true))}${P.annItem(ANN.kem, { own: 1, team: 1 })}${P.annItem(ANN.plan, { own: 1, team: 1 })}</div></div>`, 1000), '1 1 100%'))}
  <p class="why"><b>Jaunumi</b> (drawn now): the same item as in Manas grupas, but on the group's own page the line names who wrote it and when instead of the group. The team writes with "Jauns ieraksts" (at the right end of the tabs, like "Izveidot pasākumu" on Pasākumi) and moves old items to Arhīvs or deletes them from each item's "…". Visitors don't see Jaunumi.</p>
  ${shots(
    shot('Phone · Informācija · signed in, not a member', st('ag'), P.mob(`${P.phdr()}${P.gbar(G.pg, { role: 'visitor' })}<div class="rd-pg"><h4 class="rd-pt">Informācija</h4>${P.tabs(['Par mums', 'Kā notiek pirmā tikšanās', 'Praktiski'], 'Par mums', 'Informācijas daļas')}<div class="rd-art"><p>Pārgājieni pa Latvijas takām un dabas vietām. Ejam lēnā tempā, ar pauzēm, un vienmēr sagaidām jaunus cilvēkus.</p></div>${pgSoc()}</div>${P.navb('atklat')}`)),
    shot('Phone · Pasākumi · member', st('ag'), P.mob(`${P.phdr()}${P.gbar(G.pg, { role: 'member' })}<div class="rd-pg"><h4 class="rd-pt">Pasākumi</h4>${P.tabs(['Gaidāmie', 'Pagājušie'], 'Gaidāmie', 'Pasākumi')}${P.evList(pgDays, { noSecond: true })}</div>${P.navb('grupas')}`)),
    shot('Phone · the pages drawer, opened', st('ag'), P.mob(`<div class="rd-stage" style="height:520px">${P.phdr()}${P.gbar(G.pg, { role: 'member' })}<div class="rd-scrim"></div><nav class="rd-drw" aria-label="Grupas lapas"><div class="h">${P.gpic(G.pg, 'sm')}<span><b>Pārgājieni</b>${catLine('trav', 'Pārgājieni, Kempings')}</span></div>${P.gnav(memberPages, 'pas')}</nav></div>`)),
  )}
  <p class="why"><b>The phone bar</b> keeps the at-a-glance signals: ☰ for the pages, the group's mark (the category icon; with an image, the image behind the whole bar, agreed), the name, then category · city · members, and "…". For someone who isn't a member, "Sazināties" is a round chat-icon button at the right end of the bar (approved 13 Oct, <a href="#AP-08">AP-08</a>: the bar keeps one height and the group's name stays fully readable; the word is its label), so a visitor who lands on an event page still knows whose event it is and can write. Members see no button. On phones the page's name stands over its tabs, because the menu is in the drawer. In the bottom bar the tab you came from stays marked (Atklāt from discovery, Grupas from Manas grupas; agreed 13 Oct, <a href="#AR-20">AR-20</a>).</p>
</section>`;

// ── Event
/** One case of "Events you can't simply join": the rows (before and after you act), the panel, one plain line. */
const evCase = (rowsList, panel, line) => `<div class="rd-case">${P.evList([[dh(10, 18), rowsList]])}${P.eventPanel(panel)}<p class="why">${line}</p></div>`;
const event = `<section aria-labelledby="h-event">
  <h2 id="h-event">An event</h2>
  <p class="lead">Events are dense rows grouped by day, and a click opens the panel. The same rows appear on Discovery → Pasākumi, a group's Pasākumi, Manas grupas and in search; the same panel opens from all of them. The event's own page stays, for sharing and the full details.</p>
  <h3>The event row ${st('lk', 'Liked, changed 13 Oct')}</h3>
  ${shots(
    shot('The row · with its second line and the description', st('lk', 'Liked, changed 13 Oct'), `<div style="width:520px;max-width:100%">${P.evList([[dh(10, 15), [E.rn2]], [dh(10, 18), [{ ...E.fb }, { ...E.koncert }]]])}</div>`, '0 1 520px'),
    shot('On the group\'s own pages · without the group line', st('lk', 'Liked, changed 13 Oct'), `<div style="width:520px;max-width:100%">${P.evList(pgDays, { noSecond: true })}</div>`, '0 1 520px'),
  )}
  <p class="why"><b>Line one:</b> time, category dot, name, city. The city is left out when one city is chosen. <b>Line two,</b> smaller: the group (a link to it), the category and the sub-category; left out on the group's own pages, where every event is that group's. <b>The last line</b> is the short description, back as you liked it in round four (your note of 13 October): the first words of the event's text, muted, one line, cut with "…". It answers "what is it?" before anyone clicks. It is part of the one row, so every list on this page has it. "Eju" sits under the time, so names stay in line, and left-aligned with it: the tag's tick starts exactly where the time's first digit does (your notes of 13 October; before, the tag's own padding pushed it 8 px to the right). Day headings carry the date, so it isn't repeated on every row. On wide screens the rows run in two columns, read down and then across; a list covers a week, then "Rādīt nākamo nedēļu".</p>
  <h3>The event panel ${st('lk')}</h3>
  ${shots(
    shot('Desktop · the panel', st('lk'), P.eventPanel(), '0 1 360px'),
    shot('Phone · the same panel as a sheet', st('lk'), P.mob(`<div class="rd-stage" style="height:700px">${P.phdr()}<div class="rd-pg">${P.evList([[dh(10, 18), [E.koncert]]])}</div><div class="rd-scrim"></div>${P.eventPanel({ sheet: 1 })}</div>`)),
    `<div class="rd-shot" style="flex:1 1 260px;max-width:400px"><p class="why"><b>Like the group panel:</b> from the right on desktop over the dimmed list, a sheet on phones. Inside: the dot, category and sub-category on one line, when, where, the text, who is going (faces, not numbers), then "Eju" and "Visa informācija" on one line, and who organises it. "Eju" is a small step and easy to undo, so it sits right in the panel.</p><p class="why"><b>Faces only for people who are signed in</b> (13 October): a visitor sees just the number, "12 iet", because the Handbook shows no private data to logged-out visitors.</p></div>`,
  )}
  ${shots(shot('Signed out · the number, no faces', st('ag', 'Agreed 13 Oct'), P.eventPanel({ out: 1 }), '0 1 360px'))}

  <h3 id="q-states">Events you can't simply join ${st('ag')}</h3>
  <p class="lead"><b>Agreed:</b> the row gets one quiet word on its right ("Pieteikšanās" or "Pilns"); the panel says in one line what happens, and its button names the step; after you ask, the row shows the outlined "Gaida" tag, the same as on a group request.</p>
  <p class="why">Most events are open: you press "Eju" and you are going. On the live site an organiser can also approve who comes, or the event can be full with a waiting list. Each case below shows the list (before and after you act) and the panel. This is settled, build plan OD-18.</p>
  ${shots(
    shot('1 · Open: anyone can come', st('lk'), evCase([{ ...E.koncert }, { ...E.koncert, eju: 1 }], {}, 'Press "Eju" and you are going; "Eju" then sits under the time in every list. Most events are like this.'), '0 1 360px'),
    shot('2 · The organiser approves who comes', st('ag'), evCase([{ ...E.koncert, state: 'req' }, { ...E.koncert, state: 'req', eju: 'gaida' }], { state: 'req' }, '"Pieteikties" sends your request; until the organiser answers, the row shows "Gaida". The practical details appear once you are approved.'), '0 1 360px'),
    shot('3 · Full, with a waiting list', st('ag'), evCase([{ ...E.koncert, state: 'full' }, { ...E.koncert, state: 'full', eju: 'gaida' }], { state: 'full' }, 'You can join the waiting list; the row then shows "Gaida". If a place frees up, the organiser lets you in and the bell tells you.'), '0 1 360px'),
    shot('4 · Sign-ups closed', st('ag'), evCase([{ ...E.koncert, state: 'closed' }], { state: 'closed' }, 'No button. Whoever is already going keeps their "Eju".'), '0 1 360px'),
  )}
  <p class="why"><b>Cases 3 and 4 are one switch today.</b> On the live site the organiser's "Slēgt pieteikšanos" marks the event "Pilns" and the waiting list stays open. <b>Agreed (build plan OD-18):</b> keep it so, one state (case 3). Case 4, a full stop with no waiting list, is drawn only so you can choose it if you want it.</p>

  <h3>The event's own page ${st('ag', 'Agreed 13 Oct')}</h3>
  <p class="lead">Not drawn before; drawn now from the rules (your answer of 13 October). Reached from "Visa informācija" in the panel and from shared links. It sits in the group's frame, so a visitor who arrives from a link sees whose event it is and can still write ("Sazināties"). The content is the panel's, in full. <b>The group's image</b> is no longer a small square in the banner (your note of 13 October: too small to see what it shows): it fills the whole banner, as on every group page (<a href="#g-banner">the banner</a>). This event has no image of its own, so the page shows no second picture under the banner.</p>
  ${shots(shot('Desktop · the event page · seen by Pēteris: signed in, not a member (Ilze is a member, so she sees "Eju" and no "Sazināties")', st('ag'), P.desk(`${P.hdr()}${P.gban(G.vz, { role: 'visitor' })}<div class="rd-frame">${P.gnav([P.GPAGES.info, P.GPAGES.pas], 'pas')}<div class="rd-main">${P.eventPage()}</div></div>`, 1000), '1 1 100%'))}
  ${shots(
    shot('Phone · the event page · group team (Anna, who runs Vēja zirdžiņš)', st('ag'), P.mob(`${P.phdr()}${P.gbar(G.vz, { role: 'team' })}<div class="rd-pg">${P.eventPage({ team: 1 })}</div>${P.navb('grupas')}`)),
    `<div class="rd-shot" style="flex:1 1 260px;max-width:420px"><p class="why"><b>Kept from today:</b> add to calendar, open in the map (or the online link), share, "Svarīga informācija" (for events with approval, shown once you are approved), the time zone when it isn't Latvian time, and "Šis pasākums jau ir noticis" after the date.</p><p class="why"><b>The team</b> also sees "Rīkotājiem": how many are going, waiting for approval and on the waiting list (a tap opens that list with "Apstiprināt" or "Ielaist"), and Labot, Slēgt pieteikšanos, Dzēst. Deleting asks once more and tells everyone who signed up.</p></div>`,
  )}
  <h3>Events away from home ${st('ag')}</h3>
  <p class="lead">A group lives in one city, but a dance group performs in Liepāja and a hiking group walks in Sigulda. So an event has its own place, and every list filters by the event's place, not the group's. The place is a city from the list (required, filled in with the group's city to start) plus a free address; an online event gets "Tiešsaistē" and shows under "Visur" (13 October). The Jelgava dancers' concert shows up under Liepāja; the row names Liepāja, and the panel says who organises it and where they are from.</p>
  <div style="max-width:520px">${P.evList([[dh(10, 18), [E.koncert]]])}</div>
</section>`;

// ── Own area
const rq = () => `${P.el('request-row')}<div class="rd-rql"><div class="rd-rq"><span>Galda spēļu vakari · kopš otrd.</span>${pill('Gaida', 'out')}<a>Atsaukt pieteikumu</a></div></div>`;
/** Tavas grupas. `count`: the team's waiting join requests on the group's own row (Still open 9, agreed 13 Oct, build plan OD-21). */
const myGroups = (o = { count: true }) => P.rows(P.groupRow(G.pg, { pill: pill('Īpašnieks'), count: o.count ? '2 pieteikumi' : '' }) + P.groupRow(G.rn, { pill: pill('Mod') }) + P.groupRow(G.vz));
const myNews = () => P.annItem(ANN.kem) + P.annItem(ANN.vz);
const myProfile = () => `<div class="rd-art rd-prof"><div class="hd"><span class="facts">Jelgava, Rīga · Ejam kopā kopš 2025. gada marta</span>${P.btn('Labot profilu', 's', true)}</div><p>Staigāju, dejoju un mācos spēlēt šahu. Labprāt pievienojos pārgājieniem nedēļas nogalēs.</p></div>${myGroups({ count: false })}`;
const secMenu = (o = {}) => P.tabs([...(o.act ? ['Jārīkojas'] : []), 'Tuvākie pasākumi', 'Jaunumi', 'Tavas grupas', 'Tavi pieteikumi'], o.act ? 'Jārīkojas' : 'Tuvākie pasākumi', 'Manas grupas');
const ntList = () => `<div class="rd-nsec">Šodien</div>${P.ntItem(P.NT.anna)}${P.ntItem(P.NT.ok)}${P.ntItem(P.NT.ev3)}<div class="rd-nsec">Agrāk</div>${P.ntItem(P.NT.marta)}${P.ntItem(P.NT.kem)}`;
const me = `<section aria-labelledby="h-me">
  <h2 id="h-me">Your own area</h2>
  <p class="lead">${st('ag')} One space for one person, like a group (you chose (a), and will still review it). Your picture and name on top; the pages down the left: Mans profils, Manas grupas, Ziņas, Paziņojumi, Iestatījumi. On phones the pages go into the ☰ drawer and a page's parts stay across, as on a group page. It opens from the profile menu, from "Grupas" and "Es" in the bottom bar, and from "Atvērt visas ziņas" in the messages drawer and "Skatīt visus" in the bell's list.</p>

  <h3>Mans profils ${st('ag', 'Agreed 13 Oct')}</h3>
  <p class="lead">Not drawn before; drawn now from the rules on this page (your answer of 13 October). Your profile as other people see it: a few words about you, your places, since when you are here, and your groups with your role. "Labot profilu" opens the same page as a form (name, picture, about you, places, and the three privacy switches); where it lives is settled, build plan OD-26. Someone else's profile looks the same, with only the groups you share and a "Sūtīt ziņu" button.</p>
  ${shots(shot('Desktop · Mans profils', st('ag'), P.desk(`${P.hdr({ on: 'av' })}${P.phd()}<div class="rd-frame">${P.ownMenu('profils')}<div class="rd-main">${myProfile()}</div></div>`, 1000), '1 1 100%'))}
  ${shots(
    shot('Phone · Mans profils ("Es" in the bottom bar)', st('ag'), P.mob(`${P.phdr({ on: 'av' })}${P.ownBar()}<div class="rd-pg"><h4 class="rd-pt">Mans profils</h4>${myProfile()}</div>${P.navb('es')}`)),
    `<div class="rd-shot" style="flex:1 1 260px;max-width:400px"><p class="why"><b>The groups</b> are group rows with your role, as in Tavas grupas, because this is how others see where you belong. What others see follows your privacy switches, as today.</p></div>`,
  )}

  <h3>Manas grupas ${st('ag')}</h3>
  <p class="lead">Drawn once, here. Its sections run across as a horizontal menu that stays on top while you scroll and marks the section in view; a tap jumps to it. The menu is their only label, so the sections carry no titles of their own, only a thin line between them: Tuvākie pasākumi as event rows with the group and category line, Jaunumi with the group and category, Tavas grupas as group rows with your role, and Tavi pieteikumi, quieter and apart. A section with nothing new is left out. The page ends; nothing is suggested.</p>
  ${shots(shot('Desktop · Manas grupas', st('ag'), P.desk(`${P.hdr({ on: 'av' })}${P.phd()}<div class="rd-frame">${P.ownMenu('grupas')}<div class="rd-main">${secMenu()}${P.evList(myDays, { cols: true })}<hr class="rd-fsep">${myNews()}<hr class="rd-fsep">${myGroups()}<hr class="rd-fsep">${rq()}<p class="rd-fend">Tas ir viss jaunais.</p></div></div>`, 1040), '1 1 100%'))}
  ${shots(
    shot('Phone · Manas grupas ("Grupas" in the bottom bar)', st('ag'), P.mob(`${P.phdr()}${P.ownBar()}<div class="rd-pg"><h4 class="rd-pt">Manas grupas</h4>${secMenu()}${P.evList(myDays)}<hr class="rd-fsep">${myNews()}<hr class="rd-fsep">${myGroups()}<hr class="rd-fsep">${rq()}<p class="rd-fend">Tas ir viss jaunais.</p></div>${P.navb('grupas')}`)),
    shot('Phone · the drawer, opened', st('ag'), P.mob(`<div class="rd-stage" style="height:520px">${P.phdr()}${P.ownBar()}<div class="rd-scrim"></div><nav class="rd-drw" aria-label="Tava vieta"><div class="h"><span class="rd-bigav sm" role="img" aria-label="Ilzes attēls"></span><span><b>Ilze Kalniņa</b><small>Jelgava · 3 grupas</small></span></div>${P.ownMenu('grupas')}</nav></div>`)),
    `<div class="rd-shot" style="flex:1 1 260px;max-width:400px"><p class="why"><b>Tavi pieteikumi.</b> A request still waiting is not news, and you are not a member yet, so it isn't in the feed or under Tavas grupas: a quiet outlined list with the group's name, since when, "Gaida" and "Atsaukt pieteikumu" (your answer of 13 October; the same is in the group's "…" menu). When the team answers, the answer shows once in Jaunumi; accepted, the group moves into Tavas grupas.</p><p class="why"><b>Nothing looks like a button that isn't one.</b> The group's name is the only link in a Jaunumi item; the small list icon says what kind of item it is.</p><p class="why"><b>"2 pieteikumi"</b> on Pārgājieni: Ilze runs it and two people are waiting for an answer. Agreed 13 October (<a href="#q-team">Still open, 9</a>; build plan OD-21); the other way, not chosen, is drawn below.</p></div>`,
  )}

  <h3 id="q-team">Waiting join requests for the group team ${st('ag')}</h3>
  <p class="lead"><b>Agreed:</b> no separate section; the group's own row in Tavas grupas says "2 pieteikumi", and a tap opens Biedri → Pieteikumi.</p>
  <p class="why"><b>What "Jārīkojas" is:</b> on the live site, Manas grupas starts with a list called "Jārīkojas" ("needs your action"): the groups you help run where someone has asked to join and is waiting for an answer. Two ways; the first is agreed (build plan OD-21). Both are Ilze's Manas grupas on a phone; she owns Pārgājieni, where Līga and Kārlis are waiting.</p>
  ${shots(
    shot('Agreed · no section: "2 pieteikumi" on the group\'s row in Tavas grupas', st('ag', 'Agreed 13 Oct, build plan OD-21'), P.mob(`${P.phdr()}${P.ownBar()}<div class="rd-pg"><h4 class="rd-pt">Manas grupas</h4>${secMenu()}${P.evList(myDays.slice(0, 1))}<hr class="rd-fsep">${myGroups()}</div>${P.navb('grupas')}`)),
    shot('The other way · a separate "Jārīkojas" section first', st('pr', 'Not chosen'), P.mob(`${P.phdr()}${P.ownBar()}<div class="rd-pg"><h4 class="rd-pt">Manas grupas</h4>${secMenu({ act: 1 })}${P.rows(P.groupRow(G.pg, { count: '2 pieteikumi', pill: pill('Īpašnieks') }))}<hr class="rd-fsep">${P.evList(myDays.slice(0, 1))}<hr class="rd-fsep">${myGroups({ count: false })}</div>${P.navb('grupas')}`)),
    `<div class="rd-shot" style="flex:1 1 260px;max-width:400px"><p class="why"><b>Agreed:</b> the count sits on the group itself, so there is nothing new to learn, and a tap on "2 pieteikumi" opens Biedri → Pieteikumi. The bell already says when someone asks.</p><p class="why"><b>The other way</b> keeps today's habit: a list of "things to do" on top. It is easier to spot when you run several groups, but it repeats the group a second time on the same page.</p></div>`,
  )}

  <h3>Ziņas ${st('ag')}</h3>
  <p class="lead">The messages icon in the header opens a drawer from the right on any page, for quick replies; "Atvērt visas ziņas" at its end opens Ziņas in your own area: the list and the conversation side by side. On phones "Ziņas" in the bottom bar opens the same page. A group row shows the group's mark, the last message, and the category and sub-categories; a personal row shows the face and the groups you share.</p>
  ${shots(
    shot('Desktop · the messages drawer', st('ag'), P.desk(`${P.hdr({ on: 'msg' })}<div class="rd-stage" style="height:580px"><div class="rd-pg">${P.cards([G.zs, G.rn])}</div><div class="rd-scrim"></div><div class="rd-cvl rd-side"><div class="top"><b>Ziņas</b><div class="chips"><span class="on">Visas</span><span>Personīgās</span><span>Grupu</span></div></div>${P.CV.map(P.cvRow).join('')}<span class="all">Atvērt visas ziņas</span></div></div>`, 860), '1 1 860px'),
  )}
  ${shots(shot('Desktop · Ziņas in your own area · a conversation with a group\'s team', st('ag'), P.desk(`${P.hdr()}${P.phd()}<div class="rd-frame">${P.ownMenu('zinas')}<div class="rd-two"><div class="rd-cvl"><div class="top"><div class="chips"><span class="on">Visas</span><span>Personīgās</span><span>Grupu</span></div></div>${P.CV.map((c, i) => P.cvRow(i === 0 ? { ...c, on: 1 } : c)).join('')}</div><div class="rd-chat"><div class="ch"><span class="rd-cvi" style="padding:0;border:0;grid-template-columns:38px"><span class="av g" style="${cv('dance')}">${catIco('dance')}</span></span><span><b>Vēja zirdžiņš</b><small class="wl">${catLine('dance', 'Tautas dejas')}<span>· Tu ↔ grupas komanda</span></small></span></div><div class="ms"><div class="sys">Pieteikums grupai Vēja zirdžiņš · 10. okt.</div><div class="bb me"><p>Sveiki! Dejoju jau četrus gadus, gribētu pievienoties.</p></div><div class="bb"><small>Vēja zirdžiņš · Anna, vadītāja</small><p>Sveika! Nākamais mēģinājums ir otrdien, 20. oktobrī, 19:00.</p></div><div class="bb"><small>Vēja zirdžiņš · Juris, palīgs</small><p>Līdzi ērtus apavus!</p></div></div></div></div></div>`, 1040), '1 1 100%'))}
  ${shots(shot('A personal chat that started in a group', st('lk'), P.desk(`<div class="rd-chat" style="border-left:0"><div class="ch"><span class="rd-cvi" style="padding:0;border:0;grid-template-columns:38px"><span class="av">A</span></span><span><b>Anna</b><small>${I('users')} Vēja zirdžiņš, Pārgājieni</small></span></div><div class="ms"><div class="sys">Anna rakstīja no grupas Vēja zirdžiņš · 10. okt.</div><div class="bb"><p>Sveika! Vai šodien brauksi uz koncertu?</p></div></div></div>`, 420), '0 1 440px'))}
  <p class="why">Unchanged from what you liked and what is built: a personal chat that started in a group says so at the top; in a team conversation the team speaks as the group, and each reply names the person.</p>

  <h3>Paziņojumi ${st('ag')}</h3>
  <p class="lead">The bell opens a compact list: who or which group first, the type as a small icon, one quiet line with the person's words or the category; unread as a dot. The group's name is a link. "Skatīt visus" opens Paziņojumi in your own area. Site admins also get Personīgie / Administrācija tabs (drawn in <a href="#h-admin">Admin</a>).</p>
  ${shots(
    shot('Desktop · the bell\'s list', st('ag'), `<div class="rd-ntp">${P.el('notification-list')}<div class="hh"><b>Paziņojumi</b><a>Atzīmēt visus kā izlasītus</a></div>${ntList()}<a class="all">Skatīt visus</a></div>`, '0 1 380px'),
    shot('Phone · Paziņojumi in your own area', st('ag'), P.mob(`${P.phdr({ on: 'bell' })}${P.ownBar()}<div class="rd-pg"><h4 class="rd-pt">Paziņojumi</h4><div class="rd-ntp" style="width:100%;box-shadow:none">${ntList()}</div></div>${P.navb('es')}`)),
    shot('Empty', st('lk'), `<div class="rd-ntp"><div class="hh"><b>Paziņojumi</b></div><div class="rd-empty">${I('bell')}<b>Pagaidām kluss</b><p>Kad kāds pieteiksies tavā grupā vai parādīsies jauns pasākums, tas būs šeit.</p></div></div>`, '0 1 380px'),
  )}

  <h3>Iestatījumi ${st('ag')}</h3>
  <p class="lead">Light and dark live only here, as your note said: not an everyday item. Where the page sits was settled on 13 October (build plan OD-03): the last page of your own area.</p>
  ${shots(shot('Desktop · Iestatījumi', st('ag'), P.desk(`${P.hdr({ on: 'av' })}${P.phd()}<div class="rd-frame">${P.ownMenu('iest')}<div class="rd-main"><div class="rd-radio"><b>Izskats</b><span><i></i>Gaišs</span><span><i></i>Tumšs</span><span><i class="on"></i>Kā ierīcē</span></div><p class="why">The other settings stay as they are today.</p></div></div>`, 900), '1 1 900px'))}
</section>`;

// ── Pop-ups
const pop = `<section aria-labelledby="h-pop">
  <h2 id="h-pop">Pop-ups and panels ${st('lk')}</h2>
  <p class="lead">You liked this rule. A dialog in the middle asks for an answer before you go on, so it dims the page and blurs it lightly (1.5 px); the page stays recognisable. A side panel, a sheet or a drawer is a closer look while you keep browsing, so it only dims. A click outside, Esc, × and Back close all of them. Your note asked that every instance of an element look the same: the drawings here reuse the real parts, not sketches.</p>
  ${shots(shot('Dialog in the middle · dim and 1.5 px blur: the "Sazināties" form over the list', st('lk'), P.desk(`<div class="rd-stage" style="height:530px">${P.hdr()}<div class="rd-pg">${P.frow({ ...fSport2, view: 'grupas' })}${P.cards([G.zs, G.rn], P.createCard())}</div><div class="rd-scrim blur"></div>${P.contactDialog()}</div>`, 900), '1 1 900px'))}
  <p class="why"><b>Panels, sheets and drawers</b> are drawn where they live, each the real thing: the opened group card over the list and as a sheet (<a href="#h-group">A group</a>), the event panel (<a href="#h-event">An event</a>), the messages drawer and the ☰ page drawers (<a href="#h-me">Your own area</a>, <a href="#h-group">A group</a>, <a href="#h-admin">Admin</a>). Dialogs: the "Sazināties" form, the sign-in pop-up, confirmations, "Ieteikt jaunu kategoriju".</p>
</section>`;

// ── Admin
const admRows = (keys) => keys.map(([k, , , l, , d]) => krow(k, l, d)).join('');
const atabs = (on) => `${P.el('admin-sections')}<div class="rd-atabs" aria-label="Administrēšana">${[['Moderācija', 1], ['Struktūra', 3], ['Vietne', 2], ['Komanda'], ['Izstrāde']].map(([t, n]) => `<span${t === on ? ' class="on"' : ''}>${t}${n ? ` <em>${n}</em>` : ''}</span>`).join('')}</div>`;
const admin = `<section aria-labelledby="h-admin">
  <h2 id="h-admin">Admin ${st('ag')}</h2>
  <p class="lead">You approved the admin menu layouts. Admin keeps the site's header (with the shield marking where you are) and, on phones, the bottom bar. Five sections across a top row that stays on top while you scroll; each section's pages down the left; a page with parts of its own (Dizains, Rokasgrāmata) opens them indented under it. A section with one page uses the full width. No label repeats the chosen item.</p>
  <div class="rd-rows">
    <div><b>Moderācija</b> · Sūdzības (reported groups; reported people later), Lēmumi (hidden groups, removed content)</div>
    <div><b>Struktūra</b> · Kategorijas, Vietas</div>
    <div><b>Vietne</b> · Tulkojumi, Dizains (Krāsas, Kategoriju krāsas, Fonti), Rokasgrāmata</div>
    <div><b>Komanda</b> · the site's admins and owner</div>
    <div><b>Izstrāde</b> · Pārveide (this page), Atsauksmes</div>
  </div>
  ${shots(shot('Desktop · Vietne → Rokasgrāmata → Uzvedība', st('ag'), P.desk(`${P.hdr({ admin: true, on: 'shield' })}${atabs('Vietne')}<div class="rd-frame">${P.el('admin-menu')}<div class="rd-amenu"><span>Tulkojumi <em>2</em></span><span>Dizains</span><span class="par">Rokasgrāmata${I('down')}</span><div class="subs"><span>Ievads</span><span>Vērtības</span><span>Kāpēc tā pastāv</span><span>Principi</span><span>Balss un vārdi</span><span class="on">Uzvedība</span><span>Kas ko redz</span><span>Dizains</span><span>UI elementi</span></div></div><div class="rd-apg"><h4>Uzvedība</h4><div class="rd-rows"><div>Saglabāšana un sūtīšana</div><div>Dzēšana</div><div>Kļūdas</div><div>Tukšas lapas</div></div></div></div>`, 960), '1 1 100%'))}
  ${shots(shot('Desktop · Vietne → Dizains → Kategoriju krāsas', st('ag'), P.desk(`${P.hdr({ admin: true, on: 'shield' })}${atabs('Vietne')}<div class="rd-frame"><div class="rd-amenu"><span>Tulkojumi <em>2</em></span><span class="par">Dizains${I('down')}</span><div class="subs"><span>Krāsas</span><span class="on">Kategoriju krāsas</span><span>Fonti</span></div><span>Rokasgrāmata</span></div><div class="rd-apg"><h4>Kategoriju krāsas</h4><p>Katrai kategorijai ir divi toņi: gaišajai un tumšajai tēmai. Pārbaude parādās, tiklīdz izvēlies krāsu.</p><div class="rd-rows" style="padding-block:2px">${admRows(KC)}</div><div class="row">${P.btn('Priekšskatīt man', 's', true)}${P.btn('Publicēt visiem', 'p', true)}</div></div></div>`, 960), '1 1 100%'))}
  <p class="why"><b>Dizains has three parts.</b> <b>Krāsas:</b> the site colour (Sūna to start) and the neutral background, lines and quiet text that go with it, light and dark; more themes can be added here later. <b>Kategoriju krāsas:</b> one row per category, its light and dark tone, and "AA ✓" or a short warning when a tone fails. <b>Fonti:</b> Literata and Commissioner, each with a Latvian sample, chosen from a short checked list so every option has all the Latvian letters. You preview a change yourself first, then publish it for everyone.</p>
  ${shots(
    shot('Phone · Dizains → Kategoriju krāsas', st('ag'), P.mob(`${P.phdr({ admin: true, on: 'shield' })}<div class="rd-gbar"><span class="mbtn" aria-label="Administrēšanas izvēlne">${I('menu')}</span><span class="t"><b>Dizains</b><small>Kategoriju krāsas</small></span></div><div class="rd-pg"><div class="rd-rows" style="padding-block:2px">${admRows(KC.slice(0, 5))}</div></div>${P.navb(null)}`)),
    shot('Phone · the admin drawer, opened', st('ag'), P.mob(`<div class="rd-stage" style="height:520px">${P.phdr({ admin: true, on: 'shield' })}<div class="rd-gbar"><span class="mbtn">${I('menu')}</span><span class="t"><b>Dizains</b><small>Kategoriju krāsas</small></span></div><div class="rd-scrim"></div><nav class="rd-drw" aria-label="Administrēšana"><div class="h">${I('shield')}<span><b>Administrēšana</b></span></div><div class="rd-amenu"><span>Moderācija <em>1</em></span><span>Struktūra <em>3</em></span><span class="par">Vietne${I('down')}</span><div class="subs"><span>Tulkojumi</span><span class="on">Dizains · Kategoriju krāsas</span><span>Rokasgrāmata</span></div><span>Komanda</span><span>Izstrāde</span></div></nav></div>`)),
    shot('The bell for a site admin: two tabs', st('ag'), `<div class="rd-ntp"><div class="hh"><b>Paziņojumi</b><a>Atzīmēt visus kā izlasītus</a></div><div class="tabs" role="tablist"><span class="on" role="tab" aria-selected="true">Personīgie<small>3</small></span><span role="tab" aria-selected="false">Administrācija<small>2</small></span></div>${ntList()}<a class="all">Skatīt visus</a></div>`, '0 1 380px'),
  )}
  <p class="why"><b>Why turned round.</b> A group has four or five pages and few parts, so its pages fit a short list down the left. Admin has five sections and many pages (ten Handbook chapters), so the sections fit a row across and the long list goes down the left. Either way: one level across, one down. The shield menu (Atsauksmju režīms, Tulkošanas režīms, Administrēšanas panelis) is drawn in <a href="#h-shell">Header and navigation</a>.</p>
</section>`;

// ── Note index
const NOTES_NOW = [
  ['cmv6hyozx', 'One theme at a time in the search: agreed (approved, AP-06)', 'q-theme', 'Search → your question'],
  ['cmv6hzhwv', '"Rādīt visus rezultātus": I accept proposal A (approved, AP-07)', 'q-all', 'Search → "Rādīt visus rezultātus"'],
  ['cmv6i0m55', 'Show the character limit, as standard in online forms; site-wide (AR-71)', 'g-contact', 'A group → Sazināties (the counter)'],
  ['cmv6i2emw', 'A group’s chosen image as the banner’s background (AR-70)', 'g-banner', 'A group → the banner'],
  ['cmv6i5y4x', 'Event page: the group image is too small; use the whole header (AR-70)', 'h-event', 'An event → the event’s own page'],
  ['cmv6i33tb', '"Sazināties" or a chat icon instead of "Atbildēt" (AR-52)', 'h-group', 'A group → Biedri → Pieteikumi'],
  ['cmv6i3mrq', '"Eju" left-aligned with the time (AR-54)', 'h-event', 'An event → the event row'],
  ['cmv6i4n7c', 'The same: "Eju" looks misaligned (AR-54)', 'h-event', 'An event → the event row'],
  ['cmv5on08v', 'Own area: ok, will still review', 'h-me', 'Your own area'],
];
const NOTES_97 = [
  ['cmv6em8xp', 'Veids: more than 8 → a "Veids" drop-down, then the chosen chips; answered by your later note cmv6ev8az: "+N" is that drop-down', 'h-rules', 'Agreed rules → Veids chips'],
  ['cmv6ev8az', '"+3" opens the Veids list: keep it (approved)', 'h-disc', 'Discovery → drop-downs'],
  ['cmv6emof5', 'I like this filter line (approved)', 'h-disc', 'Discovery → filter line'],
  ['cmv6f07v1', 'The week starts on Monday; mark Saturday and Sunday', 'h-disc', 'Discovery → Pasākumi, drop-downs'],
  ['cmv6ewejf', 'No Šodien / Šonedēļ / Nedēļas nogalē inside the calendar', 'h-disc', 'Discovery → drop-downs (calendar)'],
  ['cmv6f2932', 'How would the categories be selected? (search)', 'q-theme', 'Search → your question'],
  ['cmv6f2pzd', 'The search: I like the general look (approved)', 'h-search', 'Search'],
  ['cmv6f3f72', 'Theme chips narrow the results: I like this (approved)', 'h-search', 'Search'],
];
const NOTES_96 = [
  ['cmv6b868y', 'The filter buttons can fit on one line (on the phone drawing); cut long names', 'h-disc', 'Discovery → filter line'],
  ['cmv6bdeft', "Don't repeat the choices; shorter names: Kur, Tēma, Tips", 'h-disc', 'Discovery → filter line'],
  ['cmv6bhqks', 'Let the place button show the chosen city; no second line', 'h-disc', 'Discovery → filter line'],
  ['cmv6bjjge', '"Rīt" is redundant next to the day strip', 'h-disc', 'Discovery → filter line'],
  ['cmv6biqx3', '"Rīt" is redundant in the calendar', 'h-disc', 'Discovery → drop-downs (calendar)'],
  ['cmv6bl9bu', 'Day strip: no "Šodien"; month in the middle, ‹ › at the sides', 'h-disc', 'Discovery → Pasākumi'],
  ['cmv6bp3o1', '"Show all results": the search word as a chip; nothing lost', 'q-all', 'Search → "Rādīt visus rezultātus"'],
  ['cmv6bsyio', 'After "Sazināties": a toast, not a second dialog', 'h-group', 'A group → Sazināties'],
  ['cmv6bu9pv', 'The next event on Informācija is cramped and looks different', 'h-group', "A group → the group's pages"],
  ['cmv6buslj', 'Event rows on the group page miss information', 'h-group', "A group → the group's pages"],
  ['cmv6bvsz0', 'Reply to a join request before approving', 'h-group', 'A group → Biedri → Pieteikumi'],
  ['cmv6c107z', 'Event rows lost the short description', 'h-event', 'An event → the event row'],
];
const NOTES_94 = [
  ['cmv696kkf', 'The phone header is crowded; move the + to the profile menu', 'h-shell', 'Header and navigation'],
  ['cmv69b6jd', 'Move the + into the bottom bar', 'h-shell', 'Header and navigation'],
  ['cmv69dk66', 'The city picker belongs inside the search, as a chip', 'h-search', 'Search'],
  ['cmv69ehf2', 'Filter bar: the sub-category only once a category is chosen', 'h-disc', 'Discovery → filter row'],
  ['cmv69f1kq', 'I like the Grupas | Pasākumi toggle', 'h-disc', 'Discovery → filter row'],
  ['cmv69fjg9', 'I like the group cards', 'h-disc', 'Discovery → group card'],
  ['cmv69g1co', '"Sports un fitness" overlaps', 'h-disc', 'Discovery → filter row (phones)'],
  ['cmv69hrqx', 'The filter row: generally good, needs rethinking', 'h-disc', 'Discovery → filter row'],
  ['cmv69i7fp', 'I like the date choices', 'h-disc', 'Discovery → filter row'],
  ['cmv69ipj4', 'Overlap: phone row, nothing chosen', 'h-disc', 'Discovery → filter row (phones)'],
  ['cmv69isks', 'Overlap: phone row, Pasākumi', 'h-disc', 'Discovery → filter row (phones)'],
  ['cmv69j7g5', 'I like the place list', 'h-disc', 'Discovery → drop-downs'],
  ['cmv69jixp', 'I like the sub-category list', 'h-disc', 'Discovery → drop-downs'],
  ['cmv69jtj7', 'I like the calendar', 'h-disc', 'Discovery → drop-downs'],
  ['cmv69k2fj', 'Šodien … Nedēļas nogalē on one line', 'h-disc', 'Discovery → drop-downs'],
  ['cmv69kwbj', 'Glitches in the filter line (phone sheet)', 'h-disc', 'Discovery → drop-downs'],
  ['cmv69n5io', 'The day strip\'s arrows are redundant', 'h-disc', 'Discovery → Pasākumi'],
  ['cmv69okgv', '"Rādīt nākamo nedēļu" as a link, not a button', 'h-disc', 'Discovery → Pasākumi'],
  ['cmv69pc8n', 'Month arrows next to the month name', 'h-disc', 'Discovery → drop-downs (calendar)'],
  ['cmv69pkq3', '"Sports un fitness": glitches (phone, Pasākumi)', 'h-disc', 'Discovery → Pasākumi'],
  ['cmv69q76k', 'Just "Citur"', 'h-disc', 'Discovery → Citur'],
  ['cmv69r7hw', 'The city picker: a chip in the search, not in the bar', 'h-search', 'Search'],
  ['cmv69s78e', 'Category chips at the top of the search, not in the bar', 'h-search', 'Search'],
  ['cmv69t6on', 'The search opens at once from the bar', 'h-search', 'Search'],
];
const NOTES = [
  ['cmv5litga', 'Sub-category drop-down: mark it as liked on the shot', 'h-disc', 'Discovery → drop-downs'],
  ['cmv5osq4r', 'Show the filter buttons open; they look too big', 'h-disc', 'Discovery → drop-downs'],
  ['cmv5otafs', '"Kad" is redundant', 'h-disc', 'Discovery → filter row'],
  ['cmv5ou1t9', 'Events need the category and sub-category filters everywhere', 'h-disc', 'Discovery → Pasākumi'],
  ['cmv5oupt9', '"Visa Latvija" needs no tick box', 'h-disc', 'Discovery → drop-downs'],
  ['cmv5nqhqz', 'Admin menu layouts approved', 'h-admin', 'Admin'],
  ['cmv5ogtoj', 'Grupas / Pasākumi at the right end of the filter line', 'h-disc', 'Discovery → filter row'],
  ['cmv5ohu5j', 'Headers and filters too tall; look at other sites', 'h-disc', 'Discovery → more compact'],
  ['cmv5oian8', '"Izvēlēts" is redundant', 'h-disc', 'Discovery → filter row'],
  ['cmv5ojrnf', 'Only three groups fit on a phone; rows like events', 'h-disc', 'Discovery → group row'],
  ['cmv5okpgl', 'A generic no-results text', 'h-disc', 'Discovery → drop-downs'],
  ['cmv5olkux', 'Your own area needs its sidebar', 'h-me', 'Your own area'],
  ['cmv5omkpt', 'Manas grupas drawn twice and differently', 'h-me', 'Your own area → Manas grupas'],
  ['cmv5ooqem', 'Pop-ups: I like this', 'h-pop', 'Pop-ups and panels'],
  ['cmv5oqmfz', 'Every instance of an element must look the same', 'h-pop', 'Whole page; Pop-ups'],
];
const niList = (list) => `<ul class="rd-ni">${list.map(([id, t, h, where]) => `<li><code>${id}</code><span>${t}</span><a href="#${h}">${where}</a></li>`).join('')}</ul>`;
const notes = `<section aria-labelledby="h-notes">
  <h2 id="h-notes">Note index</h2>
  <p class="lead">Your ${NOTES_NOW.length} open notes (${NOTES_NOW.length - 1} from the evening of 13 October, one from round eight that you will still review), and where each is answered in 9.8.</p>
  ${niList(NOTES_NOW)}
  <h3>Answered in 9.7</h3>
  <p class="lead">Your ${NOTES_97.length} notes of the afternoon of 13 October.</p>
  ${niList(NOTES_97)}
  <h3>Answered in 9.6</h3>
  <p class="lead">Your ${NOTES_96.length} notes on round 9.5.</p>
  ${niList(NOTES_96)}
  <h3>Answered in 9.4 and 9.5</h3>
  <p class="lead">Your first ${NOTES_94.length} notes of 13 October.</p>
  ${niList(NOTES_94)}
  <h3>Answered earlier</h3>
  <p class="lead">Your notes from round eight, answered in 9.0–9.3. Your answers of 12 October are recorded in the Agreed rules.</p>
  ${niList(NOTES)}
</section>`;

// ── Sprite
const SYM = {
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  msg: '<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/>',
  bell: '<path d="M6 8a6 6 0 1 1 12 0c0 7 3 8 3 8H3s3-1 3-8"/><path d="M10 20a2 2 0 0 0 4 0"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  pin: '<path d="M12 22s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/>',
  grid: '<rect x="4" y="4" width="6" height="6" rx="1.5"/><rect x="14" y="4" width="6" height="6" rx="1.5"/><rect x="4" y="14" width="6" height="6" rx="1.5"/><rect x="14" y="14" width="6" height="6" rx="1.5"/>',
  left: '<path d="m15 6-6 6 6 6"/>', right: '<path d="m9 6 6 6-6 6"/>', down: '<path d="m6 9 6 6 6-6"/>',
  all: '<circle cx="12" cy="12" r="8"/><path d="M12 8v8M8 12h8"/>',
  dance: '<circle cx="12" cy="4" r="2"/><path d="M12 7v6l-4 7M12 13l4 7M7 9l5-2 5 3"/>',
  mount: '<path d="m3 20 6-10 4 6 3-4 5 8z"/><circle cx="16" cy="6" r="2"/>',
  hobby: '<path d="M12 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2z"/>',
  comm: '<path d="M12 3l6 9h-4l4 6H6l4-6H6z"/><path d="M12 18v3"/>',
  pol: '<path d="M3 10v4h4l8 5V5l-8 5z"/><path d="M18 9a4 4 0 0 1 0 6"/>',
  pets: '<circle cx="6" cy="10" r="2"/><circle cx="10" cy="5.5" r="2"/><circle cx="14" cy="5.5" r="2"/><circle cx="18" cy="10" r="2"/><path d="M12 11c-3 0-5 4-5 6.5 0 1.5 1.5 2 2.5 2 1 0 1.5-.6 2.5-.6s1.5.6 2.5.6 2.5-.5 2.5-2c0-2.5-2-6.5-5-6.5z"/>',
  art: '<path d="M12 3a9 9 0 1 0 0 18c1.5 0 2-1 2-2s-1-1.5-1-2.5 1-1.5 2-1.5h2a4 4 0 0 0 4-4c0-4.5-4-8-9-8z"/><circle cx="7.5" cy="11" r="1"/><circle cx="10" cy="7" r="1"/><circle cx="15" cy="7.5" r="1"/>',
  music: '<path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/>',
  rel: '<path d="M12 3c1.5 2 1.5 3 0 4.5-1.5-1.5-1.5-2.5 0-4.5z"/><path d="M9 10h6v11H9z"/>',
  social: '<path d="M4 9h12v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z"/><path d="M16 11h2a2 2 0 0 1 0 4h-2M8 3v3M12 3v3"/>',
  games: '<rect x="4" y="4" width="16" height="16" rx="3"/><circle cx="9" cy="9" r="1"/><circle cx="15" cy="15" r="1"/><circle cx="15" cy="9" r="1"/><circle cx="9" cy="15" r="1"/>',
  sport: '<path d="M6 7v10M3 10v4M18 7v10M21 10v4M6 12h12"/>',
  family: '<circle cx="8" cy="6" r="2.5"/><circle cx="16.5" cy="9" r="2"/><path d="M4 20c0-4 2-7 4-7s4 3 4 7M13 20c0-3 1.5-5.5 3.5-5.5S20 17 20 20"/>',
  well: '<path d="M5 19c0-8 6-14 15-14 0 9-6 15-14 15"/><path d="M5 19l7-7"/>',
  edu: '<path d="M4 19V5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.8-3.5 3.4-5.5 6.5-5.5s5.7 2 6.5 5.5M16 4.5a3.5 3.5 0 0 1 0 7M18 14.5c2 .6 3.3 2.6 3.5 5.5"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4.5-6 8-6s7 2 8 6"/>',
  x: '<path d="M6 6l12 12M18 6 6 18"/>', check: '<path d="m5 12.5 4.5 4.5L19 7"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  cal: '<rect x="4" y="5" width="16" height="15" rx="2.5"/><path d="M4 10h16M8 3v4M16 3v4"/>',
  list: '<path d="M9 6h11M9 12h11M9 18h11M4.5 6h.01M4.5 12h.01M4.5 18h.01"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="m9 12 2 2 4-4"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>',
  note: '<path d="M5 4h14v12H9l-4 4z"/>',
  userplus: '<circle cx="9" cy="8" r="4"/><path d="M2 21c1-4 4-6 7-6s6 2 7 6M19 8v6M16 11h6"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M12 2.5v3M12 18.5v3M4.2 6.2l2.1 2.1M17.7 15.7l2.1 2.1M2.5 12h3M18.5 12h3M4.2 17.8l2.1-2.1M17.7 8.3l2.1-2.1"/>',
  logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5M21 12H9"/>',
  dots: '<circle cx="5" cy="12" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="19" cy="12" r="1.2"/>',
  share: '<circle cx="18" cy="5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="19" r="2.5"/><path d="m8.2 10.8 7.6-4.4M8.2 13.2l7.6 4.4"/>',
  flag: '<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>',
  sliders: '<path d="M4 6h9M17 6h3M4 12h3M11 12h9M4 18h11M19 18h1"/><circle cx="15" cy="6" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="17" cy="18" r="2"/>',
};
const sprite = `<svg width="0" height="0" style="position:absolute" aria-hidden="true">\n${Object.entries(SYM).map(([k, v]) => `  <symbol id="i-${k}" viewBox="0 0 24 24">${v}</symbol>`).join('\n')}\n</svg>`;

const EXTRA_CSS = `
/* v9.1: quiet lines stay one line; the less important part gives way */
.rd .rd-gr .t small,.rd .rd-gbar .t small{display:flex;min-width:0;white-space:nowrap}
.rd .rd-gr .t small .a,.rd .rd-gbar .t small .a{overflow:hidden;text-overflow:ellipsis;min-width:0}
.rd .rd-gr .t small .b,.rd .rd-gbar .t small .b{flex:none}
.rd .rd-er .sl a{flex:0 0 auto;max-width:62%}
.rd .rd-er .sl>span{flex:0 1 auto}
.rd .rd-er .sl>span:last-child{flex-shrink:1000}
.rd .rd-fsep{border:0;border-top:1px solid var(--line);margin:4px 0;width:100%}
.rd .rd-req{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.rd .rd-req>span:first-child{flex:1 1 220px;min-width:0}
.rd .rd-gbar .t small .kd{display:inline-block;width:7px;height:7px;border-radius:50%;background:var(--c);margin-right:5px;vertical-align:1px}
.rd .rd-chat .ch small.wl{display:flex;gap:2px 8px;align-items:baseline;flex-wrap:wrap}
.rd .rd-chat .ch small svg.i{width:13px;height:13px;vertical-align:-2px}
.rd .rd-cvi .q .rd-catl,.rd .rd-nti .q .rd-catl,.rd .rd-chat .ch .rd-catl{flex-wrap:nowrap}
/* search panel */
.rd .rd-spw{background:color-mix(in srgb,var(--fg) 8%,var(--bg));padding:10px 16px 18px;display:grid;justify-items:center}
.rd .rd-spl{width:min(100%,600px);background:var(--surface);border:1px solid var(--line);border-radius:16px;padding:2px 14px 12px;display:grid}
.rd .rd-sph{font:600 12px var(--body);color:var(--muted);padding:12px 0 2px}
.rd .rd-spl>.rd-schips{padding:12px 0 2px}
.rd .rd-spl .rd-drop{padding-top:6px}
.rd .rd-sbar{display:flex;align-items:center;gap:6px;padding:9px 10px;background:var(--surface);border-bottom:1px solid var(--line);min-width:0}
.rd .rd-sbar .rd-search{height:36px}
.rd .rd-spl.ph{width:100%;border:0;border-radius:0;padding:0 12px 12px}
.rd .rd-spl .rd-gr{padding:7px 0}
.rd .rd-spm{color:var(--muted);font-size:13px;padding-top:8px}
.rd .rd-spa{margin-top:8px;padding-top:10px;border-top:1px solid var(--line);color:var(--brand);font-weight:600;font-size:14px;display:flex;gap:6px;align-items:center}
.rd .rd-spa svg.i{width:16px;height:16px}
/* v9.2: language switch and footer */
.rd .rd-lang{display:inline-flex;align-items:center;gap:1px;height:32px;padding:0 6px 0 9px;border-radius:999px;font:600 13px var(--body);color:var(--fg);flex:none;white-space:nowrap}
.rd .rd-lang svg.i{width:14px;height:14px;color:var(--muted)}
.rd .rd-lang.open{background:var(--tint)}
.rd .rd-hdr.ph .rd-lang{padding:0 1px 0 3px;font-size:12px}
.rd .rd-hdr.ph .rd-ico{width:30px}
.rd .rd-hdr.ph .rd-av{margin-left:2px}
.rd .rd-hdr.ph .rd-lang svg.i{width:12px;height:12px}
.rd .rd-langl{width:200px}
.rd .rd-langl .rd-mi svg.i{color:var(--brand)}
.rd .rd-langl .rd-mi .sp{width:17px;flex:none}
.rd .rd-langl .rd-mi.on{font-weight:600}
.rd .rd-foot{display:flex;flex-wrap:wrap;align-items:center;gap:6px 18px;padding:14px 20px;background:var(--surface);border-top:1px solid var(--line);font-size:13px;color:var(--muted)}
.rd .rd-foot .rd-logo{font-size:16px;margin-right:0}
.rd .rd-foot .rd-logo::after{width:9px;height:9px;box-shadow:6px 0 0 0 color-mix(in srgb,var(--brand) 45%,transparent);margin:0 6px 0 5px}
.rd .rd-foot .m{flex:1 1 200px;min-width:0}
.rd .rd-foot .ln{display:flex;gap:16px}
.rd .rd-foot a,.rd .rd-soc a{color:var(--brand);font-weight:600;text-decoration:underline;text-decoration-color:var(--line);text-underline-offset:3px}
.rd .rd-mob .rd-foot{padding:12px}
/* v9.2: events you can't simply join, the event page */
.rd .rd-er .ct .es{color:var(--fg);font-weight:500}
.rd .rd-pnl p.es,.rd .rd-evp p.es{font-size:13px;color:var(--muted)}
.rd .rd-case{display:grid;grid-template-columns:minmax(0,1fr);gap:10px;width:360px;max-width:100%;min-width:0}
.rd .rd-evp{background:var(--surface);border-radius:16px;overflow:hidden;display:grid;min-width:0}
.rd .rd-evp .pic{height:150px;background-color:color-mix(in srgb,var(--c) 20%,var(--surface))}
.rd .rd-mob .rd-evp .pic{height:110px}
.rd .rd-evp .bd{padding:14px 18px 18px;display:grid;gap:9px;min-width:0}
.rd .rd-evp h3{font-size:24px}
.rd .rd-mob .rd-evp h3{font-size:20px}
.rd .rd-evp p{margin:0;font-size:14px}
.rd .rd-evp .facts{display:flex;align-items:flex-start;gap:6px;font-size:14px;color:var(--muted)}
.rd .rd-evp .facts svg.i{width:16px;height:16px;margin-top:3px;flex:none}
.rd .rd-evp .facts a{color:var(--brand);font-weight:600;white-space:nowrap;margin-left:4px}
.rd .rd-evp .imp{background:var(--tint);border-radius:12px;padding:9px 12px;display:grid;gap:2px}
.rd .rd-evp .imp b{font:600 13px var(--body)}
.rd .rd-evp .going{font-size:14px;color:var(--muted);display:flex;align-items:center;gap:6px}
.rd .rd-evp .act{display:flex;align-items:center;gap:8px 16px;flex-wrap:wrap}
.rd .rd-evp .rd-box2.org{margin:0 14px 14px;padding-bottom:12px;gap:8px;background:var(--bg)}
.rd .rd-evp .org .ln{display:flex;flex-wrap:wrap;gap:4px 16px;font-size:14px;color:var(--muted)}
.rd .rd-evp .org .ln b{color:var(--fg)}
.rd .rd-evp .org .row{display:flex;gap:8px;flex-wrap:wrap}
/* v9.2: a group's tabs with the team's action, the "…" menu, members, news, social links */
.rd .rd-tabr{display:flex;align-items:flex-end;gap:12px;border-bottom:1px solid var(--line);min-width:0}
.rd .rd-tabr .rd-tabs{flex:1;border-bottom:0;min-width:0}
.rd .rd-tabr>.rd-btn{margin-bottom:6px}
.rd .rd-mhd{display:block;padding:6px 10px 4px;font-size:12px;color:var(--muted)}
.rd .rd-pop-at{position:relative;min-width:0;min-height:230px}
.rd .rd-pop-at>.rd-menu{position:absolute;right:6px;top:52px;z-index:2}
.rd .rd-mr{display:flex;align-items:center;gap:10px;min-width:0}
.rd .rd-mr .av{width:36px;height:36px;border-radius:50%;background:var(--tint);display:grid;place-items:center;font:600 15px var(--display);color:var(--fg);flex:none}
.rd .rd-mr .t{display:grid;flex:1;min-width:0;line-height:1.3}
.rd .rd-mr .t b{font:600 15px var(--display);color:var(--fg)}
.rd .rd-mr .t small{font-size:12px;color:var(--muted)}
.rd .rd-fi .w .mbtn{margin-left:auto;width:28px;height:28px}
.rd .rd-soc{margin:0;display:flex;flex-wrap:wrap;gap:4px 16px;font-size:13px}
.rd .rd-gr .rd-cnt{font:600 12px var(--body);color:var(--brand);white-space:nowrap;flex:none}
.rd .rd-rq a{color:var(--brand);font-weight:600;font-size:12px;white-space:nowrap;flex:none}
.rd .rd-prof{display:grid;gap:8px}
.rd .rd-prof .hd{display:flex;align-items:center;justify-content:space-between;gap:8px 12px;flex-wrap:wrap}
.rd .rd-prof .facts{font-size:13px;color:var(--muted)}
/* v9.2: Compared with the live app */
.rd .rd-cmp{display:grid;background:var(--surface);border-radius:16px;padding:2px 16px;font-size:13px;min-width:0}
.rd .rd-cmp .r{display:grid;gap:4px 14px;padding:8px 0;border-top:1px solid var(--line);align-items:start;color:var(--muted);min-width:0}
.rd .rd-cmp .r:first-child{border-top:0}
.rd .rd-cmp .r>span{min-width:0;overflow-wrap:anywhere}
.rd .rd-cmp .r>span:nth-child(2){color:var(--fg)}
.rd .rd-cmp .hd>span{font:600 12px var(--body);color:var(--muted)!important}
.rd .rd-cmp b{color:var(--fg)}
.rd .rd-cmp a{color:var(--brand);font-weight:600}
.rd .rd-cmp .rd-st{font-size:11px;padding:3px 7px;vertical-align:1px}
.rd .rd-cmp .nt{display:block;margin-top:3px}
.rd .rd-cmp .path,.rd .rd-build .path{display:block;font:11px/1.35 ui-monospace,monospace;color:var(--muted);margin-top:2px;overflow-wrap:anywhere}
.rd .rd-cmp.a .r{grid-template-columns:26px minmax(0,1.2fr) 120px 112px minmax(0,1.6fr)}
.rd .rd-cmp.b .r{grid-template-columns:34px minmax(0,1.2fr) minmax(0,1fr)}
.rd .rd-cmp.c .r{grid-template-columns:34px minmax(0,1fr) minmax(0,1fr) minmax(0,1fr)}
.rd .rd-cmp.d .r{grid-template-columns:34px minmax(0,.8fr) minmax(0,.8fr) minmax(0,1.6fr)}
.rd .rd-mig{display:inline-block;font:600 11px/1.5 var(--body);padding:0 7px;border-radius:999px;background:color-mix(in srgb,var(--brand) 16%,var(--surface));color:var(--fg);white-space:nowrap}
@media (max-width:760px){
.rd .rd-cmp .hd{display:none}
.rd .rd-cmp.a .r,.rd .rd-cmp.b .r,.rd .rd-cmp.c .r,.rd .rd-cmp.d .r{grid-template-columns:30px minmax(0,1fr)}
.rd .rd-cmp .r>span:nth-child(n+3){grid-column:2}
.rd .rd-cmp .r>span[data-h]::before{content:attr(data-h) ": ";font-weight:600;color:var(--fg)}
}
/* v9.8: stable ids in the ledger (AR-NN) and owner approvals (AP-NN) */
.rd .rd-ledger .r>b .rid{display:block;font:500 11px/1.4 ui-monospace,monospace;color:var(--muted);text-decoration:none;margin-top:2px}
.rd .rd-ledger .r{scroll-margin-top:80px}
.rd .rd-apv{display:block;margin-top:5px;padding:5px 9px;border-radius:10px;background:var(--tint);color:var(--fg);scroll-margin-top:80px}
.rd .rd-apv .rid{font:600 11px ui-monospace,monospace;color:var(--brand);text-decoration:none;margin-right:3px}
/* v9.8: the counter under a text field with a limit */
.rd{--warn:#8A5A00;--err:#B3261E}
html.dark .rd{--warn:#E0B04A;--err:#F2948B}
.rd .rd-taw{display:grid;gap:4px}
.rd .rd-fcnt{justify-self:end;font-size:12px;color:var(--muted);font-variant-numeric:tabular-nums}
.rd .rd-fcnt.near{color:var(--warn);font-weight:600}
.rd .rd-fcnt.over{color:var(--err);font-weight:600}
.rd .rd-ta.long{max-height:84px;overflow:hidden}
/* v9.8: the group's image is the banner's background, shaded from below so the text reads in white */
.rd .rd-gban.img,.rd .rd-gbar.img{background-image:linear-gradient(to top,rgba(0,0,0,.72),rgba(0,0,0,.38) 60%,rgba(0,0,0,.18)),var(--img);background-size:cover;background-position:center;color:#fff;border-bottom:0}
.rd .rd-gban.img h3,.rd .rd-gban.img .q,.rd .rd-gban.img .rd-sub,.rd .rd-gban.img .rd-cat,.rd .rd-gbar.img .t b,.rd .rd-gbar.img .t small{color:#fff}
.rd .rd-gban.img .rd-cat::before{box-shadow:0 0 0 1.5px #fff}
.rd .rd-gban.img .rd-btn.s,.rd .rd-gbar.img .mbtn{background:rgba(255,255,255,.9);color:#1d1d1b}
.rd .rd-gbar.img .t small .kd{box-shadow:0 0 0 1.5px #fff}
/* v9.8: "Eju" under the time, its tick in line with the time's first digit */
.rd .rd-er .tmb .rd-pill{margin-left:-6px;padding-left:6px}
.rd .rd-build li{background:var(--surface);border-radius:14px;padding:10px 16px}
.rd .rd-build b{font:600 15px var(--display)}
.rd .rd-build p{margin:2px 0 0;font-size:14px;color:var(--muted)}
`;

let html = `<!-- GENERATED by scripts/redesign/gen.mjs (npm run redesign:build). Do not edit this file by hand: change the generator and rebuild.
     Redesign discussion. Discussion only. Rendered at /admin/development/redesign. Version, update time and the sections marked New/Updated live in docs/development/redesign.meta.json: bump them whenever this file changes.
     v9.0 structure: every element of the design is drawn in full in one section (see the "Agreed rules" table for where); every other copy of it uses the same markup and classes and is marked with an "el:name" comment, so a change to an element means changing every copy with that name. -->
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Literata:ital,opsz,wght@0,7..72,500;0,7..72,600;1,7..72,500&family=Commissioner:wght@400;500;600;700&display=swap">
<style>${CSS}${EXTRA_CSS}${CSS_FIX}</style>
<div class="rd">
${sprite}
<div class="wrap">
${intro}
${ledger}
${open}
${identity}
${shell}
${discovery}
${search}
${group}
${event}
${me}
${pop}
${admin}
${liveSection()}
${notes}
</div>
</div>
`;
// Feedback mode reads these attributes (lib/feedback/capture.ts, componentOf): `data-ui` names the template an element
// was drawn from, `data-feedback-context` says which drawing it sits in. Notes left here then say what they are on.
const plain = (t) => t.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/\s+/g, ' ').trim();
const attr = (t) => t.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
// 1. Every "el:name" marker passes its name on to the element that follows it (the nearest one when several are stacked).
html = html.replace(/((?:<!-- el:[\w-]+ -->)+)(\s*)<([a-z][\w-]*)((?:\s[^>]*)?)>/g, (m, marks, ws, tag, attrs) => {
  if (/\sdata-ui=/.test(attrs)) return m;
  const name = marks.match(/el:([\w-]+)/g).pop().slice(3);
  return `${marks}${ws}<${tag} data-ui="${name}"${attrs}>`;
});
// 2. Every drawing (.rd-shot) gets "viewport · caption (section)". Caption order in the generator: "Desktop · screen · who".
let section = '';
html = html.replace(/<h2\b[^>]*>([\s\S]*?)<\/h2>|<div class="rd-shot"([^>]*)><div class="cap"><span>([\s\S]*?)<\/span>([\s\S]*?)(?=<div class="rd-shot"|<h2\b|$)/g, (m, h2, shotAttrs, cap, rest) => {
  if (h2 !== undefined) { section = plain(h2).replace(/\s+(Liked|Agreed|Approved|New|Updated|Proposal)\b.*$/, ''); return m; }
  const text = plain(cap);
  const view = /\b(Desktop|Phone)\b/.test(text) ? '' : /class="rd-(desk|crop)/.test(rest) ? 'Desktop' : /class="rd-mob/.test(rest) ? 'Phone' : '';
  const context = `${view ? `${view} · ` : ''}${text}${section ? ` (${section})` : ''}`.slice(0, 150);
  return m.replace('<div class="rd-shot"', `<div class="rd-shot" data-feedback-context="${attr(context)}"`);
});
writeFileSync(OUT, html);
console.log('wrote', OUT, html.length);

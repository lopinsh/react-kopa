// Dev only (L3-3a): drafts sub-veidi and picks one Unsplash photo per Veids and sub-veids.
// `node scripts/unsplash-topics.mjs` searches (resumable, cached in scripts/.unsplash-cache/topics/, waits out the hourly limit),
// `node scripts/unsplash-topics.mjs write` writes prisma/taxonomy-content.ts.
// A pick can be swapped in scripts/.unsplash-cache/topics-overrides.json ({ "slug": "photoId" }, the id must be in that slug's cached results).
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const CACHE = path.join(ROOT, 'scripts', '.unsplash-cache', 'topics');
const OVERRIDES = path.join(ROOT, 'scripts', '.unsplash-cache', 'topics-overrides.json');
fs.mkdirSync(CACHE, { recursive: true });

/** [l1, slug, lv, en, query, subs: [slug, lv, en, query][]] */
const TOPICS = [
  ['social', 'movie-nights', 'Kino vakari', 'Movie nights', 'friends watching movie together couch', [
    ['documentary-films', 'Dokumentālās filmas', 'Documentary films', 'documentary film screening audience'],
    ['classic-cinema', 'Klasiskais kino', 'Classic cinema', 'old cinema theatre seats vintage projector'],
  ]],
  ['social', 'dinner-clubs', 'Vakariņu klubi', 'Dinner clubs', 'friends dinner table sharing meal', [
    ['world-cuisine', 'Pasaules virtuve', 'World cuisine', 'cooking together international food kitchen'],
    ['home-baking', 'Mājas cepšana', 'Home baking', 'baking bread dough flour hands'],
  ]],
  ['social', 'quiz-nights', 'Viktorīnu vakari', 'Quiz nights', 'pub quiz night team', []],
  ['hobbies', 'crochet', 'Tamborēšana', 'Crochet', 'crochet yarn hands hook', []],
  ['hobbies', 'photography', 'Fotogrāfija', 'Photography', 'photographer camera outdoors', [
    ['street-photography', 'Ielu fotogrāfija', 'Street photography', 'street photography city people walking'],
    ['nature-photography', 'Dabas fotogrāfija', 'Nature photography', 'photographer tripod landscape nature'],
    ['film-photography', 'Filmiņu fotogrāfija', 'Film photography', 'analog film camera 35mm rolls'],
  ]],
  ['hobbies', 'gardening', 'Dārzkopība', 'Gardening', 'gardening hands soil plants', [
    ['vegetable-gardening', 'Dārzeņu dārzs', 'Vegetable gardening', 'vegetable garden raised beds harvest'],
    ['flower-gardening', 'Puķu dārzs', 'Flower gardening', 'flower garden blooming summer'],
  ]],
  ['hobbies', 'model-building', 'Modelisms', 'Model building', 'scale model building hobby workbench', [
    ['scale-models', 'Mēroga modeļi', 'Scale models', 'plastic model kit painting miniature'],
    ['model-railways', 'Modeļu dzelzceļš', 'Model railways', 'model railway miniature train layout'],
  ]],
  ['sports', 'running', 'Skriešana', 'Running', 'group running park', [
    ['trail-running', 'Trail skriešana', 'Trail running', 'trail running forest path'],
    ['marathon', 'Maratoni', 'Marathon', 'marathon runners road race crowd'],
  ]],
  ['sports', 'cycling', 'Riteņbraukšana', 'Cycling', 'group cycling road', [
    ['road-cycling', 'Šosejas riteņbraukšana', 'Road cycling', 'road cyclists peloton country road'],
    ['mountain-biking', 'Kalnu riteņi', 'Mountain biking', 'mountain bike forest trail rider'],
    ['city-cycling', 'Pilsētas riteņbraukšana', 'City cycling', 'city bicycle commuter street'],
  ]],
  ['sports', 'bodybuilding', 'Kultūrisms', 'Bodybuilding', 'gym barbell weights', []],
  ['sports', 'swimming', 'Peldēšana', 'Swimming', 'swimming pool lanes', [
    ['winter-swimming', 'Ziemas peldēšana', 'Winter swimming', 'winter swimming ice hole cold water'],
    ['pool-swimming', 'Peldēšana baseinā', 'Pool swimming', 'swimmer freestyle indoor pool'],
  ]],
  ['sports', 'basketball', 'Basketbols', 'Basketball', 'basketball court game', [
    ['street-basketball', 'Basketbols ielās', 'Street basketball', 'outdoor street basketball court hoop'],
    ['indoor-basketball', 'Zāles basketbols', 'Indoor basketball', 'basketball arena indoor game players'],
  ]],
  ['travel', 'hiking', 'Pārgājieni', 'Hiking', 'hiking trail forest', [
    ['multi-day-hikes', 'Daudzdienu pārgājieni', 'Multi-day hikes', 'backpackers long distance trek mountains'],
    ['day-hikes', 'Dienas pārgājieni', 'Day hikes', 'day hike friends walking trail meadow'],
    ['nordic-walking', 'Nūjošana', 'Nordic walking', 'nordic walking poles'],
  ]],
  ['travel', 'camping', 'Kempings', 'Camping', 'camping tent forest', [
    ['tent-camping', 'Telšu kempings', 'Tent camping', 'tent by lake campfire evening'],
    ['campervan-trips', 'Kemperu braucieni', 'Campervan trips', 'campervan parked scenic road'],
  ]],
  ['travel', 'road-trips', 'Ceļojumi ar auto', 'Road trips', 'road trip car landscape', []],
  ['travel', 'kayaking', 'Kajaku braucieni', 'Kayaking', 'kayaking river paddle', []],
  ['education', 'languages', 'Valodas', 'Languages', 'language class study group', [
    ['english-language', 'Angļu valoda', 'English language', 'english conversation class students'],
    ['german-language', 'Vācu valoda', 'German language', 'german language learning book'],
    ['spanish-language', 'Spāņu valoda', 'Spanish language', 'spanish language class learning'],
  ]],
  ['education', 'tutors', 'Privātskolotāji', 'Private tutors', 'tutoring notebook desk student', [
    ['maths-tutoring', 'Matemātika', 'Maths tutoring', 'mathematics equations blackboard chalk'],
    ['programming-tutoring', 'Programmēšana', 'Programming', 'learning programming laptop code students'],
  ]],
  ['education', 'science-talks', 'Zinātnes sarunas', 'Science talks', 'science lecture audience', [
    ['astronomy', 'Astronomija', 'Astronomy', 'telescope stargazing night sky'],
    ['history-talks', 'Vēstures sarunas', 'History talks', 'history lecture old library books'],
  ]],
  ['games', 'boardgames', 'Galda spēles', 'Boardgames', 'board game night friends', [
    ['chess', 'Šahs', 'Chess', 'chess players playing chess board'],
    ['go', 'Go', 'Go (game)', 'go game baduk stones board'],
    ['dominoes', 'Domino', 'Dominoes', 'dominoes game table tiles'],
    ['novuss', 'Novuss', 'Novuss', 'carrom board game players'],
  ]],
  ['games', 'pc-games', 'Datorspēles', 'PC games', 'gaming computers lan party', [
    ['console-games', 'Konsoļu spēles', 'Console games', 'friends playing video games console controllers'],
    ['retro-gaming', 'Retro spēles', 'Retro gaming', 'retro video game arcade'],
  ]],
  ['games', 'escape-rooms', 'Bēgšanas istabas', 'Escape rooms', 'escape room puzzle lock', []],
  ['games', 'tabletop-rpgs', 'Galda lomu spēles', 'Tabletop RPGs', 'tabletop role playing dice miniatures', []],
  ['dancing', 'salsa', 'Salsa', 'Salsa', 'salsa dancing couple', []],
  ['dancing', 'folk-dancing', 'Tautas dejas', 'Folk Dancing', 'folk dance traditional costume', []],
  ['dancing', 'swing', 'Svings', 'Swing', 'swing dance lindy hop', []],
  ['music', 'rock-school', 'Rokmūzikas skola', 'Rock school', 'rock band rehearsal', [
    ['guitar', 'Ģitāra', 'Guitar', 'electric guitar playing close hands'],
    ['drums', 'Bungas', 'Drums', 'drum kit drummer sticks'],
  ]],
  ['music', 'choirs', 'Kori', 'Choirs', 'choir singing group', []],
  ['music', 'jam-sessions', 'Džemi', 'Jam sessions', 'jam session musicians acoustic', []],
  ['wellbeing', 'yoga', 'Joga', 'Yoga', 'yoga class group', [
    ['hatha-yoga', 'Hatha joga', 'Hatha yoga', 'yoga mat studio stretching pose'],
    ['vinyasa-yoga', 'Vinjasa joga', 'Vinyasa yoga', 'yoga flow warrior pose outdoors'],
    ['yin-yoga', 'Jin joga', 'Yin yoga', 'relaxing yoga bolster restorative'],
  ]],
  ['wellbeing', 'meditation', 'Meditācija', 'Meditation', 'meditation sitting nature', [
    ['mindfulness', 'Apzinātība', 'Mindfulness', 'mindfulness calm morning sunrise lake'],
    ['breathwork', 'Elpošanas prakse', 'Breathwork', 'breathing exercise lying relaxation'],
  ]],
  ['wellbeing', 'sauna', 'Pirts', 'Sauna', 'sauna wooden interior', []],
  ['art', 'painting', 'Gleznošana', 'Painting', 'painting easel artist studio', [
    ['watercolour', 'Akvarelis', 'Watercolour', 'watercolor painting brush palette'],
    ['oil-painting', 'Eļļas glezniecība', 'Oil painting', 'oil painting canvas palette knife'],
    ['acrylic-painting', 'Akrila glezniecība', 'Acrylic painting', 'acrylic painting colourful canvas'],
  ]],
  ['art', 'writing', 'Rakstīšana', 'Writing', 'writing notebook pen desk', [
    ['poetry', 'Dzeja', 'Poetry', 'poetry book reading handwritten poem'],
    ['fiction-writing', 'Prozas rakstīšana', 'Fiction writing', 'typewriter novel writing manuscript'],
  ]],
  ['art', 'theatre', 'Teātris', 'Theatre', 'theatre stage actors', [
    ['improv-theatre', 'Improvizācijas teātris', 'Improv theatre', 'improv comedy actors on stage'],
    ['amateur-theatre', 'Amatieru teātris', 'Amateur theatre', 'theatre rehearsal actors backstage costumes'],
  ]],
  ['art', 'ceramics', 'Keramika', 'Ceramics', 'ceramics pottery studio', [
    ['pottery-wheel', 'Podnieka ripa', 'Pottery wheel', 'potter wheel clay throwing hands'],
    ['hand-building', 'Veidošana ar rokām', 'Hand-building clay', 'handmade clay bowls shaping workshop'],
  ]],
  ['pets', 'dog-owners', 'Suņu īpašnieki', 'Dog owners', 'dog owners park walking dogs', [
    ['dog-walking', 'Suņu pastaigas', 'Dog walking', 'walking dog leash forest path'],
    ['dog-training', 'Suņu dresūra', 'Dog training', 'dog training obedience sit command'],
  ]],
  ['pets', 'cat-lovers', 'Kaķu draugi', 'Cat lovers', 'cat sitting window', []],
  ['pets', 'horse-riding', 'Jāšana', 'Horse riding', 'horse riding countryside', [
    ['show-jumping', 'Konkūrs', 'Show jumping', 'show jumping horse obstacle'],
    ['trail-riding', 'Izjādes dabā', 'Trail riding', 'horseback riding trail meadow group'],
  ]],
  ['religion', 'prayer-groups', 'Lūgšanu grupas', 'Prayer groups', 'praying hands candle', []],
  ['religion', 'pilgrimages', 'Svētceļojumi', 'Pilgrimages', 'pilgrim path walking', []],
  ['family', 'young-parents', 'Jauno vecāku kolektīvs', 'Young Parent Collective', 'parents stroller park', []],
  ['family', 'family-outings', 'Ģimenes izbraukumi', 'Family outings', 'family walk outdoors', []],
  ['politics', 'civic-activism', 'Pilsoniskais aktīvisms', 'Civic activism', 'community meeting people discussing', []],
  ['politics', 'debate-clubs', 'Debašu klubi', 'Debate clubs', 'debate discussion group', []],
  ['community', 'cleanup', 'Apkārtnes sakopšana', 'Neighbourhood cleanup', 'volunteers cleaning up litter', []],
  ['community', 'volunteering', 'Brīvprātīgais darbs', 'Volunteering', 'volunteers helping together', [
    ['animal-shelter', 'Dzīvnieku patversme', 'Animal shelter', 'animal shelter volunteer dogs'],
    ['food-bank', 'Pārtikas banka', 'Food bank', 'food bank volunteers sorting donations'],
  ]],
  ['community', 'community-gardens', 'Kopienas dārzi', 'Community gardens', 'community garden volunteers', []],
];

const BAD = /logo|brand|nike|adidas|apple|coca|starbucks|signage|poster|selfie|portrait|close-up|closeup|face|nude|bikini/i;

function envKey() {
  const m = fs.readFileSync(path.join(ROOT, '.env'), 'utf8').match(/^UNSPLASH_ACCESS_KEY=(.*)$/m);
  if (!m) throw new Error('no UNSPLASH_ACCESS_KEY');
  return m[1].trim().replace(/^"|"$/g, '');
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function search(slug, query, key) {
  const file = path.join(CACHE, `${slug}.json`);
  if (fs.existsSync(file)) return;
  for (;;) {
    const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=30&orientation=landscape&content_filter=high`;
    const res = await fetch(url, { headers: { Authorization: `Client-ID ${key}` } });
    if (res.status === 403 || res.status === 429) {
      console.log(`rate limited at ${slug}; waiting 5 min`);
      await sleep(5 * 60_000);
      continue;
    }
    if (!res.ok) throw new Error(`${slug}: HTTP ${res.status}`);
    const j = await res.json();
    const out = j.results.map((p) => ({
      id: p.id,
      path: new URL(p.urls.raw).pathname.slice(1),
      name: p.user.name,
      username: p.user.username,
      alt: `${p.alt_description ?? ''} | ${p.description ?? ''}`,
      w: p.width,
      h: p.height,
    }));
    fs.writeFileSync(file, JSON.stringify(out, null, 1));
    console.log(`${slug}: ${out.length} (remaining ${res.headers.get('x-ratelimit-remaining')})`);
    return;
  }
}

function rows() {
  const out = [];
  for (const [l1, slug, lv, en, query, subs] of TOPICS) {
    out.push({ level: 2, parent: l1, slug, lv, en, query });
    for (const [s, slv, sen, sq] of subs) out.push({ level: 3, parent: slug, slug: s, lv: slv, en: sen, query: sq });
  }
  return out;
}

function curatedIds() {
  const src = fs.readFileSync(path.join(ROOT, 'lib/constants/unsplash-curated.ts'), 'utf8');
  return new Set([...src.matchAll(/id: "([^"]+)"/g)].map((m) => m[1]));
}

function pickAll() {
  const overrides = fs.existsSync(OVERRIDES) ? JSON.parse(fs.readFileSync(OVERRIDES, 'utf8')) : {};
  const used = curatedIds();
  const picks = {};
  const list = rows();
  for (const o of Object.values(overrides)) used.add(o);
  for (const r of list) {
    const file = path.join(CACHE, `${r.slug}.json`);
    if (!fs.existsSync(file)) continue;
    const cands = JSON.parse(fs.readFileSync(file, 'utf8'));
    const want = overrides[r.slug];
    let p = want ? cands.find((c) => c.id === want) : null;
    if (!p) p = cands.find((c) => !used.has(c.id) && !BAD.test(c.alt) && c.w >= 3000);
    if (!p) p = cands.find((c) => !used.has(c.id));
    if (p) {
      used.add(p.id);
      picks[r.slug] = p;
    }
  }
  return { list, picks };
}

const L1_TITLES = {
  social: ['Sociālās aktivitātes', 'Social Activities'], hobbies: ['Hobiji un aizraušanās', 'Hobbies & Passions'], sports: ['Sports un fitness', 'Sports & Fitness'],
  travel: ['Ceļošana un daba', 'Travel & Outdoor'], education: ['Zinātne un izglītība', 'Science & Education'], games: ['Spēles', 'Games'], dancing: ['Dejas', 'Dancing'],
  music: ['Mūzika', 'Music'], wellbeing: ['Veselība un labsajūta', 'Health & Wellbeing'], art: ['Māksla un kultūra', 'Art & Culture'], pets: ['Mājdzīvnieki', 'Pets & Animals'],
  religion: ['Reliģija un garīgums', 'Religion & Spirituality'], family: ['Vecāki un ģimene', 'Parents & Family'], politics: ['Kustības un politika', 'Movements & Politics'],
  community: ['Kopiena un vide', 'Community & Environment'],
};
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const img = (p, params) => `https://images.unsplash.com/${p}?${params}`;
const SLIVER = 'w=640&h=96&fit=crop&crop=entropy&auto=format&q=60';
const THUMB = 'w=96&h=96&fit=crop&crop=entropy&auto=format&q=60';
const FULL = 'w=400&h=225&fit=crop&crop=entropy&auto=format&q=60';

/** The review drawing (docs/development/l3/categories.html): one numbered row per Veids and sub-veids, grouped by Tēma. */
function writeReview() {
  const { list, picks } = pickAll();
  const now = new Date();
  const p2 = (n) => String(n).padStart(2, '0');
  const stamp = `${now.getFullYear()}-${p2(now.getMonth() + 1)}-${p2(now.getDate())} ${p2(now.getHours())}:${p2(now.getMinutes())}`;
  const day = stamp.slice(0, 10);
  const version = process.env.L3_VERSION ?? 'v1';
  let n = 0;
  const row = (r, indent) => {
    n += 1;
    const p = picks[r.slug];
    const credit = p
      ? `Foto: <a class="underline" href="https://unsplash.com/@${p.username}?utm_source=ejam_kopa&amp;utm_medium=referral">${esc(p.name)}</a>, <a class="underline" href="https://unsplash.com/?utm_source=ejam_kopa&amp;utm_medium=referral">Unsplash</a> · <a class="underline" href="https://unsplash.com/photos/${p.id}?utm_source=ejam_kopa&amp;utm_medium=referral">${p.id}</a>`
      : 'Foto: nav piemērota foto';
    const pics = p
      ? `<div class="flex shrink-0 items-center gap-3 @4xl:ml-auto"><div class="w-64 shrink-0 overflow-hidden rounded-xl bg-surface shadow-card"><img src="${img(p.path, SLIVER)}" alt="" loading="eager" class="block h-12 w-full object-cover" width="640" height="96"><div class="px-3 py-2 text-meta text-foreground-muted">Kopiena ${esc(r.lv)}</div></div>
      <img src="${img(p.path, THUMB)}" alt="" loading="eager" class="size-12 shrink-0 rounded-lg object-cover" width="96" height="96">
      <img src="${img(p.path, FULL)}" alt="" loading="eager" class="hidden aspect-video w-36 shrink-0 rounded-lg object-cover @4xl:block"></div>`
      : '<div class="w-64 shrink-0 rounded-xl line px-3 py-4 text-meta text-foreground-muted">Nav foto</div>';
    return `<li id="r${n}" class="flex flex-wrap items-center gap-x-4 gap-y-2 border-0 border-t border-border py-3 first:border-t-0${indent ? ' ml-6 @3xl:ml-12' : ''}">
      <span class="w-10 shrink-0 text-item weight-strong tabular-nums text-foreground">${n}</span>
      <div class="min-w-48 flex-1"><p class="text-item text-foreground">${esc(r.lv)} <span class="text-foreground-muted">· ${esc(r.en)}</span></p><p class="text-meta text-foreground-muted">${r.level === 2 ? 'Veids (L2)' : 'Apakšveids (L3), zem ' + esc(rows().find((x) => x.slug === r.parent).lv)} · <code>${esc(r.slug)}</code></p><p class="text-meta text-foreground-muted">${credit}</p></div>
      ${pics}
    </li>`;
  };
  const sections = Object.keys(L1_TITLES).map((l1) => {
    const mine = list.filter((r) => r.level === 2 && r.parent === l1);
    if (!mine.length) return '';
    const items = mine.map((l2) => row(l2, false) + list.filter((r) => r.level === 3 && r.parent === l2.slug).map((r) => row(r, true)).join('')).join('');
    const subs = list.filter((r) => r.level === 3 && mine.some((m) => m.slug === r.parent)).length;
    return `<section id="${l1}" data-label="${esc(L1_TITLES[l1][0])}" data-st="new" data-v="${version}" data-d="${day}">
  <h2 class="text-section">${esc(L1_TITLES[l1][0])} <span class="ml-1 inline-flex items-center gap-1.5 align-middle text-meta weight-medium text-foreground-muted"><span class="inline-flex h-5 items-center rounded-pill px-2 line text-foreground">Jauns</span>${version} · ${Number(day.slice(8))}. ${['jan.', 'febr.', 'marts', 'apr.', 'maijs', 'jūn.', 'jūl.', 'aug.', 'sept.', 'okt.', 'nov.', 'dec.'][now.getMonth()]}</span></h2>
  <p class="mb-2 text-meta text-foreground-muted">${mine.length} Veidi, ${subs} apakšveidi</p>
  <ul class="@container max-w-page rounded-2xl bg-surface px-4 shadow-card">${items}</ul>
</section>`;
  });
  const html = `<!doctype html>
<html lang="lv">
<head>
<meta charset="utf-8">
<title>Kategoriju saturs: apakšveidi un foto (L3)</title>
</head>
<body class="min-h-screen font-sans bg-background p-6 text-foreground">
<!-- Generated by \`node scripts/unsplash-topics.mjs review\` from prisma/taxonomy-content.ts and the photo cache; do not hand-edit. The admin sidebar reads section[data-label][data-st][data-v][data-d] (AF-22). L3-3a draft: nothing here is applied to any database. -->
<h1 class="text-title mb-1">Kategoriju saturs: apakšveidi un foto</h1>
<p class="text-meta text-foreground-muted">Versija ${version} · publicēta ${stamp}</p>
<p class="mb-6 max-w-reading text-body-sm text-foreground-muted">Melnraksts (L3-3a, D4, D8-D10). Katra rinda ir numurēta (1, 2, 3 …), lai piezīmē var rakstīt "17 svītrot", "23 pārsaukt par Basketbols ielās", "5 cits foto". Katram Veidam un apakšVeidam ir viens Unsplash foto, rādīts trīs veidos: plāna svītra kopienas kartes augšā (D8, D10), apaļots sīkbilde saraksta rindā (D9) un 16:9 pilns kadrs (no 1024 px). Kredīts zem katras rindas. Veidi bez apakšVeidiem paliek bez apakšVeidiem: tur dalījums būtu mākslīgs. Nekas netiek ierakstīts datubāzē, kamēr visas sadaļas nav Apstiprinātas.</p>
<div class="flex flex-col gap-10">
${sections.join('\n')}
</div>
</body>
</html>
`;
  fs.mkdirSync(path.join(ROOT, 'docs', 'development', 'l3'), { recursive: true });
  fs.writeFileSync(path.join(ROOT, 'docs', 'development', 'l3', 'categories.html'), html);
  console.log(`review: ${n} numbered rows, ${version}, ${stamp}`);
}

const [cmd] = process.argv.slice(2);
if (cmd === 'write' || cmd === 'dump') {
  const { list, picks } = pickAll();
  if (cmd === 'dump') {
    console.log(JSON.stringify({ list, picks }));
  } else {
    const ph = (s) =>
      picks[s]
        ? `{ id: ${JSON.stringify(picks[s].id)}, path: ${JSON.stringify(picks[s].path)}, name: ${JSON.stringify(picks[s].name)}, username: ${JSON.stringify(picks[s].username)} }`
        : 'null';
    const subs = list.filter((r) => r.level === 3).map((r) => `  { parent: ${JSON.stringify(r.parent)}, slug: ${JSON.stringify(r.slug)}, lv: ${JSON.stringify(r.lv)}, en: ${JSON.stringify(r.en)}, photo: ${ph(r.slug)} },`);
    const l2 = list.filter((r) => r.level === 2).map((r) => `  ${JSON.stringify(r.slug)}: ${ph(r.slug)},`);
    const l2s = list.filter((r) => r.level === 2).map((r) => `  { l1: ${JSON.stringify(r.parent)}, slug: ${JSON.stringify(r.slug)}, lv: ${JSON.stringify(r.lv)}, en: ${JSON.stringify(r.en)} },`);
    const body = `// DRAFT for owner review (L3-3a), generated by scripts/unsplash-topics.mjs. Nothing here reaches seed, demo or production until the review drawing is approved.
// \`path\` is the \`photo-...\` part of an images.unsplash.com URL (store the path, add size params in code, see lib/banner.ts).
export interface TopicPhoto {
  id: string;
  path: string;
  name: string;
  username: string;
}

/** The 48 Veidi (seed + demo) the photos and sub-veidi hang under. */
export const VEIDI: { l1: string; slug: string; lv: string; en: string }[] = [
${l2s.join('\n')}
];

export const SUBTOPICS: { parent: string; slug: string; lv: string; en: string; photo: TopicPhoto | null }[] = [
${subs.join('\n')}
];

/** L2 slug -> photo, all 48 Veidi. */
export const TOPIC_PHOTOS: Record<string, TopicPhoto | null> = {
${l2.join('\n')}
};
`;
    fs.writeFileSync(path.join(ROOT, 'prisma', 'taxonomy-content.ts'), body);
    console.log(`wrote: ${list.filter((r) => r.level === 2).length} Veidi, ${list.filter((r) => r.level === 3).length} sub-veidi, ${Object.keys(picks).length} photos`);
  }
} else if (cmd === 'requery') {
  // node scripts/unsplash-topics.mjs requery <slug> "<query>": replaces that slug's cached search (one request)
  const [, slug, query] = process.argv.slice(2);
  fs.rmSync(path.join(CACHE, `${slug}.json`), { force: true });
  await search(slug, query, envKey());
} else if (cmd === 'review') {
  writeReview();
} else {
  const key = envKey();
  for (const r of rows()) await search(r.slug, r.query, key);
  console.log('all searched');
}

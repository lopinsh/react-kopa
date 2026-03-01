import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ─── Taxonomy ─────────────────────────────────────────────────────────────────
const TAXONOMY = [
  {
    slug: 'social', color: '#EC4899',
    titles: { lv: 'Sociālās aktivitātes', en: 'Social Activities' },
    children: [
      { slug: 'movie-nights', titles: { lv: 'Kino vakari', en: 'Movie nights' } },
      { slug: 'dinner-clubs', titles: { lv: 'Vakariņu klubi', en: 'Dinner clubs' } },
    ]
  },
  {
    slug: 'hobbies', color: '#F97316',
    titles: { lv: 'Hobiji un aizraušanās', en: 'Hobbies & Passions' },
    children: [
      { slug: 'crochet', titles: { lv: 'Tamborēšana', en: 'Crochet' } },
      { slug: 'photography', titles: { lv: 'Fotogrāfija', en: 'Photography' } },
    ]
  },
  {
    slug: 'sports', color: '#3B82F6',
    titles: { lv: 'Sports un fitness', en: 'Sports & Fitness' },
    children: [
      { slug: 'running', titles: { lv: 'Skriešana', en: 'Running' } },
      { slug: 'cycling', titles: { lv: 'Riteņbraukšana', en: 'Cycling' } },
      { slug: 'bodybuilding', titles: { lv: 'Kultūrisms', en: 'Bodybuilding' } },
    ]
  },
  {
    slug: 'travel', color: '#10B981',
    titles: { lv: 'Ceļošana un daba', en: 'Travel & Outdoor' },
    children: [
      { slug: 'hiking', titles: { lv: 'Pārgājieni', en: 'Hiking' } },
      { slug: 'camping', titles: { lv: 'Kempings', en: 'Camping' } },
    ]
  },
  {
    slug: 'education', color: '#F59E0B',
    titles: { lv: 'Zinātne un izglītība', en: 'Science & Education' },
    children: [
      { slug: 'languages', titles: { lv: 'Valodas', en: 'Languages' } },
      { slug: 'tutors', titles: { lv: 'Privātskolotāji', en: 'Private tutors' } },
    ]
  },
  {
    slug: 'games', color: '#8B5CF6',
    titles: { lv: 'Spēles', en: 'Games' },
    children: [
      { slug: 'boardgames', titles: { lv: 'Galda spēles', en: 'Boardgames' } },
      { slug: 'pc-games', titles: { lv: 'Datorspēles', en: 'PC games' } },
      { slug: 'escape-rooms', titles: { lv: 'Bēgšanas istabas', en: 'Escape rooms' } },
    ]
  },
  {
    slug: 'dancing', color: '#F43F5E',
    titles: { lv: 'Dejas', en: 'Dancing' },
    children: [
      { slug: 'salsa', titles: { lv: 'Salsa', en: 'Salsa' } },
      { slug: 'folk-dancing', titles: { lv: 'Tautas dejas', en: 'Folk Dancing' } },
    ]
  },
  {
    slug: 'music', color: '#6366F1',
    titles: { lv: 'Mūzika', en: 'Music' },
    children: [
      { slug: 'rock-school', titles: { lv: 'Rokmūzikas skola', en: 'Rock school' } },
      { slug: 'choirs', titles: { lv: 'Kori', en: 'Choirs' } },
    ]
  },
  {
    slug: 'wellbeing', color: '#14B8A6',
    titles: { lv: 'Veselība un labsajūta', en: 'Health & Wellbeing' },
    children: [
      { slug: 'yoga', titles: { lv: 'Joga', en: 'Yoga' } },
      { slug: 'meditation', titles: { lv: 'Meditācija', en: 'Meditation' } },
    ]
  },
  {
    slug: 'art', color: '#D946EF',
    titles: { lv: 'Māksla un kultūra', en: 'Art & Culture' },
    children: [
      { slug: 'painting', titles: { lv: 'Gleznošana', en: 'Painting' } },
      { slug: 'writing', titles: { lv: 'Rakstīšana', en: 'Writing' } },
    ]
  },
  {
    slug: 'pets', color: '#84CC16',
    titles: { lv: 'Mājdzīvnieki', en: 'Pets & Animals' },
    children: [
      { slug: 'dog-owners', titles: { lv: 'Suņu īpašnieki', en: 'Dog owners' } },
    ]
  },
  {
    slug: 'religion', color: '#64748B',
    titles: { lv: 'Reliģija un garīgums', en: 'Religion & Spirituality' },
    children: [
      { slug: 'prayer-groups', titles: { lv: 'Lūgšanu grupas', en: 'Prayer groups' } },
    ]
  },
  {
    slug: 'family', color: '#0EA5E9',
    titles: { lv: 'Vecāki un ģimene', en: 'Parents & Family' },
    children: [
      { slug: 'young-parents', titles: { lv: 'Jauno vecāku kolektīvs', en: 'Young Parent Collective' } },
    ]
  },
  {
    slug: 'politics', color: '#EF4444',
    titles: { lv: 'Kustības un politika', en: 'Movements & Politics' },
    children: [
      { slug: 'civic-activism', titles: { lv: 'Pilsoniskais aktīvisms', en: 'Civic activism' } },
    ]
  },
  {
    slug: 'community', color: '#22C55E',
    titles: { lv: 'Kopiena un vide', en: 'Community & Environment' },
    children: [
      { slug: 'cleanup', titles: { lv: 'Apkārtnes sakopšana', en: 'Neighbourhood cleanup' } },
      { slug: 'volunteering', titles: { lv: 'Brīvprātīgais darbs', en: 'Volunteering' } },
    ]
  }
];

// --- Helper ---
function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

const days = (n: number) => { const d = new Date(); d.setDate(d.getDate() + n); return d; };

async function main() {
  console.log('🌱 Seeding taxonomy...');

  const categoryIdBySlug: Record<string, string> = {};
  const l1IdByL2Slug: Record<string, string> = {};

  for (const l1 of TAXONOMY) {
    const createdL1 = await prisma.category.upsert({
      where: { slug: l1.slug },
      update: { color: l1.color },
      create: {
        slug: l1.slug, level: 1, color: l1.color,
        titles: { create: [{ lang: 'lv', title: l1.titles.lv }, { lang: 'en', title: l1.titles.en }] },
      },
    });
    categoryIdBySlug[l1.slug] = createdL1.id;
    l1IdByL2Slug[l1.slug] = createdL1.id; // map L1 to itself

    for (const l2 of l1.children) {
      const createdL2 = await prisma.category.upsert({
        where: { slug: l2.slug },
        update: {},
        create: {
          slug: l2.slug, level: 2, parentId: createdL1.id,
          titles: { create: [{ lang: 'lv', title: l2.titles.lv }, { lang: 'en', title: l2.titles.en }] },
        },
      });
      categoryIdBySlug[l2.slug] = createdL2.id;
      l1IdByL2Slug[l2.slug] = createdL1.id; // map L2 to L1


    }
  }

  // ─── Users ───────────────────────────────────────────────────────────────────
  console.log('👤 Seeding users...');

  const users = await Promise.all([
    prisma.user.upsert({ where: { email: 'oskars@local' }, update: {}, create: { email: 'oskars@local', name: 'Oskars Bērziņš', username: 'oskars_b', bio: 'Outdoor enthusiast and hiking guide.', cities: ['Riga', 'Sigulda'], image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Oskars' } }),
    prisma.user.upsert({ where: { email: 'liga@local' }, update: {}, create: { email: 'liga@local', name: 'Līga Kalniņa', username: 'liga_k', bio: 'Yoga instructor and nature lover.', cities: ['Jurmala', 'Riga'], image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Liga' } }),
    prisma.user.upsert({ where: { email: 'andris@local' }, update: {}, create: { email: 'andris@local', name: 'Andris Ozols', image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Andris' } }),
    prisma.user.upsert({ where: { email: 'marta@local' }, update: {}, create: { email: 'marta@local', name: 'Marta Liepiņa', image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marta' } }),
    prisma.user.upsert({ where: { email: 'janis@local' }, update: {}, create: { email: 'janis@local', name: 'Jānis Krūmiņš', image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Janis' } }),
    prisma.user.upsert({ where: { email: 'anna@local' }, update: {}, create: { email: 'anna@local', name: 'Anna Zariņa', image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Anna' } }),
    prisma.user.upsert({ where: { email: 'toms@local' }, update: {}, create: { email: 'toms@local', name: 'Toms Siliņš', image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Toms' } }),
    prisma.user.upsert({ where: { email: 'santa@local' }, update: {}, create: { email: 'santa@local', name: 'Santa Pētersone', image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Santa' } }),
    // legacy
    prisma.user.upsert({ where: { email: 'user@local' }, update: {}, create: { email: 'user@local', name: 'Regular User', image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user' } }),
    prisma.user.upsert({ where: { email: 'owner@local' }, update: {}, create: { email: 'owner@local', name: 'Group Owner', image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=owner' } }),
    prisma.user.upsert({ where: { email: 'admin@local' }, update: {}, create: { email: 'admin@local', name: 'Site Admin', image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin' } }),
    prisma.user.upsert({ where: { email: 'member@local' }, update: {}, create: { email: 'member@local', name: 'Group Member', image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=member' } }),
    prisma.user.upsert({ where: { email: 'test@example.com' }, update: {}, create: { email: 'test@example.com', name: 'Oskars Test', image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=OskarsTest' } }),
  ]);

  const [oskars, liga, andris, marta, janis, anna, toms, santa] = users;

  // ─── Cleanup ──────────────────────────────────────────────────────────────────
  console.log('🧹 Clearing existing data...');
  await prisma.post.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.event.deleteMany();
  await prisma.membership.deleteMany();
  await prisma.applicationMessage.deleteMany();
  await prisma.group.deleteMany();

  // ─── Groups ───────────────────────────────────────────────────────────────────
  console.log('👥 Seeding groups...');

  type GroupSeed = {
    slug: string; name: string; description: string;
    city: string; category: string; type?: 'PUBLIC' | 'PRIVATE' | 'SINGLE_EVENT';
    bannerImage?: string;
    instructions?: string;
    accentColor?: string;
    discordLink?: string;
    instagramLink?: string;
    websiteLink?: string;
    owner: typeof oskars;
    members: { user: typeof oskars; role: 'ADMIN' | 'MEMBER' | 'PENDING' }[];
  };

  const groupSeeds: GroupSeed[] = [
    {
      slug: 'pargajieni-riga', name: 'Rīgas Pārgājēji', category: 'hiking',
      description: 'Iknedēļas pārgājieni pa Latvijas skaistākajām takām. Visi gaidīti — no iesācējiem līdz pieredzējušiem tūristiem!',
      bannerImage: 'https://picsum.photos/seed/pargajieni/1200/400',
      instructions: 'Tikšanās vieta: Rīgas Centrālā stacija (pulkstenis). Līdzi ņemt ērtus apavus un ūdeni.',
      accentColor: '#10B981',
      discordLink: 'https://discord.gg/pargajieni',
      instagramLink: 'https://instagram.com/rigas_pargajieji',
      websiteLink: 'https://pargajieni.lv',
      city: 'Riga', owner: oskars,
      members: [
        { user: liga, role: 'ADMIN' },
        { user: andris, role: 'MEMBER' },
        { user: anna, role: 'MEMBER' },
        { user: santa, role: 'PENDING' }
      ],
    },
    {
      slug: 'running-riga', name: 'Rīgas Skrējēji', category: 'running',
      description: 'Kopīgas rieta skrējiens Mežaparkā un Uzvaras parkā. Katru rītu plkst. 7:00. Visi tempi laipni gaidīti!',
      bannerImage: 'https://picsum.photos/seed/running/1200/400',
      instructions: 'Sākam precīzi 7:05. WhatsApp grupa operatīvai saziņai.',
      accentColor: '#3B82F6',
      instagramLink: 'https://instagram.com/riga_runners',
      city: 'Riga', owner: andris,
      members: [
        { user: marta, role: 'MEMBER' },
        { user: toms, role: 'MEMBER' },
        { user: janis, role: 'MEMBER' },
        { user: santa, role: 'MEMBER' }
      ],
    },
    {
      slug: 'boardgames-riga', name: 'Galda Spēļu Klubs Rīga', category: 'boardgames',
      description: 'Tikamies katru piektdienas vakaru, lai spēlētu galda spēles. Paši piedāvājam Catan, Ticket to Ride, Wingspan un daudz ko citu.',
      bannerImage: 'https://picsum.photos/seed/boardgames/1200/400',
      instructions: 'Gathering at "Lude" cafe. Support the venue by ordering a drink.',
      accentColor: '#8B5CF6',
      discordLink: 'https://discord.gg/rigagames',
      city: 'Riga', owner: toms,
      members: [
        { user: santa, role: 'ADMIN' },
        { user: oskars, role: 'MEMBER' }
      ],
    },
    {
      slug: 'yoga-jurmala', name: 'Jūrmalas Jogas Kopiena', category: 'yoga',
      description: 'Dvēseles un ķermeņa harmonija pie jūras. Nodarbības pludmalē vasarā, zālē ziemā. Visiem līmeņiem.',
      bannerImage: 'https://picsum.photos/seed/yoga/1200/400',
      accentColor: '#14B8A6',
      city: 'Jurmala', owner: liga,
      members: [{ user: marta, role: 'MEMBER' }, { user: anna, role: 'MEMBER' }],
    },
    {
      slug: 'gleznieciba-riga', name: 'Rīgas Glezniecības Studija', category: 'painting',
      description: 'Kopīgas gleznošanas sesijas visiem līmeņiem. Materiālus nodrošinām. Vīns atļauts! 🍷',
      bannerImage: 'https://picsum.photos/seed/painting/1200/400',
      instructions: 'Materials provided. Feel free to bring your own inspiration.',
      accentColor: '#D946EF',
      city: 'Riga', owner: anna,
      members: [{ user: marta, role: 'ADMIN' }, { user: liga, role: 'MEMBER' }],
    },
    {
      slug: 'foto-valmiera', name: 'Vidzemes Fotografi', category: 'photography',
      description: 'Kopīgas fotosesijas dabā un pilsētā. Dalāmies zināšanās, kritizējam labvēlīgi.',
      bannerImage: 'https://picsum.photos/seed/photography/1200/400',
      accentColor: '#F97316',
      city: 'Valmiera', owner: janis,
      members: [{ user: andris, role: 'MEMBER' }, { user: toms, role: 'MEMBER' }],
    },
    {
      slug: 'salsa-riga', name: 'Rīgas Salsa Deju Klubs', category: 'salsa',
      description: 'Karstās kubāņu ritmi Rīgas sirdī! Nodarbības iesācējiem un pieredzējušiem katru trešdienu un sestdienu.',
      bannerImage: 'https://picsum.photos/seed/salsa/1200/400',
      accentColor: '#F43F5E',
      city: 'Riga', owner: marta,
      members: [{ user: anna, role: 'MEMBER' }, { user: liga, role: 'MEMBER' }],
    },
    {
      slug: 'cycling-cesis', name: 'Cēsu Riteņbraucēji', category: 'cycling',
      description: 'Nedēļas nogales braucieni pa Vidzemes bezceļiem un grants ceļiem.',
      bannerImage: 'https://picsum.photos/seed/cycling/1200/400',
      accentColor: '#3B82F6',
      city: 'Cesis', owner: toms,
      members: [{ user: janis, role: 'ADMIN' }],
    },
    {
      slug: 'kino-daugavpils', name: 'Daugavpils Kino Vakari', category: 'movie-nights',
      description: 'Katru svētdienu kopīgi skatāmies filmu un diskutējam.',
      bannerImage: 'https://picsum.photos/seed/movies/1200/400',
      accentColor: '#EC4899',
      city: 'Daugavpils', owner: santa,
      members: [{ user: anna, role: 'MEMBER' }],
    },
    {
      slug: 'english-riga', name: 'English Speaking Club Riga', category: 'languages',
      description: 'Practice your English in a friendly, welcoming environment.',
      bannerImage: 'https://picsum.photos/seed/languages/1200/400',
      accentColor: '#F59E0B',
      city: 'Riga', owner: liga,
      members: [{ user: oskars, role: 'MEMBER' }, { user: andris, role: 'MEMBER' }],
    },
    {
      slug: 'brivpratigais-riga', name: 'Rīgas Brīvprātīgie', category: 'volunteering',
      description: 'Kopā darām Rīgu labāku! Organizējam pasākumus, palīdzam tiem, kam tā vajadzīga.',
      bannerImage: 'https://picsum.photos/seed/volunteering/1200/400',
      accentColor: '#22C55E',
      city: 'Riga', owner: andris,
      members: [{ user: anna, role: 'ADMIN' }, { user: liga, role: 'MEMBER' }],
    },
    {
      slug: 'koris-riga', name: 'Rīgas Pilsētas Koris', category: 'choirs',
      description: 'Draudzīgs amatieru koris, kurš mēdz uzstāties pilsētas svētkos.',
      bannerImage: 'https://picsum.photos/seed/choir/1200/400',
      accentColor: '#6366F1',
      city: 'Riga', owner: santa,
      members: [{ user: liga, role: 'ADMIN' }, { user: marta, role: 'MEMBER' }],
    },
    {
      slug: 'camping-sigulda', name: 'Siguldas Dabas Draugi', category: 'camping',
      description: 'Kempinga ekskursijas un nakšņošana dabā.',
      bannerImage: 'https://picsum.photos/seed/camping/1200/400',
      accentColor: '#10B981',
      city: 'Sigulda', owner: oskars,
      members: [{ user: andris, role: 'ADMIN' }, { user: janis, role: 'MEMBER' }],
    },
    {
      slug: 'meditatija-riga', name: 'Rīgas Meditācijas Centrs', category: 'meditation',
      description: 'Nedēļas vadītās meditācijas sesijas un mindfulness apmācības.',
      bannerImage: 'https://picsum.photos/seed/meditation/1200/400',
      accentColor: '#14B8A6',
      city: 'Riga', owner: liga,
      members: [{ user: santa, role: 'MEMBER' }],
    },
    {
      slug: 'sakopsana-valmiera', name: 'Valmiera Zaļā', category: 'cleanup',
      description: 'Regulāras talkas Valmierā un apkārtnē.',
      bannerImage: 'https://picsum.photos/seed/cleanup/1200/400',
      accentColor: '#22C55E',
      city: 'Valmiera', owner: andris,
      members: [{ user: janis, role: 'MEMBER' }],
    },
    {
      slug: 'rakstnieki-riga', name: 'Rīgas Rakstnieku Pulciņš', category: 'writing',
      description: 'Draudzīgs pulciņš rakstošiem cilvēkiem.',
      bannerImage: 'https://picsum.photos/seed/writing/1200/400',
      accentColor: '#D946EF',
      city: 'Riga', owner: marta,
      members: [{ user: liga, role: 'MEMBER' }],
    },
    {
      slug: 'suni-jurmala', name: 'Jūrmalas Suņu Klubs', category: 'dog-owners',
      description: 'Kopīgas pastaigas ar suņiem Jūrmalas pludmalē un mežā.',
      bannerImage: 'https://picsum.photos/seed/dogs/1200/400',
      accentColor: '#84CC16',
      city: 'Jurmala', owner: marta,
      members: [{ user: anna, role: 'MEMBER' }],
    },
    {
      slug: 'jaunavecaki-riga', name: 'Jauno Vecāku Kopiena Rīgā', category: 'young-parents',
      description: 'Atbalsts un draudzība jaunajiem vecākiem.',
      bannerImage: 'https://picsum.photos/seed/family/1200/400',
      accentColor: '#0EA5E9',
      city: 'Riga', owner: anna,
      members: [{ user: liga, role: 'MEMBER' }],
    },
    {
      slug: 'pc-games-liepaja', name: 'Liepājas LAN Party', category: 'pc-games',
      description: 'Regulāras LAN parties Liepājā.',
      bannerImage: 'https://picsum.photos/seed/pc-games/1200/400',
      accentColor: '#8B5CF6',
      city: 'Liepaja', owner: janis,
      members: [{ user: toms, role: 'MEMBER' }],
    },
    {
      slug: 'pargajieni', name: 'Pārgājieni', category: 'hiking',
      description: 'Testa grupa pārgājieniem un dabas mīļotājiem. Pievienojies mums!',
      bannerImage: 'https://picsum.photos/seed/hiking-test/1200/400',
      accentColor: '#10B981',
      city: 'Riga', owner: oskars,
      members: [{ user: liga, role: 'ADMIN' }],
    }
  ];

  const groupIdBySlug: Record<string, string> = {};

  for (const g of groupSeeds) {
    const originalCatId = categoryIdBySlug[g.category];
    const l1CatId = l1IdByL2Slug[g.category];

    if (!originalCatId || !l1CatId) { console.warn(`  ⚠️  Category not found: ${g.category}`); continue; }

    const properSlug = slugify(g.name);

    const group = await prisma.group.create({
      data: {
        name: g.name, slug: properSlug, description: g.description,
        city: g.city, categoryId: l1CatId, type: g.type ?? 'PUBLIC',
        bannerImage: g.bannerImage,
        instructions: g.instructions,
        accentColor: g.accentColor,
        discordLink: g.discordLink,
        instagramLink: g.instagramLink,
        websiteLink: g.websiteLink,
        tags: originalCatId !== l1CatId ? { connect: [{ id: originalCatId }] } : undefined,
        members: {
          create: [
            { userId: g.owner.id, role: 'OWNER' },
            ...g.members.map(m => ({ userId: m.user.id, role: m.role })),
          ],
        },
      },
    });
    groupIdBySlug[g.slug] = group.id;
    console.log(`  ✓ ${g.name}`);
  }

  // ─── Events ───────────────────────────────────────────────────────────────────
  console.log('📅 Seeding events...');

  type EventSeed = {
    title: string; description: string; location: string;
    startDate: Date; groupSlug: string; creator: typeof oskars;
  };

  const eventSeeds: EventSeed[] = [
    // Pārgājieni Rīgā
    { title: 'Ķemeru purvājs – pavasara taka', description: 'Dosimies apkārt Ķemeru lielajam purvam un apskatīsim pavasara putnus. Maršruts ~12km, vidēja grūtības pakāpe.', location: 'Ķemeri, Jūrmala', startDate: days(3), groupSlug: 'pargajieni-riga', creator: oskars },
    { title: 'Rīgas kanāls – vakara pastaiga', description: 'Viegla vakara pastaiga pa Rīgas centra parkiem un kanāla malām. Beigsim ar kafejnīcas apmeklējumu.', location: 'Vērmanes dārzs, Rīga', startDate: days(10), groupSlug: 'pargajieni-riga', creator: liga },
    { title: 'Gauja – Sigulda uz Cēsīm', description: 'Vienas dienas pārgājiens pa Gaujas ielejas taku. ~20km, labs solis vajadzīgs!', location: 'Sigulda (starts/finishes Cēsis)', startDate: days(17), groupSlug: 'pargajieni-riga', creator: oskars },

    // Running Riga
    { title: 'Mežaparka rieta skrējiens', description: 'Kopīgs 10km skrējiens pa Mežaparku. Temps ~5:30min/km. Siltināties plkst. 6:55.', location: 'Mežaparks, Rīga', startDate: days(2), groupSlug: 'running-riga', creator: andris },
    { title: 'Uzvaras parka 5K', description: 'Vieglāks 5km skrējiens Uzvaras parkā. Pieejams visiem tempiem, iesācēji gaidīti!', location: 'Uzvaras parks, Rīga', startDate: days(7), groupSlug: 'running-riga', creator: marta },
    { title: 'Rīgas pusmaratona treniņš', description: 'Garāks 21km treniņskrējiens pa Daugavas upes malu, gatavojamies Rīgas pusmaratonam.', location: 'Akmens tilts, Rīga', startDate: days(14), groupSlug: 'running-riga', creator: andris },

    // Boardgames
    { title: 'Catan čempionāts', description: 'Virsotnes turnīrs Catan spēlē! Balva labākajiem. Reģistrēties iepriekš.', location: 'Kafejnīca Labums, Rīga', startDate: days(5), groupSlug: 'boardgames-riga', creator: toms },
    { title: 'Eksperimentālo spēļu vakars', description: 'Izmēģinām jaunākās izdevniecības spēles. Šoreiz – Wingspan Europe un Ark Nova.', location: 'Kafejnīca Labums, Rīga', startDate: days(12), groupSlug: 'boardgames-riga', creator: santa },

    // Yoga
    { title: 'Rīta joga pie jūras', description: 'Terapeitiskā joga uzlecošās saules gaismā. Paklāji pieejami. Apģērbs – brīvs un ērts.', location: 'Majori pludmale, Jūrmala', startDate: days(4), groupSlug: 'yoga-jurmala', creator: liga },
    { title: 'Restoratīvā joga – pilnmēness nakts', description: 'Pilnmēness joga vakars ar meditāciju un skaņu dziedināšanu.', location: 'Dzintari, Jūrmala', startDate: days(15), groupSlug: 'yoga-jurmala', creator: marta },

    // Painting
    { title: 'Akvareļu vakars – pilsētas skati', description: 'Gleznojam Rīgas vecpilsētu ar akvareļiem. Visi materiāli iekļauti. Vīna glāze – atsevišķi!', location: 'Mākslas studija Radošie, Rīga', startDate: days(6), groupSlug: 'gleznieciba-riga', creator: anna },
    { title: 'Eļļas glezniecība iesācējiem', description: 'Iemācāmies eļļas gleznošanas pamatus. 3 stundu darbnīca ar pasniedzēju.', location: 'Mākslas studija Radošie, Rīga', startDate: days(20), groupSlug: 'gleznieciba-riga', creator: marta },

    // Photography
    { title: 'Gaismēnu fotografēšana rītausmā', description: 'Ceļamies agri un ķeram maģisku gaismu Valmierā un apkārtnē. Iesācēji gaidīti!', location: 'Valmiera tilts, Valmiera', startDate: days(3), groupSlug: 'foto-valmiera', creator: janis },
    { title: 'Pilsētas ielu fotogrāfija', description: 'Street photography ekspedīcija pa Valmierpu centru. Dalāmies rezultātos grupas chat.', location: 'Valmiera centrs', startDate: days(11), groupSlug: 'foto-valmiera', creator: andris },

    // Salsa
    { title: 'Salsa iesācēju intensīvais kurss', description: '3 stundu iesācēju kurss – pamati, ritms, pāra kustības. Partneri nav nepieciešami!', location: 'Deju studija Ritms, Rīga', startDate: days(4), groupSlug: 'salsa-riga', creator: marta },
    { title: 'Bachatata nakts', description: 'Salsa & Bachata sociālās dejas vakars. DJ, dzīvā mūzika, laba atmosfēra!', location: 'Klubs Siesta, Rīga', startDate: days(9), groupSlug: 'salsa-riga', creator: anna },

    // Cycling
    { title: 'Gaujas ielejā ar grusvelu', description: 'Gravel riteņbrauciens pa Gaujas ielejas grants ceļiem. 60km, vidējs temps.', location: 'Cēsis, starts pie velo bāzes', startDate: days(6), groupSlug: 'cycling-cesis', creator: toms },
    { title: 'Velo pikniks – Cēsu apkārtne', description: 'Relaksēts brauciens uz piknika vietu Cēsu mežos. 25km kopā.', location: 'Cēsis centrs', startDate: days(13), groupSlug: 'cycling-cesis', creator: janis },

    // Movie nights
    { title: 'Kinokluba vakars – franču kino', description: 'Skatāmies klasiku: "Amélie" (2001). Diskusija pēc filmas. Ienest savu ēdienu atļauts!', location: 'Kultūras nams, Daugavpils', startDate: days(7), groupSlug: 'kino-daugavpils', creator: santa },
    { title: 'Svētku filmas maratons', description: 'Trīs filmas vienā vakarā – romantiskas komēdijas tematiskā mēnesī.', location: 'Kultūras nams, Daugavpils', startDate: days(21), groupSlug: 'kino-daugavpils', creator: santa },

    // English club
    { title: 'English Debate Night: AI & Society', description: 'Structured debate on AI impact on jobs and creativity. All levels welcome – we adapt pace!', location: 'Cafe Griezums, Riga', startDate: days(5), groupSlug: 'english-riga', creator: liga },
    { title: 'Pronunciation & Accent Workshop', description: 'A friendly workshop focused on common pronunciation pitfalls for Latvian speakers.', location: 'Cafe Griezums, Riga', startDate: days(12), groupSlug: 'english-riga', creator: oskars },

    // Volunteering
    { title: 'Talka Rīgas kanāla krastos', description: 'Sakopjam kanāla malu pie Esplanādes. Cimdus un maisus nodrošinām. Atnāc tā kā atnāc!', location: 'Kanālmala, Rīga', startDate: days(8), groupSlug: 'brivpratigais-riga', creator: andris },
    { title: 'Palīdzām pensionāriem – kopienas diena', description: 'Palīdzam vecāka gadagājuma cilvēkiem ar ikdienas darbiem. Reģistrēties iepriekš.', location: 'Pļavnieki, Rīga', startDate: days(15), groupSlug: 'brivpratigais-riga', creator: anna },

    // Choirs
    { title: 'Dziesmu svētku repertuāra mēģinājums', description: 'Gatavošanās Latvijas Dziesmu svētkiem – kopīgs repertuāra mēģinājums.', location: 'Rīgas 1. mūzikas skola', startDate: days(3), groupSlug: 'koris-riga', creator: santa },
    { title: 'Labdarības Ziemassvētku koncerts', description: 'Labdarības koncerts par labu bērnu slimnīcai. Atnāciet un atbalstiet!', location: 'Doma baznīca, Rīga', startDate: days(30), groupSlug: 'koris-riga', creator: liga },

    // Camping
    { title: 'Lieldienu kempings Gaujas ielejā', description: 'Trīs dienu kempings Gaujas nacionālajā parkā. Vietas ierobežotas – rezervē laicīgi!', location: 'Gaujas nacionālais parks', startDate: days(8), groupSlug: 'camping-sigulda', creator: oskars },
    { title: 'Naksnīgā laipa – pusnakts stars', description: 'Nakts pārgājiens ar blaušanu un naktsmājiņu mežā. Aprīkojuma saraksts tiek sūtīts.', location: 'Sigulda', startDate: days(22), groupSlug: 'camping-sigulda', creator: andris },

    // Meditation
    { title: 'Rīta meditācija – mierīgas sākums', description: '30 minūšu vadīta meditācija rīta cēlienā. Tēja pēc sesijas. Iegūstiet dienas enerģiju!', location: 'Zen centrs, Rīga', startDate: days(2), groupSlug: 'meditatija-riga', creator: liga },
    { title: 'Pilnmēness vizualizācija', description: 'Garāka 90 minūšu meditācija ar pilnmēness noslēpumu tematiku. Sveļas un sveces.', location: 'Zen centrs, Rīga', startDate: days(16), groupSlug: 'meditatija-riga', creator: santa },

    // Cleanup
    { title: 'Pavasara talka Valmierā', description: 'Pilsētas pavasara lieltā talka – sakopjam parkus un ielas kopā. Kafija un maizītes – nodrošinātas!', location: 'Raiņa parks, Valmiera', startDate: days(5), groupSlug: 'sakopsana-valmiera', creator: andris },

    // Writing
    { title: 'Rakstīšanas maratons – 24h', description: 'NaNoWriMo iedvesmota rakstīšanas nakts. Ierodies brīdī, kad vēlies, raksti, ko gribi!', location: 'Bibliotēka, Rīga', startDate: days(11), groupSlug: 'rakstnieki-riga', creator: marta },

    // Dog owners
    { title: 'Suņu svētki Jūrmalā', description: 'Lielais suņu satikšanās pasākums Jūrmalas pludmalē. Sacensības, fotokonkurss un balvas!', location: 'Bulduri pludmale, Jūrmala', startDate: days(9), groupSlug: 'suni-jurmala', creator: marta },

    // Young parents
    { title: 'Bērnu un vecāku parks – sestdiena', description: 'Kopīga pastaiga ar rati-kārtis pa Mežaparku. Iepazīstāmies, dalāmies padomos.', location: 'Mežaparks, Rīga', startDate: days(4), groupSlug: 'jaunavecaki-riga', creator: anna },

    // LAN Party
    { title: 'Liepājas LAN Party #12', description: '24h LAN party Liepājā! CS2, Dota, un jūsu izvēle. Ienest savu datoru. Vietu limits: 40.', location: 'IT hubs Liepāja', startDate: days(14), groupSlug: 'pc-games-liepaja', creator: janis },

    // Legacy
    { title: 'Siguldas zelta rudens', description: 'Dosimies rudenīgā pārgājienā pa Siguldas takām.', location: 'Siguldas stacija', startDate: days(2), groupSlug: 'pargajieni', creator: oskars },
    { title: 'Vakara pastaiga gar jūru', description: 'Relaksējoša pastaiga Jūrmalas pludmalē.', location: 'Majori', startDate: days(7), groupSlug: 'pargajieni', creator: liga },
  ];

  // Clear and re-create events & posts each run so dates stay fresh
  console.log('📅 Seeding events...');
  const slugsToSeed = eventSeeds.map(e => e.groupSlug).filter(Boolean);
  const groupIdsToClean = slugsToSeed.map(s => groupIdBySlug[s]).filter(Boolean);
  await prisma.event.deleteMany({ where: { groupId: { in: groupIdsToClean } } });
  await prisma.post.deleteMany({ where: { groupId: { in: groupIdsToClean } } });

  const eventCreateData = eventSeeds
    .map(e => {
      const groupId = groupIdBySlug[e.groupSlug];
      if (!groupId) { console.warn(`  ⚠️ Group not found: ${e.groupSlug}`); return null; }
      return {
        title: e.title,
        slug: slugify(e.title),
        description: e.description,
        location: e.location,
        startDate: e.startDate,
        groupId,
        creatorId: e.creator.id,
        bannerImage: `https://picsum.photos/seed/${e.groupSlug}/1200/400`,
        instructions: 'Please be on time and bring a positive attitude!'
      };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  await prisma.event.createMany({ data: eventCreateData });


  // ─── Discussion Posts ─────────────────────────────────────────────────────────
  console.log('💬 Seeding posts...');

  const postSeeds: { content: string; author: typeof oskars; groupSlug: string }[] = [
    { content: 'Sveiki visiem! Prieks redzēt, ka grupa aug. Kad plānots nākamais pārgājiens?', author: andris, groupSlug: 'pargajieni-riga' },
    { content: 'Pagājušajā nedēļā Ķemeri bija fantastiski – putni dziedāja un sūnas spīdēja! Ieteiktu visiem apmeklēt.', author: liga, groupSlug: 'pargajieni-riga' },
    { content: 'Vai kāds zinās, kur var atrast labas apavu soles pārgājieniem? Mani vecās vairs neder 😅', author: oskars, groupSlug: 'pargajieni-riga' },

    { content: 'Šorīt 7km Mežaparkā – 28:40! Personīgais rekords! 🎉 Paldies grupai par motivāciju!', author: marta, groupSlug: 'running-riga' },
    { content: 'Atgādinām – sestdien ir 18km garais treniņskrējiens. Ūdeni ņemiet līdzi!', author: andris, groupSlug: 'running-riga' },

    { content: 'Pagājušā piektdienas Catan turnīrs bija episkāks par gaidīto! Nākamo plānojam jau drīzumā.', author: santa, groupSlug: 'boardgames-riga' },
    { content: 'Vai kāds vēlas pievienoties Wingspan spēlei šodien vakarā? Ir vieta 4. spēlētājam!', author: toms, groupSlug: 'boardgames-riga' },

    { content: 'Vakara joga pie jūras šodien bija maģiska 🌅 Paldies Līgai par skaisto nodarbību!', author: marta, groupSlug: 'yoga-jurmala' },
    { content: 'Nākamreiz ienestu papildus jogas paklāju jaunpienācējiem – vai varam organizēt?', author: anna, groupSlug: 'yoga-jurmala' },

    { content: 'Šī nedēļa gleznošanas studijā bija intensīva – bet rezultāts ir tā vērts! Skatiet foto pievienoto 🎨', author: anna, groupSlug: 'gleznieciba-riga' },
    { content: 'Jautājums – vai eļļas krāsas var mazgāt ar sauļošanās krēmu? Jautāju drauga vārdā 😂', author: janis, groupSlug: 'gleznieciba-riga' },

    { content: 'Rīta gaisma šodien pie Valmierpes tilta bija neticama! Augšuplādēju galeriju grupas albumā.', author: janis, groupSlug: 'foto-valmiera' },
    { content: 'Vai kāds ieteiktu labu Lightroom preset komplektu Latvijas ainavu fotogrāfijai?', author: andris, groupSlug: 'foto-valmiera' },

    { content: '¡Muy caliente! Pagājušnakts bachata vakars bija lielisks. Atgriezīsimies nākammēnes!', author: marta, groupSlug: 'salsa-riga' },
    { content: 'Iesācēju kurss sestdien – ir vēl 3 brīvas vietas! Nāc un mēģini, pirmo reizi nav jābaidās.', author: anna, groupSlug: 'salsa-riga' },

    { content: 'Pagājušā brauciena Gaujas ieleja foto jau augšuplādētas! 87km pa granti – tas bija episkais!', author: toms, groupSlug: 'cycling-cesis' },

    { content: 'Amélie filma bija dzejas pilna! Nākamreiz gaidām jūs lielākā skaitā 🥐', author: santa, groupSlug: 'kino-daugavpils' },

    { content: 'Last Tuesday\'s debate was fantastic! The arguments about AI replacing artists were really thought-provoking.', author: oskars, groupSlug: 'english-riga' },
    { content: 'Does anyone have good podcast recommendations for improving British English accent?', author: marta, groupSlug: 'english-riga' },

    { content: 'Talka kanāla krastos bija lieliska! Savācām 14 maisus atkritumu. Paldies visiem biedriem!', author: anna, groupSlug: 'brivpratigais-riga' },

    { content: 'Mēģinājums vakar noritēja fantastiski – esam gatavi Dziesmu svētkiem! 🎵', author: liga, groupSlug: 'koris-riga' },

    { content: 'Suņu svētku pasākums bija fantastisks! Mans Mango ieguva 2. vietu skaistākā aste konkursā 🐾', author: santa, groupSlug: 'suni-jurmala' },
  ];

  const postCreateData = postSeeds
    .map(p => {
      const groupId = groupIdBySlug[p.groupSlug];
      if (!groupId) return null;
      return { content: p.content, authorId: p.author.id, groupId };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  await prisma.post.createMany({ data: postCreateData });

  console.log('✅ Seeding complete!');
  console.log(`   ${groupSeeds.length} groups · ${eventSeeds.length} events · ${postSeeds.length} posts`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });

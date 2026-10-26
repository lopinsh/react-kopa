import type { DemoGroup } from './types';

const u = (...keys: string[]) => keys.map((k) => `demo_${k}`);

export const ART_GROUPS: DemoGroup[] = [
  {
    slug: 'krasu-lietus-gleznotaji',
    l2: 'painting',
    name: 'Krāsu lietus gleznotāji',
    city: 'Riga',
    lookingFor: 'Kāds, kas nebaidās no ļoti spilgtas zilās',
    ageDays: 58,
    owner: 'demo_rozes_arturs',
    members: u('tintes_karlis', 'lapsu_anna', 'saules_ilze', 'migla_ruta', 'zeltainais_gatis'),
    tagline: {
      lv: 'Gleznojam kopā, kamēr ārā līst, un neviens nesaka, ka tas nav īsts mākslas darbs.',
      en: 'We paint together while it rains outside, and nobody says it is not real art.',
    },
    about: {
      lv: '<p>Reizi nedēļā noliekam molbertus pie loga un gleznojam to, ko redzam vai neredzam. Otas, krāsas un pacietība ir kopīgas.</p>',
      en: '<p>Once a week we set easels by the window and paint what we see or do not see. Brushes, paints and patience are shared.</p>',
    },
    second: {
      title: { lv: 'Ko ņemt līdzi', en: 'What to bring' },
      body: {
        lv: '<p>Vecas drēbes, kuras var notraipīt, un vienu lietu, ko gribi iemūžināt. Pārējo sagādājam.</p>',
        en: '<p>Old clothes that can take a stain, and one thing you want to capture. We provide the rest.</p>',
      },
    },
    events: [
      {
        title: { lv: 'Lietus gleznošanas vakars', en: 'Rainy painting evening' },
        description: {
          lv: 'Gleznojam pēc dabas pie loga. Ja nelīst, iztēlojamies, ka līst.',
          en: 'We paint from life by the window. If it is not raining, we imagine that it is.',
        },
        location: 'Kāda dzīvokļa darbnīca, Miera iela',
        inDays: 5, hour: 18, hours: 3,
        going: u('tintes_karlis', 'lapsu_anna', 'saules_ilze'),
      },
      {
        title: { lv: 'Plenērs pie upes', en: 'Open-air session by the river' },
        description: {
          lv: 'Dienas plenērs krastmalā. Pusdienas ņemam līdzi un ēdam starp otām.',
          en: 'A daytime session on the riverbank. We bring lunch and eat between brushstrokes.',
        },
        location: 'Daugavas krastmala pie vecās pilsētas',
        inDays: 18, hour: 11, hours: 4,
        going: u('migla_ruta', 'zeltainais_gatis', 'tintes_karlis'),
      },
    ],
    posts: [
      { title: 'Krāsas sagādātas', content: 'Jaunas zilās un dzeltenās krāsas ir pie loga. Vēl var pieteikties uz nākamo vakaru.', daysAgo: 3 },
      { title: 'Izstāde pie loga', content: 'Mūsu darbus uz nedēļu pakārsim kāda kafejnīcas loga priekšā. Visi paši vērtējam.', daysAgo: 13 },
    ],
  },
  {
    slug: 'tintes-pirati',
    l2: 'writing',
    name: 'Tintes pirāti',
    city: 'Riga',
    lookingFor: 'Divi stāstnieki ar atvērtu piezīmju grāmatiņu',
    ageDays: 71,
    owner: 'demo_tintes_karlis',
    members: u('rozes_arturs', 'zvaigznu_marite', 'pelekais_olivers', 'sniega_liene', 'mezu_dace'),
    tagline: {
      lv: 'Rakstām īsus stāstus un lasām tos skaļi, lai piratizētu paši savas idejas.',
      en: 'We write short stories and read them aloud, pirating our own ideas.',
    },
    about: {
      lv: '<p>Katrā tikšanās reizē ir viens uzdevums, desmit minūtes rakstīšanas un tikpat daudz drosmes nolasīt. Kritika ir laipna, bet godīga.</p>',
      en: '<p>Each meeting has one prompt, ten minutes of writing and as much courage to read it out. Feedback is kind but honest.</p>',
    },
    second: {
      title: { lv: 'Mūsu tradīcijas', en: 'Our traditions' },
      body: {
        lv: '<p>Katrs sākam ar vienu vārdu, ko uzdod iepriekšējais rakstnieks. Labākais stāsts saņem tēju bez cukura.</p>',
        en: '<p>Everyone starts with a single word given by the previous writer. The best story wins a cup of tea with no sugar.</p>',
      },
    },
    events: [
      {
        title: { lv: 'Desmit minūšu stāsti', en: 'Ten-minute stories' },
        description: {
          lv: 'Uzdevums, desmit minūtes rakstīšanas un nolasīšana. Beigās balsojam par dīvaināko sākumu.',
          en: 'A prompt, ten minutes of writing and a reading. At the end we vote for the oddest opening.',
        },
        location: 'Kāda grāmatu plaukta istaba, Pārdaugava',
        inDays: 8, hour: 19, hours: 2,
        going: u('rozes_arturs', 'zvaigznu_marite', 'pelekais_olivers'),
      },
      {
        title: { lv: 'Tiešsaistes rediģēšanas vakars', en: 'Online editing evening' },
        description: {
          lv: 'Kopā izlabojam trīs īsus tekstus. Ņem līdzi savu, ja gribi.',
          en: 'We polish three short texts together. Bring your own if you like.',
        },
        isOnline: true,
        location: 'Saite tiks nosūtīta dalībniekiem',
        inDays: 20, hour: 20, hours: 2,
        going: u('sniega_liene', 'mezu_dace'),
      },
      {
        title: { lv: 'Pastaiga pēc sižetiem', en: 'A walk in search of plots' },
        description: {
          lv: 'Ejam pa pilsētu un katrs pierakstām pa vienai nejaušai frāzei no garāmgājējiem.',
          en: 'We walk through town and each jot down one random phrase from passers-by.',
        },
        location: 'Pie pulksteņa pilsētas centrā',
        inDays: 33, hour: 16, hours: 2,
        going: u('pelekais_olivers', 'zvaigznu_marite'),
      },
    ],
    posts: [
      { title: 'Jauns uzdevums gaida', content: 'Nākamajā reizē rakstām par kādu, kas atrod koferi ar nezināmu saturu.', daysAgo: 2 },
      { title: 'Pierakstu burtnīca atrasta', content: 'Brūna burtnīca ar kaķa zīmējumu palikusi pēc tikšanās. Gaida īpašnieku.', daysAgo: 10 },
    ],
  },
  {
    slug: 'aizkulisu-zvaigznes',
    l2: 'theatre',
    name: 'Aizkulišu zvaigznes',
    city: 'Riga',
    lookingFor: 'Kāds, kas var runāt ar skatuves pavalodu',
    ageDays: 44,
    owner: 'demo_zvaigznu_marite',
    members: u('kapteinis_mencis', 'rozes_arturs', 'saules_ilze', 'burbulu_santa', 'dzirkstele_janis', 'ledus_toms'),
    tagline: {
      lv: 'Amatieru teātris bez biļetēm: spēlējam sev un tiem, kas ienāk pa atvērtām durvīm.',
      en: 'An amateur theatre without tickets: we play for ourselves and anyone walking in through the open door.',
    },
    about: {
      lv: '<p>Mēģinām īsas ainas, improvizējam un smejamies pie kļūdām. Lomu sadalām ar vilkšanu no cepures.</p>',
      en: '<p>We rehearse short scenes, improvise and laugh at mistakes. Roles are handed out by drawing from a hat.</p>',
    },
    second: {
      title: { lv: 'Biežāk uzdotie jautājumi', en: 'Frequently asked questions' },
      body: {
        lv: '<p>Vai jābūt pieredzei? Nē. Vai ir kostīmi? Mazliet. Vai drīkst aizmirst tekstu? Tā ir daļa no izrādes.</p>',
        en: '<p>Do I need experience? No. Are there costumes? A few. May I forget my lines? That is part of the show.</p>',
      },
    },
    events: [
      {
        title: { lv: 'Improvizācijas vakars', en: 'Improvisation evening' },
        description: {
          lv: 'Spēles, kas liek smieties un domāt ātri. Nav jāiemācās nekas iepriekš.',
          en: 'Games that make you laugh and think fast. Nothing to learn in advance.',
        },
        location: 'Kāda pagalma telpa, Centrs',
        inDays: 6, hour: 19, hours: 2,
        going: u('kapteinis_mencis', 'rozes_arturs', 'saules_ilze', 'burbulu_santa'),
      },
      {
        title: { lv: 'Mazā izrāde pagalmā', en: 'The small courtyard show' },
        description: {
          lv: 'Trīs īsas ainas pagalmā. Skatītāji sēž uz kastēm, aktieri uz taburetēm.',
          en: 'Three short scenes in a courtyard. Audience on crates, actors on stools.',
        },
        location: 'Pagalms Ģertrūdes ielā',
        inDays: 24, hour: 18, hours: 2,
        going: u('dzirkstele_janis', 'ledus_toms', 'saules_ilze'),
      },
    ],
    posts: [
      { title: 'Cepure atrasta', content: 'Lielā lomu cepure ir atrasta pie ieejas. Lomas tiks vilktas kā parasti.', daysAgo: 4 },
      { title: 'Kostīmu apmaiņa', content: 'Ņem kādu vecu mēteli vai cepuri, un apmainām pret citu. Gaidīsim nākamajā reizē.', daysAgo: 16 },
    ],
  },
  {
    slug: 'mala-meistaru-dzirnavas',
    l2: 'ceramics',
    name: 'Māla meistaru dzirnavas',
    city: 'Sigulda',
    lookingFor: 'Kāds ar pacietību pret izkaltušiem māliem',
    ageDays: 35,
    owner: 'demo_dzirkstele_janis',
    members: u('lapsu_anna', 'sniega_liene', 'migla_ruta', 'mezu_dace', 'vetras_edgars'),
    tagline: {
      lv: 'Veidojam krūzes, bļodas un dīvainus ķirbjus, kas pēc tam nokļūst krāsnī.',
      en: 'We shape mugs, bowls and strange pumpkins that end up in the kiln.',
    },
    about: {
      lv: '<p>Darbnīcā katram ir sava vieta pie galda un kaudze māla. Ikviens aiziet ar kādu nelielu veidojumu, kas ne vienmēr izskatās pēc plāna.</p>',
      en: '<p>In the workshop everyone has a spot at the table and a lump of clay. Everyone leaves with a small piece that does not always look like the plan.</p>',
    },
    second: {
      title: { lv: 'Ko ņemt līdzi', en: 'What to bring' },
      body: {
        lv: '<p>Priekšautu un idejas. Māls un instrumenti ir kopēji. Vēlāk pēc apdedzināšanas vari paņemt savu darbu.</p>',
        en: '<p>An apron and some ideas. Clay and tools are shared. After firing you can pick up your piece.</p>',
      },
    },
    events: [
      {
        title: { lv: 'Pirmā krūze', en: 'The first mug' },
        description: {
          lv: 'Iesācējiem: izveidojam vienkāršu krūzi no pamata. Rokturis ir izaicinājums.',
          en: 'For beginners: we make a simple mug from scratch. The handle is the challenge.',
        },
        location: 'Kāda darbnīca pie dzelzceļa',
        inDays: 9, hour: 17, hours: 3,
        going: u('lapsu_anna', 'sniega_liene', 'migla_ruta'),
      },
      {
        title: { lv: 'Glazēšanas diena', en: 'Glazing day' },
        description: {
          lv: 'Krāsojam jau izdedzinātos darbus. Krāsu izvēle ir ļoti liela.',
          en: 'We paint the already fired pieces. The choice of glazes is very wide.',
        },
        location: 'Kāda darbnīca pie dzelzceļa',
        inDays: 23, hour: 12, hours: 4,
        going: u('mezu_dace', 'vetras_edgars'),
      },
    ],
    posts: [
      { title: 'Krāsns ir karsta', content: 'Šonedēļ apdedzinām pirmo partiju. Lūdzu, atnes visu gatavo līdz otrdienai.', daysAgo: 5 },
      { title: 'Māls sagādāts', content: 'Divi maisi baltā un viens sarkanā māla ir darbnīcā. Pietiks visiem.', daysAgo: 14 },
    ],
  },
];

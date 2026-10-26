import type { DemoGroup } from './types';

const u = (...keys: string[]) => keys.map((k) => `demo_${k}`);

export const COMMUNITY_GROUPS: DemoGroup[] = [
  {
    slug: 'sakopsanas-siksparnu-dienas',
    l2: 'cleanup',
    name: 'Sakopšanas sikspārņu dienas',
    city: 'Cesis',
    lookingFor: 'Cimdi, maisi un divi kaimiņi, kam nav žēl sestdienas',
    ageDays: 46,
    owner: 'demo_migla_ruta',
    members: u('mezu_dace', 'sniega_liene', 'ledus_toms', 'vetras_edgars', 'lapsu_anna'),
    tagline: {
      lv: 'Sestdienās sakopjam parku un krastu, jo zeme pateiksies tikai tad, ja to nesalasīs citi.',
      en: 'On Saturdays we tidy the park and the shore, since the land only thanks us if we do the picking.',
    },
    about: {
      lv: '<p>Divas stundas, pāris maisu un liela gandarījuma sajūta. Cimdus un maisus sagādājam, ņem tikai labu garastāvokli.</p>',
      en: '<p>Two hours, a few bags and a big sense of satisfaction. We provide gloves and bags; you bring a good mood.</p>',
    },
    second: {
      title: { lv: 'Ko ņemt līdzi', en: 'What to bring' },
      body: {
        lv: '<p>Ērtus apavus un ūdeni. Pēc darba mēs kopīgi iedzeram tēju un saskaitām, cik maisu esam piepildījuši.</p>',
        en: '<p>Comfortable shoes and water. After the work we share tea and count the bags we filled.</p>',
      },
    },
    events: [
      {
        title: { lv: 'Parka sakopšana', en: 'Park cleanup' },
        description: {
          lv: 'Divas stundas parkā ar maisiem un cimdiem. Pēc tam tēja un smiekli.',
          en: 'Two hours in the park with bags and gloves. Tea and laughter afterwards.',
        },
        location: 'Pulcēšanās pie parka strūklakas',
        inDays: 5, hour: 10, hours: 3,
        going: u('mezu_dace', 'sniega_liene', 'ledus_toms'),
      },
      {
        title: { lv: 'Krasta sakopšana', en: 'Shoreline cleanup' },
        description: {
          lv: 'Ejam gar upes krastu un savācam to, kas tur nepieder.',
          en: 'We walk along the riverbank and collect what does not belong there.',
        },
        location: 'Gaujas krasts pie tilta',
        inDays: 19, hour: 10, hours: 3,
        going: u('vetras_edgars', 'lapsu_anna'),
      },
    ],
    posts: [
      { title: 'Cimdi sagādāti', content: 'Trīsdesmit pāri cimdu un divdesmit maisu gaida pie strūklakas. Pietiks visiem.', daysAgo: 3 },
      { title: 'Kopā savākts', content: 'Pēdējā reizē savācām četrdesmit maisu. Paldies visiem, kas atnāca!', daysAgo: 14 },
    ],
  },
  {
    slug: 'laipnibas-karavana',
    l2: 'volunteering',
    name: 'Laipnības karavāna',
    city: 'Riga',
    lookingFor: 'Brīvprātīgie ar brīvu vakaru vai divu stundu',
    ageDays: 74,
    owner: 'demo_tintes_karlis',
    members: u('saules_ilze', 'lapsu_anna', 'burbulu_santa', 'zvaigznu_marite', 'pelekais_olivers', 'mezu_dace', 'dzirkstele_janis'),
    tagline: {
      lv: 'Brīvprātīgie, kas ar skaļu smaidu iet palīdzēt tur, kur vajag roku.',
      en: 'Volunteers who go with a loud smile to lend a hand where one is needed.',
    },
    about: {
      lv: '<p>Palīdzam uzkopt, nest, krāsot un sagatavot telpas dažādiem pasākumiem. Katram ir vieta un darbs, kas patīk.</p>',
      en: '<p>We help clean, carry, paint and prepare spaces for all kinds of events. Everyone has a place and a task they enjoy.</p>',
    },
    second: {
      title: { lv: 'Biežāk uzdotie jautājumi', en: 'Frequently asked questions' },
      body: {
        lv: '<p>Vai jāprot kaut kas īpašs? Nē. Cik ilgi jāpalīdz? Cik vēlies. Vai ir uzkodas? Vienmēr.</p>',
        en: '<p>Do I need special skills? No. How long must I help? As long as you like. Are there snacks? Always.</p>',
      },
    },
    events: [
      {
        title: { lv: 'Pagalma krāsošana', en: 'Courtyard painting' },
        description: {
          lv: 'Krāsojam žogu un soliņus. Vecas drēbes ir obligātas.',
          en: 'We paint the fence and benches. Old clothes are mandatory.',
        },
        location: 'Kāds kopienas pagalms, Maskavas forštate',
        inDays: 8, hour: 10, hours: 4,
        going: u('saules_ilze', 'lapsu_anna', 'burbulu_santa', 'zvaigznu_marite'),
      },
      {
        title: { lv: 'Kastu ķēde', en: 'The box chain' },
        description: {
          lv: 'Kopīgi krāvējam un nesam kastes uz jauno telpu. Pēc darba uzkodas.',
          en: 'We pack and carry boxes to the new space together. Snacks after the work.',
        },
        location: 'Kopienas centra ieeja',
        inDays: 22, hour: 16, hours: 3,
        going: u('pelekais_olivers', 'mezu_dace', 'dzirkstele_janis'),
      },
      {
        title: { lv: 'Tiešsaistes plānošanas vakars', en: 'Online planning evening' },
        description: {
          lv: 'Pusstunda, lai izvēlētos nākamo darbu un sadalītu uzdevumus.',
          en: 'Half an hour to choose the next job and split the tasks.',
        },
        isOnline: true,
        location: 'Saite tiks nosūtīta dalībniekiem',
        inDays: 31, hour: 20, hours: 1,
        going: u('saules_ilze', 'lapsu_anna'),
      },
    ],
    posts: [
      { title: 'Krāsa ir atvesta', content: 'Zaļā un dzeltenā krāsa gaida pagalmā. Otas ir arī, bet var ņemt savas.', daysAgo: 4 },
      { title: 'Paldies par palīdzību', content: 'Pēdējā reizē palīdzējām četrdesmit cilvēkiem pārcelties. Esat lieliski!', daysAgo: 16 },
    ],
  },
  {
    slug: 'saknu-zemes-zinatnieki',
    l2: 'community-gardens',
    name: 'Sakņu zemes zinātnieki',
    city: 'Valmiera',
    lookingFor: 'Kāds ar lāpstu, pacietību vai abiem',
    ageDays: 39,
    owner: 'demo_dzirkstele_janis',
    members: u('lapsu_anna', 'mezu_dace', 'sniega_liene', 'migla_ruta', 'saules_ilze'),
    tagline: {
      lv: 'Kopienas dārzs, kur sēklu iestādām kopā un ražu dalām vēl vairāk.',
      en: 'A community garden where we plant seeds together and share the harvest even more.',
    },
    about: {
      lv: '<p>Katrai dobei ir savs saimnieks, bet darbs notiek kopā. Vienu sestdienu mēnesī sagatavojam zemi, laistām un salasām ražu.</p>',
      en: '<p>Each bed has its keeper, but the work happens together. One Saturday a month we prepare the soil, water and pick the harvest.</p>',
    },
    second: {
      title: { lv: 'Mūsu tradīcijas', en: 'Our traditions' },
      body: {
        lv: '<p>Pirmais dārza kartupelis tiek svinēts ar mazu ballīti. Pārāk lielo ķirbi atdodam tam, kurš to izaudzējis.</p>',
        en: '<p>The first potato of the season is celebrated with a small party. The oversized pumpkin goes back to whoever grew it.</p>',
      },
    },
    events: [
      {
        title: { lv: 'Dobju sagatavošana', en: 'Preparing the beds' },
        description: {
          lv: 'Rokam, irdinām un mēslojam. Pēc darba kopīgas pusdienas pie dārza galda.',
          en: 'We dig, loosen and fertilise. Shared lunch at the garden table afterwards.',
        },
        location: 'Kopienas dārzs pie daudzdzīvokļu mājas',
        inDays: 9, hour: 10, hours: 4,
        going: u('lapsu_anna', 'mezu_dace', 'sniega_liene'),
      },
      {
        title: { lv: 'Sēklu apmaiņa', en: 'Seed swap' },
        description: {
          lv: 'Ņem līdzi sēklas, kas tev lieku, un paņem tās, kuras gribi izmēģināt.',
          en: 'Bring seeds you have too many of and take some you want to try.',
        },
        location: 'Dārza paviljons',
        inDays: 20, hour: 14, hours: 2,
        going: u('migla_ruta', 'saules_ilze', 'lapsu_anna'),
      },
    ],
    posts: [
      { title: 'Dobes sadalītas', content: 'Vēl ir brīvas trīs dobes. Pieteikties var jebkurā laikā.', daysAgo: 5 },
      { title: 'Lietus laistīs mūsu vietā', content: 'Šonedēļ laistīt nevajag. Šoreiz mums palīdz debesis.', daysAgo: 12 },
    ],
  },
];

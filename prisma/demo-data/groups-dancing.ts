import type { DemoGroup } from './types';

const u = (...keys: string[]) => keys.map((k) => `demo_${k}`);

export const DANCING_GROUPS: DemoGroup[] = [
  {
    slug: 'salsas-kometa',
    l2: 'salsa',
    name: 'Salsas komēta',
    city: 'Riga',
    lookingFor: 'Dejotāja vai dejotājs, kas negrib stāvēt malā',
    ageDays: 49,
    owner: 'demo_dzirkstele_janis',
    members: u('zvaigznu_marite', 'saules_ilze', 'burbulu_santa', 'kapteinis_mencis', 'vetras_edgars'),
    tagline: {
      lv: 'Salsas vakari, kuros ritms pārvietojas ātrāk par komētu un smaids vēl ātrāk.',
      en: 'Salsa evenings where the rhythm moves faster than a comet and the smile faster still.',
    },
    about: {
      lv: '<p>Sākam ar īsu nodarbību iesācējiem, tad dejojam visi kopā. Pāris nav vajadzīgs, partneri mainām ik pēc dziesmas.</p>',
      en: '<p>We start with a short lesson for beginners, then dance all together. No partner needed; we swap after every song.</p>',
    },
    second: {
      title: { lv: 'Ko ņemt līdzi', en: 'What to bring' },
      body: {
        lv: '<p>Ērtus apavus ar gludu zoli un ūdens pudeli. Pārējo atnesīs mūzika.</p>',
        en: '<p>Comfortable shoes with a smooth sole and a water bottle. The music brings the rest.</p>',
      },
    },
    events: [
      {
        title: { lv: 'Iesācēju stunda un vakars', en: 'Beginner lesson and social' },
        description: {
          lv: 'Stunda pamata soļiem, pēc tam brīva dejošana līdz vēlam vakaram.',
          en: 'An hour of basic steps, then free dancing until late.',
        },
        location: 'Deju zāle kādā pagalmā, Centrs',
        inDays: 4, hour: 19, hours: 3,
        going: u('zvaigznu_marite', 'saules_ilze', 'burbulu_santa'),
      },
      {
        title: { lv: 'Svētdienas pēcpusdienas deja', en: 'Sunday afternoon dance' },
        description: {
          lv: 'Mierīgāka dejošana pie tējas un vieglām uzkodām.',
          en: 'A calmer dance with tea and light snacks.',
        },
        location: 'Deju zāle kādā pagalmā, Centrs',
        weekday: 7, inDays: 18, hour: 15, hours: 3,
        going: u('kapteinis_mencis', 'vetras_edgars'),
      },
      {
        title: { lv: 'Tiešsaistes ritma vingrinājums', en: 'Online rhythm warm-up' },
        description: {
          lv: 'Pusstunda ritma un soļu atkārtošanai no mājām.',
          en: 'Half an hour of rhythm and step practice from home.',
        },
        isOnline: true,
        location: 'Saite tiks nosūtīta dalībniekiem',
        inDays: 30, hour: 19, hours: 1,
        going: u('dzirkstele_janis'),
      },
    ],
    posts: [
      { title: 'Jauna dziesmu kolekcija', content: 'Savācām piecdesmit jaunas dziesmas. Ja gribi savu ierosināt, raksti.', daysAgo: 3 },
      { title: 'Paldies par vakaru', content: 'Pagājušā vakara dejas bija karstākas par komētu. Paldies visiem.', daysAgo: 10 },
    ],
  },
  {
    slug: 'tautas-deju-zvaigznajs',
    l2: 'folk-dancing',
    name: 'Tautas deju zvaigznājs',
    city: 'Valmiera',
    lookingFor: 'Divi dejotāji un viens harmonikas spēlētājs',
    ageDays: 62,
    owner: 'demo_lapsu_anna',
    members: u('mezu_dace', 'migla_ruta', 'sniega_liene', 'rozes_arturs', 'zeltainais_gatis'),
    tagline: {
      lv: 'Tautas dejas zem zvaigžņu pārsega, kur katrs solis ir apļa daļa.',
      en: 'Folk dancing under a blanket of stars, where every step belongs to the circle.',
    },
    about: {
      lv: '<p>Dejojam latviešu un kaimiņzemju dejas, un mācāmies pa ceļam. Ja soļi sajūk, mēs sākam no jauna un smejamies. Mūzikai palīdz vecā harmonika.</p>',
      en: '<p>We dance Latvian and neighbouring dances and learn as we go. If the steps tangle, we start again and laugh. An old accordion helps with the music.</p>',
    },
    second: {
      title: { lv: 'Mūsu tradīcijas', en: 'Our traditions' },
      body: {
        lv: '<p>Katrs vakars beidzas ar vienu garu apli, kurā ir visi. Kurš pēdējais atnāk, atver apli.</p>',
        en: '<p>Every evening ends with one long circle that includes everyone. Whoever arrives last opens the circle.</p>',
      },
    },
    events: [
      {
        title: { lv: 'Rudens aplis', en: 'The autumn circle' },
        description: {
          lv: 'Dejas, kuras zina visi, un dažas, kuras nezina neviens.',
          en: 'Dances everyone knows and a few nobody does.',
        },
        location: 'Kultūras nama zāle, Valmiera',
        inDays: 7, hour: 18, hours: 3,
        going: u('mezu_dace', 'migla_ruta', 'sniega_liene'),
      },
      {
        title: { lv: 'Harmonikas vakars', en: 'Accordion evening' },
        description: {
          lv: 'Dzīvā mūzika un dejas mazā lokā. Ir arī vieta skatītājiem.',
          en: 'Live music and dancing in a small circle. There is also room for spectators.',
        },
        location: 'Kultūras nama zāle, Valmiera',
        inDays: 23, hour: 18, hours: 3,
        going: u('rozes_arturs', 'zeltainais_gatis'),
      },
    ],
    posts: [
      { title: 'Soļu piezīmes', content: 'Sagatavojām papīru ar soļu aprakstiem trīs dejām. Atrodams pie ieejas.', daysAgo: 5 },
      { title: 'Jauns harmonikists', content: 'Mums ir jauns mūziķis, kas spēlē ātrāk, nekā mēs protam dejot. Gatavojieties.', daysAgo: 16 },
    ],
  },
  {
    slug: 'svinga-robotu-balle',
    l2: 'swing',
    name: 'Svinga robotu balle',
    city: 'Jurmala',
    lookingFor: 'Pāris, kas netraucē, ja uzkāpj uz kājas',
    ageDays: 36,
    owner: 'demo_burbulu_santa',
    members: u('saules_ilze', 'tintes_karlis', 'pelekais_olivers', 'ledus_toms'),
    tagline: {
      lv: 'Svinga balles, kurās pat roboti kustas pa ritmu un neviens neuzkāpj uz kājas. Gandrīz.',
      en: 'Swing balls where even the robots move to the rhythm and nobody steps on anyone\'s foot. Almost.',
    },
    about: {
      lv: '<p>Vakara sākumā mācāmies vienu soli, beigās dejojam, kā māk. Mūziku atskaņo vecie skaņuplašu ieraksti un dažas jaunas dziesmas.</p>',
      en: '<p>We learn one step at the start of the evening and dance as best we can by the end. The music comes from old records and a few new songs.</p>',
    },
    second: {
      title: { lv: 'Biežāk uzdotie jautājumi', en: 'Frequently asked' },
      body: {
        lv: '<p>Vai jāpiedalās pārī? Nē. Vai jāģērbjas vecmodīgi? Nav jāģērbjas, bet ir jautrāk.</p>',
        en: '<p>Do I need a partner? No. Do I have to dress retro? You do not, but it is more fun.</p>',
      },
    },
    events: [
      {
        title: { lv: 'Pirmā robotu balle', en: 'The first robot ball' },
        description: {
          lv: 'Vakars ar vienu soli, daudz dziesmu un vēl vairāk smieklu.',
          en: 'An evening with one step, many songs and even more laughter.',
        },
        location: 'Kāda pagalma lapene, Majori',
        inDays: 6, hour: 19, hours: 3,
        going: u('saules_ilze', 'tintes_karlis', 'pelekais_olivers'),
      },
      {
        title: { lv: 'Pludmales svinga pēcpusdiena', en: 'Beach swing afternoon' },
        description: {
          lv: 'Dejas pie jūras, ja laiks ļaus. Ja nē, dejosim zem jumta.',
          en: 'Dancing by the sea if the weather allows. If not, we will dance under a roof.',
        },
        location: 'Pludmales paviljons, Jūrmala',
        inDays: 21, hour: 15, hours: 3,
        going: u('ledus_toms', 'burbulu_santa'),
      },
    ],
    posts: [
      { title: 'Skaņuplašu kaste', content: 'Atradām veco skaņuplašu kasti. Pirmie ieraksti jau skan mūsu vakaros.', daysAgo: 3 },
      { title: 'Jauns solis', content: 'Nākamajā reizē mācāmies jaunu soli ar nosaukumu „robota šķiršanās“. Nebaidieties.', daysAgo: 12 },
    ],
  },
];

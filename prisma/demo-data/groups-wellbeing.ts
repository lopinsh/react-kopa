import type { DemoGroup } from './types';

const u = (...keys: string[]) => keys.map((k) => `demo_${k}`);

export const WELLBEING_GROUPS: DemoGroup[] = [
  {
    slug: 'pirts-ar-ledus-karaliem',
    l2: 'sauna',
    name: 'Pirts ar ledus karaļiem',
    city: 'Daugavpils',
    lookingFor: 'Kāds, kas prot pareizi mest tvaiku',
    ageDays: 52,
    owner: 'demo_ledus_toms',
    members: u('burbulu_santa', 'sniega_liene', 'zeltainais_gatis', 'saules_ilze', 'mezu_dace'),
    tagline: {
      lv: 'Karsta pirts, auksts ezers un neviena steidzīga cilvēka.',
      en: 'A hot sauna, a cold lake and not a single person in a hurry.',
    },
    about: {
      lv: '<p>Satiekamies reizi divās nedēļās, lai sakarstu, atdzistu un atkal sakarstu. Pa vidu runājam par visu, izņemot darbu.</p>',
      en: '<p>We meet every other week to heat up, cool down and heat up again. In between we talk about everything except work.</p>',
    },
    second: {
      title: { lv: 'Pirts kārtība', en: 'Sauna etiquette' },
      body: {
        lv: '<p>Ņem līdzi dvieli, cepuri un pacietību. Tvaiku met tas, kam rokā slota, un neviens neiebilst.</p>',
        en: '<p>Bring a towel, a hat and some patience. Whoever holds the birch whisk throws the steam, and nobody objects.</p>',
      },
    },
    events: [
      {
        title: { lv: 'Pirts pie ezera', en: 'Sauna by the lake' },
        description: {
          lv: 'Trīs reizes pirtī, trīs reizes ezerā. Pēc tam zāļu tēja.',
          en: 'Three rounds in the sauna, three dips in the lake. Herbal tea afterwards.',
        },
        location: 'Kāda ezera krasta pirtiņa',
        inDays: 6, hour: 18, hours: 3,
        going: u('burbulu_santa', 'sniega_liene', 'saules_ilze'),
      },
      {
        title: { lv: 'Slotu siešanas vakars', en: 'Whisk-binding evening' },
        description: {
          lv: 'Sienam bērzu slotas nākamajām reizēm. Zari ir sagādāti.',
          en: 'We bind birch whisks for the coming sessions. The twigs are provided.',
        },
        location: 'Kāda pagalma šķūnis',
        inDays: 19, hour: 17, hours: 2,
        going: u('zeltainais_gatis', 'mezu_dace'),
      },
    ],
    posts: [
      { title: 'Ezers vēl nav aizsalis', content: 'Ūdens ir tieši tik auksts, cik vajag. Nākamajā reizē droši var nākt.', daysAgo: 3 },
      { title: 'Atrasta pazaudēta cepure', content: 'Zila vilnas cepure ar bumbuli palikusi pirtī. Atnāc pakaļ, kad vari.', daysAgo: 12 },
    ],
  },
  {
    slug: 'saules-sveicienu-pludmale',
    l2: 'yoga',
    name: 'Saules sveicienu pludmale',
    city: 'Jurmala',
    lookingFor: 'Agrie putni ar paklājiņu',
    ageDays: 37,
    owner: 'demo_saules_ilze',
    members: u('burbulu_santa', 'migla_ruta', 'lapsu_anna', 'rozes_arturs', 'vetras_edgars'),
    tagline: {
      lv: 'Joga pludmalē rītausmā, kamēr vilnis rāmi skalo krastu.',
      en: 'Yoga on the beach at sunrise while the waves hush the shore.',
    },
    about: {
      lv: '<p>Stundu vingrojam smiltīs, mierīgi un bez sacensības. Ja kāds aizmieg pozā, mēs viņu nemodinām.</p>',
      en: '<p>We stretch on the sand for an hour, calmly and without competing. If someone falls asleep mid-pose, we leave them be.</p>',
    },
    second: {
      title: { lv: 'Ko ņemt līdzi', en: 'What to bring' },
      body: {
        lv: '<p>Paklājiņu vai lielu dvieli, ūdens pudeli un siltu džemperi atpūtai. Apavi nav vajadzīgi.</p>',
        en: '<p>A mat or a large towel, a water bottle and a warm jumper for the rest. Shoes are not needed.</p>',
      },
    },
    events: [
      {
        title: { lv: 'Rītausmas sesija', en: 'Sunrise session' },
        description: {
          lv: 'Sešdesmit minūtes lēnas jogas pie jūras. Sākam, kad kļūst gaišs.',
          en: 'Sixty minutes of slow yoga by the sea. We start when it gets light.',
        },
        location: 'Pludmale pie kāpu takas',
        inDays: 4, hour: 7, hours: 1,
        going: u('burbulu_santa', 'migla_ruta', 'lapsu_anna'),
      },
      {
        title: { lv: 'Jogas un tējas rīts', en: 'Yoga and tea morning' },
        description: {
          lv: 'Īsāka sesija un kopīga tēja no termosiem.',
          en: 'A shorter session and shared tea from thermoses.',
        },
        location: 'Smilšu kāpa pie baznīcas',
        inDays: 17, hour: 9, hours: 2,
        going: u('rozes_arturs', 'vetras_edgars'),
      },
      {
        title: { lv: 'Vakara stiepšanās tiešsaistē', en: 'Evening stretch online' },
        description: {
          lv: 'Trīsdesmit minūtes mierīgas stiepšanās pirms miega. Vajag tikai paklājiņu.',
          en: 'Thirty minutes of gentle stretching before bed. All you need is a mat.',
        },
        isOnline: true,
        location: 'Saite tiks nosūtīta dalībniekiem',
        inDays: 28, hour: 21, hours: 1,
        going: u('lapsu_anna', 'burbulu_santa'),
      },
    ],
    posts: [
      { title: 'Rītā būs miglains', content: 'Prognoze sola miglu virs jūras. Mēs to uzskatām par īpašu noskaņu.', daysAgo: 2 },
      { title: 'Paklājiņi pie kāpām', content: 'Rezerves paklājiņi ir pie sargu mājas. Ņemiet, cik vajag.', daysAgo: 11 },
    ],
  },
  {
    slug: 'lauku-jogas-pulcins',
    l2: 'yoga',
    name: 'Lauku jogas pulciņš',
    city: 'Sigulda',
    lookingFor: 'Vēl divi, kas nebaidās no zāles smaržas',
    ageDays: 29,
    owner: 'demo_sniega_liene',
    members: u('mezu_dace', 'dzirkstele_janis', 'migla_ruta', 'ledus_toms'),
    tagline: {
      lv: 'Joga pļavā ar govju skatienu no attāluma un putnu pavadījumu.',
      en: 'Yoga in a meadow, watched by cows from afar and accompanied by birds.',
    },
    about: {
      lv: '<p>Vingrojam brīvā dabā, lēnā tempā. Ja līst, pārceļamies zem lielās nojumes, kur skaņa ir vēl mierinošāka.</p>',
      en: '<p>We stretch outdoors at an unhurried pace. If it rains, we move under the big canopy, where the sound is even more soothing.</p>',
    },
    second: {
      title: { lv: 'Biežāk uzdotie jautājumi', en: 'Frequently asked questions' },
      body: {
        lv: '<p>Vai jāprot? Nē. Vai govis ir draudzīgas? Pārsvarā. Vai būs tēja? Vienmēr.</p>',
        en: '<p>Do I need experience? No. Are the cows friendly? Mostly. Will there be tea? Always.</p>',
      },
    },
    events: [
      {
        title: { lv: 'Pļavas sesija', en: 'Meadow session' },
        description: {
          lv: 'Stunda jogas starp pļavas ziediem. Nāc ar vaļīgām drēbēm.',
          en: 'An hour of yoga among the meadow flowers. Come in loose clothes.',
        },
        location: 'Pļava pie Gaujas',
        inDays: 7, hour: 10, hours: 2,
        going: u('mezu_dace', 'dzirkstele_janis', 'migla_ruta'),
      },
      {
        title: { lv: 'Klusuma pastaiga un joga', en: 'Silent walk and yoga' },
        description: {
          lv: 'Piecpadsmit minūtes klusi ejam, tad stiepjamies. Runājam tikai pie tējas.',
          en: 'Fifteen minutes of silent walking, then stretching. We talk only over tea.',
        },
        location: 'Meža taka pie atpūtas vietas',
        inDays: 21, hour: 9, hours: 2,
        going: u('ledus_toms', 'mezu_dace'),
      },
    ],
    posts: [
      { title: 'Nojume ir uzstādīta', content: 'Ja līs, būs sausa vieta. Paklājiņu skaits ir ierobežots, tāpēc ņem savu.', daysAgo: 6 },
      { title: 'Govis pārcēlušās', content: 'Šonedēļ pļavas otrā pusē. Mēs viņus netraucēsim, viņi mūs arī ne.', daysAgo: 17 },
    ],
  },
  {
    slug: 'klusuma-kosmonauti',
    l2: 'meditation',
    name: 'Klusuma kosmonauti',
    city: 'Riga',
    lookingFor: 'Kāds, kas var piecas minūtes nesmieties',
    ageDays: 66,
    owner: 'demo_pelekais_olivers',
    members: u('zvaigznu_marite', 'tintes_karlis', 'lapsu_anna', 'rozes_arturs', 'zeltainais_gatis', 'kapteinis_mencis'),
    tagline: {
      lv: 'Divdesmit minūtes klusuma reizi nedēļā, lai atkal justu savu orbītu.',
      en: 'Twenty minutes of silence once a week to find your orbit again.',
    },
    about: {
      lv: '<p>Sēžam, elpojam un neko neplānojam. Beigās katrs pasaka vienu vārdu, ko aizvakar nepamanīja.</p>',
      en: '<p>We sit, breathe and plan nothing. At the end each of us says one word they did not notice the day before.</p>',
    },
    second: {
      title: { lv: 'Mūsu tradīcijas', en: 'Our traditions' },
      body: {
        lv: '<p>Sākam ar zvaniņu, beidzam ar tēju. Ja telefons iezvanās, mēs to uzskatām par pārsteiguma ieguldījumu.</p>',
        en: '<p>We start with a small bell and end with tea. If a phone rings, we count it as a surprise contribution.</p>',
      },
    },
    events: [
      {
        title: { lv: 'Klusuma vakars', en: 'Evening of silence' },
        description: {
          lv: 'Divas īsas meditācijas ar pauzi starp tām. Matracis nav obligāts.',
          en: 'Two short meditations with a break between them. A mattress is optional.',
        },
        location: 'Kāda dzīvokļa viesistaba, Centrs',
        inDays: 5, hour: 19, hours: 2,
        going: u('zvaigznu_marite', 'tintes_karlis', 'lapsu_anna', 'kapteinis_mencis'),
      },
      {
        title: { lv: 'Elpošanas rīts tiešsaistē', en: 'Breathing morning online' },
        description: {
          lv: 'Piecpadsmit minūtes kopīgas elpošanas pirms darba dienas.',
          en: 'Fifteen minutes of breathing together before the working day.',
        },
        isOnline: true,
        location: 'Saite tiks nosūtīta dalībniekiem',
        inDays: 12, hour: 7, hours: 1,
        going: u('rozes_arturs', 'zeltainais_gatis'),
      },
      {
        title: { lv: 'Pastaiga ar klusumu', en: 'A walk with silence' },
        description: {
          lv: 'Lēna pastaiga parkā bez sarunām. Beigās tēja no termosa.',
          en: 'A slow walk in the park without talking. Tea from a thermos at the end.',
        },
        location: 'Strūklaka Vērmanes dārzā',
        inDays: 26, hour: 10, hours: 2,
        going: u('tintes_karlis', 'kapteinis_mencis'),
      },
    ],
    posts: [
      { title: 'Atrasts zvaniņš', content: 'Vecais zvaniņš ir atrasts. Tas skan tikpat mierīgi kā iepriekš.', daysAgo: 5 },
      { title: 'Jauns laiks vakaros', content: 'Vakara sesijas sāksim pusstundu agrāk, lai paliek laiks tējai.', daysAgo: 14 },
    ],
  },
];

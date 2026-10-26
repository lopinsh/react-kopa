import type { DemoGroup } from './types';

const u = (...keys: string[]) => keys.map((k) => `demo_${k}`);

export const SOCIAL_GROUPS: DemoGroup[] = [
  {
    slug: 'zinataju-pelecu-viktorinas',
    l2: 'quiz-nights',
    name: 'Zinātāju pelēču viktorīnas',
    city: 'Riga',
    lookingFor: 'Vēl divi komandas biedri, kas zina visu par pelēm',
    ageDays: 52,
    owner: 'demo_zvaigznu_marite',
    members: u('pelekais_olivers', 'rozes_arturs', 'tintes_karlis', 'saules_ilze', 'zeltainais_gatis'),
    tagline: {
      lv: 'Viktorīnu vakari komandām, kas zina visu par peļu vēsturi un neko citu.',
      en: 'Quiz nights for teams who know everything about mouse history and nothing else.',
    },
    about: {
      lv: '<p>Katru otro nedēļu sakārtojam galdus, uzrakstām jautājumus un cenšamies nezaudēt pret pelēm. Uzvarētāji saņem goda siera šķēli, zaudētāji — arī.</p>',
      en: '<p>Every other week we arrange the tables, write the questions and try not to lose to the mice. Winners get an honorary slice of cheese, and so do the losers.</p>',
    },
    second: {
      title: { lv: 'Kā spēlējam', en: 'How we play' },
      body: {
        lv: '<p>Komandas pa 3-5 cilvēkiem, sešas kārtas, katrā astoņi jautājumi. Telefoni paliek kabatā. Ja nav savas komandas, piesēdinām pie kādas.</p>',
        en: '<p>Teams of 3-5, six rounds of eight questions each. Phones stay in pockets. If you have no team, we seat you with one.</p>',
      },
    },
    events: [
      {
        title: { lv: 'Pavasara siera kauss', en: 'The Spring Cheese Cup' },
        description: {
          lv: 'Lielā sezonas viktorīna ar sešām kārtām un vienu pārsteiguma jautājumu.',
          en: 'The big season quiz with six rounds and one surprise question.',
        },
        location: 'Kāda pagalma lapene, Āgenskalns',
        inDays: 6, hour: 19, hours: 3,
        going: u('pelekais_olivers', 'rozes_arturs', 'saules_ilze'),
      },
      {
        title: { lv: 'Tiešsaistes ātrā kārta', en: 'Online lightning round' },
        description: {
          lv: 'Stundas garš ātrais formāts no mājām. Pietiek ar kameru un labu garastāvokli.',
          en: 'A one-hour fast format from home. A camera and a good mood are enough.',
        },
        location: 'Saite tiks nosūtīta dalībniekiem',
        isOnline: true,
        inDays: 20, hour: 20, hours: 1,
        going: u('tintes_karlis', 'zeltainais_gatis'),
      },
    ],
    posts: [
      { title: 'Jautājumu kaste ir pilna', content: 'Paldies visiem, kas iemeta jautājumus. Nākamajā reizē būs arī jautājumi par siera šķirnēm.', daysAgo: 3 },
      { title: 'Jauns galds', content: 'Atradām lielāku galdu, tagad sēžam bez pleciem skaldīšanās. Ir vieta vēl diviem.', daysAgo: 12 },
    ],
  },
  {
    slug: 'kino-ar-mikstu-kraslumu',
    l2: 'movie-nights',
    name: 'Kino ar mīkstu krāslumu',
    city: 'Jurmala',
    lookingFor: 'Kāds, kam ir liels audums un vēl lielāka pacietība',
    ageDays: 41,
    owner: 'demo_saules_ilze',
    members: u('kapteinis_mencis', 'migla_ruta', 'mezu_dace', 'burbulu_santa'),
    tagline: {
      lv: 'Filmu vakari zem segām: skatāmies vecas filmas un pēc tam strīdamies, kurš galu galā bija vainīgs.',
      en: 'Movie evenings under blankets: we watch old films and then argue about who was to blame.',
    },
    about: {
      lv: '<p>Satiekamies kāda mājās, katrs atnes kaut ko ēdamu un segu. Filmu izvēlamies kopā, parasti ar balsojumu, kas beidzas ar ķildu.</p>',
      en: '<p>We meet at someone\'s place, everyone brings a snack and a blanket. We pick the film together, usually by a vote that ends in an argument.</p>',
    },
    second: {
      title: { lv: 'Ko ņemt līdzi', en: 'What to bring' },
      body: {
        lv: '<p>Segu, kaut ko uzkožamu un vēlmi sēdēt tumsā. Skaļi komentāri ir atļauti tikai pēc titriem.</p>',
        en: '<p>A blanket, something to snack on and a willingness to sit in the dark. Loud comments are allowed only after the credits.</p>',
      },
    },
    events: [
      {
        title: { lv: 'Melnbaltais piektdienas vakars', en: 'Black-and-white Friday' },
        description: {
          lv: 'Viena klasiska melnbalta filma un tēja ar medu. Pēc tam diskusija.',
          en: 'One classic black-and-white film and tea with honey. Discussion afterwards.',
        },
        location: 'Kāda dzīvokļa viesistaba, Majori',
        weekday: 5, inDays: 4, hour: 19, hours: 3,
        going: u('kapteinis_mencis', 'migla_ruta', 'burbulu_santa'),
      },
      {
        title: { lv: 'Filmu maratons lietainai svētdienai', en: 'Rainy Sunday film marathon' },
        description: {
          lv: 'Divas filmas pēc kārtas un pusdienas pa vidu.',
          en: 'Two films back to back, with lunch in between.',
        },
        location: 'Kāda dzīvokļa viesistaba, Dubulti',
        weekday: 7, inDays: 17, hour: 14, hours: 5,
        going: u('mezu_dace', 'migla_ruta'),
      },
      {
        title: { lv: 'Balsojuma vakars', en: 'Voting night' },
        description: {
          lv: 'Nolemjam nākamā mēneša filmas. Gaidāmas ķildas.',
          en: 'We decide next month\'s films. Expect arguments.',
        },
        location: 'Vērmanes dārza strūklaka',
        inDays: 31, hour: 18,
        going: u('saules_ilze'),
      },
    ],
    posts: [
      { title: 'Segu noliktava', content: 'Esam sakrājuši rezerves segas. Ja aizmirsti savu, vienmēr kāda atradīsies.', daysAgo: 5 },
      { title: 'Titru noteikums', content: 'Atgādinājums: komentāri tikai pēc titriem. Tiešām.', daysAgo: 14 },
    ],
  },
  {
    slug: 'vakarinu-klubs-ar-parsteigumu',
    l2: 'dinner-clubs',
    name: 'Vakariņu klubs “Ar pārsteigumu”',
    city: 'Cesis',
    lookingFor: 'Divi, kas nebaidās no nezināmiem ēdieniem',
    ageDays: 66,
    owner: 'demo_migla_ruta',
    members: u('sniega_liene', 'mezu_dace', 'lapsu_anna', 'dzirkstele_janis', 'rozes_arturs', 'ledus_toms'),
    tagline: {
      lv: 'Kopīgas vakariņas, kur katrs atnes vienu ēdienu un neviens nezina, kas būs galdā.',
      en: 'Shared dinners where everyone brings one dish and nobody knows what will be on the table.',
    },
    about: {
      lv: '<p>Katru mēnesi gatavojam kopīgu galdu: viens atnes zupu, cits mērci, kāds — kaut ko, kam vēl nav nosaukuma. Receptes apmainām pēc ēšanas.</p>',
      en: '<p>Every month we set one shared table: one person brings soup, another a sauce, someone something that has no name yet. We swap recipes after eating.</p>',
    },
    second: {
      title: { lv: 'Mūsu tradīcijas', en: 'Our traditions' },
      body: {
        lv: '<p>Katrs ēdiens tiek pasniegts ar vienu teikumu par tā izcelsmi, jo vairāk izdomāts, jo labāk. Traukus mazgājam kopā.</p>',
        en: '<p>Every dish is served with one sentence about where it came from; the more made up, the better. We do the dishes together.</p>',
      },
    },
    events: [
      {
        title: { lv: 'Rudens zupu vakars', en: 'Autumn soup evening' },
        description: {
          lv: 'Katrs atnes savu zupu, mēs atnesam maizi un karotes.',
          en: 'Everyone brings a soup, we bring bread and spoons.',
        },
        location: 'Kāda mājas virtuve, Cēsu vecpilsēta',
        inDays: 8, hour: 18, hours: 3,
        going: u('sniega_liene', 'mezu_dace', 'lapsu_anna'),
      },
      {
        title: { lv: 'Ēdiens bez nosaukuma', en: 'The dish with no name' },
        description: {
          lv: 'Visi ēdieni ir noslēpums līdz pēdējam brīdim.',
          en: 'Every dish stays a secret until the last moment.',
        },
        location: 'Kāda mājas virtuve, Cēsu vecpilsēta',
        inDays: 26, hour: 18, hours: 3,
        going: u('dzirkstele_janis', 'rozes_arturs', 'ledus_toms'),
      },
    ],
    posts: [
      { title: 'Recepšu burtnīca', content: 'Sākām kopīgu recepšu burtnīcu. Katrs ieraksta savu, un burtnīca staigā no rokas rokā.', daysAgo: 7 },
      { title: 'Alerģijas', content: 'Pirms katra vakara uzrakstām, kam kas nederēs. Pasakiet savus vārdus laikus.', daysAgo: 18 },
    ],
  },
];

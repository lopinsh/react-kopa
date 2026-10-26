import type { DemoGroup } from './types';

const u = (...keys: string[]) => keys.map((k) => `demo_${k}`);

export const GAMES_GROUPS: DemoGroup[] = [
  {
    slug: 'puku-midzena-pavadoni',
    l2: 'tabletop-rpgs',
    name: 'Pūķu midzeņa pavadoņi',
    city: 'Riga',
    lookingFor: 'Spēļu meistars, kas prot sacerēt pūķus',
    ageDays: 57,
    owner: 'demo_rozes_arturs',
    members: u('zvaigznu_marite', 'dzirkstele_janis', 'tintes_karlis', 'pelekais_olivers', 'lapsu_anna'),
    tagline: {
      lv: 'Galda lomu spēles ar pūķiem, kuri vienmēr ir noskaņoti draudzīgāk, nekā izskatās.',
      en: 'Tabletop role-playing with dragons that are always friendlier than they look.',
    },
    about: {
      lv: '<p>Katru nedēļu kāds ir spēles meistars, pārējie ir varoņi. Stāstu veidojam kopā, un kauliņi tikai atgādina, ka nekas nav droši.</p>',
      en: '<p>Every week someone is the game master and the rest are heroes. We build the story together, and the dice only remind us that nothing is certain.</p>',
    },
    second: {
      title: { lv: 'Jaunajiem varoņiem', en: 'For new heroes' },
      body: {
        lv: '<p>Pieredze nav vajadzīga. Pirmajā reizē dodam gatavu varoni un trīs kauliņus. Pārējo izdomājam pa ceļam.</p>',
        en: '<p>No experience needed. The first time we hand you a ready hero and three dice. We figure out the rest along the way.</p>',
      },
    },
    events: [
      {
        title: { lv: 'Pūķa alas piedzīvojums', en: 'The dragon cave adventure' },
        description: {
          lv: 'Jauna kampaņa sākas ar divām stundām un vienu apdraudētu ciematu.',
          en: 'A new campaign starts with two hours and one threatened village.',
        },
        location: 'Kāda pagalma telpa, Āgenskalns',
        inDays: 4, hour: 18, hours: 4,
        going: u('zvaigznu_marite', 'dzirkstele_janis', 'tintes_karlis'),
      },
      {
        title: { lv: 'Tiešsaistes vienas stundas spēle', en: 'Online one-hour game' },
        description: {
          lv: 'Īsa spēle bez gatavošanās, ja nedēļā nav bijis laika lielajai.',
          en: 'A short no-preparation game for weeks when there was no time for the big one.',
        },
        isOnline: true,
        location: 'Saite tiks nosūtīta dalībniekiem',
        inDays: 17, hour: 20, hours: 1,
        going: u('pelekais_olivers', 'lapsu_anna'),
      },
    ],
    posts: [
      { title: 'Jauns spēles meistars', content: 'Pie mums pievienojās cilvēks, kurš grib vadīt spēli par kosmosa pirātiem. Pieteikšanās atvērta.', daysAgo: 3 },
      { title: 'Kauliņu mazgāšana', content: 'Reizi gadā mazgājam visus kauliņus. Šodien tāda diena.', daysAgo: 12 },
    ],
  },
  {
    slug: 'kaulinu-burvju-ordenis',
    l2: 'boardgames',
    name: 'Kauliņu burvju ordenis',
    city: 'Cesis',
    lookingFor: 'Vēl divi spēlētāji un viena liela spēle',
    ageDays: 46,
    owner: 'demo_migla_ruta',
    members: u('rozes_arturs', 'sniega_liene', 'mezu_dace', 'zeltainais_gatis'),
    tagline: {
      lv: 'Galda spēļu vakari, kuros kauliņi nekad nekrīt tā, kā cerēts.',
      en: 'Boardgame evenings where the dice never land as hoped.',
    },
    about: {
      lv: '<p>Ordenis sanāk reizi nedēļā un spēlē visu, kas ietilpst uz galda. Ir stratēģija, ir sadarbība un ir spēles, kur kāds noteikti sašutīs.</p>',
      en: '<p>The order meets weekly and plays whatever fits on the table. There is strategy, cooperation and games where someone will surely be outraged.</p>',
    },
    second: {
      title: { lv: 'Mūsu tradīcijas', en: 'Our traditions' },
      body: {
        lv: '<p>Zaudētājs izvēlas nākamo spēli. Uzvarētājs vāra tēju. Šo noteikumu neviens nav mainījis.</p>',
        en: '<p>The loser picks the next game. The winner makes the tea. Nobody has changed this rule.</p>',
      },
    },
    events: [
      {
        title: { lv: 'Lielo spēļu vakars', en: 'Big games evening' },
        description: {
          lv: 'Trīs stundas vienai garai spēlei ar daudz kāršu un vēl vairāk strīdu.',
          en: 'Three hours for one long game with many cards and even more arguments.',
        },
        location: 'Kāda kafejnīcas aizmugures zāle, Cēsis',
        inDays: 5, hour: 18, hours: 3,
        going: u('rozes_arturs', 'sniega_liene', 'mezu_dace'),
      },
      {
        title: { lv: 'Jauno spēļu izmēģinājums', en: 'New games trial' },
        description: {
          lv: 'Izmēģinām četras jaunas spēles un balsojam, kuras paturēt.',
          en: 'We try four new games and vote on which to keep.',
        },
        location: 'Kāda kafejnīcas aizmugures zāle, Cēsis',
        inDays: 19, hour: 18, hours: 3,
        going: u('zeltainais_gatis', 'rozes_arturs'),
      },
    ],
    posts: [
      { title: 'Spēļu plaukts', content: 'Savācām kopīgu plauktu ar divdesmit spēlēm. Var aizņemties uz nedēļu.', daysAgo: 4 },
      { title: 'Noteikumu pārlasīšana', content: 'Atradām noteikumu kļūdu, kas mūs vajāja mēnesi. Tagad spēlējam pareizi.', daysAgo: 15 },
    ],
  },
  {
    slug: 'spelu-galda-planeta',
    l2: 'boardgames',
    name: 'Spēļu galda planēta',
    city: 'Liepaja',
    lookingFor: 'Kāds, kam patīk gudras spēles un vienkārša tēja',
    ageDays: 35,
    owner: 'demo_vetras_edgars',
    members: u('burbulu_santa', 'kapteinis_mencis', 'saules_ilze', 'ledus_toms', 'tintes_karlis'),
    tagline: {
      lv: 'Planēta, uz kuras katru nedēļu ir spēļu vakars un nekad nav garlaicīgi.',
      en: 'A planet where every week has a game night and it is never boring.',
    },
    about: {
      lv: '<p>Planētas iedzīvotāji sanāk uz mazajām spēlēm un lielajām sarunām. Sākam ar vieglām spēlēm, bet beidzam ar tādām, kuras prasa trīs cilvēku sadarbību.</p>',
      en: '<p>The planet\'s residents gather for small games and big conversations. We start with easy games and end with ones that need three people to cooperate.</p>',
    },
    second: {
      title: { lv: 'Biežāk uzdotie jautājumi', en: 'Frequently asked' },
      body: {
        lv: '<p>Vai jāprot spēlēt? Nē, iemācīsim. Vai drīkst atnākt ar bērnu? Jā, ja viņš pārvalda kāršu jaukšanu.</p>',
        en: '<p>Do I need to know how to play? No, we will teach you. Can I bring a child? Yes, if they can shuffle cards.</p>',
      },
    },
    events: [
      {
        title: { lv: 'Pirmā planētas nakts', en: 'The planet\'s first night' },
        description: {
          lv: 'Iepazīšanās vakars ar vieglām spēlēm un siltām uzkodām.',
          en: 'A get-to-know-you evening with easy games and warm snacks.',
        },
        location: 'Kāda mājas dzīvojamā istaba, Liepāja',
        inDays: 8, hour: 18, hours: 3,
        going: u('burbulu_santa', 'kapteinis_mencis', 'saules_ilze'),
      },
      {
        title: { lv: 'Svētdienas kāršu pēcpusdiena', en: 'Sunday card afternoon' },
        description: {
          lv: 'Kāršu spēles un cepumi svētdienas pēcpusdienā.',
          en: 'Card games and biscuits on a Sunday afternoon.',
        },
        location: 'Kāda mājas dzīvojamā istaba, Liepāja',
        inDays: 22, hour: 15, hours: 3,
        going: u('ledus_toms', 'tintes_karlis'),
      },
    ],
    posts: [
      { title: 'Jaunas spēles', content: 'Planētas bibliotēkā pievienojām trīs jaunas sadarbības spēles.', daysAgo: 2 },
      { title: 'Galdu pārkārtojums', content: 'Mēs pārkārtojām galdus, lai sēdētu ērtāk. Atnāciet pārbaudīt.', daysAgo: 11 },
    ],
  },
  {
    slug: 'pikselu-kosmosa-flote',
    l2: 'pc-games',
    name: 'Pikseļu kosmosa flote',
    city: 'Daugavpils',
    lookingFor: 'Pilots ar mierīgu pelīti',
    ageDays: 31,
    owner: 'demo_zeltainais_gatis',
    members: u('ledus_toms', 'pelekais_olivers', 'dzirkstele_janis', 'rozes_arturs'),
    tagline: {
      lv: 'Datorspēļu vakari komandai, kas pārvalda divus kosmosa kuģus un vienu kafijas automātu.',
      en: 'PC game evenings for a crew that runs two spaceships and one coffee machine.',
    },
    about: {
      lv: '<p>Spēlējam sadarbības spēles, kurās jāvada kuģis, jāceļ pilsēta vai jāizdzīvo uz svešas planētas. Iepriekšēja pieredze nav vajadzīga, tikai pacietība.</p>',
      en: '<p>We play cooperative games where you steer a ship, build a city or survive on an alien planet. No previous experience needed, only patience.</p>',
    },
    second: {
      title: { lv: 'Ko ņemt līdzi', en: 'What to bring' },
      body: {
        lv: '<p>Savu datoru vai atnāc uz kopīgo galdu. Austiņas un labs garastāvoklis ir obligāti.</p>',
        en: '<p>Your own computer, or come to the shared table. Headphones and a good mood are required.</p>',
      },
    },
    events: [
      {
        title: { lv: 'Flotes pirmais lidojums', en: 'The fleet\'s first flight' },
        description: {
          lv: 'Divas stundas sadarbības spēlē, kur katrs pilda savu uzdevumu.',
          en: 'Two hours of a cooperative game where everyone has their own task.',
        },
        isOnline: true,
        location: 'Saite tiks nosūtīta dalībniekiem',
        inDays: 3, hour: 20, hours: 2,
        going: u('ledus_toms', 'pelekais_olivers', 'dzirkstele_janis'),
      },
      {
        title: { lv: 'Klātienes spēļu vakars', en: 'In-person gaming evening' },
        description: {
          lv: 'Satiekamies klātienē, lai mēs beidzot redzētu viens otra sejas.',
          en: 'We meet in person so we can finally see each other\'s faces.',
        },
        location: 'Kāda jauniešu centra telpa, Daugavpils',
        inDays: 20, hour: 18, hours: 4,
        going: u('rozes_arturs', 'zeltainais_gatis'),
      },
    ],
    posts: [
      { title: 'Servera zvaigžņu karte', content: 'Uzstādījām savu serveri. Pieslēgšanās dati tiks nosūtīti dalībniekiem.', daysAgo: 5 },
      { title: 'Jauna spēle uz skatuves', content: 'Šonedēļ izmēģinām spēli par kosmosa dārzkopjiem. Izklausās dīvaini, bet patīk.', daysAgo: 14 },
    ],
  },
  {
    slug: 'slepeno-durvju-meistari',
    l2: 'escape-rooms',
    name: 'Slepeno durvju meistari',
    city: 'Riga',
    lookingFor: 'Kāds, kas pamana to, ko citi nepamana',
    ageDays: 42,
    owner: 'demo_tintes_karlis',
    members: u('zvaigznu_marite', 'saules_ilze', 'kapteinis_mencis', 'migla_ruta', 'vetras_edgars'),
    tagline: {
      lv: 'Komanda, kas kopā iet cauri bēgšanas istabām un tikko izkļūst ar mazliet apdegušiem nerviem.',
      en: 'A team that goes through escape rooms together and just barely gets out with slightly singed nerves.',
    },
    about: {
      lv: '<p>Mēs apmeklējam bēgšanas istabas un domājam, kā tikt ārā. Pēc tam apspriežam, ko palaidām garām. Reizēm uzvaram, reizēm saņemam mierinājuma balvu.</p>',
      en: '<p>We visit escape rooms and think about how to get out. Afterwards we discuss what we missed. Sometimes we win, sometimes we get a consolation prize.</p>',
    },
    second: {
      title: { lv: 'Kā mēs darbojamies', en: 'How we work' },
      body: {
        lv: '<p>Vienmēr komandā četri līdz seši cilvēki. Vienam jāatbild par kodiem, citam par priekšmetu kārtību. Sarunas notiek skaļi.</p>',
        en: '<p>Teams of four to six people. One person looks after codes, another after the order of objects. Conversation happens out loud.</p>',
      },
    },
    events: [
      {
        title: { lv: 'Noslēpumainā bibliotēka', en: 'The mysterious library' },
        description: {
          lv: 'Sešu cilvēku komanda mēģina izkļūt no bibliotēkas istabas sešdesmit minūtēs.',
          en: 'A team of six tries to escape the library room in sixty minutes.',
        },
        location: 'Kāda bēgšanas istaba, Vecrīga',
        inDays: 9, hour: 19, hours: 2,
        going: u('zvaigznu_marite', 'saules_ilze', 'kapteinis_mencis'),
      },
      {
        title: { lv: 'Mīklu vakars', en: 'Puzzle evening' },
        description: {
          lv: 'Trenējamies uz mājas mīklām un loģikas uzdevumiem. Pietiek ar tēju un pildspalvu.',
          en: 'We train on home puzzles and logic tasks. Tea and a pen are enough.',
        },
        location: 'Kāda dzīvokļa virtuve, Teika',
        inDays: 25, hour: 19, hours: 2,
        going: u('migla_ruta', 'vetras_edgars'),
      },
    ],
    posts: [
      { title: 'Mēs izkļuvām', content: 'Pagājušās reizes istaba bija ļoti grūta, bet izkļuvām ar divām sekundēm rezervē.', daysAgo: 4 },
      { title: 'Nākamā istaba', content: 'Izvēlējāmies istabu par vecu kosmosa staciju. Pieteikšanās atvērta līdz piektdienai.', daysAgo: 13 },
    ],
  },
];

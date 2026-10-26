import type { DemoGroup } from './types';

const u = (...keys: string[]) => keys.map((k) => `demo_${k}`);

export const SPORTS_GROUPS: DemoGroup[] = [
  {
    slug: 'lielo-kapu-skrejeji',
    l2: 'running',
    name: 'Lielo kāpu skrējēji',
    city: 'Jurmala',
    lookingFor: 'Kāds, kas skrien lēnāk nekā runā',
    ageDays: 38,
    owner: 'demo_burbulu_santa',
    members: u('saules_ilze', 'vetras_edgars', 'sniega_liene', 'dzirkstele_janis', 'migla_ruta'),
    tagline: {
      lv: 'Skrienam pa kāpām un mežu takām tempā, kurā vēl var parunāt un pasmieties.',
      en: 'We run on dunes and forest trails at a pace where you can still talk and laugh.',
    },
    about: {
      lv: '<p>Neviens netiek atstāts aizmugurē: ja kāds paliek pēdējais, mēs apgriežamies un skrienam viņam līdzi. Pēc skrējiena ir tēja un banāni.</p>',
      en: '<p>Nobody is left behind: if someone is last, we turn around and run with them. After the run there is tea and bananas.</p>',
    },
    second: {
      title: { lv: 'Ko ņemt līdzi', en: 'What to bring' },
      body: {
        lv: '<p>Ērtus apavus, ūdeni un mugurā to, kas neaizķeras. Lietus mūs neapstādina, bet pērkons gan.</p>',
        en: '<p>Comfortable shoes, water and clothes that do not snag. Rain does not stop us, thunder does.</p>',
      },
    },
    events: [
      {
        title: { lv: 'Rīta skrējiens pa kāpām', en: 'Morning dune run' },
        description: {
          lv: 'Seši kilometri lēnā tempā. Sākums pie jūras kāpu laipas.',
          en: 'Six kilometres at an easy pace. We start at the dune boardwalk.',
        },
        location: 'Kāpu laipa, Jaundubulti',
        inDays: 3, hour: 8,
        going: u('saules_ilze', 'vetras_edgars', 'sniega_liene'),
      },
      {
        title: { lv: 'Vakara meža aplis', en: 'Evening forest loop' },
        description: {
          lv: 'Aplis pa meža taku ar pauzi pie pārgājienu soliņa.',
          en: 'A loop on the forest trail with a break at the hiking bench.',
        },
        location: 'Ragakāpas mežs, autostāvvieta',
        inDays: 12, hour: 18,
        going: u('dzirkstele_janis', 'migla_ruta'),
      },
      {
        title: { lv: 'Skrējiens ar vēja palīdzību', en: 'Run with the wind' },
        description: {
          lv: 'Ja vējš pūtīs mugurā, mūs neviens nesapratīs. Ja pretī, mēs tāpat priecāsimies.',
          en: 'If the wind is behind us, nobody will catch us. If it is in our faces, we will cheer anyway.',
        },
        location: 'Jūrmalas pludmale pie Majoriem',
        inDays: 30, hour: 9, hours: 2,
        going: u('burbulu_santa', 'vetras_edgars'),
      },
    ],
    posts: [
      { title: 'Sākam agrāk', content: 'Dienas kļūst īsākas, tāpēc nedēļas skrējienu sākam pusstundu agrāk.', daysAgo: 4 },
      { title: 'Atradām zaudētu cimdu', content: 'Pēc pagājušā skrējiena mežā palika viens sarkans cimds. Ja tas ir tavs, raksti.', daysAgo: 13 },
    ],
  },
  {
    slug: 'rita-skrejeju-neprats',
    l2: 'running',
    name: 'Rīta skrējēju neprāts',
    city: 'Riga',
    lookingFor: 'Divi, kas cēlās pirms saules',
    ageDays: 61,
    owner: 'demo_pelekais_olivers',
    members: u('zvaigznu_marite', 'rozes_arturs', 'ledus_toms', 'zeltainais_gatis'),
    tagline: {
      lv: 'Skrējieni pirms darba, kad pilsēta vēl guļ un vienīgais satiksmes sastrēgums ir mūsējais.',
      en: 'Runs before work, when the city is still asleep and the only traffic jam is ours.',
    },
    about: {
      lv: '<p>Tikšanās sešos no rīta, skrējiens stundu, tad kafija. Ja nenāc, nekas: nākamajā rītā mēs būsim atkal.</p>',
      en: '<p>We meet at six in the morning, run for an hour, then coffee. If you miss one, that is fine; we will be back the next morning.</p>',
    },
    second: {
      title: { lv: 'Mūsu tradīcijas', en: 'Our traditions' },
      body: {
        lv: '<p>Pēdējais pie finiša nes kafiju visiem. Tradīcija nav oficiāla, bet to ievēro stingri.</p>',
        en: '<p>The last one to the finish buys coffee for everyone. It is not official, but it is strictly observed.</p>',
      },
    },
    events: [
      {
        title: { lv: 'Pusstundas aplis ap Ķīpsalu', en: 'Half-hour loop around Ķīpsala' },
        description: {
          lv: 'Īss, ātrs skrējiens, lai ierautos nedēļā.',
          en: 'A short, quick run to get into the week.',
        },
        location: 'Ķīpsalas tilta pakājē',
        inDays: 2, hour: 6, hours: 1,
        going: u('zvaigznu_marite', 'rozes_arturs'),
      },
      {
        title: { lv: 'Svētdienas ilgais skrējiens', en: 'Sunday long run' },
        description: {
          lv: 'Divpadsmit kilometri, ūdens pa ceļam un kafija beigās.',
          en: 'Twelve kilometres, water along the way and coffee at the end.',
        },
        location: 'Mežaparka estrāde',
        weekday: 7, inDays: 15, hour: 8, hours: 2,
        going: u('ledus_toms', 'zeltainais_gatis', 'zvaigznu_marite'),
      },
    ],
    posts: [
      { title: 'Kafijas rinda', content: 'Kafejnīcā pie Mežaparka mums rezervē galdu pēc skrējiena. Ierodies līdz deviņiem.', daysAgo: 5 },
      { title: 'Atstarotāji', content: 'Pievērsiet uzmanību atstarotājiem, rīti kļūst tumšāki.', daysAgo: 17 },
    ],
  },
  {
    slug: 'velo-brigade-melnais-ritenis',
    l2: 'cycling',
    name: 'Velo brigāde “Melnais ritenis”',
    city: 'Sigulda',
    lookingFor: 'Kāds ar atbilstošu riteni un nelielu remonta komplektu',
    ageDays: 49,
    owner: 'demo_dzirkstele_janis',
    members: u('sniega_liene', 'mezu_dace', 'vetras_edgars', 'kapteinis_mencis', 'ledus_toms'),
    tagline: {
      lv: 'Ar riteņiem pa mežu un lauku ceļiem, kur galvenais ir nenokrist un nepaklīst.',
      en: 'On bikes through forest and country roads, where the main thing is not to fall and not to get lost.',
    },
    about: {
      lv: '<p>Braucam mierīgi, apstājamies bieži un nekad neatstājam neviena. Katram braucienam ir viens atbildīgais, kas zina ceļu, vismaz teorētiski.</p>',
      en: '<p>We ride calmly, stop often and never leave anyone behind. Each ride has one guide who knows the way, at least in theory.</p>',
    },
    second: {
      title: { lv: 'Pirms brauciena', en: 'Before the ride' },
      body: {
        lv: '<p>Pārbaudi bremzes, gaisu riepās un ņem līdzi rezerves kameru. Ķiveres obligātas, smaidi — ieteicami.</p>',
        en: '<p>Check your brakes, tyre pressure and bring a spare tube. Helmets are compulsory, smiles are recommended.</p>',
      },
    },
    events: [
      {
        title: { lv: 'Rudens meža brauciens', en: 'Autumn forest ride' },
        description: {
          lv: 'Trīsdesmit kilometri pa Gaujas krastu, lēns temps un daudz lapu.',
          en: 'Thirty kilometres along the Gauja, slow pace and plenty of leaves.',
        },
        location: 'Siguldas dzelzceļa stacija',
        inDays: 10, hour: 10, hours: 4,
        going: u('sniega_liene', 'mezu_dace', 'vetras_edgars'),
      },
      {
        title: { lv: 'Riteņu remonta darbnīca', en: 'Bike repair workshop' },
        description: {
          lv: 'Kopā iemācāmies nomainīt kameru, noregulēt bremzes un nesaplēst pirkstus.',
          en: 'Together we learn to change a tube, adjust brakes and not hurt our fingers.',
        },
        location: 'Kāda garāža, Siguldas centrs',
        inDays: 25, hour: 15,
        going: u('kapteinis_mencis', 'ledus_toms'),
      },
    ],
    posts: [
      { title: 'Maršruta karte', content: 'Pievienojām jaunu maršrutu uz Turaidu. Karte ir pie nākamā brauciena apraksta.', daysAgo: 6 },
      { title: 'Atradām ķiveri', content: 'Kāds aizmirsa ķiveri pie stacijas. Tā ir pie grupas vadītāja.', daysAgo: 19 },
    ],
  },
  {
    slug: 'dzelzs-galdnieki',
    l2: 'bodybuilding',
    name: 'Dzelzs galdnieki',
    city: 'Daugavpils',
    lookingFor: 'Kāds, kas mācēs pareizi pacelt, nevis tikai skaļi uzvilkt',
    ageDays: 55,
    owner: 'demo_ledus_toms',
    members: u('zeltainais_gatis', 'pelekais_olivers', 'dzirkstele_janis', 'burbulu_santa'),
    tagline: {
      lv: 'Kopīgi treniņi zālē, kur svars ir tikai skaitlis, bet tehnika — svarīgāka par spēku.',
      en: 'Group workouts in the gym where weight is only a number and technique matters more than strength.',
    },
    about: {
      lv: '<p>Trenējamies divas reizes nedēļā, palīdzam cits citam ar tehniku un pārbaudām, vai kāds nav aizmirsis padzerties. Nekādas sacensības, tikai iecietība.</p>',
      en: '<p>We train twice a week, help each other with form and check that nobody forgot to drink water. No competition, only patience.</p>',
    },
    second: {
      title: { lv: 'Biežāk uzdotie jautājumi', en: 'Frequently asked' },
      body: {
        lv: '<p>Vai vajag spēku? Nē. Vai vajag zināt uzdevumus? Nē, parādīsim. Vai drīkst atnākt ar slikto garastāvokli? Tieši tāpēc ir treniņi.</p>',
        en: '<p>Do you need strength? No. Do you need to know the exercises? No, we will show you. May you come in a bad mood? That is what workouts are for.</p>',
      },
    },
    events: [
      {
        title: { lv: 'Pamatu treniņš iesācējiem', en: 'Basics for beginners' },
        description: {
          lv: 'Visas galvenās kustības ar vieglu svaru un daudz skaidrojumu.',
          en: 'All the main movements with light weights and plenty of explanation.',
        },
        location: 'Kāda sporta zāle, Daugavpils centrs',
        inDays: 5, hour: 18,
        going: u('zeltainais_gatis', 'burbulu_santa'),
      },
      {
        title: { lv: 'Kājas vienmēr ir svarīgas', en: 'Never skip leg day' },
        description: {
          lv: 'Nedēļas kāju treniņš. Pēc tam pārvietojamies lēnām.',
          en: 'The week\'s leg workout. Afterwards we move slowly.',
        },
        location: 'Kāda sporta zāle, Daugavpils centrs',
        inDays: 19, hour: 18,
        going: u('pelekais_olivers', 'dzirkstele_janis'),
      },
    ],
    posts: [
      { title: 'Treniņu grafiks', content: 'Treniņi ir otrdienās un ceturtdienās. Ja grafiks nederēs, mēs to pielāgosim.', daysAgo: 3 },
      { title: 'Ūdens noteikums', content: 'Ūdens pudele ir obligāta. Lūdzam to ņemt nopietni.', daysAgo: 14 },
    ],
  },
  {
    slug: 'burbulu-ziemas-peldetaji',
    l2: 'swimming',
    name: 'Burbuļu ziemas peldētāji',
    city: 'Liepaja',
    lookingFor: 'Divi drosmīgie, kas peldas arī, kad ūdens nav silts',
    ageDays: 43,
    owner: 'demo_vetras_edgars',
    members: u('kapteinis_mencis', 'burbulu_santa', 'sniega_liene', 'saules_ilze', 'ledus_toms', 'migla_ruta'),
    tagline: {
      lv: 'Peldes jūrā, ezerā vai baseinā, kad ir silti, auksti vai kaut kā pa vidu.',
      en: 'Swims in the sea, a lake or a pool, when it is warm, cold or somewhere in between.',
    },
    about: {
      lv: '<p>Ūdenī ejam kopā un negājam vieni. Aukstumā ienirstam īsi, pēc tam tēja, termoss un sausa apģērbs. Drosme ir labvēlīga, bet prāts — svarīgāks.</p>',
      en: '<p>We enter the water together and never alone. In cold water we dip briefly, then tea, a thermos and dry clothes. Courage is nice, but sense matters more.</p>',
    },
    second: {
      title: { lv: 'Drošība un padomi', en: 'Safety and tips' },
      body: {
        lv: '<p>Vienmēr ir kāds krastā. Siltās drēbes ņem līdzi, pēc peldes apģērbies uzreiz. Ja jūties slikti, neej.</p>',
        en: '<p>There is always someone on the shore. Bring warm clothes and dress right after your swim. If you feel unwell, do not go in.</p>',
      },
    },
    events: [
      {
        title: { lv: 'Rīta peldes sezonas sākums', en: 'Start of the morning swim season' },
        description: {
          lv: 'Pirmā kopīgā pelde jūrā, lēnām un ar smaidu.',
          en: 'The first shared swim in the sea, slow and with a smile.',
        },
        location: 'Liepājas pludmale pie ostas',
        inDays: 4, hour: 8, hours: 1,
        going: u('kapteinis_mencis', 'burbulu_santa', 'sniega_liene'),
      },
      {
        title: { lv: 'Baseina vakars', en: 'Pool evening' },
        description: {
          lv: 'Silts baseins, lēnas distances un tēja pēc tam.',
          en: 'A warm pool, slow distances and tea afterwards.',
        },
        location: 'Kāda peldbaseins, Liepājas centrs',
        inDays: 16, hour: 19,
        going: u('saules_ilze', 'ledus_toms'),
      },
      {
        title: { lv: 'Ziemas iepazīšanās ar ūdeni', en: 'Meeting winter water' },
        description: {
          lv: 'Īss iegremdēšanās brīdis aukstā ūdenī ar uzraugu krastā.',
          en: 'A brief dip in cold water with a spotter on the shore.',
        },
        location: 'Liepājas pludmale pie ostas',
        inDays: 36, hour: 10, hours: 1,
        going: u('migla_ruta', 'burbulu_santa'),
      },
    ],
    posts: [
      { title: 'Drošības atgādinājums', content: 'Pelde tikai kopā. Ja jūra ir nemierīga, ejam uz baseinu.', daysAgo: 2 },
      { title: 'Termosu apmaiņa', content: 'Ja kādam ir lieks termoss, ir daudzi, kam tāds trūkst.', daysAgo: 12 },
    ],
  },
  {
    slug: 'basketbola-ezi-no-rietumiem',
    l2: 'basketball',
    name: 'Basketbola ēži no rietumiem',
    city: 'Valmiera',
    lookingFor: 'Gari spēlētāji un arī īsi, kas ātri skrien',
    ageDays: 33,
    owner: 'demo_zeltainais_gatis',
    members: u('mezu_dace', 'lapsu_anna', 'dzirkstele_janis', 'rozes_arturs', 'tintes_karlis', 'zvaigznu_marite', 'pelekais_olivers'),
    tagline: {
      lv: 'Draudzīgas basketbola spēles, kur rezultāts ir mazāk svarīgs par labu garastāvokli.',
      en: 'Friendly basketball games where the score matters less than a good mood.',
    },
    about: {
      lv: '<p>Spēlējam vienu reizi nedēļā, dalāmies divās komandās un maināmies, lai neviens neuzvarētu pārāk bieži. Iesācēji ir īpaši gaidīti.</p>',
      en: '<p>We play once a week, split into two teams and shuffle so nobody wins too often. Beginners are especially welcome.</p>',
    },
    second: {
      title: { lv: 'Noteikumi', en: 'House rules' },
      body: {
        lv: '<p>Mīksti apavi, nekādu elkoņu un daudz smieklu. Ja kāds ir noguris, viņš sēž malā bez sirdsapziņas pārmetumiem.</p>',
        en: '<p>Soft soles, no elbows and plenty of laughter. If someone is tired, they sit on the side without guilt.</p>',
      },
    },
    events: [
      {
        title: { lv: 'Trešdienas spēle', en: 'Wednesday game' },
        description: {
          lv: 'Parastā nedēļas spēle divās komandās. Beigās kopīgs bilžu brīdis.',
          en: 'The usual weekly game in two teams. A group photo at the end.',
        },
        location: 'Kāda skolas sporta zāle, Valmieras centrs',
        weekday: 3, inDays: 3, hour: 19,
        going: u('mezu_dace', 'lapsu_anna', 'dzirkstele_janis', 'rozes_arturs'),
      },
      {
        title: { lv: 'Draudzības turnīrs', en: 'Friendship tournament' },
        description: {
          lv: 'Mini turnīrs ar trim komandām. Balvā — banāni.',
          en: 'A mini tournament with three teams. The prize is bananas.',
        },
        location: 'Kāda skolas sporta zāle, Valmieras centrs',
        inDays: 21, hour: 12, hours: 4,
        going: u('tintes_karlis', 'zvaigznu_marite', 'pelekais_olivers'),
      },
    ],
    posts: [
      { title: 'Bumbas atradās', content: 'Pazudusī bumba atradās zem sola. Paldies, ka meklējāt.', daysAgo: 4 },
      { title: 'Jauns laiks', content: 'No nākamā mēneša sākam pusstundu agrāk, lai paspētu visi.', daysAgo: 15 },
    ],
  },
];

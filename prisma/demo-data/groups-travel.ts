import type { DemoGroup } from './types';

const u = (...keys: string[]) => keys.map((k) => `demo_${k}`);

export const TRAVEL_GROUPS: DemoGroup[] = [
  {
    slug: 'kosmosa-kombi-celotaji',
    l2: 'road-trips',
    name: 'Kosmosa kombi ceļotāji',
    city: 'Riga',
    lookingFor: 'Kāds ar kombi vai vismaz ar labu mūzikas gaumi',
    ageDays: 48,
    owner: 'demo_kapteinis_mencis',
    members: u('saules_ilze', 'tintes_karlis', 'mezu_dace', 'vetras_edgars', 'zeltainais_gatis'),
    tagline: {
      lv: 'Izbraucieni pa Latviju ar vecu kombi, kuru mēs saucam par kosmosa kuģi.',
      en: 'Trips around Latvia in an old van we insist on calling a spaceship.',
    },
    about: {
      lv: '<p>Katru mēnesi izvēlamies vienu virzienu un braucam, līdz beidzas benzīns vai pacietība. Pa ceļam apstājamies pie visa, kas izskatās interesanti.</p>',
      en: '<p>Every month we pick a direction and drive until the petrol or the patience runs out. We stop at anything that looks interesting.</p>',
    },
    second: {
      title: { lv: 'Ko ņemt līdzi', en: 'What to bring' },
      body: {
        lv: '<p>Termosu, siltas zeķes un vienu stāstu, ko vēl neesam dzirdējuši. Ar degvielu dalāmies godīgi.</p>',
        en: '<p>A thermos, warm socks and one story we have not heard yet. We split the fuel fairly.</p>',
      },
    },
    events: [
      {
        title: { lv: 'Vidzemes jūras krasta aplis', en: 'The Vidzeme coast loop' },
        description: {
          lv: 'Diena pie jūras ar piecām apstāšanās vietām un vienu kopīgu pusdienu pauzi.',
          en: 'A day by the sea with five stops and one shared lunch break.',
        },
        location: 'Pulcēšanās pie Origo autoostas',
        inDays: 9, hour: 9, hours: 8,
        going: u('saules_ilze', 'tintes_karlis', 'vetras_edgars'),
      },
      {
        title: { lv: 'Maršruta plānošanas vakars', en: 'Route planning evening' },
        description: {
          lv: 'Uz kartes izvēlamies nākamā mēneša virzienu. Tēja ir klāt.',
          en: 'We pick next month\'s direction on the map. Tea is provided.',
        },
        location: 'Kāda dzīvokļa virtuve, Teika',
        inDays: 22, hour: 19, hours: 2,
        going: u('mezu_dace', 'zeltainais_gatis'),
      },
    ],
    posts: [
      { title: 'Kombi ir sagatavots', content: 'Riepas nomainītas, termoss pildīts. Vēl var pieteikties uz nākamo izbraukumu.', daysAgo: 4 },
      { title: 'Atradām jaunu apstāšanās vietu', content: 'Pie Salacas ir pļava ar galdu un strūklaku. Ievērosim to nākamajā reizē.', daysAgo: 15 },
    ],
  },
  {
    slug: 'meness-laivotaju-braliba',
    l2: 'kayaking',
    name: 'Mēness laivotāju brālība',
    city: 'Cesis',
    lookingFor: 'Kāds, kas prot stūrēt kanoe',
    ageDays: 60,
    owner: 'demo_migla_ruta',
    members: u('kapteinis_mencis', 'burbulu_santa', 'sniega_liene', 'lapsu_anna'),
    tagline: {
      lv: 'Airējam pa Gauju, kad ūdens ir mierīgs un laiks nav svarīgs.',
      en: 'We paddle the Gauja when the water is calm and the time does not matter.',
    },
    about: {
      lv: '<p>Brālība sanāk uz ūdens agros rītos un gaišos vakaros. Ātrums nav mērķis, mērķis ir nokļūt līdz nākamajai sēklim un neapgāzties.</p>',
      en: '<p>The brotherhood meets on the water in early mornings and light evenings. Speed is not the goal; the goal is to reach the next sandbar and not tip over.</p>',
    },
    second: {
      title: { lv: 'Drošība un laivas', en: 'Safety and boats' },
      body: {
        lv: '<p>Vestes ir obligātas visiem. Laivas var aizņemties no mums, ja dod ziņu divas dienas iepriekš.</p>',
        en: '<p>Life jackets are required for everyone. You can borrow a boat from us if you tell us two days ahead.</p>',
      },
    },
    events: [
      {
        title: { lv: 'Rīta airēšana līdz Āraišiem', en: 'Morning paddle to Āraiši' },
        description: {
          lv: 'Mierīgs posms pa straumi, ap sešiem kilometriem, ar kafijas pauzi krastā.',
          en: 'A calm stretch downstream, about six kilometres, with a coffee break on the bank.',
        },
        location: 'Laivu piestātne pie Cēsu tilta',
        inDays: 7, hour: 8, hours: 4,
        going: u('kapteinis_mencis', 'burbulu_santa', 'sniega_liene'),
      },
      {
        title: { lv: 'Pilnmēness brauciens', en: 'Full moon outing' },
        description: {
          lv: 'Vakara airēšana, kamēr mēness paceļas virs koku galotnēm.',
          en: 'An evening paddle while the moon rises over the treetops.',
        },
        location: 'Laivu piestātne pie Cēsu tilta',
        inDays: 28, hour: 20, hours: 3,
        going: u('lapsu_anna', 'kapteinis_mencis'),
      },
    ],
    posts: [
      { title: 'Laivas ir ūdenī', content: 'Sezona sākta. Trīs laivas gatavas, divas vēl gaida krāsojumu.', daysAgo: 6 },
      { title: 'Jaunā marķējuma plāns', content: 'Sākam atzīmēt ērtākās piestātnes. Ja zini labu vietu, pastāsti.', daysAgo: 17 },
    ],
  },
  {
    slug: 'puka-mugurkaula-pargajieni',
    l2: 'hiking',
    name: 'Pūķa mugurkaula pārgājieni',
    city: 'Sigulda',
    lookingFor: 'Vēl divi staigātāji ar labiem zābakiem',
    ageDays: 41,
    owner: 'demo_sniega_liene',
    members: u('migla_ruta', 'mezu_dace', 'dzirkstele_janis', 'ledus_toms', 'pelekais_olivers'),
    tagline: {
      lv: 'Pārgājieni pa Gaujas senlejas nogāzēm, kur katrs kalns izskatās pēc iemigušā pūķa.',
      en: 'Hikes along the Gauja valley slopes, where every hill looks like a sleeping dragon.',
    },
    about: {
      lv: '<p>Staigājam pa pūķa mugurkaulu, tas ir, pa Siguldas taku tīklu. Katrs pārgājiens ir 8 līdz 15 kilometri, ar daudz pauzēm un vēl vairāk stāstu.</p>',
      en: '<p>We walk the dragon\'s spine, which is the Sigulda trail network. Each hike is 8 to 15 kilometres, with many breaks and even more stories.</p>',
    },
    second: {
      title: { lv: 'Mūsu tradīcijas', en: 'Our traditions' },
      body: {
        lv: '<p>Pirmajā virsotnē visi atsaucas ar pūķa rēcienu. Pēdējā posmā vienmēr ir kāda kafija, ko kāds ir uzvārījis termosā.</p>',
        en: '<p>On the first summit everyone answers with a dragon roar. The last stretch always has a coffee someone brewed into a flask.</p>',
      },
    },
    events: [
      {
        title: { lv: 'Rudens pūķa aste', en: 'The autumn dragon tail' },
        description: {
          lv: 'Divpadsmit kilometru loks pa Gaujas krastu, ar pusdienām pie ugunskura vietas.',
          en: 'A twelve kilometre loop along the Gauja bank, with lunch at a campfire spot.',
        },
        location: 'Siguldas dzelzceļa stacija',
        inDays: 5, hour: 10, hours: 5,
        going: u('migla_ruta', 'mezu_dace', 'ledus_toms'),
      },
      {
        title: { lv: 'Vakara ugunskura pārgājiens', en: 'Evening campfire hike' },
        description: {
          lv: 'Īss gājiens krēslā un tad desiņas uz oglēm.',
          en: 'A short walk at dusk and then sausages over the embers.',
        },
        location: 'Gūtmaņa alas autostāvvieta',
        inDays: 19, hour: 17, hours: 3,
        going: u('dzirkstele_janis', 'pelekais_olivers'),
      },
      {
        title: { lv: 'Tiešsaistes kartes vakars', en: 'Online map evening' },
        description: {
          lv: 'Kopā skatām nākamo pārgājienu kartē. Pietiek ar tēju un datoru.',
          en: 'We look over the next hike on the map together. Tea and a laptop are enough.',
        },
        isOnline: true,
        location: 'Saite tiks nosūtīta dalībniekiem',
        inDays: 31, hour: 19, hours: 1,
        going: u('sniega_liene', 'mezu_dace'),
      },
    ],
    posts: [
      { title: 'Taka ir atvērta', content: 'Pēc vētras taka pie Turaidas atkal ir izejama. Zari novākti.', daysAgo: 3 },
      { title: 'Zābaku pārbaude', content: 'Pirms rudens sezonas pārbaudiet zābakus. Mitras kājas sabojā jebkuru pūķi.', daysAgo: 11 },
    ],
  },
  {
    slug: 'zemzemes-celu-staigataji',
    l2: 'hiking',
    name: 'Zemzemes ceļu staigātāji',
    city: 'Valmiera',
    lookingFor: 'Kāds ar kompasu un humora izjūtu',
    ageDays: 33,
    owner: 'demo_mezu_dace',
    members: u('lapsu_anna', 'rozes_arturs', 'tintes_karlis', 'saules_ilze'),
    tagline: {
      lv: 'Gājieni pa mazajiem Vidzemes ceļiem, kurus neviens nav nosaucis, bet visi ir noskrējuši.',
      en: 'Walks along small Vidzeme roads that nobody named but everyone has crossed.',
    },
    about: {
      lv: '<p>Meklējam ceļus, kas kartē izskatās kā noplūdis zīmuļa strīpas. Dažreiz tie ved uz pļavu, dažreiz uz pagalmu ar suni. Abi ir labi iznākumi.</p>',
      en: '<p>We look for roads that look like pencil smudges on the map. Sometimes they lead to a meadow, sometimes to a yard with a dog. Both are good outcomes.</p>',
    },
    second: {
      title: { lv: 'Biežāk uzdotie jautājumi', en: 'Frequently asked' },
      body: {
        lv: '<p>Vai jāzina ceļš? Nē. Vai ir tualete? Reti. Vai būs jautri? Gandrīz vienmēr.</p>',
        en: '<p>Do I need to know the way? No. Is there a toilet? Rarely. Will it be fun? Almost always.</p>',
      },
    },
    events: [
      {
        title: { lv: 'Strenču meža stīga', en: 'The Strenči forest string' },
        description: {
          lv: 'Desmit kilometri pa nezināmiem meža ceļiem. Taku atrodam kopā.',
          en: 'Ten kilometres of unknown forest roads. We find the way together.',
        },
        location: 'Valmieras autoosta',
        inDays: 11, hour: 9, hours: 6,
        going: u('lapsu_anna', 'rozes_arturs'),
      },
      {
        title: { lv: 'Kartes un tējas vakars', en: 'Maps and tea evening' },
        description: {
          lv: 'Aplūkojam vecās kartes un izvēlamies nākamo ceļu.',
          en: 'We study old maps and choose the next road.',
        },
        location: 'Kāda pagalma lapene, Valmiera',
        inDays: 26, hour: 18, hours: 2,
        going: u('tintes_karlis', 'saules_ilze'),
      },
    ],
    posts: [
      { title: 'Atradām jaunu ceļu', content: 'Aiz vecā dzirnavu dīķa ir taka, kas kartē nav iezīmēta. Nākamajā gājienā uz turieni.', daysAgo: 5 },
      { title: 'Paldies par pārsteigumu', content: 'Tas suns, kas mūs pavadīja, ir atradis saimnieku. Paldies visiem.', daysAgo: 14 },
    ],
  },
  {
    slug: 'zvaigznu-telts-kolektivs',
    l2: 'camping',
    name: 'Zvaigžņu telts kolektīvs',
    city: 'Liepaja',
    lookingFor: 'Kāds ar divvietīgu telti un lielu somu',
    ageDays: 55,
    owner: 'demo_vetras_edgars',
    members: u('kapteinis_mencis', 'burbulu_santa', 'ledus_toms', 'dzirkstele_janis', 'zvaigznu_marite'),
    tagline: {
      lv: 'Kempings tur, kur debesis ir tumšas un telts vēl tumšāka.',
      en: 'Camping where the sky is dark and the tent is darker.',
    },
    about: {
      lv: '<p>Divas reizes mēnesī dodamies uz kādu klusu vietu pie jūras vai meža, uzceļam teltis un skatāmies zvaigznēs. Ja ir mākoņi, skatāmies viens uz otru.</p>',
      en: '<p>Twice a month we head to a quiet spot by the sea or the forest, pitch the tents and look at the stars. If it is cloudy, we look at each other.</p>',
    },
    second: {
      title: { lv: 'Ko ņemt līdzi', en: 'What to bring' },
      body: {
        lv: '<p>Telti, guļammaisu, lukturi un kaut ko ēdamu kopīgam galdam. Zvaigžņu kartes mums ir.</p>',
        en: '<p>A tent, a sleeping bag, a torch and something edible for the shared table. We have the star maps.</p>',
      },
    },
    events: [
      {
        title: { lv: 'Pirmā rudens nakts', en: 'The first autumn night' },
        description: {
          lv: 'Nakts pie jūras Pāvilostā, ar zvaigžņu vērošanu un siltu tēju.',
          en: 'A night by the sea at Pāvilosta, with stargazing and warm tea.',
        },
        location: 'Pļava aiz Pāvilostas',
        inDays: 13, hour: 17, hours: 16,
        going: u('kapteinis_mencis', 'burbulu_santa', 'zvaigznu_marite'),
      },
      {
        title: { lv: 'Telšu pārbaudes vakars', en: 'Tent check evening' },
        description: {
          lv: 'Izliekam teltis parkā un pārbaudām, vai nav caurumu. Vieglas uzkodas.',
          en: 'We pitch the tents in the park and check for holes. Light snacks.',
        },
        location: 'Jūrmalas parks, Liepāja',
        inDays: 3, hour: 18, hours: 2,
        going: u('ledus_toms', 'dzirkstele_janis'),
      },
    ],
    posts: [
      { title: 'Zvaigžņu karte ir klāt', content: 'Atradām lielo zvaigžņu karti, kas der arī mākoņainai naktij.', daysAgo: 2 },
      { title: 'Jaunā vieta pie jūras', content: 'Pārbaudījām kempinga vietu aiz kāpām. Tur ir ūdens un klusums.', daysAgo: 10 },
    ],
  },
];

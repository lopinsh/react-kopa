import type { DemoGroup } from './types';

const u = (...keys: string[]) => keys.map((k) => `demo_${k}`);

export const MUSIC_GROUPS: DemoGroup[] = [
  {
    slug: 'skalo-zvaigznu-rokskola',
    l2: 'rock-school',
    name: 'Skaļo zvaigžņu rokskola',
    city: 'Riga',
    lookingFor: 'Vēl divi bundzinieki un viens pacietīgs kaimiņš',
    ageDays: 53,
    owner: 'demo_zeltainais_gatis',
    members: u('dzirkstele_janis', 'tintes_karlis', 'kapteinis_mencis', 'pelekais_olivers', 'ledus_toms'),
    tagline: {
      lv: 'Rokmūzikas skola tiem, kas grib uzspēlēt skaļi un tomēr mīļi.',
      en: 'A rock school for those who want to play loud and still kindly.',
    },
    about: {
      lv: '<p>Mācāmies trīs akordus, tad ceturto, tad izveidojam grupu. Mēģinājumi notiek skaņu izolētā telpā, tāpēc kaimiņi ir laimīgi.</p>',
      en: '<p>We learn three chords, then a fourth, then form a band. Rehearsals happen in a soundproofed room, so the neighbours are happy.</p>',
    },
    second: {
      title: { lv: 'Ko ņemt līdzi', en: 'What to bring' },
      body: {
        lv: '<p>Savu instrumentu, ja tāds ir. Ja nav, kaut kas atradīsies. Ausu aizbāžņi ir bez maksas.</p>',
        en: '<p>Your own instrument, if you have one. If not, we will find something. Earplugs are free.</p>',
      },
    },
    events: [
      {
        title: { lv: 'Pirmā trīs akordu stunda', en: 'The first three-chord lesson' },
        description: {
          lv: 'Iepazīstamies, sadalāmies pa instrumentiem un spēlējam pirmo dziesmu.',
          en: 'We meet, split by instrument and play the first song.',
        },
        location: 'Mēģinājumu telpa, Pārdaugava',
        inDays: 5, hour: 18, hours: 3,
        going: u('dzirkstele_janis', 'tintes_karlis', 'kapteinis_mencis'),
      },
      {
        title: { lv: 'Skaļuma pārbaude', en: 'Volume check' },
        description: {
          lv: 'Mazs koncerts draugiem un ģimenei. Ieeja bez maksas, ausu aizbāžņi pie durvīm.',
          en: 'A small concert for friends and family. Free entry, earplugs at the door.',
        },
        location: 'Mēģinājumu telpa, Pārdaugava',
        inDays: 26, hour: 19, hours: 2,
        going: u('pelekais_olivers', 'ledus_toms'),
      },
    ],
    posts: [
      { title: 'Jauna bungu iekārta', content: 'Saņēmām veco bungu komplektu. Tas ir skaļš, bet skaists.', daysAgo: 4 },
      { title: 'Dziesmu saraksts', content: 'Sastādījām piecpadsmit dziesmu sarakstu. Katram atradīsies sava.', daysAgo: 14 },
    ],
  },
  {
    slug: 'meness-balsu-koris',
    l2: 'choirs',
    name: 'Mēness balsu koris',
    city: 'Sigulda',
    lookingFor: 'Tenori un altas, bet derēs jebkura balss',
    ageDays: 58,
    owner: 'demo_sniega_liene',
    members: u('lapsu_anna', 'migla_ruta', 'saules_ilze', 'zvaigznu_marite', 'burbulu_santa', 'rozes_arturs'),
    tagline: {
      lv: 'Koris, kas dzied vakaros un cenšas, lai mēness atbalsotos.',
      en: 'A choir that sings in the evenings and tries to make the moon echo back.',
    },
    about: {
      lv: '<p>Repertuārs ir no tautasdziesmām līdz mūsdienu melodijām. Nošu lasīšana nav obligāta, bet tiek pieklājīgi mācīta.</p>',
      en: '<p>The repertoire runs from folk songs to modern melodies. Reading music is not required but is politely taught.</p>',
    },
    second: {
      title: { lv: 'Mūsu tradīcijas', en: 'Our traditions' },
      body: {
        lv: '<p>Katru mēģinājumu sākam ar kopīgu elpu un beidzam ar vienu dziesmu bez pavadījuma. Tā skan vislabāk.</p>',
        en: '<p>We start every rehearsal with a shared breath and end with one song without accompaniment. That is when it sounds best.</p>',
      },
    },
    events: [
      {
        title: { lv: 'Rudens mēģinājums', en: 'Autumn rehearsal' },
        description: {
          lv: 'Divas stundas jaunajam repertuāram un viena tējas pauze pa vidu.',
          en: 'Two hours for the new repertoire and one tea break in the middle.',
        },
        location: 'Kultūras nama zāle, Sigulda',
        inDays: 3, hour: 18, hours: 2,
        going: u('lapsu_anna', 'migla_ruta', 'saules_ilze'),
      },
      {
        title: { lv: 'Atvērtais mēģinājums', en: 'Open rehearsal' },
        description: {
          lv: 'Ikviens var ienākt, noklausīties un pamēģināt padziedāt.',
          en: 'Anyone can come in, listen and try singing along.',
        },
        location: 'Kultūras nama zāle, Sigulda',
        inDays: 17, hour: 18, hours: 2,
        going: u('zvaigznu_marite', 'burbulu_santa', 'rozes_arturs'),
      },
      {
        title: { lv: 'Mēness koncerts', en: 'The moon concert' },
        description: {
          lv: 'Neliels koncerts brīvā dabā, ja laiks ļaus. Siltas drēbes ieteicamas.',
          en: 'A small concert outdoors if the weather allows. Warm clothes recommended.',
        },
        location: 'Turaidas pils pagalms',
        inDays: 35, hour: 19, hours: 2,
        going: u('sniega_liene', 'migla_ruta'),
      },
    ],
    posts: [
      { title: 'Jaunas notis', content: 'Nodrukājām jaunas notis. Paņemiet savu eksemplāru pie ieejas.', daysAgo: 2 },
      { title: 'Vietas basiem', content: 'Mums ļoti trūkst dziļu balsu. Ja zini kādu, pastāsti viņam par mums.', daysAgo: 11 },
    ],
  },
  {
    slug: 'rita-miglas-dziedataji',
    l2: 'choirs',
    name: 'Rīta miglas dziedātāji',
    city: 'Cesis',
    lookingFor: 'Cilvēks, kas dzied agri no rīta',
    ageDays: 27,
    owner: 'demo_mezu_dace',
    members: u('sniega_liene', 'migla_ruta', 'lapsu_anna', 'vetras_edgars'),
    tagline: {
      lv: 'Neliels koris, kas dzied tikai agros rītos, kamēr migla vēl nav nokāpusi.',
      en: 'A small choir that sings only in early mornings, before the mist has lifted.',
    },
    about: {
      lv: '<p>Sanākam pirms darba un dziedam piecpadsmit minūtes. Tad dodamies prom ar siltāku sirdi. Īsi, mierīgi un bez eksāmeniem.</p>',
      en: '<p>We meet before work and sing for fifteen minutes. Then we leave with a warmer heart. Short, calm and no exams.</p>',
    },
    second: {
      title: { lv: 'Biežāk uzdotie jautājumi', en: 'Frequently asked' },
      body: {
        lv: '<p>Cikos? Septiņos. Vai jāprot dziedāt? Nē. Vai ir kafija? Pēc dziedāšanas, nevis pirms.</p>',
        en: '<p>When? At seven. Do I need to be able to sing? No. Is there coffee? After singing, not before.</p>',
      },
    },
    events: [
      {
        title: { lv: 'Miglas rīts', en: 'A misty morning' },
        description: {
          lv: 'Pusstunda dziedāšanas pie ezera. Ja nav miglas, dziedam tāpat.',
          en: 'Half an hour of singing by the lake. If there is no mist, we sing anyway.',
        },
        location: 'Cēsu pils parka ezers',
        inDays: 2, hour: 7, hours: 1,
        going: u('sniega_liene', 'migla_ruta', 'lapsu_anna'),
      },
      {
        title: { lv: 'Svētdienas rīta aplis', en: 'Sunday morning circle' },
        description: {
          lv: 'Garāks mēģinājums svētdienas rītā, ar pankūkām pēc tam.',
          en: 'A longer rehearsal on Sunday morning, with pancakes afterwards.',
        },
        location: 'Kāda mājas virtuve, Cēsis',
        weekday: 7, inDays: 16, hour: 9, hours: 2,
        going: u('vetras_edgars', 'mezu_dace'),
      },
    ],
    posts: [
      { title: 'Rīta saraksts', content: 'Nākamo divu nedēļu dziesmas ir izvēlētas. Saraksts pie ieejas.', daysAgo: 3 },
      { title: 'Pankūku receptes', content: 'Pankūku receptes tiek vāktas. Pirmā tiks pasniegta pēc svētdienas mēģinājuma.', daysAgo: 12 },
    ],
  },
  {
    slug: 'briva-dzema-kosmoss',
    l2: 'jam-sessions',
    name: 'Brīvā džema kosmoss',
    city: 'Liepaja',
    lookingFor: 'Ģitārists, kurš nebaidās no pauzēm',
    ageDays: 40,
    owner: 'demo_vetras_edgars',
    members: u('kapteinis_mencis', 'ledus_toms', 'dzirkstele_janis', 'zeltainais_gatis', 'burbulu_santa'),
    tagline: {
      lv: 'Džemi bez plāna un bez repertuāra, kur kosmoss skan tā, kā iznāk.',
      en: 'Jam sessions with no plan and no repertoire, where the cosmos sounds however it turns out.',
    },
    about: {
      lv: '<p>Atnes instrumentu un klausies. Kāds sāk ritmu, otrs pievienojas, un pēc piecām minūtēm ir dziesma. Vai arī nav, un tas ir tikpat labi.</p>',
      en: '<p>Bring an instrument and listen. Someone starts a rhythm, another joins, and after five minutes there is a song. Or there is not, and that is just as good.</p>',
    },
    second: {
      title: { lv: 'Mūsu tradīcijas', en: 'Our traditions' },
      body: {
        lv: '<p>Neviens neuzstājas, visi spēlē. Ja nezini, ko spēlēt, klausies. Pēdējā dziesma ir vienmēr kopīga.</p>',
        en: '<p>Nobody performs, everyone plays. If you do not know what to play, listen. The last song is always shared.</p>',
      },
    },
    events: [
      {
        title: { lv: 'Atvērtais džems', en: 'The open jam' },
        description: {
          lv: 'Vakars bez programmas, ar skaņas ierīcēm un kopīgu enerģiju.',
          en: 'An evening without a programme, with amps and shared energy.',
        },
        location: 'Kāda mēģinājumu telpa, Liepāja',
        inDays: 10, hour: 19, hours: 3,
        going: u('kapteinis_mencis', 'ledus_toms', 'dzirkstele_janis'),
      },
      {
        title: { lv: 'Akustiskais vakars', en: 'Acoustic evening' },
        description: {
          lv: 'Klusāks džems ar ģitārām, bungām uz pleciem un balsīm.',
          en: 'A quieter jam with guitars, hand drums and voices.',
        },
        location: 'Kāda mājas dārza lapene, Liepāja',
        inDays: 24, hour: 18, hours: 3,
        going: u('zeltainais_gatis', 'burbulu_santa'),
      },
    ],
    posts: [
      { title: 'Skaņas ierīces', content: 'Saņēmām aizdevumā divus pastiprinātājus. Paldies tam, kurš tos atvedīs.', daysAgo: 5 },
      { title: 'Jauns ritms', content: 'Pagājušoreiz sākām ar vienu ritmu, kas turpinājās četrdesmit minūtes. Pierakstījām.', daysAgo: 16 },
    ],
  },
];

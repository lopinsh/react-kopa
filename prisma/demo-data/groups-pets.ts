import type { DemoGroup } from './types';

const u = (...keys: string[]) => keys.map((k) => `demo_${k}`);

export const PETS_GROUPS: DemoGroup[] = [
  {
    slug: 'sunu-parks-pie-meness',
    l2: 'dog-owners',
    name: 'Suņu parks pie Mēness',
    city: 'Riga',
    lookingFor: 'Suņa saimnieks, kas pieņem arī mitrus deguntiņus',
    ageDays: 63,
    owner: 'demo_pelekais_olivers',
    members: u('vetras_edgars', 'saules_ilze', 'mezu_dace', 'zvaigznu_marite', 'kapteinis_mencis'),
    tagline: {
      lv: 'Suņu saimnieki, kas satiekas parkā, kamēr četrkājainie sarunājas savā valodā.',
      en: 'Dog owners meeting in the park while the four-legged ones chat in their own language.',
    },
    about: {
      lv: '<p>Sestdienu rītos pastaigājam suņus kopā. Mazie un lielie ir laipni gaidīti, ja ir pieradināti pie citiem suņiem.</p>',
      en: '<p>On Saturday mornings we walk our dogs together. Small and large ones are welcome if they are used to other dogs.</p>',
    },
    second: {
      title: { lv: 'Ko ņemt līdzi', en: 'What to bring' },
      body: {
        lv: '<p>Suni, pavadu, maisiņus un kādu cienastu. Ūdens bļodu parasti atnesam visiem.</p>',
        en: '<p>A dog, a lead, bags and a treat or two. We usually bring a water bowl for everyone.</p>',
      },
    },
    events: [
      {
        title: { lv: 'Sestdienas pastaiga', en: 'Saturday walk' },
        description: {
          lv: 'Stunda parkā ar sunīšiem, kuri pārrunā jaunumus. Cilvēki dara to pašu.',
          en: 'An hour in the park with dogs catching up on news. The humans do the same.',
        },
        location: 'Parka ieeja pie lielā koka',
        inDays: 4, hour: 10, hours: 2,
        going: u('vetras_edgars', 'saules_ilze', 'mezu_dace'),
      },
      {
        title: { lv: 'Mācību rīts suņiem', en: 'Dog training morning' },
        description: {
          lv: 'Pamatkomandas ar mierīgu trenera padomu. Nav obligāti, bet palīdz.',
          en: 'Basic commands with calm advice from a trainer. Optional, but it helps.',
        },
        location: 'Zālājs aiz sporta laukuma',
        inDays: 15, hour: 9, hours: 2,
        going: u('zvaigznu_marite', 'kapteinis_mencis'),
      },
      {
        title: { lv: 'Suņu saimnieku tējas vakars', en: 'Dog owners\' tea evening' },
        description: {
          lv: 'Bez suņiem, tikai ar stāstiem par viņiem. Katrs atnes vienu smieklīgu bildi.',
          en: 'Without dogs, only stories about them. Everyone brings one funny photo.',
        },
        location: 'Kāda kafijas telpa, Āgenskalns',
        inDays: 30, hour: 18, hours: 2,
        going: u('vetras_edgars', 'mezu_dace', 'saules_ilze'),
      },
    ],
    posts: [
      { title: 'Atrasta pavada', content: 'Sarkana pavada ar zilu rokturi atstāta pie sola. Gaida īpašnieku.', daysAgo: 3 },
      { title: 'Ūdens bļodas', content: 'Pie ieejas atstājām divas lielas ūdens bļodas. Pildām katru reizi no jauna.', daysAgo: 9 },
    ],
  },
  {
    slug: 'kaku-kosmosa-programma',
    l2: 'cat-lovers',
    name: 'Kaķu kosmosa programma',
    city: 'Riga',
    lookingFor: 'Kāds, kura kaķis grib satikt citu kaķi',
    ageDays: 41,
    owner: 'demo_tintes_karlis',
    members: u('zvaigznu_marite', 'kapteinis_mencis', 'burbulu_santa', 'migla_ruta', 'rozes_arturs'),
    tagline: {
      lv: 'Kaķu saimnieki, kas pārrunā, kāpēc viņu mīluļi tikko izlēca no palodzes.',
      en: 'Cat people discussing why their darlings just leapt off the windowsill.',
    },
    about: {
      lv: '<p>Dalāmies stāstos, padomos un fotogrāfijās. Reizēm saņemam arī kādu atvērtu kaķu hotel iespēju, bet tas ir jau cits stāsts.</p>',
      en: '<p>We share stories, tips and photos. Sometimes there is an open-ended chat about cat sitting, but that is another story.</p>',
    },
    second: {
      title: { lv: 'Mūsu tradīcijas', en: 'Our traditions' },
      body: {
        lv: '<p>Katrs tikšanās sākas ar vienu kaķa stāstu. Labāko izvēlamies pēc smaidu skaita.</p>',
        en: '<p>Every meeting starts with one cat story. We pick the best by counting smiles.</p>',
      },
    },
    events: [
      {
        title: { lv: 'Kaķu stāstu vakars', en: 'Cat story evening' },
        description: {
          lv: 'Katrs pastāsta vienu stāstu par savu kaķi. Pie tējas.',
          en: 'Everyone tells one story about their cat. Over tea.',
        },
        location: 'Kāda kafejnīcas aizmugures telpa, Centrs',
        inDays: 7, hour: 18, hours: 2,
        going: u('zvaigznu_marite', 'kapteinis_mencis', 'burbulu_santa'),
      },
      {
        title: { lv: 'Tiešsaistes kaķu padomi', en: 'Online cat advice' },
        description: {
          lv: 'Stunda jautājumiem un atbildēm par kaķu ēdienu, rotaļām un miegu.',
          en: 'An hour of questions and answers about cat food, play and sleep.',
        },
        isOnline: true,
        location: 'Saite tiks nosūtīta dalībniekiem',
        inDays: 19, hour: 20, hours: 1,
        going: u('migla_ruta', 'rozes_arturs'),
      },
    ],
    posts: [
      { title: 'Kaķu foto sacensības', content: 'Nosūtiet savu labāko bildi, un izvēlēsimies kopīgi. Uzvarētājs saņems tēju.', daysAgo: 4 },
      { title: 'Atrasta rotaļlieta', content: 'Zila pele ar zvaniņu palikusi pēc pēdējās tikšanās. Droši, ka tā pieder kādam kaķim.', daysAgo: 12 },
    ],
  },
  {
    slug: 'zirgu-veja-jatnieki',
    l2: 'horse-riding',
    name: 'Zirgu vēja jātnieki',
    city: 'Valmiera',
    lookingFor: 'Kāds, kas nebaidās no zirga acīm',
    ageDays: 55,
    owner: 'demo_mezu_dace',
    members: u('lapsu_anna', 'vetras_edgars', 'sniega_liene', 'migla_ruta'),
    tagline: {
      lv: 'Jāšanas draugi, kas ik nedēļu sakāpj seglos un lēnām izbauda lauku.',
      en: 'Riding friends who climb into the saddle each week and enjoy the countryside slowly.',
    },
    about: {
      lv: '<p>Braucam mierīgā tempā, pa takām un pļavām. Iesācēji ir laipni gaidīti, pieredzējušie palīdz.</p>',
      en: '<p>We ride at an easy pace along trails and meadows. Beginners are welcome and experienced riders help out.</p>',
    },
    second: {
      title: { lv: 'Biežāk uzdotie jautājumi', en: 'Frequently asked questions' },
      body: {
        lv: '<p>Vai vajag savu zirgu? Nē. Vai drīkst nokrist? Mēģinām to nedarīt. Vai ir ķivere? Ir.</p>',
        en: '<p>Do I need my own horse? No. May I fall off? We try not to. Is there a helmet? Yes.</p>',
      },
    },
    events: [
      {
        title: { lv: 'Mierīgā pļavas jāšana', en: 'Easy meadow ride' },
        description: {
          lv: 'Stunda jāšanas pa pļavām ar pauzēm skatieniem. Piemērota iesācējiem.',
          en: 'An hour riding across meadows with pauses for the views. Suitable for beginners.',
        },
        location: 'Staļļi pie lauku ceļa',
        inDays: 10, hour: 10, hours: 3,
        going: u('lapsu_anna', 'vetras_edgars', 'sniega_liene'),
      },
      {
        title: { lv: 'Zirgu kopšanas rīts', en: 'Horse care morning' },
        description: {
          lv: 'Mācāmies tīrīt, sukāt un apseglot zirgu. Pēc tam tēja un maizītes.',
          en: 'We learn to clean, brush and saddle a horse. Afterwards tea and sandwiches.',
        },
        location: 'Staļļi pie lauku ceļa',
        inDays: 25, hour: 9, hours: 3,
        going: u('migla_ruta', 'lapsu_anna'),
      },
    ],
    posts: [
      { title: 'Seglu pārbaude', content: 'Visi segli ir pārbaudīti un gatavi sezonai. Vēl var pieteikties uz nākamo jāšanu.', daysAgo: 5 },
      { title: 'Jauns kumeļš', content: 'Staļļos pievienojies jauns kumeļš. Viņš vēl mācās, tāpēc skatāmies no attāluma.', daysAgo: 14 },
    ],
  },
];

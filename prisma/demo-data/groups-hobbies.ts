import type { DemoGroup } from './types';

const u = (...keys: string[]) => keys.map((k) => `demo_${k}`);

export const HOBBIES_GROUPS: DemoGroup[] = [
  {
    slug: 'tamboresanas-ezeru-kopiena',
    l2: 'crochet',
    name: 'Tamborēšanas ezeru kopiena',
    city: 'Valmiera',
    lookingFor: 'Kāds, kam ir pāri palikusi zila dzija',
    ageDays: 35,
    owner: 'demo_lapsu_anna',
    members: u('migla_ruta', 'mezu_dace', 'saules_ilze', 'sniega_liene'),
    tagline: {
      lv: 'Tamborējam, tērzējam un cenšamies noadīt visu ezeru, vienu valni pēc otra.',
      en: 'We crochet, chat and try to knit up a whole lake, one wave at a time.',
    },
    about: {
      lv: '<p>Sēžam pie liela galda, katrs ar savu dziju un savu garastāvokli. Iesācējiem ir rezerves āķi un pacietība, pieredzējušiem — stāsti.</p>',
      en: '<p>We sit around a big table, each with their own yarn and mood. Beginners get spare hooks and patience; the experienced bring stories.</p>',
    },
    second: {
      title: { lv: 'Ko ņemt līdzi', en: 'What to bring' },
      body: {
        lv: '<p>Tamboradatu, dziju un krūzi. Ja nav nekā, atnāc tāpat: kaut ko atradīsim.</p>',
        en: '<p>A hook, some yarn and a mug. If you have nothing, come anyway; we will find something.</p>',
      },
    },
    events: [
      {
        title: { lv: 'Zilā viļņa vakars', en: 'Blue wave evening' },
        description: {
          lv: 'Tamborējam vienu kopīgu segu no zilām dzijas paliekām.',
          en: 'We crochet one shared blanket from leftover blue yarn.',
        },
        location: 'Kāda pagalma lapene, Valmieras centrs',
        inDays: 5, hour: 18, hours: 3,
        going: u('migla_ruta', 'mezu_dace'),
      },
      {
        title: { lv: 'Āķu apmaiņas tirdziņš', en: 'Hook swap' },
        description: {
          lv: 'Atnes lieko, paņem vajadzīgo. Bez naudas, ar tēju.',
          en: 'Bring what you do not need, take what you do. No money, with tea.',
        },
        location: 'Valmieras parka estrāde',
        inDays: 22, hour: 12,
        going: u('saules_ilze', 'sniega_liene', 'migla_ruta'),
      },
    ],
    posts: [
      { title: 'Kopīgā sega aug', content: 'Sega jau ir metru gara. Paldies visiem, kas pievienoja savu kvadrātiņu.', daysAgo: 4 },
      { title: 'Jaunas shēmas', content: 'Pievienojām mapi ar vienkāršām shēmām iesācējiem. Jautā, ja nav skaidrs.', daysAgo: 15 },
    ],
  },
  {
    slug: 'fotografu-ar-vienu-aci-klubs',
    l2: 'photography',
    name: 'Fotogrāfu ar vienu aci klubs',
    city: 'Riga',
    lookingFor: 'Kāds ar teleobjektīvu un labu humora izjūtu',
    ageDays: 58,
    owner: 'demo_rozes_arturs',
    members: u('tintes_karlis', 'pelekais_olivers', 'zeltainais_gatis', 'kapteinis_mencis', 'saules_ilze'),
    tagline: {
      lv: 'Fotosoļojumi pa pilsētu, kur viena acs skatās kadrā un otra meklē kafijas vietu.',
      en: 'Photo walks through the city where one eye looks through the viewfinder and the other looks for coffee.',
    },
    about: {
      lv: '<p>Ejam lēni, apstājamies bieži un fotografējam visu, kas izskatās interesanti. Pēc tam pārliecināmies, ka tas vairs neizskatās.</p>',
      en: '<p>We walk slowly, stop often and photograph anything that looks interesting. Afterwards we check whether it still does.</p>',
    },
    second: {
      title: { lv: 'Mūsu noteikumi', en: 'Our rules' },
      body: {
        lv: '<p>Neviens netiek fotografēts bez atļaujas. Katrā pastaigā katrs izvēlas vienu savu labāko kadru un pastāsta par to.</p>',
        en: '<p>Nobody is photographed without permission. On every walk each person picks one favourite frame and tells its story.</p>',
      },
    },
    events: [
      {
        title: { lv: 'Zelta stundas pastaiga', en: 'Golden hour walk' },
        description: {
          lv: 'Ejam pa krastmalu, kamēr gaisma vēl ir maiga.',
          en: 'We walk along the embankment while the light is still soft.',
        },
        location: 'Vērmanes dārza strūklaka',
        inDays: 3, hour: 17,
        going: u('tintes_karlis', 'pelekais_olivers'),
      },
      {
        title: { lv: 'Kadru apskate tiešsaistē', en: 'Online photo review' },
        description: {
          lv: 'Katrs parāda trīs kadrus, citi saka, kas patīk.',
          en: 'Each person shows three frames, the others say what they like.',
        },
        location: 'Saite tiks nosūtīta dalībniekiem',
        isOnline: true,
        inDays: 14, hour: 20, hours: 2,
        going: u('zeltainais_gatis', 'kapteinis_mencis', 'saules_ilze'),
      },
      {
        title: { lv: 'Miglas rīta izbrauciens', en: 'Foggy morning trip' },
        description: {
          lv: 'Agrs rīts, termoss un ceļš uz tuvāko purvu.',
          en: 'Early morning, a thermos and a road to the nearest bog.',
        },
        location: 'Sākam pie Āgenskalna tirgus',
        inDays: 33, hour: 6, hours: 4,
        going: u('rozes_arturs', 'tintes_karlis'),
      },
    ],
    posts: [
      { title: 'Kopējais albums', content: 'Pa mēnesim izvēlamies labākos kadrus kopējam albumam. Iesūti līdz mēneša beigām.', daysAgo: 2 },
      { title: 'Statīvu maiņa', content: 'Kāds meklē lētu statīvu, kāds citam ir lieks. Parunājiet savā starpā.', daysAgo: 10 },
    ],
  },
  {
    slug: 'smilsu-pulkvezu-darzkopju-biedriba',
    l2: 'gardening',
    name: 'Smilšu pulkvežu dārzkopju biedrība',
    city: 'Sigulda',
    lookingFor: 'Kāds ar siltumnīcu vai vismaz ar lielu spaini',
    ageDays: 74,
    owner: 'demo_lapsu_anna',
    members: u('mezu_dace', 'sniega_liene', 'dzirkstele_janis', 'ledus_toms', 'migla_ruta', 'burbulu_santa'),
    tagline: {
      lv: 'Dārzkopji, kas audzē visu, kas aug smiltīs, un pārējo mēģina pierunāt.',
      en: 'Gardeners who grow whatever grows in sand and try to persuade the rest.',
    },
    about: {
      lv: '<p>Apmainām sēklas, stādus un padomus. Ik pa laikam apciemojam kāda dārzu un kopīgi izlemjam, kas tur nevajadzētu stādīt.</p>',
      en: '<p>We swap seeds, seedlings and advice. Now and then we visit someone\'s garden and decide together what should not have been planted there.</p>',
    },
    second: {
      title: { lv: 'Sēklu bibliotēka', en: 'Seed library' },
      body: {
        lv: '<p>Mums ir kaste ar sēklu paciņām. Paņem paciņu, un rudenī atnes atpakaļ vismaz divas.</p>',
        en: '<p>We have a box of seed packets. Take one, and bring back at least two in autumn.</p>',
      },
    },
    events: [
      {
        title: { lv: 'Sēklu apmaiņa', en: 'Seed swap' },
        description: {
          lv: 'Atnes sēklas, paņem sēklas, uzzini, kas neaug.',
          en: 'Bring seeds, take seeds, find out what does not grow.',
        },
        location: 'Siguldas parks pie strūklakas',
        inDays: 9, hour: 11,
        going: u('mezu_dace', 'sniega_liene', 'migla_ruta'),
      },
      {
        title: { lv: 'Komposta meistarklase', en: 'Compost masterclass' },
        description: {
          lv: 'Kā no virtuves atkritumiem iegūt melno zeltu. Ar demonstrāciju.',
          en: 'How to turn kitchen scraps into black gold. With a demonstration.',
        },
        location: 'Kāda dārzs, Siguldas nomale',
        inDays: 24, hour: 15,
        going: u('dzirkstele_janis', 'ledus_toms'),
      },
    ],
    posts: [
      { title: 'Salnas brīdinājums', content: 'Nākamajā nedēļā gaidāmas salnas. Pārsedziet jutīgos stādus ar audumu.', daysAgo: 1 },
      { title: 'Lieki kartupeļi', content: 'Kādam ir lieks maiss agro kartupeļu sēklai. Raksti, ja vajag.', daysAgo: 11 },
    ],
  },
  {
    slug: 'mazo-kugu-darbnica',
    l2: 'model-building',
    name: 'Mazo kuģu darbnīca',
    city: 'Liepaja',
    lookingFor: 'Kāds, kam ir stabilas rokas un smalka pincete',
    ageDays: 47,
    owner: 'demo_kapteinis_mencis',
    members: u('vetras_edgars', 'zeltainais_gatis', 'pelekais_olivers', 'ledus_toms'),
    tagline: {
      lv: 'Būvējam kuģu, lidmašīnu un vilcienu modeļus, kas nekad neizbrauks no galda.',
      en: 'We build models of ships, planes and trains that will never leave the table.',
    },
    about: {
      lv: '<p>Sēžam pie liela galda ar līmi, pincetēm un lupām. Katrs strādā pie sava, bet visi dod padomus citu darbam, vai tie tiek lūgti vai ne.</p>',
      en: '<p>We sit at a big table with glue, tweezers and magnifiers. Everyone works on their own, but everyone advises on the others\' builds, asked or not.</p>',
    },
    second: {
      title: { lv: 'Biežāk uzdotie jautājumi', en: 'Frequently asked' },
      body: {
        lv: '<p>Vai vajag pieredzi? Nē. Vai vajag pacietību? Ļoti. Vai līme smaržo? Jā, tāpēc logs ir vaļā.</p>',
        en: '<p>Do you need experience? No. Do you need patience? A lot. Does the glue smell? Yes, so the window stays open.</p>',
      },
    },
    events: [
      {
        title: { lv: 'Klusais būvēšanas vakars', en: 'Quiet building evening' },
        description: {
          lv: 'Divas stundas mierā un līmē. Nekādas sarunas par politiku.',
          en: 'Two hours of calm and glue. No talk about politics.',
        },
        location: 'Kāda darbnīca, Karosta',
        inDays: 7, hour: 18,
        going: u('vetras_edgars', 'zeltainais_gatis'),
      },
      {
        title: { lv: 'Kuģu parāde bļodā', en: 'Parade of ships in a basin' },
        description: {
          lv: 'Liekam gatavos kuģus lielā ūdens bļodā un skatāmies, kuri nenogrimst.',
          en: 'We put finished ships in a big basin of water and see which do not sink.',
        },
        location: 'Kāda darbnīca, Karosta',
        inDays: 28, hour: 16,
        going: u('pelekais_olivers', 'ledus_toms', 'vetras_edgars'),
      },
    ],
    posts: [
      { title: 'Krāsu pasūtījums', content: 'Pasūtām krāsas kopā, jo tā iznāk lētāk. Raksti, kādas vajag.', daysAgo: 6 },
      { title: 'Jauns galds', content: 'Dabūjām otru galdu, tagad vieta pietiek visiem.', daysAgo: 16 },
    ],
  },
  {
    slug: 'fotografesana-ar-telefonu-bez-kauna',
    l2: 'photography',
    name: 'Fotografēšana ar telefonu bez kauna',
    city: 'Daugavpils',
    lookingFor: 'Ikviens ar telefonu un acīm, kas redz sīkumus',
    ageDays: 29,
    owner: 'demo_ledus_toms',
    members: u('zeltainais_gatis', 'sniega_liene', 'tintes_karlis', 'lapsu_anna', 'burbulu_santa'),
    tagline: {
      lv: 'Nav dārgu kameru, ir tikai telefons un skatiens, kas pamana pelējumu uz sienas kā mākslu.',
      en: 'No expensive cameras, just a phone and an eye that sees mould on a wall as art.',
    },
    about: {
      lv: '<p>Katru nedēļu izvēlamies tēmu: durvis, ēnas, balti vārti. Visi nofotografē savu skatu un parāda citiem.</p>',
      en: '<p>Each week we pick a theme: doors, shadows, white gates. Everyone shoots their own take and shows the others.</p>',
    },
    second: {
      title: { lv: 'Nedēļas tēmas', en: 'Weekly themes' },
      body: {
        lv: '<p>Tēmas izvēlamies pēc kārtas. Ja kāds ierosina savu, tā iet pirmā rindā.</p>',
        en: '<p>We take turns choosing themes. If someone suggests one, it goes to the front of the line.</p>',
      },
    },
    events: [
      {
        title: { lv: 'Durvju medības', en: 'Door hunt' },
        description: {
          lv: 'Stundu staigājam pa vecpilsētu un meklējam skaistākās durvis.',
          en: 'We walk the old town for an hour looking for the finest doors.',
        },
        location: 'Daugavpils cietoksnis, galveno vārtu priekšā',
        inDays: 4, hour: 17,
        going: u('zeltainais_gatis', 'sniega_liene'),
      },
      {
        title: { lv: 'Kadru parāde', en: 'Frame parade' },
        description: {
          lv: 'Parādām labākos kadrus uz lielā ekrāna un balsojam par smieklīgāko.',
          en: 'We show the best frames on a big screen and vote for the funniest.',
        },
        location: 'Saite tiks nosūtīta dalībniekiem',
        isOnline: true,
        inDays: 19, hour: 19, hours: 1,
        going: u('tintes_karlis', 'lapsu_anna', 'burbulu_santa'),
      },
    ],
    posts: [
      { title: 'Šīs nedēļas tēma', content: 'Tēma ir “ēnas pusdienlaikā”. Kadru iesūti līdz svētdienai.', daysAgo: 2 },
      { title: 'Paldies par kadriem', content: 'Pagājušās nedēļas durvis bija izcilas. Sliktākās durvis tomēr uzvarēja.', daysAgo: 9 },
    ],
  },
];

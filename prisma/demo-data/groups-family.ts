import type { DemoGroup } from './types';

const u = (...keys: string[]) => keys.map((k) => `demo_${k}`);

export const FAMILY_GROUPS: DemoGroup[] = [
  {
    slug: 'smilsu-pils-vecaki',
    l2: 'young-parents',
    name: 'Smilšu pils vecāki',
    city: 'Jurmala',
    lookingFor: 'Vecāki, kas pieņem arī smilšainas kurpes',
    ageDays: 33,
    owner: 'demo_burbulu_santa',
    members: u('saules_ilze', 'lapsu_anna', 'migla_ruta', 'vetras_edgars', 'zvaigznu_marite'),
    tagline: {
      lv: 'Jaunie vecāki, kas satiekas rotaļu laukumā un dalās ar miegu, ko kāds vēl atrod.',
      en: 'Young parents meeting at the playground and sharing whatever sleep anyone still finds.',
    },
    about: {
      lv: '<p>Satiekamies rīta pastaigās, kamēr bērni rok smiltīs. Pārrunājam gan to, kas izdodas, gan to, kas nē.</p>',
      en: '<p>We meet on morning walks while the kids dig in the sand. We talk about what works and what does not.</p>',
    },
    second: {
      title: { lv: 'Ko ņemt līdzi', en: 'What to bring' },
      body: {
        lv: '<p>Ratus vai nēsāšanas somu, termosu ar tēju un rezerves zeķītes. Uzkodas dalām kopā.</p>',
        en: '<p>A pram or carrier, a flask of tea and spare socks. We share snacks.</p>',
      },
    },
    events: [
      {
        title: { lv: 'Rīta pastaiga ar ratiem', en: 'Morning pram walk' },
        description: {
          lv: 'Lēna pastaiga gar jūru ar pauzi uz rotaļu laukuma.',
          en: 'A slow walk along the sea with a break at the playground.',
        },
        location: 'Rotaļu laukums pie jūras',
        inDays: 3, hour: 10, hours: 2,
        going: u('saules_ilze', 'lapsu_anna', 'migla_ruta'),
      },
      {
        title: { lv: 'Mazuļu rotaļu pēcpusdiena', en: 'Toddler play afternoon' },
        description: {
          lv: 'Rotaļas, grāmatas un kopīga tēja, kamēr mazuļi apskata viens otru.',
          en: 'Games, books and shared tea while the toddlers inspect one another.',
        },
        location: 'Kāda bibliotēkas bērnu istaba',
        inDays: 16, hour: 15, hours: 2,
        going: u('vetras_edgars', 'zvaigznu_marite'),
      },
      {
        title: { lv: 'Vecāku vakars bez bērniem', en: 'Parents\' evening without kids' },
        description: {
          lv: 'Divas stundas klusuma, kafijas un sarunu par visu, izņemot autiņbiksīšu izvēli.',
          en: 'Two hours of quiet, coffee and conversation about anything but nappy brands.',
        },
        location: 'Kāda kafejnīcas telpa Jūrmalā',
        inDays: 29, hour: 19, hours: 2,
        going: u('saules_ilze', 'migla_ruta', 'lapsu_anna'),
      },
    ],
    posts: [
      { title: 'Laukuma kārtība', content: 'Smilšu rotaļlietas atstājam kopīgajā kastē. Ja pazaudēsim, kāds noteikti atradīs.', daysAgo: 3 },
      { title: 'Rezerves zeķītes', content: 'Esam sagādājuši nelielu grozu ar rezerves zeķītēm. Ņem un atstāj pēc vajadzības.', daysAgo: 10 },
    ],
  },
  {
    slug: 'brokastu-ekspedicija',
    l2: 'family-outings',
    name: 'Brokastu ekspedīcija',
    city: 'Riga',
    lookingFor: 'Ģimene ar bērniem, kas mīl pikniku',
    ageDays: 62,
    owner: 'demo_zvaigznu_marite',
    members: u('kapteinis_mencis', 'saules_ilze', 'dzirkstele_janis', 'lapsu_anna', 'burbulu_santa', 'sniega_liene'),
    tagline: {
      lv: 'Ģimenes izbraucieni ar groziem, segām un vienu kopīgu plānu: nesteigties.',
      en: 'Family outings with baskets, blankets and one shared plan: do not hurry.',
    },
    about: {
      lv: '<p>Reizi mēnesī dodamies uz kādu parku, pļavu vai jūras krastu. Bērniem ir vieta skriet, vecākiem vieta apsēsties.</p>',
      en: '<p>Once a month we head to a park, meadow or beach. Kids have room to run and grown-ups have a place to sit.</p>',
    },
    second: {
      title: { lv: 'Biežāk uzdotie jautājumi', en: 'Frequently asked questions' },
      body: {
        lv: '<p>Vai jāņem ēdiens? Jā, bet dalāmies. Vai der suņi? Der. Ja līst, dodamies zem nojumes.</p>',
        en: '<p>Do we bring food? Yes, but we share. Are dogs welcome? Yes. If it rains, we move under a canopy.</p>',
      },
    },
    events: [
      {
        title: { lv: 'Piknika sestdiena', en: 'Picnic Saturday' },
        description: {
          lv: 'Segas pļavā, grozi vidū un spēles bērniem. Visi ņem līdzi kaut ko garšīgu.',
          en: 'Blankets on the meadow, baskets in the middle and games for the kids. Everyone brings something tasty.',
        },
        location: 'Pļava Mežaparkā',
        inDays: 10, hour: 11, hours: 4,
        going: u('kapteinis_mencis', 'saules_ilze', 'dzirkstele_janis', 'lapsu_anna'),
      },
      {
        title: { lv: 'Zoodārza pastaiga', en: 'A walk through the zoo' },
        description: {
          lv: 'Pastaiga pa dzīvnieku dārzu un pusdienas pie ieejas. Bērni izvēlas, kuru dzīvnieku apskatīt pirmo.',
          en: 'A stroll through the animal park and lunch by the gate. The children choose which animal to see first.',
        },
        location: 'Pie galvenās ieejas',
        inDays: 24, hour: 11, hours: 4,
        going: u('burbulu_santa', 'sniega_liene'),
      },
    ],
    posts: [
      { title: 'Groza saraksts', content: 'Uzrakstījām ieteikumu sarakstu, ko ņemt piknikā. Piemēram: segu, bumbu un citronu ūdeni.', daysAgo: 5 },
      { title: 'Lietus plāns', content: 'Ja līs, tiekamies zem nojumes pie ieejas. Paņem lietusmēteļus.', daysAgo: 12 },
    ],
  },
];

import type { DemoGroup } from './types';

const u = (...keys: string[]) => keys.map((k) => `demo_${k}`);

export const POLITICS_GROUPS: DemoGroup[] = [
  {
    slug: 'maju-sapulces-akcija',
    l2: 'civic-activism',
    name: 'Māju sapulces akcija',
    city: 'Riga',
    lookingFor: 'Kaimiņi, kas grib sakārtot savu pagalmu',
    ageDays: 54,
    owner: 'demo_pelekais_olivers',
    members: u('rozes_arturs', 'tintes_karlis', 'zvaigznu_marite', 'lapsu_anna', 'mezu_dace'),
    tagline: {
      lv: 'Kaimiņi, kas kopā pierakstās, ko vēlas mainīt savā pagalmā un ielā.',
      en: 'Neighbours who write down together what they want to change in their yard and street.',
    },
    about: {
      lv: '<p>Sākam ar mazu: soliņu, laternu vai pārtaisītu autobusa pieturu. Katra tikšanās beidzas ar vienu konkrētu darbu.</p>',
      en: '<p>We start small: a bench, a lamp or a rebuilt bus stop. Every meeting ends with one concrete task.</p>',
    },
    second: {
      title: { lv: 'Mūsu kārtība', en: 'How we work' },
      body: {
        lv: '<p>Katram ir viena minūte, lai pateiktu savu ideju. Balsojam ar rokām, tad ejam darīt. Partiju nav.</p>',
        en: '<p>Everyone gets one minute to share an idea. We vote by raising hands, then go and do it. No parties involved.</p>',
      },
    },
    events: [
      {
        title: { lv: 'Pagalma sapulce', en: 'Courtyard meeting' },
        description: {
          lv: 'Stundu runājam par to, ko mainīt. Beigās izvēlamies vienu lietu un sadalām darbus.',
          en: 'An hour of discussion about what to change. At the end we choose one thing and split the tasks.',
        },
        location: 'Kāda pagalma lapene, Āgenskalns',
        inDays: 7, hour: 18, hours: 2,
        going: u('rozes_arturs', 'tintes_karlis', 'zvaigznu_marite'),
      },
      {
        title: { lv: 'Vēstuļu rakstīšanas vakars', en: 'Letter-writing evening' },
        description: {
          lv: 'Kopīgi sagatavojam vēstuli pašvaldībai. Ņem līdzi savu pildspalvu.',
          en: 'We draft a letter to the municipality together. Bring your own pen.',
        },
        location: 'Kāda kopīgā telpa, Pārdaugava',
        inDays: 20, hour: 19, hours: 2,
        going: u('lapsu_anna', 'mezu_dace'),
      },
    ],
    posts: [
      { title: 'Soliņš nokrāsots', content: 'Pagalma soliņš ir nokrāsots. Vienīgais, kas palicis, ir uzlikt zīmi, ka krāsa vēl slapja.', daysAgo: 3 },
      { title: 'Nākamais solis', content: 'Nākamajā sapulcē runāsim par laternu pagalmā. Visi priekšlikumi ir gaidīti.', daysAgo: 13 },
    ],
  },
  {
    slug: 'robotu-parlamenta-debasu-klubs',
    l2: 'debate-clubs',
    name: 'Robotu parlamenta debašu klubs',
    city: 'Liepaja',
    lookingFor: 'Divi, kas prot ar smaidu nepiekrist',
    ageDays: 40,
    owner: 'demo_kapteinis_mencis',
    members: u('zvaigznu_marite', 'rozes_arturs', 'vetras_edgars', 'zeltainais_gatis', 'ledus_toms'),
    tagline: {
      lv: 'Debatējam par smieklīgiem jautājumiem tā, it kā tie būtu ļoti nopietni.',
      en: 'We debate silly questions as if they were deadly serious.',
    },
    about: {
      lv: '<p>Katru reizi izvēlamies tēmu, piemēram, vai tējai jābūt karstai. Puses sadalām ar monētu, un katrs noklausās otru.</p>',
      en: '<p>Each time we pick a topic, such as whether tea should be hot. Sides are decided by a coin and everyone listens to the other.</p>',
    },
    second: {
      title: { lv: 'Debašu noteikumi', en: 'Debate rules' },
      body: {
        lv: '<p>Katram divas minūtes, bez pārtraukšanas. Argumentus izvērtējam, nevis cilvēkus. Beigās kopīgi smejamies.</p>',
        en: '<p>Two minutes each, no interruptions. We judge arguments, not people. We laugh together at the end.</p>',
      },
    },
    events: [
      {
        title: { lv: 'Vai tējai jābūt karstai', en: 'Should tea be hot' },
        description: {
          lv: 'Divas komandas, divas minūtes katram un viens tējas krūzes balsojums.',
          en: 'Two teams, two minutes each and one vote by tea mug.',
        },
        location: 'Kāda bibliotēkas lasītava, Liepāja',
        inDays: 6, hour: 18, hours: 2,
        going: u('zvaigznu_marite', 'rozes_arturs', 'vetras_edgars'),
      },
      {
        title: { lv: 'Tiešsaistes ātrās debates', en: 'Online quick-fire debates' },
        description: {
          lv: 'Piecas minūtes katrai tēmai, pieci jautājumi. Ātri, skaļi un draudzīgi.',
          en: 'Five minutes per topic, five questions. Fast, loud and friendly.',
        },
        isOnline: true,
        location: 'Saite tiks nosūtīta dalībniekiem',
        inDays: 18, hour: 20, hours: 1,
        going: u('zeltainais_gatis', 'ledus_toms'),
      },
      {
        title: { lv: 'Debašu kauss', en: 'The debate cup' },
        description: {
          lv: 'Draudzīgs turnīrs ar mazu balvu: zelta ķērpis no papīra.',
          en: 'A friendly tournament with a small prize: a golden paper turnip.',
        },
        location: 'Kāda kafejnīcas aizmugures zāle',
        inDays: 35, hour: 17, hours: 3,
        going: u('vetras_edgars', 'zvaigznu_marite', 'rozes_arturs'),
      },
    ],
    posts: [
      { title: 'Nākamā tēma', content: 'Nākamajā reizē debatējam, vai zeķēm vajag pāri. Atbilde nav tik skaidra, kā šķiet.', daysAgo: 4 },
      { title: 'Tiesneša cepure', content: 'Tiesneša cepure ir atrasta. Tā ir pārāk liela, bet tas pieder pie lomas.', daysAgo: 15 },
    ],
  },
];

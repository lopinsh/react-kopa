import type { DemoGroup } from './types';

const u = (...keys: string[]) => keys.map((k) => `demo_${k}`);

export const RELIGION_GROUPS: DemoGroup[] = [
  {
    slug: 'klusuma-svecu-loks',
    l2: 'prayer-groups',
    name: 'Klusuma sveču loks',
    city: 'Liepaja',
    lookingFor: 'Kāds, kam patīk klusa pulcēšanās pie sveces',
    ageDays: 47,
    owner: 'demo_kapteinis_mencis',
    members: u('migla_ruta', 'saules_ilze', 'ledus_toms', 'rozes_arturs', 'zvaigznu_marite'),
    tagline: {
      lv: 'Klusa pulcēšanās pie sveces, kur katrs lūdz, domā vai vienkārši klausās.',
      en: 'A quiet gathering by a candle where each person prays, thinks or simply listens.',
    },
    about: {
      lv: '<p>Satiekamies reizi nedēļā uz pusstundu. Katrs ir laipni gaidīts neatkarīgi no ticības, un neviens netiek pārliecināts.</p>',
      en: '<p>We meet once a week for half an hour. Everyone is welcome regardless of belief, and nobody gets persuaded.</p>',
    },
    second: {
      title: { lv: 'Mūsu kārtība', en: 'How we do it' },
      body: {
        lv: '<p>Aizdedzinām sveci, apsēžamies un klusējam. Ja kāds grib, var pateikt vārdu vai divus. Beigās tēja.</p>',
        en: '<p>We light a candle, sit down and keep quiet. Anyone who wishes may say a word or two. Tea at the end.</p>',
      },
    },
    events: [
      {
        title: { lv: 'Sveču vakars', en: 'Candle evening' },
        description: {
          lv: 'Pusstunda klusuma un svecīšu gaismas. Pēc tam kopīga tēja.',
          en: 'Half an hour of silence and candlelight. Shared tea afterwards.',
        },
        location: 'Kāda mazā kapliča, Vecliepāja',
        inDays: 3, hour: 19, hours: 1,
        going: u('migla_ruta', 'saules_ilze', 'ledus_toms'),
      },
      {
        title: { lv: 'Tiešsaistes domu stunda', en: 'Online reflection hour' },
        description: {
          lv: 'Mierīga stunda domām un klusumam, ar sveci katrā mājā.',
          en: 'A calm hour for thoughts and quiet, with a candle in every home.',
        },
        isOnline: true,
        location: 'Saite tiks nosūtīta dalībniekiem',
        inDays: 14, hour: 20, hours: 1,
        going: u('rozes_arturs', 'zvaigznu_marite'),
      },
    ],
    posts: [
      { title: 'Svecītes sagādātas', content: 'Jaunu sveču pietiks visu mēnesi. Ja vari, atnes savu svečturi.', daysAgo: 4 },
      { title: 'Laiks ir mainīts', content: 'No nākamās nedēļas satiekamies stundu agrāk, lai paliek laiks tējai.', daysAgo: 13 },
    ],
  },
  {
    slug: 'lietus-dievu-svetcelnieki',
    l2: 'pilgrimages',
    name: 'Lietus dievu svētceļnieki',
    city: 'Cesis',
    lookingFor: 'Kāds ar ērtiem apaviem un mierīgu soli',
    ageDays: 69,
    owner: 'demo_zeltainais_gatis',
    members: u('migla_ruta', 'mezu_dace', 'sniega_liene', 'kapteinis_mencis', 'ledus_toms', 'vetras_edgars'),
    tagline: {
      lv: 'Pārgājieni uz senām vietām, kur lietus ir daļa no ceļojuma.',
      en: 'Walks to ancient places where the rain is part of the journey.',
    },
    about: {
      lv: '<p>Ejam no viena svētā akmens, koka vai kapelas līdz nākamajam. Dodamies lēni, klusām domām un bez steigas.</p>',
      en: '<p>We walk from one sacred stone, tree or chapel to the next. We go slowly, with quiet thoughts and no hurry.</p>',
    },
    second: {
      title: { lv: 'Ko ņemt līdzi', en: 'What to bring' },
      body: {
        lv: '<p>Ūdensnecaurlaidīgu jaku, ērtus apavus un sviestmaizi. Vietas atkarībā no laika izvēlamies uz vietas.</p>',
        en: '<p>A waterproof jacket, comfortable shoes and a sandwich. We choose the stops on the day, depending on the weather.</p>',
      },
    },
    events: [
      {
        title: { lv: 'Pirmais lietus ceļš', en: 'The first rain trail' },
        description: {
          lv: 'Seši kilometri starp trim senām vietām. Pauzēm paredzēta tēja.',
          en: 'Six kilometres between three ancient sites. Tea breaks included.',
        },
        location: 'Pulcēšanās pie Cēsu dzelzceļa stacijas',
        inDays: 8, hour: 10, hours: 5,
        going: u('migla_ruta', 'mezu_dace', 'sniega_liene', 'kapteinis_mencis'),
      },
      {
        title: { lv: 'Ceļa plānošanas vakars', en: 'Trail planning evening' },
        description: {
          lv: 'Uz kartes izvēlamies nākamo maršrutu un pārrunājam, ko ņemt līdzi.',
          en: 'We pick the next route on the map and discuss what to bring.',
        },
        location: 'Kāda mājas virtuve, Cēsis',
        inDays: 21, hour: 19, hours: 2,
        going: u('ledus_toms', 'vetras_edgars'),
      },
      {
        title: { lv: 'Rudens svētceļojums', en: 'Autumn pilgrimage' },
        description: {
          lv: 'Garāks pārgājiens ar nakšņošanu. Vietu skaits ir ierobežots.',
          en: 'A longer trip with an overnight stay. Places are limited.',
        },
        location: 'Pulcēšanās pie Cēsu dzelzceļa stacijas',
        inDays: 38, hour: 9, hours: 7,
        going: u('migla_ruta', 'mezu_dace'),
      },
    ],
    posts: [
      { title: 'Maršruts ir gatavs', content: 'Pirmais ceļš ir izstaigāts un atzīmēts kartē. Mēs tikai ejam pakaļ.', daysAgo: 4 },
      { title: 'Lietusmēteļu saraksts', content: 'Ja kādam trūkst lietusmētelis, uzrakstiet. Mums ir pāris rezerves.', daysAgo: 11 },
    ],
  },
];

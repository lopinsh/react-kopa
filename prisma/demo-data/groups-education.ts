import type { DemoGroup } from './types';

const u = (...keys: string[]) => keys.map((k) => `demo_${k}`);

export const EDUCATION_GROUPS: DemoGroup[] = [
  {
    slug: 'eksperimentalo-ermu-akademija',
    l2: 'science-talks',
    name: 'Eksperimentālo ērmu akadēmija',
    city: 'Riga',
    lookingFor: 'Kāds, kas var izskaidrot melnos caurumus ar tējkaroti',
    ageDays: 50,
    owner: 'demo_zvaigznu_marite',
    members: u('rozes_arturs', 'tintes_karlis', 'pelekais_olivers', 'saules_ilze', 'ledus_toms'),
    tagline: {
      lv: 'Zinātnes sarunas par visu, kas kūp, mirgo vai pazūd, un vēl pāris lietām.',
      en: 'Science talks about everything that smokes, flickers or vanishes, plus a few other things.',
    },
    about: {
      lv: '<p>Katru reizi viens cilvēks stāsta desmit minūtes par kaut ko, ko pats nesen uzzinājis. Pēc tam jautājam tik ilgi, kamēr kafija atdziest.</p>',
      en: '<p>Each time one person talks for ten minutes about something they recently learned. Then we ask questions until the coffee goes cold.</p>',
    },
    second: {
      title: { lv: 'Kā uzstāties', en: 'How to give a talk' },
      body: {
        lv: '<p>Pietiek ar vienu ideju un vienu piemēru. Slaidi nav obligāti, bet rekvizīti ir ļoti gaidīti.</p>',
        en: '<p>One idea and one example are enough. Slides are optional, but props are very welcome.</p>',
      },
    },
    events: [
      {
        title: { lv: 'Kāpēc debesis ir zilas', en: 'Why the sky is blue' },
        description: {
          lv: 'Trīs īsi stāsti par gaismu, vienu eksperimentu un daudz jautājumu.',
          en: 'Three short talks about light, one experiment and plenty of questions.',
        },
        location: 'Kāda pagalma telpa, Centrs',
        inDays: 8, hour: 19, hours: 2,
        going: u('rozes_arturs', 'tintes_karlis', 'pelekais_olivers'),
      },
      {
        title: { lv: 'Tiešsaistes ērmu stunda', en: 'Online oddities hour' },
        description: {
          lv: 'Stunda ar visdīvainākajiem faktiem, ko dalībnieki atraduši nedēļas laikā.',
          en: 'An hour of the strangest facts participants found during the week.',
        },
        isOnline: true,
        location: 'Saite tiks nosūtīta dalībniekiem',
        inDays: 24, hour: 20, hours: 1,
        going: u('saules_ilze', 'ledus_toms'),
      },
    ],
    posts: [
      { title: 'Tēmu saraksts atjaunots', content: 'Pievienojām tēmas par vulkāniem, bišu valodu un sāls kristāliem. Piesakies uz savu.', daysAgo: 4 },
      { title: 'Paldies par eksperimentu', content: 'Pagājušās reizes burbuļu eksperiments izdevās labāk, nekā plānots. Tīrīšana turpinās.', daysAgo: 13 },
    ],
  },
  {
    slug: 'valodu-tilts-uz-marsu',
    l2: 'languages',
    name: 'Valodu tilts uz Marsu',
    city: 'Jurmala',
    lookingFor: 'Kāds, kas runā franču vai marsiešu valodā',
    ageDays: 38,
    owner: 'demo_saules_ilze',
    members: u('tintes_karlis', 'burbulu_santa', 'zeltainais_gatis', 'rozes_arturs'),
    tagline: {
      lv: 'Valodu sarunu vakari, kuros runājam visu, kas der, lai nokļūtu līdz Marsam.',
      en: 'Language conversation evenings where we speak whatever gets us to Mars.',
    },
    about: {
      lv: '<p>Katrai valodai savs galds: angļu, vācu, franču un vēl dažas pēc vēlēšanās. Kļūdas ir gaidītas, jo bez tām tilts neizdodas.</p>',
      en: '<p>Every language has its own table: English, German, French and a few more on request. Mistakes are welcome, since without them the bridge does not hold.</p>',
    },
    second: {
      title: { lv: 'Mūsu tradīcijas', en: 'Our traditions' },
      body: {
        lv: '<p>Pirmās desmit minūtes runājam tikai par laiku. Pēdējās desmit minūtes tikai par ēdienu.</p>',
        en: '<p>The first ten minutes we speak only about the weather. The last ten only about food.</p>',
      },
    },
    events: [
      {
        title: { lv: 'Trīs valodu galdi', en: 'Three language tables' },
        description: {
          lv: 'Angļu, vācu un franču sarunas pie atsevišķiem galdiem, ar tēju un cepumiem.',
          en: 'English, German and French conversation at separate tables, with tea and biscuits.',
        },
        location: 'Kāda kafijas stūrīša zāle, Majori',
        inDays: 10, hour: 18, hours: 2,
        going: u('tintes_karlis', 'burbulu_santa', 'zeltainais_gatis'),
      },
      {
        title: { lv: 'Tiešsaistes sarunu kārta', en: 'Online conversation round' },
        description: {
          lv: 'Stunda ātrām sarunām pa pāriem. Valodu mainām ik pēc piecpadsmit minūtēm.',
          en: 'An hour of quick pair conversations. We switch languages every fifteen minutes.',
        },
        isOnline: true,
        location: 'Saite tiks nosūtīta dalībniekiem',
        inDays: 27, hour: 19, hours: 1,
        going: u('rozes_arturs'),
      },
    ],
    posts: [
      { title: 'Jauns franču galds', content: 'Franču galdam ir pietiekami daudz dalībnieku. Tāpēc tas tagad ir atsevišķs.', daysAgo: 3 },
      { title: 'Vārdu kaste', content: 'Pie ieejas stāv kaste ar neizprotamiem vārdiem. Katru reizi izvelkam vienu un cenšamies to izmantot.', daysAgo: 14 },
    ],
  },
  {
    slug: 'pucu-skolotaju-ordenis',
    l2: 'tutors',
    name: 'Pūču skolotāju ordenis',
    city: 'Daugavpils',
    lookingFor: 'Skolotājs vai skolnieks, abi der',
    ageDays: 44,
    owner: 'demo_ledus_toms',
    members: u('lapsu_anna', 'zeltainais_gatis', 'migla_ruta', 'pelekais_olivers'),
    tagline: {
      lv: 'Vietā, kur skolotāji un skolnieki atrod viens otru bez liekas steigas.',
      en: 'A place where tutors and students find each other without undue rush.',
    },
    about: {
      lv: '<p>Ordenis sanāk reizi nedēļā bibliotēkas telpā. Vieni piedāvā palīdzību matemātikā vai valodās, citi meklē kādu, kas mierīgi paskaidro. Visi sēž pie viena galda.</p>',
      en: '<p>The order meets once a week in a library room. Some offer help with maths or languages, others look for someone who explains calmly. Everyone sits at one table.</p>',
    },
    second: {
      title: { lv: 'Biežāk uzdotie jautājumi', en: 'Frequently asked' },
      body: {
        lv: '<p>Vai jāmaksā? Katrs vienojas pats. Vai drīkst atnākt tikai paklausīties? Protams, pūces ir labas klausītājas.</p>',
        en: '<p>Do I have to pay? Each pair agrees on its own. Can I just come to listen? Of course, owls are good listeners.</p>',
      },
    },
    events: [
      {
        title: { lv: 'Pūču tikšanās', en: 'The owl meeting' },
        description: {
          lv: 'Iepazīšanās un pāru veidošana: kas māca, kas mācās un kā.',
          en: 'Getting to know each other and forming pairs: who teaches, who learns and how.',
        },
        location: 'Bibliotēkas lasītava, Daugavpils',
        inDays: 6, hour: 17, hours: 2,
        going: u('lapsu_anna', 'zeltainais_gatis', 'migla_ruta'),
      },
      {
        title: { lv: 'Matemātikas klusā stunda', en: 'Quiet maths hour' },
        description: {
          lv: 'Klusa kopā mācīšanās stunda ar iespēju pajautāt, ja iestrēgst.',
          en: 'A quiet hour of studying together with a chance to ask if you get stuck.',
        },
        location: 'Bibliotēkas lasītava, Daugavpils',
        inDays: 21, hour: 17, hours: 1,
        going: u('pelekais_olivers'),
      },
    ],
    posts: [
      { title: 'Jauni skolotāji', content: 'Pie mums pievienojās divi jauni skolotāji: vienam patīk ķīmija, otram latviešu valoda.', daysAgo: 5 },
      { title: 'Grāmatu apmaiņas plaukts', content: 'Plauktā var atstāt mācību grāmatu un paņemt citu. Paldies visiem, kas jau atnesuši.', daysAgo: 16 },
    ],
  },
  {
    slug: 'puku-valodas-sarunu-klubs',
    l2: 'languages',
    name: 'Pūķu valodas sarunu klubs',
    city: 'Valmiera',
    lookingFor: 'Kāds, kas zina vismaz vienu dzejoli sengrieķu valodā',
    ageDays: 29,
    owner: 'demo_lapsu_anna',
    members: u('mezu_dace', 'rozes_arturs', 'sniega_liene', 'zvaigznu_marite', 'dzirkstele_janis'),
    tagline: {
      lv: 'Sarunu klubs senām un mazliet izdomātām valodām, kurās runā pūķi un viņu draugi.',
      en: 'A conversation club for old and slightly invented languages spoken by dragons and their friends.',
    },
    about: {
      lv: '<p>Mēs mācāmies latīņu, vecās norvēģu un citas valodas, ko nerunā neviens, bet visi saprot pēc trešās tējas krūzes. Dažreiz izdomājam arī pašu valodu.</p>',
      en: '<p>We learn Latin, Old Norse and other languages nobody speaks but everyone understands after the third cup of tea. Sometimes we even invent our own.</p>',
    },
    second: {
      title: { lv: 'Ko ņemt līdzi', en: 'What to bring' },
      body: {
        lv: '<p>Piezīmju grāmatiņu, ziņkāri un tasi. Vārdnīcas mums ir kopīgas.</p>',
        en: '<p>A notebook, curiosity and a mug. We share the dictionaries.</p>',
      },
    },
    events: [
      {
        title: { lv: 'Pirmā draudzīgā rēciena stunda', en: 'The first friendly roar lesson' },
        description: {
          lv: 'Ievads vecajā norvēģu valodā, pāris frāzes un daudz smieklu.',
          en: 'An intro to Old Norse, a few phrases and plenty of laughter.',
        },
        location: 'Kāda mājīga telpa, Valmiera',
        inDays: 12, hour: 18, hours: 2,
        going: u('mezu_dace', 'rozes_arturs', 'sniega_liene'),
      },
      {
        title: { lv: 'Latīņu dzejas vakars', en: 'Latin poetry evening' },
        description: {
          lv: 'Lasām īsus latīņu dzejoļus un meklējam, kas tajos ir smieklīgs.',
          en: 'We read short Latin poems and look for what is funny in them.',
        },
        location: 'Kāda mājīga telpa, Valmiera',
        inDays: 30, hour: 18, hours: 2,
        going: u('zvaigznu_marite', 'dzirkstele_janis'),
      },
    ],
    posts: [
      { title: 'Vārdu saraksts', content: 'Sagatavojām sarakstu ar simts noderīgiem vārdiem. Atrodams pie ieejas.', daysAgo: 7 },
      { title: 'Jauna dalībniece', content: 'Pie mums ir pievienojusies kāda, kas pārvalda islandiešu. Izmantosim to.', daysAgo: 18 },
    ],
  },
];

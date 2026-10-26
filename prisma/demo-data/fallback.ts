import type { DemoGroup, DemoUser, Text } from './types';

/**
 * A generic demo group for an ACTIVE sub-theme the data files do not name (an admin made it on the live site).
 * Built by the script at run time so every theme still ends with something to join.
 */
export function fallbackGroup(
  l2: { slug: string; title: Text },
  users: DemoUser[],
  index: number,
  slugify: (text: string) => string,
): DemoGroup {
  const pick = (n: number) => users[(index + n) % users.length].key;
  const name = `Demo grupa: ${l2.title.lv}`;
  return {
    slug: slugify(name),
    l2: l2.slug,
    name,
    city: 'Riga',
    lookingFor: 'Kāds, kas grib sākt īstu grupu',
    ageDays: 30,
    owner: pick(0),
    members: [pick(1), pick(2), pick(3), pick(4)],
    tagline: {
      lv: `Parauga grupa tēmai "${l2.title.lv}", lai redzētu, kā te viss izskatās.`,
      en: `A sample group for "${l2.title.en}", to show what things look like here.`,
    },
    about: {
      lv: `<p>Šeit varētu satikties cilvēki, kuriem patīk "${l2.title.lv}". Īstu grupu vari izveidot pats.</p>`,
      en: `<p>This is where people who enjoy "${l2.title.en}" could meet. You can create a real group yourself.</p>`,
    },
    second: {
      title: { lv: 'Kā tas notiek', en: 'How it works' },
      body: {
        lv: '<p>Grupas tikšanās, pasludinājumi un sarunas parādās tieši šeit. Kad būs īsta grupa, demo pazudīs.</p>',
        en: '<p>Meetings, announcements and chats of a group appear right here. Once a real group exists, the demo can go.</p>',
      },
    },
    events: [
      {
        title: { lv: 'Pirmā tikšanās', en: 'The first meeting' },
        description: { lv: 'Iepazīstamies un izlemjam, ko darīsim kopā.', en: 'We meet and decide what to do together.' },
        location: 'Kāda kafejnīcas telpa, Centrs',
        inDays: 8, hour: 18, hours: 2,
        going: [pick(1), pick(2)],
      },
      {
        title: { lv: 'Tiešsaistes vakars', en: 'Online evening' },
        description: { lv: 'Īsa tiešsaistes tikšanās ar tēju mājās.', en: 'A short online meeting with tea at home.' },
        isOnline: true,
        location: 'Saite tiks nosūtīta dalībniekiem',
        inDays: 22, hour: 20, hours: 1,
        going: [pick(3)],
      },
    ],
    posts: [
      { title: 'Laipni lūdzam', content: 'Šī ir demo grupa. Apskaties, kā viss izskatās, un izveido īstu.', daysAgo: 3 },
      { title: 'Nākamā tikšanās', content: 'Nākamā tikšanās jau ir kalendārā. Pievienojies, ja gribi redzēt, kā tas notiek.', daysAgo: 9 },
    ],
  };
}

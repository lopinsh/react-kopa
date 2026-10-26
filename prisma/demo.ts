/**
 * Demo content (D1): clearly imaginary groups, events and announcements so every theme has something to look at.
 * Separate from seed.ts: it never wipes anything and only writes rows it owns (demo users and groups they own).
 *
 *   npm run db:demo              add or refresh the demo content (re-run monthly to move event dates forward)
 *   npm run db:demo -- --remove  delete all demo groups and demo users
 *
 * Self-contained under prisma/: imports only @prisma/client and ./demo-data (the runner image copies only /app/prisma).
 */
import { PrismaClient } from '@prisma/client';
import { ABOUT_TITLE, DEMO_CREATE_PARAGRAPH, DEMO_EMAIL_DOMAIN, DEMO_GROUPS, DEMO_L2S, DEMO_NOTICE, DEMO_USERS } from './demo-data';
import type { DemoGroup, DemoUser } from './demo-data';

const prisma = new PrismaClient();

const LOOKING_FOR_MAX = 60;
const TAGLINE_MAX = 200;
const demoEmail = (username: string) => `${username}@${DEMO_EMAIL_DOMAIN}`;

function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

/** Riga wall-clock `hour:00`, `inDays` from today, as a UTC Date (the container runs in UTC). */
function rigaDate(inDays: number, hour: number): Date {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Riga', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
  const [y, m, d] = parts.split('-').map(Number);
  const wall = Date.UTC(y, m - 1, d + inDays, hour, 0, 0);
  const offsetMs = (instant: number): number => {
    const label = new Intl.DateTimeFormat('en', { timeZone: 'Europe/Riga', timeZoneName: 'shortOffset' })
      .formatToParts(new Date(instant)).find((p) => p.type === 'timeZoneName')?.value ?? 'GMT+2';
    const match = /GMT([+-])(\d+)(?::(\d+))?/.exec(label);
    if (!match) return 2 * 3600_000;
    const sign = match[1] === '-' ? -1 : 1;
    return sign * (Number(match[2]) * 60 + Number(match[3] ?? 0)) * 60_000;
  };
  const first = wall - offsetMs(wall);
  return new Date(wall - offsetMs(first));
}

/** Fail early on data mistakes, before any write. */
function validate(): void {
  const userKeys = new Set(DEMO_USERS.map((u) => u.key));
  const seen = new Set<string>();
  for (const g of DEMO_GROUPS) {
    const where = `group "${g.name}"`;
    if (g.slug !== slugify(g.name)) throw new Error(`${where}: slug should be "${slugify(g.name)}"`);
    if (seen.has(g.slug)) throw new Error(`${where}: duplicate slug`);
    seen.add(g.slug);
    if (g.lookingFor.length > LOOKING_FOR_MAX) throw new Error(`${where}: lookingFor over ${LOOKING_FOR_MAX}`);
    if (g.tagline.lv.length > TAGLINE_MAX || g.tagline.en.length > TAGLINE_MAX) throw new Error(`${where}: tagline over ${TAGLINE_MAX}`);
    if (g.events.length < 2 || g.events.length > 3) throw new Error(`${where}: needs 2-3 events`);
    if (g.posts.length !== 2) throw new Error(`${where}: needs 2 posts`);
    const keys = [g.owner, ...g.members, ...g.events.flatMap((e) => e.going)];
    for (const k of keys) if (!userKeys.has(k)) throw new Error(`${where}: unknown user ${k}`);
    if (g.members.includes(g.owner)) throw new Error(`${where}: owner listed as member`);
    const evSlugs = g.events.map((e) => slugify(e.title.lv));
    if (new Set(evSlugs).size !== evSlugs.length) throw new Error(`${where}: duplicate event slug`);
    for (const p of g.posts) if (p.title.length > 60) throw new Error(`${where}: post title over 60`);
  }
}

async function demoUserIds(): Promise<string[]> {
  const users = await prisma.user.findMany({ where: { email: { endsWith: `@${DEMO_EMAIL_DOMAIN}` } }, select: { id: true } });
  return users.map((u) => u.id);
}

async function removeAll(): Promise<void> {
  const ids = await demoUserIds();
  const groups = await prisma.group.deleteMany({ where: { members: { some: { role: 'OWNER', userId: { in: ids } } } } });
  const users = await prisma.user.deleteMany({ where: { id: { in: ids } } });
  console.log(`Removed ${groups.count} demo groups and ${users.count} demo users (the new sub-themes stay).`);
}

async function upsertTaxonomy(): Promise<void> {
  let created = 0;
  for (const l2 of DEMO_L2S) {
    const parent = await prisma.category.findUnique({ where: { slug: l2.l1 }, select: { id: true } });
    if (!parent) {
      console.warn(`  ! theme "${l2.l1}" not found, skipping sub-theme "${l2.slug}"`);
      continue;
    }
    const before = await prisma.category.findUnique({ where: { slug: l2.slug }, select: { id: true } });
    await prisma.category.upsert({
      where: { slug: l2.slug },
      update: {},
      create: {
        slug: l2.slug,
        slugLv: slugify(l2.lv),
        level: 2,
        parentId: parent.id,
        status: 'ACTIVE',
        titles: { create: [{ lang: 'lv', title: l2.lv }, { lang: 'en', title: l2.en }] },
      },
    });
    if (!before) created++;
  }
  console.log(`Sub-themes: ${DEMO_L2S.length} checked, ${created} created.`);
}

async function upsertUsers(): Promise<Map<string, string>> {
  const ids = new Map<string, string>();
  for (const u of DEMO_USERS as DemoUser[]) {
    const fields = {
      name: u.name,
      username: u.username,
      bio: u.bio,
      avatarSeed: u.username,
      cities: u.cities,
      role: 'USER' as const,
      allowDirectMessages: false,
      isProfilePublic: true,
      showGroupsOnProfile: true,
    };
    const row = await prisma.user.upsert({ where: { email: demoEmail(u.username) }, update: fields, create: { email: demoEmail(u.username), ...fields } });
    ids.set(u.key, row.id);
  }
  console.log(`Demo users: ${ids.size}.`);
  return ids;
}

interface Ctx {
  userId: Map<string, string>;
  allDemoIds: string[];
  cityOk: (slug: string) => string;
}

async function syncGroup(g: DemoGroup, l1Id: string, l2Id: string, ctx: Ctx): Promise<'created' | 'updated' | 'skipped'> {
  const existing = await prisma.group.findUnique({
    where: { categoryId_slug: { categoryId: l1Id, slug: g.slug } },
    select: { id: true, members: { where: { role: 'OWNER' }, select: { userId: true } } },
  });
  if (existing && !existing.members.some((m) => ctx.allDemoIds.includes(m.userId))) {
    console.warn(`  ! "${g.slug}" is taken by a real group, skipped`);
    return 'skipped';
  }
  const ownerId = ctx.userId.get(g.owner) as string;
  const city = ctx.cityOk(g.city);
  const data = {
    name: g.name,
    city,
    lookingFor: g.lookingFor,
    bannerImage: `https://picsum.photos/seed/demo-${g.slug}/1200/675`,
    type: 'PUBLIC' as const,
    isAcceptingMembers: true,
    description: null,
    tags: { set: [{ id: l2Id }] },
  };
  const about: Record<'lv' | 'en', string> = {
    lv: `<p>${DEMO_NOTICE.lv} ${g.tagline.lv}</p>${g.about.lv}${DEMO_CREATE_PARAGRAPH.lv}`,
    en: `<p>${DEMO_NOTICE.en} ${g.tagline.en}</p>${g.about.en}${DEMO_CREATE_PARAGRAPH.en}`,
  };

  await prisma.$transaction(async (tx) => {
    const group = existing
      ? await tx.group.update({ where: { id: existing.id }, data })
      : await tx.group.create({
          data: { ...data, slug: g.slug, categoryId: l1Id, createdAt: new Date(Date.now() - g.ageDays * 86400_000), tags: { connect: [{ id: l2Id }] } },
        });

    // Sections: replaced wholesale (a demo group's text is ours).
    await tx.groupSection.deleteMany({ where: { groupId: group.id } });
    await tx.groupSection.create({
      data: {
        groupId: group.id, order: 0, visibility: 'PUBLIC', originalLang: 'lv',
        translations: { create: [
          { lang: 'lv', title: ABOUT_TITLE.lv, content: about.lv },
          { lang: 'en', title: ABOUT_TITLE.en, content: about.en },
        ] },
      },
    });
    await tx.groupSection.create({
      data: {
        groupId: group.id, order: 1, visibility: 'PUBLIC', originalLang: 'lv',
        translations: { create: [
          { lang: 'lv', title: g.second.title.lv, content: g.second.body.lv },
          { lang: 'en', title: g.second.title.en, content: g.second.body.en },
        ] },
      },
    });

    // Memberships: owner + listed members; other demo memberships go, real ones stay.
    const wanted = [g.owner, ...g.members].map((k) => ctx.userId.get(k) as string);
    await tx.membership.deleteMany({ where: { groupId: group.id, userId: { in: ctx.allDemoIds.filter((id) => !wanted.includes(id)) } } });
    await tx.membership.upsert({
      where: { userId_groupId: { userId: ownerId, groupId: group.id } }, update: { role: 'OWNER' }, create: { userId: ownerId, groupId: group.id, role: 'OWNER' },
    });
    for (const k of g.members) {
      const userId = ctx.userId.get(k) as string;
      await tx.membership.upsert({
        where: { userId_groupId: { userId, groupId: group.id } }, update: { role: 'MEMBER' }, create: { userId, groupId: group.id, role: 'MEMBER' },
      });
    }

    // Events: upsert by slug, dates move with the run date; demo events not in the data go.
    const slugs = g.events.map((e) => slugify(e.title.lv));
    await tx.event.deleteMany({ where: { groupId: group.id, creatorId: { in: ctx.allDemoIds }, slug: { notIn: slugs } } });
    for (const e of g.events) {
      const slug = slugify(e.title.lv);
      const startDate = rigaDate(e.inDays, e.hour);
      const endDate = new Date(startDate.getTime() + (e.hours ?? 2) * 3600_000);
      const fields = {
        location: e.location, city: ctx.cityOk(e.city ?? g.city), isOnline: e.isOnline ?? false,
        visibility: 'PUBLIC' as const, joinMode: 'OPEN' as const, startDate, endDate, creatorId: ownerId, originalLang: 'lv',
      };
      const event = await tx.event.upsert({
        where: { groupId_slug: { groupId: group.id, slug } },
        update: fields,
        create: { ...fields, groupId: group.id, slug },
      });
      for (const lang of ['lv', 'en'] as const) {
        await tx.eventTranslation.upsert({
          where: { eventId_lang: { eventId: event.id, lang } },
          update: { title: e.title[lang], description: e.description[lang] },
          create: { eventId: event.id, lang, title: e.title[lang], description: e.description[lang] },
        });
      }
      const going = e.going.map((k) => ctx.userId.get(k) as string);
      await tx.attendance.deleteMany({ where: { eventId: event.id, userId: { in: ctx.allDemoIds.filter((id) => !going.includes(id)) } } });
      for (const userId of going) {
        await tx.attendance.upsert({
          where: { userId_eventId: { userId, eventId: event.id } }, update: { status: 'GOING' }, create: { userId, eventId: event.id, status: 'GOING' },
        });
      }
    }

    // Announcements: demo-authored posts are replaced, others stay.
    await tx.post.deleteMany({ where: { groupId: group.id, authorId: { in: ctx.allDemoIds } } });
    for (const p of g.posts) {
      await tx.post.create({
        data: {
          groupId: group.id, authorId: ownerId, title: p.title, content: p.content, visibility: 'PUBLIC',
          createdAt: new Date(Date.now() - p.daysAgo * 86400_000),
        },
      });
    }
  }, { timeout: 60_000, maxWait: 10_000 });
  return existing ? 'updated' : 'created';
}

async function apply(): Promise<void> {
  validate();
  await upsertTaxonomy();
  const userId = await upsertUsers();
  const allDemoIds = [...userId.values()];

  const activeCities = new Set((await prisma.city.findMany({ where: { status: 'ACTIVE' }, select: { slug: true } })).map((c) => c.slug));
  const warnedCities = new Set<string>();
  const cityOk = (slug: string): string => {
    if (activeCities.has(slug)) return slug;
    if (!warnedCities.has(slug)) console.warn(`  ! city "${slug}" is not active, using Riga`);
    warnedCities.add(slug);
    return 'Riga';
  };

  const counts = { created: 0, updated: 0, skipped: 0 };
  for (const g of DEMO_GROUPS) {
    const l2 = await prisma.category.findUnique({ where: { slug: g.l2 }, select: { id: true, parentId: true, status: true } });
    if (!l2 || l2.status !== 'ACTIVE' || !l2.parentId) {
      console.warn(`  ! sub-theme "${g.l2}" missing or not active, skipped "${g.slug}"`);
      counts.skipped++;
      continue;
    }
    const result = await syncGroup(g, l2.parentId, l2.id, { userId, allDemoIds, cityOk });
    counts[result]++;
    console.log(`  ${result.padEnd(7)} ${g.slug}`);
  }
  console.log(`Groups: ${counts.created} created, ${counts.updated} updated, ${counts.skipped} skipped.`);

  const stale = await prisma.group.deleteMany({
    where: { members: { some: { role: 'OWNER', userId: { in: allDemoIds } } }, slug: { notIn: DEMO_GROUPS.map((g) => g.slug) } },
  });
  if (stale.count) console.log(`Removed ${stale.count} demo groups no longer in the data.`);

  // Coverage: every ACTIVE sub-theme (including admin-made ones) and how many demo groups it has.
  const demoGroups = await prisma.group.findMany({
    where: { members: { some: { role: 'OWNER', userId: { in: allDemoIds } } } },
    select: { tags: { select: { id: true } } },
  });
  const perL2 = new Map<string, number>();
  for (const dg of demoGroups) for (const t of dg.tags) perL2.set(t.id, (perL2.get(t.id) ?? 0) + 1);
  const activeL2 = await prisma.category.findMany({ where: { level: 2, status: 'ACTIVE' }, select: { id: true, slug: true } });
  const missing = activeL2.filter((c) => !perL2.has(c.id)).map((c) => c.slug);
  if (missing.length) console.warn(`No demo group: ${missing.join(', ')}`);
  else console.log('Coverage: every active sub-theme has a demo group.');

  const [events, posts] = await Promise.all([
    prisma.event.count({ where: { creatorId: { in: allDemoIds } } }),
    prisma.post.count({ where: { authorId: { in: allDemoIds } } }),
  ]);
  console.log(`Totals: ${allDemoIds.length} users, ${demoGroups.length} groups, ${events} events, ${posts} posts.`);
  console.log('Boards cache for up to 5 minutes, so new cards may take that long to show.');
}

async function main(): Promise<void> {
  if (process.argv.includes('--remove')) await removeAll();
  else await apply();
}

main()
  .catch((err: unknown) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());

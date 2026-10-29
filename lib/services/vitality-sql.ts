import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { DEFAULT_TIME_ZONE } from '@/lib/time-zone';
import { DEMO_EMAIL_DOMAIN, VITALITY_MIN_MEMBERS, VITALITY_WEEKS, type VitalitySeriesKey } from '@/lib/constants/vitality';

/** Raw SQL for the vitality panel (R31). Values are always bound; fragments are `Prisma.sql`. */

export const DAY_MS = 86_400_000;

/** A JS date as a UTC `timestamp` (the column type; Prisma stores UTC without a zone). Passed as ISO text so the session zone never matters. */
export const utc = (d: Date) => Prisma.sql`(${d.toISOString()}::timestamptz AT TIME ZONE 'UTC')`;
/** A JS date as a wall-clock `timestamp` in the site zone (Europe/Riga). */
const riga = (d: Date) => Prisma.sql`(${d.toISOString()}::timestamptz AT TIME ZONE ${DEFAULT_TIME_ZONE})`;
/** A stored UTC column as a wall-clock `timestamp` in the site zone. */
const localCol = (col: Prisma.Sql) => Prisma.sql`((${col} AT TIME ZONE 'UTC') AT TIME ZONE ${DEFAULT_TIME_ZONE})`;

export type Demo = { user: (col: Prisma.Sql) => Prisma.Sql; group: (col: Prisma.Sql) => Prisma.Sql };

/** The one demo rule: a demo user has a demo-domain email (null email is real); a demo group is owned by one. */
export function demoFilter(includeDemo: boolean): Demo {
    if (includeDemo) return { user: () => Prisma.sql`TRUE`, group: () => Prisma.sql`TRUE` };
    const users = Prisma.sql`SELECT id FROM "User" WHERE email LIKE ${'%@' + DEMO_EMAIL_DOMAIN}`;
    const groups = Prisma.sql`SELECT "groupId" FROM "Membership" WHERE role = 'OWNER' AND "userId" IN (${users})`;
    return {
        user: (col) => Prisma.sql`${col} NOT IN (${users})`,
        group: (col) => Prisma.sql`${col} NOT IN (${groups})`,
    };
}

const SOURCES: Record<VitalitySeriesKey, (d: Demo) => Prisma.Sql> = {
    users: (d) => Prisma.sql`SELECT u."createdAt" AS at FROM "User" u WHERE ${d.user(Prisma.sql`u.id`)}`,
    groups: (d) => Prisma.sql`SELECT g."createdAt" AS at FROM "Group" g WHERE ${d.group(Prisma.sql`g.id`)}`,
    joins: (d) => Prisma.sql`SELECT m."joinedAt" AS at FROM "Membership" m WHERE m.role IN ('MEMBER', 'ADMIN') AND ${d.user(Prisma.sql`m."userId"`)} AND ${d.group(Prisma.sql`m."groupId"`)}`,
    events: (d) => Prisma.sql`SELECT e."createdAt" AS at FROM "Event" e WHERE ${d.group(Prisma.sql`e."groupId"`)}`,
    signups: (d) => Prisma.sql`SELECT a."joinedAt" AS at FROM "Attendance" a JOIN "Event" e ON e.id = a."eventId" WHERE a.status IN ('GOING', 'PENDING', 'WAITLISTED') AND ${d.user(Prisma.sql`a."userId"`)} AND ${d.group(Prisma.sql`e."groupId"`)}`,
};

export type SeriesRow = { total: number; last7: number; last30: number; prev30: number; week: string; count: number };

/** One series: totals and the 12 Monday weeks (Europe/Riga), oldest first, as 12 rows carrying the same totals. */
export function seriesRows(key: VitalitySeriesKey, now: Date, d: Demo): Promise<SeriesRow[]> {
    const since = (days: number) => utc(new Date(now.getTime() - days * DAY_MS));
    const thisWeek = Prisma.sql`date_trunc('week', ${riga(now)})`;
    const back = Prisma.sql`(${VITALITY_WEEKS - 1} * interval '1 week')`;
    return prisma.$queryRaw<SeriesRow[]>(Prisma.sql`
        WITH src AS (${SOURCES[key](d)}),
        tot AS (
            SELECT count(*)::int AS total,
                   (count(*) FILTER (WHERE at >= ${since(7)}))::int AS last7,
                   (count(*) FILTER (WHERE at >= ${since(30)}))::int AS last30,
                   (count(*) FILTER (WHERE at >= ${since(60)} AND at < ${since(30)}))::int AS prev30
            FROM src
        ),
        wk AS (
            SELECT w, (SELECT count(*)::int FROM src WHERE date_trunc('week', ${localCol(Prisma.sql`src.at`)}) = w) AS count
            FROM generate_series(${thisWeek} - ${back}, ${thisWeek}, interval '1 week') AS w
        )
        SELECT tot.*, to_char(wk.w, 'YYYY-MM-DD') AS week, wk.count FROM tot CROSS JOIN wk ORDER BY wk.w
    `);
}

export type ParticipationRow = {
    users: number; inGroup: number; groups: number; avgMembers: number; groupsMin3: number;
    messages7: number; messages30: number; posts7: number; posts30: number;
};

export async function participationRow(now: Date, d: Demo): Promise<ParticipationRow> {
    const since = (days: number) => utc(new Date(now.getTime() - days * DAY_MS));
    const rows = await prisma.$queryRaw<ParticipationRow[]>(Prisma.sql`
        WITH gm AS (
            SELECT g.id, count(m.id) FILTER (WHERE m.role IN ('OWNER', 'ADMIN', 'MEMBER'))::int AS n
            FROM "Group" g LEFT JOIN "Membership" m ON m."groupId" = g.id
            WHERE ${d.group(Prisma.sql`g.id`)} GROUP BY g.id
        )
        SELECT
            (SELECT count(*)::int FROM "User" u WHERE ${d.user(Prisma.sql`u.id`)}) AS users,
            (SELECT count(DISTINCT m."userId")::int FROM "Membership" m WHERE m.role IN ('OWNER', 'ADMIN', 'MEMBER') AND ${d.user(Prisma.sql`m."userId"`)}) AS "inGroup",
            (SELECT count(*)::int FROM gm) AS groups,
            (SELECT coalesce(avg(n), 0)::float8 FROM gm) AS "avgMembers",
            (SELECT count(*)::int FROM gm WHERE n >= ${VITALITY_MIN_MEMBERS}) AS "groupsMin3",
            (SELECT count(*)::int FROM "Message" x WHERE x."createdAt" >= ${since(7)} AND ${d.user(Prisma.sql`x."senderId"`)}) AS messages7,
            (SELECT count(*)::int FROM "Message" x WHERE x."createdAt" >= ${since(30)} AND ${d.user(Prisma.sql`x."senderId"`)}) AS messages30,
            (SELECT count(*)::int FROM "Post" x WHERE x."createdAt" >= ${since(7)} AND ${d.user(Prisma.sql`x."authorId"`)} AND ${d.group(Prisma.sql`x."groupId"`)}) AS posts7,
            (SELECT count(*)::int FROM "Post" x WHERE x."createdAt" >= ${since(30)} AND ${d.user(Prisma.sql`x."authorId"`)} AND ${d.group(Prisma.sql`x."groupId"`)}) AS posts30
    `);
    return rows[0];
}

export type HealthRow = { id: string; members: number; active: boolean; lastActivity: Date };

/** Every visible (not hidden) group: its ADMIN+MEMBER count, whether it showed life in the window, and its last sign of life. */
export function healthRows(now: Date, activeDays: number, d: Demo): Promise<HealthRow[]> {
    const from = utc(new Date(now.getTime() - activeDays * DAY_MS));
    const to = utc(new Date(now.getTime() + activeDays * DAY_MS));
    const nowU = utc(now);
    return prisma.$queryRaw<HealthRow[]>(Prisma.sql`
        SELECT g.id,
            (SELECT count(*)::int FROM "Membership" m WHERE m."groupId" = g.id AND m.role IN ('ADMIN', 'MEMBER')) AS members,
            (coalesce(sign.at >= ${from}, FALSE) OR EXISTS (SELECT 1 FROM "Event" e WHERE e."groupId" = g.id AND e."startDate" > ${nowU} AND e."startDate" <= ${to})) AS active,
            coalesce(sign.at, g."createdAt") AS "lastActivity"
        FROM "Group" g
        CROSS JOIN LATERAL (SELECT GREATEST(
            (SELECT max(m."joinedAt") FROM "Membership" m WHERE m."groupId" = g.id AND m.role IN ('ADMIN', 'MEMBER')),
            (SELECT max(p."createdAt") FROM "Post" p WHERE p."groupId" = g.id),
            (SELECT max(ms."createdAt") FROM "Message" ms JOIN "Conversation" c ON c.id = ms."conversationId" WHERE c."originGroupId" = g.id),
            (SELECT max(e."createdAt") FROM "Event" e WHERE e."groupId" = g.id),
            (SELECT max(e."startDate") FROM "Event" e WHERE e."groupId" = g.id AND e."startDate" <= ${nowU})
        ) AS at) sign
        WHERE g."hiddenAt" IS NULL AND ${d.group(Prisma.sql`g.id`)}
    `);
}

export type PresenceRow = { active1: number; active7: number; active30: number; cohort: number; returned: number; since: Date | null };

/** Active users by `lastSeenAt` (R31-2) and the return rate of those who signed up 30-60 days ago. */
export async function presenceRow(now: Date, d: Demo): Promise<PresenceRow> {
    const since = (days: number) => utc(new Date(now.getTime() - days * DAY_MS));
    const rows = await prisma.$queryRaw<PresenceRow[]>(Prisma.sql`
        WITH u AS (SELECT "createdAt", "lastSeenAt" FROM "User" x WHERE ${d.user(Prisma.sql`x.id`)})
        SELECT
            (count(*) FILTER (WHERE "lastSeenAt" >= ${since(1)}))::int AS active1,
            (count(*) FILTER (WHERE "lastSeenAt" >= ${since(7)}))::int AS active7,
            (count(*) FILTER (WHERE "lastSeenAt" >= ${since(30)}))::int AS active30,
            (count(*) FILTER (WHERE "createdAt" >= ${since(60)} AND "createdAt" < ${since(30)}))::int AS cohort,
            (count(*) FILTER (WHERE "createdAt" >= ${since(60)} AND "createdAt" < ${since(30)} AND "lastSeenAt" >= ${since(30)}))::int AS returned,
            min("lastSeenAt") AS since
        FROM u
    `);
    return rows[0];
}

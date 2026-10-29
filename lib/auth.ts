import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import github from "next-auth/providers/github";
import google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { PresenceService } from "@/lib/services/presence.service";
import { cookies } from "next/headers";

/** The site language from next-intl's cookie, for the email digest (R33). Never throws: where cookies are out of reach the email goes in the default language. */
async function readLocaleCookie(): Promise<string | null> {
    try {
        return (await cookies()).get("NEXT_LOCALE")?.value ?? null;
    } catch {
        return null;
    }
}

// Simple per-user password map for local development.
// Key: email, Value: password
const DEV_PASSWORDS: Record<string, string> = {
    "user@local": "user",
    "admin@local": "admin",
    "owner@local": "owner",
    "siteowner@local": "siteowner",
    "member@local": "member",
    "oskars@local": "oskars",
    "liga@local": "liga",
    "andris@local": "andris",
    "marta@local": "marta",
    "janis@local": "janis",
    "anna@local": "anna",
    "toms@local": "toms",
    "santa@local": "santa",
    "test@example.com": "kopa2026",
};

const ROLE_RECHECK_MS = 60_000;
// The last-visit day is written at most this often per user (R31-2).
const LAST_SEEN_EVERY_MS = 24 * 60 * 60_000;

// Seed accounts with site powers have public passwords: never allowed in production.
const SEED_SITE_ADMINS = new Set(["admin@local", "siteowner@local"]);

export const { handlers, auth, signIn, signOut } = NextAuth({
    adapter: PrismaAdapter(prisma),
    session: { strategy: "jwt" },
    providers: [
        github({
            clientId: process.env.GITHUB_ID,
            clientSecret: process.env.GITHUB_SECRET,
        }),
        google({
            clientId: process.env.GOOGLE_ID,
            clientSecret: process.env.GOOGLE_SECRET,
        }),
        Credentials({
            name: "Login",
            credentials: {
                email: { label: "Email", type: "email", placeholder: "you@example.com" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                const email = credentials?.email as string;
                const password = credentials?.password as string;

                if (!email || !password) return null;

                const user = await prisma.user.findFirst({
                    where: { email: { equals: email.trim(), mode: 'insensitive' } },
                });
                if (!user) return null;

                if (user.password) {
                    const isValid = await bcrypt.compare(password, user.password);
                    if (!isValid) return null;
                } else {
                    // Fallback for seeded dev accounts. In production only when
                    // ALLOW_DEV_PASSWORDS=true (test server, docker-compose.server.yml),
                    // and never for the seed site admin — its password is public.
                    if (process.env.NODE_ENV === "production") {
                        if (process.env.ALLOW_DEV_PASSWORDS !== "true") return null;
                        if (SEED_SITE_ADMINS.has(email.trim().toLowerCase())) return null;
                    }
                    const expectedPassword = DEV_PASSWORDS[email];
                    if (!expectedPassword || password !== expectedPassword) return null;
                }

                return { id: user.id, name: user.name, email: user.email, image: user.image };
            },
        }),
    ],
    pages: {
        signIn: "/auth/signin",
    },
    callbacks: {
        jwt: async ({ token, user, trigger }) => {
            if (user) {
                token.id = user.id as string;
                // Fetch user profile data on sign-in so middleware and server code
                // can use it without repeated DB calls.
                const dbUser = await prisma.user.findUnique({
                    where: { id: user.id as string },
                    select: { username: true, role: true, avatarSeed: true },
                });
                token.username = dbUser?.username ?? null;
                token.role = dbUser?.role ?? 'USER';
                token.avatarSeed = dbUser?.avatarSeed ?? null;
                token.roleCheckedAt = Date.now();
            } else if (token.id && Date.now() - Number(token.roleCheckedAt ?? 0) > ROLE_RECHECK_MS) {
                // The owner can make or remove admins, so a long-lived token must not keep a stale role:
                // re-read just the role from the DB at most once a minute.
                const dbUser = await prisma.user.findUnique({ where: { id: token.id as string }, select: { role: true } });
                // A deleted user keeps no site powers.
                token.role = dbUser?.role ?? 'USER';
                token.roleCheckedAt = Date.now();
            }
            if (trigger === "update" && token.id) {
                // Anyone signed in can POST any payload to /api/auth/session, so the
                // client's values are never trusted: refresh the profile from the DB.
                const dbUser = await prisma.user.findUnique({
                    where: { id: token.id as string },
                    select: { name: true, image: true, username: true, role: true, avatarSeed: true },
                });
                if (dbUser) {
                    token.name = dbUser.name;
                    token.picture = dbUser.image;
                    token.username = dbUser.username;
                    token.role = dbUser.role;
                    token.avatarSeed = dbUser.avatarSeed;
                }
            }
            if (token.id && Date.now() - Number(token.lastSeenWrittenAt ?? 0) > LAST_SEEN_EVERY_MS) {
                // Day-level last visit for the admin vitality panel. A failed write never signs anyone out.
                try {
                    await PresenceService.touch(token.id as string, await readLocaleCookie());
                    token.lastSeenWrittenAt = Date.now();
                } catch (error) {
                    // Retry in a minute, not on every request while the DB is down.
                    token.lastSeenWrittenAt = Date.now() - LAST_SEEN_EVERY_MS + ROLE_RECHECK_MS;
                    console.error('lastSeenAt write failed', error);
                }
            }
            return token;
        },
        session: ({ session, token }) => {
            if (session.user) {
                session.user.id = token.id as string;
                session.user.username = (token.username as string | null) ?? null;
                session.user.role = (token.role as 'USER' | 'ADMIN' | 'OWNER') ?? 'USER';
                session.user.avatarSeed = (token.avatarSeed as string | null | undefined) ?? null;
                if (token.picture) {
                    session.user.image = token.picture as string;
                }
            }
            return session;
        },
    },
});

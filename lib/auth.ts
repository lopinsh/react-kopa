import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import github from "next-auth/providers/github";
import google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

// Simple per-user password map for local development.
// Key: email, Value: password
const DEV_PASSWORDS: Record<string, string> = {
    "user@local": "user",
    "admin@local": "admin",
    "owner@local": "owner",
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
                        if (email === "admin@local") return null;
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
            return token;
        },
        session: ({ session, token }) => {
            if (session.user) {
                session.user.id = token.id as string;
                session.user.username = (token.username as string | null) ?? null;
                session.user.role = (token.role as 'USER' | 'ADMIN') ?? 'USER';
                session.user.avatarSeed = (token.avatarSeed as string | null | undefined) ?? null;
                if (token.picture) {
                    session.user.image = token.picture as string;
                }
            }
            return session;
        },
    },
});

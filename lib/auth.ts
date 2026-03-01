import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import github from "next-auth/providers/github";
import google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";

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
            name: "Test Login",
            credentials: {
                email: { label: "Email", type: "email", placeholder: "user@local" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                const email = credentials?.email as string;
                const password = credentials?.password as string;

                // Check password against the dev map
                const expectedPassword = DEV_PASSWORDS[email];
                if (!expectedPassword || password !== expectedPassword) return null;

                const user = await prisma.user.findUnique({ where: { email } });
                if (!user) return null;

                return { id: user.id, name: user.name, email: user.email, image: user.image };
            },
        }),
    ],
    pages: {
        signIn: "/auth/signin",
    },
    callbacks: {
        jwt: async ({ token, user, trigger, session }) => {
            if (user) {
                token.id = user.id as string;
                // Fetch username from DB on initial sign-in so middleware can
                // check it without a DB call on every request.
                const dbUser = await prisma.user.findUnique({
                    where: { id: user.id as string },
                    select: { username: true },
                });
                token.username = dbUser?.username ?? null;
            }
            if (trigger === "update" && session) {
                if (session.name !== undefined) token.name = session.name;
                if (session.image !== undefined) token.picture = session.image;
                // Called after onboarding saves a username — refresh the token
                // so the middleware intercept clears immediately.
                if (session.username !== undefined) token.username = session.username;
            }
            return token;
        },
        session: ({ session, token }) => {
            if (session.user) {
                session.user.id = token.id as string;
                session.user.username = (token.username as string | null) ?? null;
                if (token.picture) {
                    session.user.image = token.picture as string;
                }
            }
            return session;
        },
    },
});


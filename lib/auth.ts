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

                const user = await prisma.user.findUnique({ where: { email } });
                if (!user) return null;

                if (user.password) {
                    const isValid = await bcrypt.compare(password, user.password);
                    if (!isValid) return null;
                } else {
                    // Fallback for dev passwords
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
        jwt: async ({ token, user, trigger, session }) => {
            if (user) {
                token.id = user.id as string;
                // Fetch user profile data on sign-in so middleware and server code
                // can use it without repeated DB calls.
                const dbUser = await prisma.user.findUnique({
                    where: { id: user.id as string },
                    select: { username: true, role: true },
                });
                token.username = dbUser?.username ?? null;
                token.role = dbUser?.role ?? 'USER';
            }
            if (trigger === "update" && session) {
                if (session.name !== undefined) token.name = session.name;
                if (session.image !== undefined) token.picture = session.image;
                if (session.username !== undefined) token.username = session.username;
                if (session.role !== undefined) token.role = session.role;
            }
            return token;
        },
        session: ({ session, token }) => {
            if (session.user) {
                session.user.id = token.id as string;
                session.user.username = (token.username as string | null) ?? null;
                session.user.role = (token.role as 'USER' | 'ADMIN') ?? 'USER';
                if (token.picture) {
                    session.user.image = token.picture as string;
                }
            }
            return session;
        },
    },
});

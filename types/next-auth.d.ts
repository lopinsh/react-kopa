import type { DefaultSession } from "next-auth";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            username: string | null;
            role: 'USER' | 'ADMIN';
        } & DefaultSession["user"];
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        username: string | null;
        role: 'USER' | 'ADMIN';
    }
}

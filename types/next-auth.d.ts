import type { DefaultSession } from "next-auth";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            username: string | null;
            avatarSeed: string | null;
            role: 'USER' | 'ADMIN' | 'OWNER';
        } & DefaultSession["user"];
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        username: string | null;
        avatarSeed?: string | null;
        role: 'USER' | 'ADMIN' | 'OWNER';
        roleCheckedAt?: number;
        // When this session signed in; older than emailVerified = ended (Google link, lib/auth.ts).
        signedInAt?: number;
        lastSeenWrittenAt?: number;
    }
}

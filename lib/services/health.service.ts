import { prisma } from '@/lib/prisma';

export interface HealthContext {
    ok: boolean;
    database: 'up' | 'down';
}

/** Liveness + DB reachability, used by the deploy health check and the front proxy. */
export const HealthService = {
    async check(): Promise<HealthContext> {
        try {
            await prisma.$queryRaw`SELECT 1`;
            return { ok: true, database: 'up' };
        } catch {
            return { ok: false, database: 'down' };
        }
    },
};

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const group = await prisma.group.findFirst({
        select: {
            slug: true,
            category: {
                select: {
                    slug: true,
                    parent: {
                        select: { slug: true }
                    }
                }
            }
        }
    });
    console.log(JSON.stringify(group));
}

main().catch(console.error).finally(() => prisma.$disconnect());

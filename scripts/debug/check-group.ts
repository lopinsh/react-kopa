import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();
async function main() {
    try {
        const group = await prisma.group.findFirst({
            where: { slug: 'geocaching-klubs' },
            include: {
                tags: true,
                category: {
                    include: {
                        parent: {
                            include: {
                                parent: true
                            }
                        }
                    }
                }
            }
        });
        console.log('GROUP_DATA_START');
        console.log(JSON.stringify(group, null, 2));
        console.log('GROUP_DATA_END');
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}
main();

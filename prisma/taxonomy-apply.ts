import type { PrismaClient } from '@prisma/client';
import { SUBTOPICS, TOPIC_PHOTOS, type TopicPhoto } from './taxonomy-content';

const photoCols = (p: TopicPhoto) => ({ imagePath: p.path, imageCreditName: p.name, imageCreditUser: p.username });

/**
 * Applies the approved content (D4, D11) to the Veidi in `l2Ids` (slug -> id): their photo, and the sub-veidi under them with theirs.
 * Idempotent and gentle: a sub-veids is created with `update: {}` (an admin rename survives), a photo is written only where all three
 * image columns are empty, nobody's group tags are touched. Returns slug -> id for the sub-veidi under `l2Ids`.
 */
export async function applyTaxonomyContent(prisma: PrismaClient, l2Ids: Map<string, string>): Promise<Map<string, string>> {
  const subIds = new Map<string, string>();
  const fill = (id: string, p: TopicPhoto | null | undefined) =>
    p ? prisma.category.updateMany({ where: { id, imagePath: null, imageCreditName: null, imageCreditUser: null }, data: photoCols(p) }) : null;
  for (const [slug, id] of l2Ids) await fill(id, TOPIC_PHOTOS[slug]);
  for (const s of SUBTOPICS) {
    const parentId = l2Ids.get(s.parent);
    if (!parentId) continue;
    const row = await prisma.category.upsert({
      where: { slug: s.slug },
      update: {},
      create: {
        slug: s.slug, level: 3, parentId, status: 'ACTIVE',
        titles: { create: [{ lang: 'lv', title: s.lv }, { lang: 'en', title: s.en }] },
      },
    });
    subIds.set(s.slug, row.id);
    await fill(row.id, s.photo);
  }
  console.log(`Taxonomy content: ${l2Ids.size} Veidi checked, ${subIds.size} sub-veidi present.`);
  return subIds;
}

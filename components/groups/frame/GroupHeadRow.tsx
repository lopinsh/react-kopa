import type { BannerCredit } from '@/lib/validations/banner';
import { getSmartImageUrl } from '@/lib/image-utils';
import GroupHead from './GroupHead';
import HeadPicture from './HeadPicture';

/** The head row of a group (layout): the info tile and, on Informācija, the group's picture beside it. No picture: the tile takes the whole row. */
export default function GroupHeadRow({ image, credit }: { image: string | null; credit?: BannerCredit }) {
    return <GroupHead picture={image ? <HeadPicture image={getSmartImageUrl(image)} credit={credit} /> : undefined} />;
}

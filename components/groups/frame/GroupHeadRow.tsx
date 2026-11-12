import type { BannerCredit } from '@/lib/validations/banner';
import { getSmartImageUrl } from '@/lib/image-utils';
import GroupHead from './GroupHead';
import HeadPicture from './HeadPicture';

/** The head row of a group (layout): the info tile (photo = the group's own picture, else its hub's, K-151) and, on Informācija below 1024, the picture as a strip under it. */
export default function GroupHeadRow({ image, credit, hubPhoto }: { image: string | null; credit?: BannerCredit; hubPhoto?: string }) {
    const own = image ? getSmartImageUrl(image) : null;
    return <GroupHead photo={own ?? hubPhoto} picture={own ? <HeadPicture variant="strip" image={own} credit={credit} /> : undefined} />;
}

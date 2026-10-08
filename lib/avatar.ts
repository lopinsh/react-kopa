/** What a user avatar needs: an uploaded/OAuth photo, or a seed for the generated one. */
export interface AvatarUser {
    id: string;
    image?: string | null;
    avatarSeed?: string | null;
}

/**
 * The URL to show for a user's avatar.
 * A real photo (upload, Google, GitHub) wins; otherwise a DiceBear "clay" figure
 * seeded by the user's avatar seed, or their id so it never changes on rename.
 * Stored DiceBear URLs from older styles count as generated and are replaced.
 */
export function avatarUrl(user: AvatarUser): string {
    const image = user.image?.trim();
    if (image && !image.includes('api.dicebear.com')) return image;
    const seed = user.avatarSeed?.trim() || user.id;
    return `https://api.dicebear.com/10.x/clay/svg?seed=${encodeURIComponent(seed)}`;
}

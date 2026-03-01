import { NextRequest, NextResponse } from 'next/server';
import { GroupService } from '@/lib/services/group.service';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    const { slug } = await params;

    // Get query parameters locale and path
    const searchParams = request.nextUrl.searchParams;
    const locale = searchParams.get('locale') || 'lv';
    const path = searchParams.get('path');

    // Fetch group to determine l1Slug
    const group = await GroupService.getGroupWithContext(slug, locale);

    if (!group) {
        // Fallback to home if group doesn't exist
        return NextResponse.redirect(new URL(`/${locale}`, request.url));
    }

    // Construct the fully resolved canonical URL
    let destinationUrl = `/${locale}/${group.category.l1Slug}/group/${slug}`;

    // Append any trailing paths (like /settings, /members, etc.)
    if (path) {
        destinationUrl += `/${path}`;
    }

    // Issue a 301 Permanent Redirect
    return NextResponse.redirect(new URL(destinationUrl, request.url), 301);
}

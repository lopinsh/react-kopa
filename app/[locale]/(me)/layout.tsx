import { auth } from '@/lib/auth';
import { getTranslations } from 'next-intl/server';
import { UserService } from '@/lib/services/user.service';
import { avatarUrl } from '@/lib/avatar';
import { cityLabel } from '@/lib/city-label';
import { MeProvider } from '@/components/providers/MeProvider';
import PersonHeader from '@/components/me/PersonHeader';
import MeMenu from '@/components/me/MeMenu';
import MePhoneBar from '@/components/me/MePhoneBar';
import FrameColumns from '@/components/ui/FrameColumns';

/**
 * The frame of your own area (AR-60): a person header and the pages down the left on desktop, a bar with a ☰ drawer on phones.
 * Signed out there is no frame; the pages keep their own sign-in redirect (and Manas grupas its guest view).
 */
export default async function MeLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const session = await auth();
    const ctx = session?.user?.id ? await UserService.getOwnAreaContext(session.user.id) : null;
    // Signed out there is no frame, but the page still starts at the frame's spacing.
    if (!ctx) return <div className="mx-auto max-w-6xl px-3 pb-6 pt-3 md:px-[22px] md:pt-[18px]">{children}</div>;

    const [t, tCities] = await Promise.all([
        getTranslations({ locale, namespace: 'profile' }),
        getTranslations({ locale, namespace: 'cities' }),
    ]);
    const line = [cityLabel(tCities, ctx.firstCity), t('area.groupCount', { count: ctx.groupCount })].filter(Boolean).join(' · ');

    return (
        <MeProvider value={{ name: ctx.name || t('anonymousUser'), avatarSrc: avatarUrl(ctx), line }}>
            <PersonHeader />
            <MePhoneBar />
            <FrameColumns nav={<MeMenu variant="side" />} className="[--me-head:64px] md:[--me-head:72px]">
                {children}
            </FrameColumns>
        </MeProvider>
    );
}

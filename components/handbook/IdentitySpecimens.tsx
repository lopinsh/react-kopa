import { useTranslations } from 'next-intl';
import { CATEGORY_TONE_SLUGS } from '@/lib/constants';
import { categoryColor } from '@/lib/theme/category';
import { CategoryDisc } from '@/components/ui/CategoryIcon';
import Logo from '@/components/ui/Logo';

/** The wordmark in both sizes and as circles only. */
export function LogoSamples() {
    const t = useTranslations('admin.handbook.ui');
    return (
        <div className="flex flex-wrap items-end gap-x-10 gap-y-6">
            <div className="space-y-2"><Logo /><p className="text-meta text-foreground-muted">{t('logoDesktop')}</p></div>
            <div className="space-y-2"><Logo size="sm" /><p className="text-meta text-foreground-muted">{t('logoPhone')}</p></div>
            <div className="space-y-2"><Logo iconOnly /><p className="text-meta text-foreground-muted">{t('logoIconOnly')}</p></div>
        </div>
    );
}

const ROLES = ['pageTitle', 'section', 'item', 'body', 'small', 'note'] as const;

/** The type scale: Literata for titles, Commissioner for text, the human note in the site colour. */
export function TypeSamples() {
    const t = useTranslations('admin.handbook.ui');
    const text = {
        pageTitle: t('sample.groupName'),
        section: t('sample.announcementTitle'),
        item: t('sample.eventTitle'),
        body: t('sample.groupDescription'),
        small: t('sample.eventLocation'),
        note: t('sample.noteText'),
    };
    const cls = {
        pageTitle: 'text-section text-foreground',
        section: 'text-item text-foreground',
        item: 'text-item text-foreground',
        body: 'text-body-sm text-foreground',
        small: 'text-meta text-foreground-muted',
        note: 'human-note',
    };
    return (
        <div className="space-y-4">
            {ROLES.map((role) => (
                <div key={role} className="grid gap-1 sm:grid-cols-[11rem_1fr] sm:gap-4">
                    <p className="text-meta text-foreground-muted">{t(`typeRoles.${role}`)}</p>
                    <p className={cls[role]}>{text[role]}</p>
                </div>
            ))}
        </div>
    );
}

const SWATCHES = [
    ['background', 'bg-background text-foreground'],
    ['surface', 'bg-surface text-foreground'],
    ['tint', 'bg-tint text-foreground'],
    ['border', 'bg-border text-foreground'],
    ['foreground', 'bg-foreground text-background'],
    ['muted', 'bg-foreground-muted text-background'],
    ['primary', 'bg-primary text-primary-foreground'],
    ['danger', 'bg-danger text-danger-foreground'],
    ['success', 'bg-success text-background'],
    ['warning', 'bg-warning text-background'],
] as const;

/** Swatches of the site colours and the 15 category tones; they follow the light/dark toggle of the page. */
export function ColourSamples() {
    const t = useTranslations('admin.handbook.ui');
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                {SWATCHES.map(([name, cls]) => (
                    <div key={name} className={`flex h-16 items-end rounded-xl p-2 text-body-sm weight-medium ring-1 ring-inset ring-border ${cls}`}>
                        {t(`colourRoles.${name}`)}
                    </div>
                ))}
            </div>
            <div>
                <p className="mb-3 text-meta text-foreground">{t('tonesTitle')}</p>
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
                    {CATEGORY_TONE_SLUGS.map((slug) => (
                        <div key={slug} className="flex items-center gap-2 text-meta text-foreground-muted">
                            <CategoryDisc slug={slug} color={categoryColor(slug)} />
                            {slug}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { Palette } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { auth } from '@/lib/auth';
import { signInUrl } from '@/lib/auth-redirect';
import { getActiveTheme } from '@/lib/theme/server';
import DesignEditor from '@/components/admin/design/DesignEditor';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'admin.nav' });
    return { title: t('design') };
}

export default async function AdminDesignPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations('admin.design');

    const session = await auth();
    if (!session?.user?.id) redirect(signInUrl(locale, '/admin/design'));
    if (session.user.role !== 'ADMIN') notFound();

    // Start from what this admin currently sees: their preview if they have one, otherwise the published theme.
    const theme = await getActiveTheme();

    return (
        <div className="container mx-auto max-w-6xl px-4 py-8">
            <div className="mb-6 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Palette className="h-6 w-6" />
                </div>
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-foreground">{t('title')}</h1>
                    <p className="mt-1 text-foreground-muted">{t('subtitle')}</p>
                </div>
            </div>
            {theme.isPreview && <p className="mb-6 rounded-xl border border-border bg-surface px-4 py-3 text-sm font-semibold text-foreground">{t('previewActive')}</p>}
            <DesignEditor
                key={`${theme.id ?? 'default'}-${theme.presetKey}`}
                initial={{ presetKey: theme.presetKey, light: theme.light, dark: theme.dark, headingFont: theme.headingFont, bodyFont: theme.bodyFont }}
            />
        </div>
    );
}

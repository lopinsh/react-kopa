import { getTranslations } from 'next-intl/server';
import { MessageSquare, Clock } from 'lucide-react';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function MessagesPlaceholderPage({
    params
}: {
    params: Promise<{ locale: string; l1Slug: string }>
}) {
    const { locale, l1Slug } = await params;
    const session = await auth();

    if (!session?.user) {
        redirect(`/${locale}/${l1Slug}/login`);
    }

    const t = await getTranslations('messages');

    return (
        <div className="container mx-auto max-w-4xl px-4 py-8 md:py-12 mt-16 lg:mt-0">
            <h1 className="text-3xl font-black text-foreground mb-8 tracking-tight">{t('title')}</h1>

            <div className="flex flex-col items-center justify-center text-center py-20 px-4 rounded-3xl border border-dashed border-border bg-surface shadow-sm">
                <div className="relative mb-6">
                    <div className="absolute inset-0 bg-blue-500/10 blur-xl rounded-full" />
                    <div className="h-20 w-20 rounded-3xl bg-surface-elevated flex items-center justify-center border border-border relative">
                        <MessageSquare className="h-10 w-10 text-blue-500" />
                        <div className="absolute -bottom-2 -right-2 bg-background rounded-full p-1">
                            <Clock className="h-5 w-5 text-foreground-muted animate-pulse" />
                        </div>
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-foreground mb-3">{t('comingSoon')}</h2>
                <p className="text-foreground-muted max-w-sm mb-8 leading-relaxed">
                    {t('placeholderDescription')}
                </p>

                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[var(--accent)] bg-[var(--accent)]/10 px-4 py-2 rounded-xl">
                    <span>{t('inDevelopment')}</span>
                </div>
            </div>
        </div>
    );
}

'use client';

import { Link } from '@/i18n/routing';
import { Heart } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { UI } from '@/lib/constants';

export function Footer({ locale }: { locale: string }) {
    const t = useTranslations('shell.footer');
  const c_common = useTranslations('common');
    const currentYear = new Date().getFullYear();

    const sections = [
        {
            title: c_common('platform'),
            links: [
                { label: c_common('discover'), href: `/` },
                { label: c_common('myGroups'), href: `/profile/my-groups` },
                { label: c_common('createGroup'), href: `/create` },
            ]
        },
        {
            title: t('information'),
            links: [
                { label: c_common('about'), href: '/about' },
                { label: t('privacy'), href: '/privacy' },
            ]
        }
    ];

    return (
        <footer data-ui={UI.footer} className="border-t border-border bg-surface-elevated/30 py-12 pb-24 md:pb-12">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    {/* Brand */}
                    <div className="col-span-1">
                        <Link href={`/`} className="flex items-center gap-2 group">
                            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center group-hover:rotate-12 transition-transform shadow-md">
                                <span className="text-white font-bold text-sm">{c_common('brandShort')}</span>
                            </div>
                            <span className="text-xl font-bold bg-clip-text text-transparent bg-linear-to-r from-indigo-500 to-rose-500">
                                {t('logoSubtitle')}
                            </span>
                        </Link>
                        <p className="mt-4 max-w-xs text-sm leading-relaxed text-foreground-muted">
                            {t('mission')}
                        </p>
                    </div>

                    {/* Links */}
                    {sections.map((section) => (
                        <div key={section.title}>
                            <h3 className="text-xs font-black uppercase tracking-widest text-foreground-muted mb-4">{section.title}</h3>
                            <ul className="space-y-3">
                                {section.links.map((link) => (
                                    <li key={link.label}>
                                        <Link
                                            href={link.href}
                                            className="text-sm text-foreground-muted hover:text-indigo-400 transition-colors"
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-6">
                    <p className="text-sm text-foreground-muted">
                        © {currentYear} {c_common('brandName')}. {t('madeWith')} <Heart className="h-3 w-3 inline text-rose-500 mx-1 fill-rose-500" /> {t('forCommunity')}
                    </p>
                </div>
            </div>
        </footer>
    );
}

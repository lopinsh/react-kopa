'use client';

import { Link } from '@/i18n/routing';
import { Github, Twitter, Instagram, Mail, Heart } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function Footer({ locale }: { locale: string }) {
    const t = useTranslations('shell.footer');
    const currentYear = new Date().getFullYear();

    const sections = [
        {
            title: t('platform'),
            links: [
                { label: t('discover'), href: `/explore` },
                { label: t('myGroups'), href: `/profile/my-groups` },
                { label: t('createGroup'), href: `/create` },
            ]
        },
        {
            title: t('support'),
            links: [
                { label: t('helpCenter'), href: '#' },
                { label: t('privacyPolicy'), href: '#' },
                { label: t('terms'), href: '#' },
            ]
        },
        {
            title: t('about'),
            links: [
                { label: t('mission'), href: '#' },
                { label: t('guidelines'), href: '#' },
                { label: t('contact'), href: '#' },
            ]
        }
    ];

    return (
        <footer className="border-t border-border bg-surface-elevated/30 py-12 pb-24 md:pb-12">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                    {/* Brand */}
                    <div className="col-span-1">
                        <Link href={`/`} className="flex items-center gap-2 group">
                            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center group-hover:rotate-12 transition-transform shadow-md">
                                <span className="text-white font-bold text-sm">EK</span>
                            </div>
                            <span className="text-xl font-bold bg-clip-text text-transparent bg-linear-to-r from-indigo-500 to-rose-500">
                                {t('logoSubtitle')}
                            </span>
                        </Link>
                        <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/50">
                            {t('mission')}
                        </p>
                        <div className="mt-6 flex items-center gap-4">
                            <a href="#" className="text-white/40 hover:text-white transition-colors">
                                <Instagram className="h-5 w-5" />
                            </a>
                            <a href="#" className="text-white/40 hover:text-white transition-colors">
                                <Github className="h-5 w-5" />
                            </a>
                            <a href="#" className="text-white/40 hover:text-white transition-colors">
                                <Twitter className="h-5 w-5" />
                            </a>
                        </div>
                    </div>

                    {/* Links */}
                    {sections.map((section) => (
                        <div key={section.title}>
                            <h3 className="text-xs font-black uppercase tracking-widest text-white/40 mb-4">{section.title}</h3>
                            <ul className="space-y-3">
                                {section.links.map((link) => (
                                    <li key={link.label}>
                                        <Link
                                            href={link.href}
                                            className="text-sm text-white/60 hover:text-indigo-400 transition-colors"
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
                    <p className="text-sm text-white/30">
                        © {currentYear} Ejam Kopā. {t('madeWith')} <Heart className="h-3 w-3 inline text-rose-500 mx-1 fill-rose-500" /> {t('forCommunity')}
                    </p>
                    <div className="flex items-center gap-6">
                        <Link href={`/explore`} className="text-xs font-medium text-white/30 hover:text-white transition-colors">
                            {t('languageLabel')}
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}

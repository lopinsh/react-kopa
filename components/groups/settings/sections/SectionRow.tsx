'use client';

import { useTranslations } from 'next-intl';
import { GripVertical, Lock } from 'lucide-react';
import { clsx } from 'clsx';
import SectionRowActions from './SectionRowActions';
import type { SectionDraft } from '@/components/groups/SectionEditForm';

const stripHtml = (html: string) => {
    if (typeof window === 'undefined') return html.replace(/<[^>]*>/g, '');
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || '';
};

type Props = {
    section: SectionDraft;
    index: number;
    isLast: boolean;
    isEditing: boolean;
    isPending: boolean;
    onToggle: () => void;
    onMove: (direction: 'up' | 'down') => void;
    /** The open edit form, shown under the row. */
    children?: React.ReactNode;
};

export default function SectionRow({ section, index, isLast, isEditing, isPending, onToggle, onMove, children }: Props) {
    const c_common = useTranslations('common');
    const original = section.texts[section.originalLang];

    return (
        <div
            className={clsx(
                'group relative overflow-hidden rounded-2xl border transition-all duration-200',
                isEditing
                    ? 'border-primary bg-surface-elevated ring-4 ring-primary/5'
                    : 'border-border bg-surface hover:border-primary/30'
            )}
        >
            <div className="relative flex items-center gap-4 p-4 has-[button[data-row-toggle]:focus-visible]:outline has-[button[data-row-toggle]:focus-visible]:outline-2 has-[button[data-row-toggle]:focus-visible]:-outline-offset-2 has-[button[data-row-toggle]:focus-visible]:outline-primary md:p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface-elevated text-foreground-muted">
                    {index === 0 ? <span className="text-xs font-semibold">0</span> : <GripVertical className="h-4 w-4" />}
                </div>

                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                        <h3 lang={section.originalLang} className="font-semibold text-foreground">
                            {/* The whole row is the button: the stretched overlay opens and closes the section; the move buttons sit above it. */}
                            <button
                                type="button"
                                data-row-toggle
                                aria-expanded={isEditing}
                                onClick={onToggle}
                                className="cursor-pointer text-left outline-none after:absolute after:inset-0"
                            >
                                {original.title}
                            </button>
                        </h3>
                        {section.visibility === 'MEMBERS_ONLY' && (
                            <span className="flex items-center gap-1 rounded-full bg-primary/10 px-1.5 py-0.5 text-[11px] font-medium text-primary">
                                <Lock className="h-2.5 w-2.5" />
                                {c_common('visibilityMembersOnly')}
                            </span>
                        )}
                    </div>
                    <p lang={section.originalLang} className="mt-0.5 line-clamp-1 text-xs text-foreground-muted">
                        {original.content ? stripHtml(original.content) : c_common('emptyContent')}
                    </p>
                </div>

                <SectionRowActions index={index} isLast={isLast} isEditing={isEditing} isPending={isPending} onMove={onMove} />
            </div>

            {isEditing && (
                <div className="border-t border-border/50 p-6 pt-0">
                    {children}
                </div>
            )}
        </div>
    );
}

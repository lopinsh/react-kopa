'use client';

import { useState, useTransition } from 'react';
import { useTranslations, useFormatter } from 'next-intl';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { Calendar, MapPin, Users, ArrowRight, CheckCircle2, HelpCircle } from 'lucide-react';
import { toggleAttendance } from '@/actions/event-actions';
import { clsx } from 'clsx';
import { useAuthGate } from '@/lib/useAuthGate';
import AuthGateModal from '@/components/modals/AuthGateModal';

import Image from 'next/image';

type Props = {
    event: {
        id: string;
        title: string;
        description: string | null;
        startDate: Date;
        location: string | null;
        isAttending: boolean;
        attendeeCount: number;
        isMembersOnly?: boolean;
        isRecurring?: boolean;
        recurrencePattern?: string | null;
        bannerImage?: string | null;
        instructions?: string | null;
        group?: {
            name: string;
            slug: string;
            category: { slug: string };
        };
        attendeeList: { id: string; name: string | null; image: string | null }[];
    };
    locale: string;
    href: string;
};

export default function EventCard({ event, locale, href }: Props) {
    const t = useTranslations('group');
    const tErrors = useTranslations('errors');
    const tEvent = useTranslations('event');
    const formatter = useFormatter();
    const { error: toastError } = useToast();
    const timeZone = 'Europe/Riga';
    const [isPending, startTransition] = useTransition();
    const { gateAction, isModalOpen, closeModal } = useAuthGate();

    const handleRSVP = () => {
        gateAction(() => {
            startTransition(async () => {
                const result = await toggleAttendance(event.id, event.isAttending ? 'NONE' : 'GOING', locale);
                if (!result.success) toastError(tErrors(result.error as 'ACTION_FAILED'));
            });
        });
    };

    return (
        <div
            className="group relative flex flex-col gap-6 overflow-hidden rounded-3xl border border-border bg-surface p-6 transition-all hover:border-[var(--accent)] hover:shadow-premium"
        >
            {/* Banner Background */}
            {event.bannerImage && (
                <div className="absolute inset-0 z-0 h-32 w-full opacity-20">
                    <Image
                        src={event.bannerImage}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-surface" />
                </div>
            )}

            <div className="relative z-10 flex items-start justify-between">
                <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-black uppercase tracking-widest text-[var(--accent)]">
                            {formatter.dateTime(new Date(event.startDate), { weekday: 'long', day: 'numeric', month: 'long', timeZone })}
                        </span>
                        {event.isMembersOnly && (
                            <span className="rounded-full bg-surface-elevated px-2 py-0.5 text-[10px] font-black uppercase tracking-tighter text-foreground-muted">
                                {tEvent('membersOnly')}
                            </span>
                        )}
                        {event.isRecurring && (
                            <span className="rounded-full bg-[var(--accent)]/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-tighter text-[var(--accent)]">
                                {t('recurring')}
                            </span>
                        )}
                    </div>
                    <h3 className="mt-2 text-xl font-bold text-foreground group-hover:text-[var(--accent)] transition-colors">
                        {event.title}
                    </h3>
                    {event.isRecurring && event.recurrencePattern && (
                        <p className="mt-1 text-xs font-bold text-[var(--accent)]/80">
                            {event.recurrencePattern}
                        </p>
                    )}
                </div>

                {/* Date Badge */}
                <div className="flex h-12 w-12 flex-col items-center justify-center rounded-2xl bg-surface-elevated font-bold shadow-sm">
                    <span className="text-lg leading-none">{formatter.dateTime(new Date(event.startDate), { day: 'numeric', timeZone })}</span>
                    <span className="text-[10px] uppercase text-foreground-muted">{formatter.dateTime(new Date(event.startDate), { month: 'short', timeZone })}</span>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-foreground-muted">
                <div className="flex items-center gap-1.5 font-medium">
                    <Calendar className="h-4 w-4" />
                    {formatter.dateTime(new Date(event.startDate), { hour: '2-digit', minute: '2-digit', hour12: false, timeZone })}
                </div>
                {event.location && (
                    <div className="flex items-center gap-1.5 font-medium">
                        <MapPin className="h-4 w-4" />
                        {event.location}
                    </div>
                )}
                <div className="flex items-center gap-1.5 font-medium">
                    <Users className="h-4 w-4" />
                    {event.attendeeCount} {t('attending')}
                </div>
            </div>

            {
                event.description && (
                    <div
                        className="line-clamp-3 text-sm text-foreground-muted leading-relaxed prose prose-sm prose-invert max-w-none"
                        dangerouslySetInnerHTML={{ __html: event.description }}
                    />
                )
            }

            {
                event.instructions && (
                    <div className="relative z-10 rounded-xl border border-[var(--accent)]/10 bg-[var(--accent)]/5 p-3 text-xs">
                        <div className="flex items-center gap-1.5 font-bold text-[var(--accent)] mb-1">
                            <HelpCircle className="h-3 w-3" />
                            {t('specialInstructions')}
                        </div>
                        <div
                            className="prose prose-xs prose-invert max-w-none text-foreground-muted/80"
                            dangerouslySetInnerHTML={{ __html: event.instructions }}
                        />
                    </div>
                )
            }

            {/* Attendee Avatars */}
            {
                event.attendeeList.length > 0 && (
                    <div className="flex items-center -space-x-2">
                        {event.attendeeList.map((user, idx) => (
                            <div
                                key={user.id}
                                className="h-7 w-7 rounded-full border-2 border-surface bg-surface-elevated overflow-hidden ring-1 ring-border shadow-sm"
                                style={{ zIndex: 10 - idx }}
                            >
                                {user.image ? (
                                    <Image
                                        src={user.image}
                                        alt={user.name || ''}
                                        width={28}
                                        height={28}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center text-[10px] font-bold text-foreground-muted">
                                        {user.name?.[0] || '?'}
                                    </div>
                                )}
                            </div>
                        ))}
                        {event.attendeeCount > event.attendeeList.length && (
                            <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-surface bg-surface-elevated text-[10px] font-bold text-foreground-muted ring-1 ring-border shadow-sm">
                                +{event.attendeeCount - event.attendeeList.length}
                            </div>
                        )}
                    </div>
                )
            }

            <div className="mt-auto flex items-center gap-2">
                <button
                    onClick={handleRSVP}
                    disabled={isPending}
                    className={clsx(
                        "flex flex-1 items-center justify-center gap-2 rounded-2xl py-3 text-sm font-bold transition-all disabled:opacity-50",
                        event.isAttending
                            ? "bg-primary/10 text-primary hover:bg-primary/20"
                            : "bg-surface-elevated text-foreground hover:bg-[var(--accent)] hover:text-white shadow-card"
                    )}
                >
                    {isPending ? (
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    ) : event.isAttending ? (
                        <>
                            <CheckCircle2 className="h-4 w-4" />
                            {t('attendingStatus')}
                        </>
                    ) : (
                        t('attendButton')
                    )}
                </button>

                <Link
                    href={href}
                    aria-label={event.title}
                    className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border bg-surface text-foreground-muted hover:bg-surface-elevated transition-colors"
                >
                    <ArrowRight className="h-4 w-4" />
                </Link>
            </div>

            <AuthGateModal isOpen={isModalOpen} onClose={closeModal} />
        </div >
    );
}

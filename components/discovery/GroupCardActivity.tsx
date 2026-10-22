import { Clock, Plus, Scissors } from 'lucide-react';
import { useTranslations } from 'next-intl';
import ActivityNote from './ActivityNote';
import Faces from '@/components/ui/Faces';
import type { CardActivity } from '@/lib/services/card-activity';
import type { Face } from '@/lib/services/event-panel';

type Props = {
    activity?: CardActivity;
    lookingFor: string | null;
    faces?: Face[];
    memberCount: number;
    /** City and member count, already worded ("Rīga · 12 biedri"). */
    place: string;
    /** The empty seat: open for a viewer who is not in the group, a clock while their request waits, none for members. */
    seat: 'open' | 'pending' | 'none';
};

/** A neutral tag-sized dashed ring for the seat. */
export function Seat({ pending, label }: { pending: boolean; label: string }) {
    // ui-allow: a 28 px dashed circle, the empty seat
    return (
        <span role="img" aria-label={label} className="grid size-7 shrink-0 place-items-center rounded-full border-[1.5px] border-dashed border-foreground-muted/60 text-foreground-muted">
            {pending ? <Clock aria-hidden="true" className="size-3.5" /> : <Plus aria-hidden="true" className="size-3.5" />}
        </span>
    );
}

/**
 * A group card's tear-off tab (R18): perforation and scissors on top, a tone tint below, two fixed rows so a grid row keeps one height.
 * Row 1, the note: a running meeting, the next meeting, the newest public announcement, else "Ko meklējam?"; none: the row is left out.
 * Row 2: faces and the seat on the left, city and members on the right.
 */
export default function GroupCardActivity({ activity, lookingFor, faces = [], memberCount, place, seat }: Props) {
    const t = useTranslations('discovery');
    const more = memberCount - faces.length;

    return (
        <div className="relative mt-auto flex h-24 flex-col justify-center gap-2 rounded-b-2xl px-[var(--card-pad)] tab-tint text-meta text-foreground">
            <span aria-hidden="true" className="perforation" />
            <Scissors aria-hidden="true" className="tear-scissors size-4" />
            <ActivityNote activity={activity} lookingFor={lookingFor} />
            <div className="flex min-w-0 items-center gap-2">
                <Faces faces={faces} size="lg" />
                {faces.length > 0 && more > 0 && <span className="shrink-0 weight-strong">+{more}</span>}
                {seat !== 'none' && <Seat pending={seat === 'pending'} label={seat === 'pending' ? t('seatPending') : t('seatOpen')} />}
                <span className="ml-auto min-w-0 truncate text-foreground-muted">{place}</span>
            </div>
        </div>
    );
}

'use client';

import { useEffect, useRef } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { addMinutesLocal, localTimeExists, minutesBetween, nextFullHourLocal, toLocalValue } from '@/lib/local-datetime';
import type { EventFormData } from '@/lib/validations/event';
import type { EventToEdit } from '@/components/forms/event/EventForm';

/** The start and end of the event form: filled in after mount, the end follows the start, the skipped DST hour is refused. */
export function useEventTimes(form: UseFormReturn<EventFormData>, event?: EventToEdit) {
    const { setValue, getValues, setError } = form;
    // Once the organiser empties the end, start changes stop filling it in again.
    const endLeftEmpty = useRef(!!event && !event.endDate);

    // Done after mount because the server renders in its own zone (UTC in production), not the viewer's:
    // computing these during render would show server-zone times and mismatch on hydration.
    // Editing: the stored times in the browser zone. New event: start at the next full hour.
    useEffect(() => {
        if (getValues('startDate')) return;
        if (event) {
            setValue('startDate', toLocalValue(event.startDate));
            setValue('endDate', toLocalValue(event.endDate));
            return;
        }
        const start = nextFullHourLocal();
        setValue('startDate', start);
        setValue('endDate', addMinutesLocal(start, 120));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /** The end moves with the start: same length as before, or 2 hours when there was none. */
    function changeStart(next: string) {
        const previousStart = String(getValues('startDate') ?? '');
        const previousEnd = String(getValues('endDate') ?? '');
        setValue('startDate', next, { shouldDirty: true, shouldValidate: true });
        if (!next) return;
        if (previousEnd) {
            const length = previousStart ? minutesBetween(previousStart, previousEnd) : null;
            setValue('endDate', addMinutesLocal(next, length && length > 0 ? length : 120), { shouldDirty: true, shouldValidate: true });
        } else if (!endLeftEmpty.current) {
            setValue('endDate', addMinutesLocal(next, 120), { shouldDirty: true, shouldValidate: true });
        }
    }

    function changeEnd(next: string) {
        endLeftEmpty.current = next === '';
        setValue('endDate', next, { shouldDirty: true, shouldValidate: true });
    }

    /**
     * The hour the clocks skip would silently become the next one: marks such a start or end with TIME_SKIPPED
     * (client-only, see localTimeExists). True when both times exist.
     */
    function markSkippedTimes(): boolean {
        const skipped = (['startDate', 'endDate'] as const).filter((n) => {
            const v = String(getValues(n) ?? '');
            return v !== '' && !localTimeExists(v);
        });
        skipped.forEach((n) => setError(n, { type: 'custom', message: 'TIME_SKIPPED' }));
        return skipped.length === 0;
    }

    return { changeStart, changeEnd, markSkippedTimes };
}

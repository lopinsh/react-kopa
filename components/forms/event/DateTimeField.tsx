'use client';

import { splitLocal, joinLocal } from '@/lib/local-datetime';
import DateField from '@/components/forms/event/DateField';
import TimeSelect from '@/components/forms/event/TimeSelect';

type Props = {
    /** Local "YYYY-MM-DDTHH:mm" in the viewer's zone, or '' when empty. */
    value: string;
    onChange: (value: string) => void;
    /** Time used when a date is picked while no time is set yet. */
    defaultTime?: string;
    invalid?: boolean;
    idPrefix: string;
};

/** A date field and a time field for one moment. */
export default function DateTimeField({ value, onChange, defaultTime = '12:00', invalid, idPrefix }: Props) {
    const { date, time } = splitLocal(value);

    return (
        <div className="grid grid-cols-[minmax(0,1fr)_6.5rem] gap-2">
            <DateField
                id={`${idPrefix}-date`}
                value={date}
                invalid={invalid}
                onChange={(d) => onChange(joinLocal(d, time || defaultTime))}
            />
            <TimeSelect
                id={`${idPrefix}-time`}
                value={time}
                invalid={invalid}
                disabled={!date}
                onChange={(tm) => onChange(joinLocal(date, tm))}
            />
        </div>
    );
}

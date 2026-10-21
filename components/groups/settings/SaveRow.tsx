'use client';

import { useTranslations } from 'next-intl';
import { Save, AlertCircle } from 'lucide-react';

type Props = {
    isPending: boolean;
    disabled: boolean;
    serverError: string | null;
};

export default function SaveRow({ isPending, disabled, serverError }: Props) {
    const gt = useTranslations('group');
    const c_common = useTranslations('common');

    return (
        <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
                type="submit"
                disabled={isPending || disabled}
                className="flex h-14 items-center gap-3 rounded-pill bg-primary px-10 weight-strong text-primary-foreground transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
            >
                {isPending ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                ) : (
                    <Save className="h-5 w-5" />
                )}
                {c_common('saveChanges')}
            </button>

            {serverError ? (
                <div role="alert" className="flex items-center gap-2 rounded-2xl border border-danger/40 bg-danger/10 p-4 text-danger">
                    <AlertCircle className="h-4 w-4" />
                    <p className="text-body-sm">{serverError}</p>
                </div>
            ) : (
                <p className="text-meta text-foreground-muted">
                    {gt('saveChangesDesc')}
                </p>
            )}
        </div>
    );
}

'use client';

import { useTranslations } from 'next-intl';
import { Save, AlertCircle } from 'lucide-react';
import Button from '@/components/ui/Button';

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
            <Button
                type="submit"
                disabled={isPending || disabled}
            >
                {isPending ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                ) : (
                    <Save className="size-5" />
                )}
                {c_common('saveChanges')}
            </Button>

            {serverError ? (
                <div role="alert" className="flex items-center gap-2 rounded-2xl border border-danger/40 bg-danger/10 p-4 text-danger">
                    <AlertCircle className="size-4" />
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

import { useTranslations } from 'next-intl';
import type { PendingCategoryWithContext, ActiveL2WithAliases } from '@/lib/services/taxonomy.service';
import PendingInboxCard from './PendingInboxCard';

type Props = {
    pending: PendingCategoryWithContext;
    canonicalOptions: ActiveL2WithAliases[];
    onClose: () => void;
};

export default function SlideoverPendingView({ pending, canonicalOptions }: Props) {
    const t = useTranslations('admin.taxonomy.slideover');

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-item text-foreground-muted mb-4">{t('pendingTitle')}</h3>
                {/* We can just reuse PendingInboxCard which already has the full triage UI */}
                <PendingInboxCard
                    item={pending}
                    canonicalOptions={canonicalOptions}
                    onSelect={() => { }}
                />
            </div>
        </div>
    );
}

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { createTopic } from '@/actions/taxonomy-actions';
import { useToast } from '@/hooks/use-toast';
import type { L2Category } from '@/lib/services/taxonomy.service';
import type { SelectedTaxonomyNode } from './TaxonomyTree';
import { Input } from '@/components/ui/Input';
import Button from '@/components/ui/Button';

type Props = {
    l2: L2Category;
    l1Id: string;
    onNodeSelect: (node: SelectedTaxonomyNode) => void;
};

/** The sub-veidi (L3) of a Veids with the form to add one. */
export default function SlideoverSubtopics({ l2, l1Id, onNodeSelect }: Props) {
    const t = useTranslations('admin.taxonomy.slideover');
    const tFields = useTranslations('admin.taxonomy.fields');
    const c = useTranslations('common');
    const { success, error } = useToast();
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [nameEn, setNameEn] = useState('');
    const [nameLv, setNameLv] = useState('');

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        if (isPending || !nameEn.trim() || !nameLv.trim()) return;
        startTransition(async () => {
            const res = await createTopic(l2.id, { nameEn: nameEn.trim(), nameLv: nameLv.trim() });
            if (res.success) {
                success(t('subtopicCreated'));
                setNameEn('');
                setNameLv('');
                router.refresh();
            } else {
                error(c('error'));
            }
        });
    };

    return (
        <section>
            <h3 className="text-item mb-4">{t('subtopics', { count: l2.tags.length })}</h3>
            <div className="line rounded-xl divide-y divide-border bg-surface mb-6">
                {l2.tags.map(l3 => (
                    <button
                        key={l3.id}
                        type="button"
                        onClick={() => onNodeSelect({ type: 'l3', id: l3.id, l2Id: l2.id, l1Id })}
                        className="w-full flex items-center justify-between gap-3 p-3 text-left hover:bg-surface-elevated/50 transition-colors"
                    >
                        <span className="text-body-sm truncate">{l3.title}</span>
                    </button>
                ))}
                {l2.tags.length === 0 && <div className="p-4 text-body-sm text-foreground-muted text-center">{t('noSubtopics')}</div>}
            </div>

            <div className="line rounded-xl bg-surface-elevated/30 p-4">
                <h4 className="text-item mb-3">{t('createSubtopic')}</h4>
                <form onSubmit={handleCreate} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="min-w-0">
                            <label className="block text-tag text-foreground-muted mb-1">{tFields('nameEn')}</label>
                            <Input type="text" value={nameEn} onChange={e => setNameEn(e.target.value)} required />
                        </div>
                        <div className="min-w-0">
                            <label className="block text-tag text-foreground-muted mb-1">{tFields('nameLv')}</label>
                            <Input type="text" value={nameLv} onChange={e => setNameLv(e.target.value)} required />
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <Button type="submit" disabled={isPending || !nameEn.trim() || !nameLv.trim()}>{t('addSubtopic')}</Button>
                    </div>
                </form>
            </div>
        </section>
    );
}

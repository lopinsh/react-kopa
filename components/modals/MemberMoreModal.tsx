'use client';

import { MessageSquare } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';
import { clsx } from 'clsx';
import ContactGroupModal from './ContactGroupModal';
import { avatarUrl } from '@/lib/avatar';
import Modal from '@/components/ui/Modal';

type Props = {
    isOpen: boolean;
    onClose: () => void;
    members: {
        role: string;
        user: {
            id: string;
            name: string | null;
            image: string | null;
            avatarSeed?: string | null;
        };
    }[];
    groupId: string;
    groupName: string;
    /** The viewer may write to the owner and admins (a member who is not on the team). */
    canWriteTeam?: boolean;
};

export default function MemberMoreModal({ isOpen, onClose, members, groupId, groupName, canWriteTeam }: Props) {
    const t = useTranslations('group');
    const locale = useLocale();
  const c_common = useTranslations('common');
    const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);

    if (!isOpen) return null;

    return (
        <>
            <Modal
                onClose={onClose}
                size="2xl"
                flush
                title={`${c_common('membersTitle')} (${members.length})`}
                panelClassName="flex max-h-[80vh] flex-col"
            >
                {/* List */}
                <div className="overflow-y-auto p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {members.map(({ user, role }) => (
                        <div
                            key={user.id}
                            onClick={() => {
                                if (canWriteTeam && (role === 'OWNER' || role === 'ADMIN')) {
                                    setIsSupportModalOpen(true);
                                }
                            }}
                            className={clsx(
                                "flex items-center gap-3 p-3 rounded-2xl border border-border bg-surface-elevated/50 transition-all",
                                canWriteTeam && (role === 'OWNER' || role === 'ADMIN') && "cursor-pointer hover:bg-surface-elevated hover:border-[var(--accent)]/50"
                            )}
                        >
                            <div className="relative h-12 w-12 overflow-hidden rounded-full bg-surface-elevated shrink-0">
                                <img
                                    src={avatarUrl(user)}
                                    alt={user.name || ''}
                                    className="h-full w-full object-cover"
                                    referrerPolicy="no-referrer"
                                />
                            </div>

                            <div className="flex flex-col min-w-0">
                                <span className="truncate text-sm font-bold text-foreground">
                                    {user.name || t('anonymousUser')}
                                </span>
                                <span
                                    className={clsx(
                                        "text-[10px] font-bold uppercase tracking-wider",
                                        role === 'OWNER' ? 'text-owner' : 'text-[var(--accent)]'
                                    )}
                                >
                                    {t(`role_${role.toLowerCase()}`)}
                                </span>
                            </div>

                            {/* Hover hint for messaging admins */}
                            {canWriteTeam && (role === 'OWNER' || role === 'ADMIN') && (
                                <div className="ml-auto flex bg-[var(--accent)]/10 text-[var(--accent)] p-2 rounded-full">
                                    <MessageSquare className="h-4 w-4" />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </Modal>

                {isSupportModalOpen && <ContactGroupModal
                    isOpen={isSupportModalOpen}
                    onClose={() => setIsSupportModalOpen(false)}
                    groupId={groupId}
                    groupName={groupName}
                    locale={locale}
                    allowJoin={false}
                />}
        </>
    );
}

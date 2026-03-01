'use client';

import { X, User, MessageSquare } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { clsx } from 'clsx';
import SupportMessageModal from './SupportMessageModal';

type Props = {
    isOpen: boolean;
    onClose: () => void;
    members: {
        role: string;
        user: {
            id: string;
            name: string | null;
            image: string | null;
        };
    }[];
    accentColor: string;
    groupId: string;
    groupName: string;
    isMember?: boolean;
};

export default function MemberMoreModal({ isOpen, onClose, members, accentColor, groupId, groupName, isMember }: Props) {
    const t = useTranslations('group');
    const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
    const [selectedAdmin, setSelectedAdmin] = useState<{ id: string; name: string | null } | null>(null);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="w-full max-w-2xl rounded-3xl bg-surface shadow-2xl animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[80vh]">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-border">
                    <h2 className="text-xl font-bold text-foreground">
                        {t('membersTitle')} ({members.length})
                    </h2>
                    <button
                        onClick={onClose}
                        className="rounded-full p-2 text-foreground-muted hover:bg-surface-elevated transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* List */}
                <div className="overflow-y-auto p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {members.map(({ user, role }) => (
                        <div
                            key={user.id}
                            onClick={() => {
                                if (isMember && (role === 'OWNER' || role === 'ADMIN')) {
                                    setSelectedAdmin({ id: user.id, name: user.name });
                                    setIsSupportModalOpen(true);
                                }
                            }}
                            className={clsx(
                                "flex items-center gap-3 p-3 rounded-2xl border border-border bg-surface-elevated/50 transition-all",
                                isMember && (role === 'OWNER' || role === 'ADMIN') && "cursor-pointer hover:bg-surface-elevated hover:border-[var(--accent)]/50"
                            )}
                            style={isMember && (role === 'OWNER' || role === 'ADMIN') ? { '--accent': accentColor } as any : undefined}
                        >
                            <div className="relative h-12 w-12 overflow-hidden rounded-full bg-surface-elevated shrink-0">
                                {user.image ? (
                                    <img
                                        src={user.image || undefined}
                                        alt={user.name || 'User'}
                                        className="h-full w-full object-cover"
                                        referrerPolicy="no-referrer"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center text-foreground-muted">
                                        <User className="h-6 w-6" />
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col min-w-0">
                                <span className="truncate text-sm font-bold text-foreground">
                                    {user.name || 'Anonymous User'}
                                </span>
                                <span
                                    className="text-[10px] font-bold uppercase tracking-wider"
                                    style={{ color: role === 'OWNER' ? '#f59e0b' : accentColor }}
                                >
                                    {t(`role_${role.toLowerCase()}`)}
                                </span>
                            </div>

                            {/* Hover hint for messaging admins */}
                            {isMember && (role === 'OWNER' || role === 'ADMIN') && (
                                <div className="ml-auto flex bg-[var(--accent)]/10 text-[var(--accent)] p-2 rounded-full">
                                    <MessageSquare className="h-4 w-4" />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <SupportMessageModal
                isOpen={isSupportModalOpen}
                onClose={() => setIsSupportModalOpen(false)}
                groupId={groupId}
                groupName={groupName}
                accentColor={accentColor}
            />
        </div>
    );
}

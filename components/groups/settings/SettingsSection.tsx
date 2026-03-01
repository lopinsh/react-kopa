'use client';

import { type LucideIcon } from 'lucide-react';

type Props = {
    title: string;
    description: string;
    icon: LucideIcon;
    children: React.ReactNode;
};

export default function SettingsSection({ title, description, icon: Icon, children }: Props) {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h3 className="text-xl font-black text-foreground mb-1 flex items-center gap-2">
                    <Icon className="h-6 w-6 text-[var(--accent)]" />
                    {title}
                </h3>
                <p className="text-sm text-foreground-muted mb-8">
                    {description}
                </p>
            </div>
            {children}
        </div>
    );
}

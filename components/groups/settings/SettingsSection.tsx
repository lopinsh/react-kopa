'use client';

type Props = {
    title: string;
    description: string;
    children: React.ReactNode;
};

/** One settings card: the same look as the cards in Iestatījumi. */
export default function SettingsSection({ title, description, children }: Props) {
    return (
        <section className="grid gap-4 rounded-2xl bg-surface px-4 py-3.5">
            <div>
                <h3 className="font-heading text-[15px] font-semibold text-foreground">{title}</h3>
                <p className="mt-0.5 text-sm text-foreground-muted">{description}</p>
            </div>
            {children}
        </section>
    );
}

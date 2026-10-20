'use client';

type Props = {
    title: string;
    description: string;
    children: React.ReactNode;
};

/** One settings card: the same look as the cards in Iestatījumi. */
export default function SettingsSection({ title, description, children }: Props) {
    return (
        <section className="grid gap-4 rounded-2xl bg-surface px-4 py-3.5 shadow-card frame">
            <div>
                <h3 className="text-item text-foreground">{title}</h3>
                <p className="mt-0.5 text-body-sm text-foreground">{description}</p>
            </div>
            {children}
        </section>
    );
}

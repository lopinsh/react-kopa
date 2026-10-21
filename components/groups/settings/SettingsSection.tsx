'use client';

type Props = {
    title: string;
    description: string;
    children: React.ReactNode;
};

/** One settings section: a heading and a hairline above it, no box (a box is for one thing you act on as a unit). */
export default function SettingsSection({ title, description, children }: Props) {
    return (
        <section className="grid gap-4">
            <div>
                <h3 className="text-item text-foreground">{title}</h3>
                <p className="mt-0.5 text-body-sm text-foreground">{description}</p>
            </div>
            {children}
        </section>
    );
}

import type { CSSProperties, ReactNode } from 'react';

/** Sets the group accent colour (`--accent`) for the components inside, as a group page's layout does. */
export default function AccentScope({ color, children, className }: { color: string; children: ReactNode; className?: string }) {
    return <div style={{ '--accent': color } as CSSProperties} className={className}>{children}</div>;
}

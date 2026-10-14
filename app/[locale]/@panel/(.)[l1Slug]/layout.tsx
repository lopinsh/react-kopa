import type { ReactNode } from 'react';
import PanelShell from '@/components/panels/PanelShell';

/** The panel's shell stays mounted from loading to content and from one panel to the next. */
export default function PanelLayout({ children }: { children: ReactNode }) {
    return <PanelShell>{children}</PanelShell>;
}

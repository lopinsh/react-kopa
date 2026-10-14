'use client';

import ErrorState from '@/components/ui/ErrorState';
import PanelPicture from '@/components/panels/PanelPicture';

/** A panel that failed to load: the shell stays and offers a retry (without this the locale's error page would replace the list). */
export default function PanelError({ reset }: { error: Error; reset: () => void }) {
    return (
        <div style={{ ['--c' as string]: 'var(--foreground-muted)' }}>
            <PanelPicture image={null} l1Slug="" />
            <ErrorState onRetry={reset} />
        </div>
    );
}

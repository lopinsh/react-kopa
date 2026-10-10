'use client';

import dynamic from 'next/dynamic';

// Loaded on demand, so the pop-up and pins are only downloaded when the server actually renders feedback mode.
const FeedbackMode = dynamic(() => import('./FeedbackMode'), { ssr: false });

export default function FeedbackModeLoader() {
    return <FeedbackMode />;
}

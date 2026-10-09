'use client';

import dynamic from 'next/dynamic';

// Loaded on demand, so the editor and its script are only downloaded when the server actually renders translation mode.
const TranslateMode = dynamic(() => import('./TranslateMode'), { ssr: false });

export default function TranslateModeLoader() {
    return <TranslateMode />;
}

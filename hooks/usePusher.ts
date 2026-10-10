'use client';

import { useEffect, useRef } from 'react';
import { pusherClient } from '@/lib/pusher';

/**
 * Several components listen on the same channel (the user's private one carries notifications and
 * messages). Each one binds and unbinds only its own handler; the channel itself is unsubscribed when
 * the last listener is gone, so one component unmounting never silences another.
 */
const listeners = new Map<string, number>();

function acquire(channelName: string) {
    listeners.set(channelName, (listeners.get(channelName) ?? 0) + 1);
    return pusherClient.subscribe(channelName);
}

function release(channelName: string) {
    const left = (listeners.get(channelName) ?? 1) - 1;
    if (left > 0) {
        listeners.set(channelName, left);
        return;
    }
    listeners.delete(channelName);
    pusherClient.unsubscribe(channelName);
}

export function usePusher<T>(channelName: string, eventName: string, callback: (data: T) => void) {
    const callbackRef = useRef(callback);

    // Keep the latest callback reference
    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    useEffect(() => {
        if (!channelName || !eventName) return;

        const channel = acquire(channelName);
        const boundCallback = (data: T) => {
            callbackRef.current(data);
        };
        channel.bind(eventName, boundCallback);

        return () => {
            channel.unbind(eventName, boundCallback);
            release(channelName);
        };
    }, [channelName, eventName]);
}

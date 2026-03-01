'use client';

import { useEffect, useRef } from 'react';
import { pusherClient } from '@/lib/pusher';
import { Channel } from 'pusher-js';

export function usePusher(channelName: string, eventName: string, callback: (data: any) => void) {
    const callbackRef = useRef(callback);

    // Keep the latest callback reference
    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    useEffect(() => {
        if (!channelName || !eventName) return;

        // Subscribe to the channel
        const channel: Channel = pusherClient.subscribe(channelName);

        // Define the bound function that calls the latest callback
        const boundCallback = (data: any) => {
            callbackRef.current(data);
        };

        // Bind the event
        channel.bind(eventName, boundCallback);

        // Cleanup on unmount or when channel/event changes
        return () => {
            channel.unbind(eventName, boundCallback);
            pusherClient.unsubscribe(channelName);
        };
    }, [channelName, eventName]);
}

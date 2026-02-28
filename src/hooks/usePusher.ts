'use client';

import { useEffect, useRef, useCallback } from 'react';
import { getPusherClient } from '@/lib/pusher';
import type PusherJS from 'pusher-js';
import type { Channel } from 'pusher-js';

interface UsePusherOptions {
  channelName: string;
  events: Record<string, (data: any) => void>;
  enabled?: boolean;
}

/**
 * React hook for subscribing to a Pusher channel.
 * Automatically subscribes/unsubscribes on mount/unmount.
 */
export function usePusher({ channelName, events, enabled = true }: UsePusherOptions) {
  const channelRef = useRef<Channel | null>(null);

  useEffect(() => {
    if (!enabled || !channelName) return;

    const client = getPusherClient();
    const channel = client.subscribe(channelName);
    channelRef.current = channel;

    // Bind all event handlers
    for (const [eventName, handler] of Object.entries(events)) {
      channel.bind(eventName, handler);
    }

    return () => {
      // Unbind all event handlers
      for (const [eventName, handler] of Object.entries(events)) {
        channel.unbind(eventName, handler);
      }
      client.unsubscribe(channelName);
      channelRef.current = null;
    };
  }, [channelName, enabled]); // Don't include events in deps to avoid infinite re-renders

  return channelRef;
}

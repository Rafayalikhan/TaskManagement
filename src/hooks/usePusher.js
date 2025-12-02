'use client';

import { useEffect, useState, useRef } from 'react';
import { getPusher } from '@/lib/pusher';

export const usePusher = (channelName, eventName, callback) => {
  const [isConnected, setIsConnected] = useState(false);
  const callbackRef = useRef(callback);

  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    const pusher = getPusher();
    const channel = pusher.subscribe(channelName);

    channel.bind('pusher:subscription_succeeded', () => {
      setIsConnected(true);
    });

    channel.bind(eventName, (data) => {
      callbackRef.current(data);
    });

    return () => {
      channel.unbind(eventName);
      pusher.unsubscribe(channelName);
    };
  }, [channelName, eventName]); // Remove callback from dependencies

  return isConnected;
};



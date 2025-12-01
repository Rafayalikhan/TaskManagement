import Pusher from 'pusher-js';

let pusherInstance = null;

export const initPusher = () => {
  if (!pusherInstance) {
    pusherInstance = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
    });
  }
  return pusherInstance;
};

export const getPusher = () => {
  if (!pusherInstance) {
    return initPusher();
  }
  return pusherInstance;
};
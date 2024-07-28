import Pusher from 'pusher';

export const sendPoke = async () => {
  if (
    !process.env.REPLICHAT_PUSHER_APP_ID ||
    !process.env.REPLICHAT_PUSHER_KEY ||
    !process.env.REPLICHAT_PUSHER_SECRET ||
    !process.env.REPLICHAT_PUSHER_CLUSTER
  ) {
    throw new Error('Missing Pusher environment variables');
  }
  const pusher = new Pusher({
    appId: process.env.REPLICHAT_PUSHER_APP_ID,
    key: process.env.REPLICHAT_PUSHER_KEY,
    secret: process.env.REPLICHAT_PUSHER_SECRET,
    cluster: process.env.REPLICHAT_PUSHER_CLUSTER,
    useTLS: true,
  });
  const t0 = Date.now();
  await pusher.trigger('default', 'poke', {});
  console.log('Sent poke in', Date.now() - t0);
}

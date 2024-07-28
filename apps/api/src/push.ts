import Pusher from 'pusher';

export const sendPoke = async () => {
  const pusher = new Pusher({
    appId: '1841076',
    key: 'd80d9194733592ca3b4e',
    secret: '809c386d2d8b80318560',
    cluster: 'ap2',
    useTLS: true,
  });
  const t0 = Date.now();
  await pusher.trigger('default', 'poke', {});
  console.log('Sent poke in', Date.now() - t0);
}

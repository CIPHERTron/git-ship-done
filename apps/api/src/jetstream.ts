import { connect } from 'nats';

export const initJetStream = async () => {
  const connection = await connect({ servers: '127.0.0.1:4222' });
  const jsm = await connection.jetstreamManager();
  const jetstream = connection.jetstream();

  const streamName = 'TODO_STREAM';
  const subject = 'replicache.*';

  try {
    await jsm.streams.info(streamName);
    console.log(`Stream ${streamName} already exists, deleting it.`);
    await jsm.streams.delete(streamName); // Delete existing stream
  } catch (err: any) {
    if (err.api_error?.err_code === 404) {
      console.log(`Stream ${streamName} does not exist.`);
    } else {
      throw err;
    }
  }

  console.log(`Creating a new stream ${streamName} with subject ${subject}.`);
  await jsm.streams.add({ name: streamName, subjects: [subject] });

  return jetstream;
};

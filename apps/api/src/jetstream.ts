import { connect, StringCodec } from 'nats'

export const initJetStream = async () => {
    const connection = await connect({ servers: 'nats://localhost:4222' })
    const jsm = await connection.jetstreamManager();
    const jetstream = connection.jetstream();

    await jsm.streams.add({ name: 'TODO_STREAM', subjects: ['todo.create'] });

    return jetstream;
}
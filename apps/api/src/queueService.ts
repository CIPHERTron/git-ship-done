import { connect, StringCodec, JetStreamClient, consumerOpts } from 'nats';
import { Octokit } from '@octokit/rest'
import fetch from 'node-fetch';
import * as dotenv from 'dotenv'

dotenv.config();

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO_OWNER = process.env.REPO_OWNER;
const REPO_NAME = process.env.REPO_NAME;

const octokit = new Octokit({
    auth: GITHUB_TOKEN,
    request: {
        fetch
    }
});

const createGithubIssue = async (title: string, body: string) => {
    try {
        const response = await octokit.issues.create({
            owner: REPO_OWNER!,
            repo: REPO_NAME!,
            title,
            body
        });

        console.log('Created Github Issue', response.data);
    } catch(error) {
        console.log('Error creating github issue: ', error);
    }
};

export const startQueueService = async () => {
    const connection = await connect({ servers: '127.0.0.1:4222' });
    const jetstream = connection.jetstream();

    const sc = StringCodec();

    const opts = consumerOpts();
    opts.manualAck()
    opts.deliverTo('todo_create_queue');
    opts.deliverNew();
    opts.ackExplicit();

    const sub = await jetstream.subscribe('todo.create', opts);
    console.log('Listening for todo.create messages...')

    for await (const m of sub) {
        try {
            const todo = JSON.parse(sc.decode(m.data));
            console.log('Processing todo:', todo);
            await createGithubIssue(todo.title, todo.description);
            m.ack();
        } catch (error) {
            console.error('Error processing message:', error);
        }
    }

};

startQueueService().catch((err) => {
    console.error('Queue service error:', err)
})
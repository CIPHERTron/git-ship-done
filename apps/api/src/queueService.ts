import { connect, StringCodec, JetStreamClient, consumerOpts } from 'nats';
import {PrismaClient} from '@prisma/client';
import { Octokit } from '@octokit/rest'
import fetch from 'node-fetch';
import * as dotenv from 'dotenv'

dotenv.config();

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO_OWNER = process.env.REPO_OWNER;
const REPO_NAME = process.env.REPO_NAME;

const prisma = new PrismaClient();

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
        return response.data.number;
    } catch(error) {
        console.log('Error creating github issue: ', error);
        throw error;
    }
};

const processMessage = async (data: string) => {
    const todo = JSON.parse(data);
    const { id, title, description } = todo;

    let issueNumber: number | null = null;
    let retries = 0;
    const maxRetries = 3;

    while(retries < maxRetries && issueNumber === null) {
        try {
            issueNumber = await createGithubIssue(title, description);
        } catch (error) {
            retries++;
            console.log(`Retry ${retries}/${maxRetries}`);

            if(retries === maxRetries) {
                console.error(`Max retries reached. Failed to create GitHub issue for todo title: ${title}`);
                return;
            }
        }
    }

    if(issueNumber) {
        await prisma.todo.update({
            where: { id },
            data: { gh_issue_id: issueNumber }
        })
    }
};

export const startQueueService = async () => {
    const connection = await connect({ servers: '127.0.0.1:4222' });
    const jetstream = connection.jetstream();

    const sc = StringCodec();

    const opts = consumerOpts();
    opts.manualAck()
    opts.deliverNew();
    opts.ackExplicit();
    opts.deliverTo('todo_create_queue');

    const sub = await jetstream.subscribe('todo.create', opts);
    console.log('Listening for todo.create messages...')

    for await (const m of sub) {
        try {
            const data = sc.decode(m.data);
            await processMessage(data);            
            m.ack();
        } catch (error) {
            console.error('Error processing message:', error);
        }
    }

};

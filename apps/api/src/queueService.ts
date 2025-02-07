import { connect, StringCodec, JetStreamClient, consumerOpts } from 'nats';
import {PrismaClient} from '@prisma/client';
import {createGithubIssue, updateGithubIssue, closeGithubIssue, reopenGithubIssue} from './controllers/octokitControllers.ts'


const prisma = new PrismaClient();

const processCreateTodo = async (data: any) => {
    const { id, title, description } = data;
  
    let issueNumber: number | null = null;
    let retries = 0;
    const maxRetries = 3;
  
    while (retries < maxRetries && issueNumber === null) {
      try {
        issueNumber = await createGithubIssue(title, description);
      } catch (error) {
        retries++;
        console.log(`Retry ${retries}/${maxRetries}`);
  
        if (retries === maxRetries) {
          console.error(`Max retries reached. Failed to create GitHub issue for todo title: ${title}`);
          return;
        }
      }
    }
  
    if (issueNumber) {
      await prisma.todo.update({
        where: { id },
        data: { gh_issue_id: issueNumber },
      });
    }
};

const processUpdateTodo = async (data: any) => {
    const { id, title, description } = data;
  
    const todo = await prisma.todo.findUnique({
      where: { id },
    });
  
    if (!todo || !todo.gh_issue_id) {
      console.log(`Todo or GitHub issue not found for id: ${id}`);
      return;
    }
  
    await updateGithubIssue(todo.gh_issue_id, title, description);
};

const processDeleteTodo = async (data: any) => {
    const { id } = data;
  
    const todo = await prisma.todo.findUnique({
      where: { id },
    });

    console.log(todo)
  
    if (!todo || !todo.gh_issue_id) {
      console.log(`Todo or GitHub issue not found for id: ${id}`);
      return;
    }
  
    await closeGithubIssue(todo.gh_issue_id);

    if(todo) {
      await prisma.todo.delete({
          where: { id: id }
      });
    }
};

const processDoneTodo = async (data: any) => {
  const { id, done } = data;

  const todo = await prisma.todo.findUnique({
    where: { id },
  });

  if (!todo || !todo.gh_issue_id) {
    console.log(`Todo or GitHub issue not found for id: ${id}`);
    return;
  }

  if (done) {
    await closeGithubIssue(todo.gh_issue_id);
  } else {
    await reopenGithubIssue(todo.gh_issue_id);
  }
};

const processMessage = async (data: string) => {
    const message = JSON.parse(data);
    const { type, data: messageData } = message;
  
    switch (type) {
      case 'createTodo':
        await processCreateTodo(messageData);
        break;
      case 'updateTodo':
        await processUpdateTodo(messageData);
        break;
      case 'deleteTodo':
        await processDeleteTodo(messageData);
        break;
      case 'doneTodo':
        await processDoneTodo(messageData);
        break;
      default:
        console.log(`Unknown message type: ${message.type}`);
    }
  };
  

export const startQueueService = async () => {
    const connection = await connect({ servers: '127.0.0.1:4222' });
    const jetstream = connection.jetstream();
  
    const sc = StringCodec();
  
    const opts = consumerOpts();
    opts.manualAck();
    opts.deliverNew();
    opts.ackExplicit();
    opts.deliverTo('todo_queue');
  
    const sub = await jetstream.subscribe('replicache.*', opts);
    console.log('Listening for replicache messages...');
  
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

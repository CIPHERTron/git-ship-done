import { FastifyReply, FastifyRequest } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { JetStreamClient, StringCodec } from 'nats';

interface ReplicachePushRequest {
    Body: {
        clientID: string,
      mutations: Array<{
        id: string;
        name: string;
        args: any;
      }>;
    };
}
interface ReplicachePullRequest {
    Body: {
        clientGroupID: string;
        cookie?: number;
    };
}

export const replicachePush = (prisma: PrismaClient, jetStreamClient: JetStreamClient) => {
    return async (req: FastifyRequest<ReplicachePushRequest>, reply: FastifyReply) => {
        const { mutations } = req.body;

        const sc = StringCodec();

        try {

            for (const mutation of mutations) {
                const message = {
                    type: mutation.name,
                    data: mutation.args,
                };

                switch (mutation.name) {
                    case 'createTodo':
                        const checkTodo = await prisma.todo.findUnique({
                            where: {id: mutation.args.id}
                        })
                        if(!checkTodo) {
                            const newTodo = await prisma.todo.create({
                                data: mutation.args,
                            });
                            message.data = newTodo;
                            await jetStreamClient.publish('replicache.create', sc.encode(JSON.stringify(message)));
                        }
                        break;
                    case 'updateTodo':
                        const updatedTodo = await prisma.todo.update({
                            where: { id: mutation.args.id },
                            data: mutation.args
                        });
                        message.data = updatedTodo;
                        await jetStreamClient.publish('replicache.update', sc.encode(JSON.stringify(message)));
                        break;
                    case 'deleteTodo':
                        const deletedTodo = await prisma.todo.delete({
                            where: { id: mutation.args.id }
                        });
                        message.data = deletedTodo;
                        await jetStreamClient.publish('replicache.delete', sc.encode(JSON.stringify(message)));
                        break;
                    default:
                        throw new Error(`Unknown mutation: ${mutation.name}`)
                }
            }
            reply.send({success: true})
        } catch (error) {
            console.log('Error processing mutations:', error);
            reply.status(500).send({ error: 'Internal Server Error while processing mutations' })
        }
    }
}


export const replicachePull = (prisma: PrismaClient) => {
  return async (req: FastifyRequest<ReplicachePullRequest>, reply: FastifyReply) => {
    const pull = req.body;
    const clientGroupID = pull.clientGroupID;
    const fromVersion = pull.cookie ?? 0;

    try {
      const todos = await prisma.todo.findMany();

      // Create patch operations
      const changes = todos.map(todo => {
        if (todo.deleted) {
          return {
            op: 'del',
            key: `/todo/${todo.id}`,
          };
        } else {
          return {
            op: 'put',
            key: `/todo/${todo.id}`,
            value: {
              id: todo.id,
              title: todo.title,
              description: todo.description,
              done: todo.done,
              gh_issue_id: todo.gh_issue_id,
              createdAt: todo.createdAt,
            },
          };
        }
      });

      // Fetch the last mutation ID for the client group
      const clientGroup = await prisma.replicacheClient.findUnique({
        where: { id: clientGroupID },
      });

      const lastMutationID = clientGroup?.lastMutationID ?? 0;

      // Update the last mutation ID for the client group
      await prisma.replicacheClient.upsert({
        where: { id: clientGroupID },
        update: { lastMutationID },
        create: { id: `${clientGroupID}-${Date.now()}`, clientGroupID, lastMutationID, version: Date.now() },
      });

      // Construct the pull response
      reply.send({
        lastMutationIDChanges: { [clientGroupID]: lastMutationID },
        cookie: Date.now(),
        patch: changes,
      });
    } catch (error) {
      console.log('Error pulling data:', error);
      reply.status(500).send({ error: 'Internal server error at replicachePull while fetching data' });
    }
  };
};

  

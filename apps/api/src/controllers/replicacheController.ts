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
    return async (req: FastifyRequest, reply: FastifyReply) => {
      try {
        const todos = await prisma.todo.findMany();
        console.log(todos)
        
        const changes = todos.map(todo => ({
            op: 'put',
            key: `/todo/${todo.id}`,
            value: todo,
        }));
  
        reply.send({ lastMutationIDChanges: {}, cookie: Date.now(), patch: changes });
      } catch (error) {
        console.log('Error pulling data:', error);
        reply.status(500).send({ error: 'Internal server error at replicachePull while fetching data' });
      }
    };
};
  

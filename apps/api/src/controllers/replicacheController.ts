import { FastifyReply, FastifyRequest } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { JetStreamClient, StringCodec } from 'nats';

interface ReplicachePushRequest {
    Body: {
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
                switch (mutation.name) {
                    case 'createTodo':
                        await prisma.todo.create({
                            data: mutation.args
                        });
                        await jetStreamClient.publish('replicache.create', sc.encode(JSON.stringify(mutation.args)));
                        break;
                    case 'updateTodo':
                        await prisma.todo.update({
                            where: { id: mutation.args.id },
                            data: mutation.args
                        });
                        await jetStreamClient.publish('replicache.update', sc.encode(JSON.stringify(mutation.args)));
                        break;
                    case 'deleteTodo':
                        await prisma.todo.delete({
                            where: { id: mutation.args.id }
                        });
                        await jetStreamClient.publish('replicache.delete', sc.encode(JSON.stringify(mutation.args)));
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
            reply.send({ todos });
        } catch (error) {
            console.log('Error pulling data:', error);
            reply.status(500).send({ error: 'Internal server error at replicachePull while fetching data' })
        }
    }
}
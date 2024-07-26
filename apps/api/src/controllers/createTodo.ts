import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { JetStreamClient, StringCodec } from 'nats';

interface CreateTodoRequest {
    Body: {
        title: string;
        description: string;
    }
}

export const createTodoController = (prisma: PrismaClient, jetStreamClient: JetStreamClient) => {
    return async (req: FastifyRequest<CreateTodoRequest>, reply: FastifyReply) => {
        const { title, description } = req.body;

        const todo = await prisma.todo.create({
            data: {
                title,
                description
            }
        });

        const sc = StringCodec();
        await jetStreamClient.publish('todo.create', sc.encode(JSON.stringify(todo)));

        reply.send(todo)
    }
}
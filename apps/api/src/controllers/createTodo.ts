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

        try {
            const todo = await prisma.todo.create({
                data: {
                    title,
                    description
                }
            });
    
            // Publish to-do creation event to jetstream
            const sc = StringCodec();
            await jetStreamClient.publish('todo.create', sc.encode(JSON.stringify(todo)));
    
            reply.send(todo)
        } catch (error) {
            console.log("Error creating todo:", error);
            reply.status(500).send({ error: "Internal Server Error while pushing todo to DB" });
        }
    };
}
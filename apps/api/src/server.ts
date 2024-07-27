import Fastify from 'fastify';
import {PrismaClient} from '@prisma/client'
import * as dotenv from 'dotenv'
import { initJetStream } from './jetstream.ts';
import { createTodoController, updateTodoController, deleteTodoController } from './controllers/createTodo.ts';
import { replicachePull, replicachePush } from './controllers/replicacheController.ts'

dotenv.config();

export const startServer = async () => {
    const prisma = new PrismaClient();
    const fastify = Fastify({logger: true});

    const jetStreamClient = await initJetStream()

    fastify.get('/', async (req: any, res: any) => {
        return { message: 'Welcome to Git Ship Done server' }
    });

    fastify.post('/create-todo', createTodoController(prisma, jetStreamClient));
    fastify.post('/update-todo', updateTodoController(prisma, jetStreamClient));
    fastify.post('/delete-todo', deleteTodoController(prisma, jetStreamClient));

    // Replicache endpoints
    fastify.post('/replicache-push', replicachePush(prisma, jetStreamClient));
    fastify.post('/replicache-pull', replicachePull(prisma));

    try {
        await fastify.listen({ port: 8888, host: '0.0.0.0' });
        fastify.log.info("Server listening at http://localhost:8888");
    } catch (error) {
        fastify.log.error(error);
        process.exit(1);
    }
};

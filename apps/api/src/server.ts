import Fastify from 'fastify';
import cors from '@fastify/cors'
import formbody from '@fastify/formbody'
import {PrismaClient} from '@prisma/client'
import * as dotenv from 'dotenv'
import { initJetStream } from './jetstream.ts';
import { createTodoController, updateTodoController, deleteTodoController, getAllTodosController } from './controllers/createTodo.ts';
import { replicachePull, replicachePush } from './controllers/replicacheController.ts'

dotenv.config();

export const startServer = async () => {
    const prisma = new PrismaClient();
    const fastify = Fastify({logger: true});

    await fastify.register(formbody)

    await fastify.register(cors, {
        origin: '*'
    })

    const jetStreamClient = await initJetStream()

    fastify.get('/', async (req: any, res: any) => {
        return { message: 'Welcome to Git Ship Done server' }
    });

    fastify.post('/create-todo', createTodoController(prisma, jetStreamClient));
    fastify.post('/update-todo', updateTodoController(prisma, jetStreamClient));
    fastify.post('/delete-todo', deleteTodoController(prisma, jetStreamClient));
    fastify.get('/get-all-todos', getAllTodosController(prisma))

    // Replicache endpoints
    fastify.post('/replicache/push', replicachePush(prisma, jetStreamClient));
    fastify.post('/replicache/pull', replicachePull(prisma));

    fastify.setErrorHandler((error, request, reply) => {
        request.log.error(error);
        reply.status(500).send({ error: 'Internal Server Error' });
    })

    try {
        await fastify.listen({ port: 8888, host: '0.0.0.0' });
        fastify.log.info("Server listening at http://localhost:8888");
    } catch (error) {
        fastify.log.error(error);
        process.exit(1);
    }
};

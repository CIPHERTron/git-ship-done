import Fastify from 'fastify';
import {PrismaClient} from '@prisma/client'
import dotenv from 'dotenv'
import { initJetStream } from './jetstream';
import { createTodoController } from './controllers/createTodo';

dotenv.config();

async function main() {
    const prisma = new PrismaClient();
    const fastify = Fastify({logger: true});

    const jetStreamClient = await initJetStream()

    fastify.get('/', async (req: any, res: any) => {
        return { message: 'Welcome to Git Ship Done server' }
    });

    fastify.post('/create-todo', createTodoController(prisma, jetStreamClient));

    try {
        await fastify.listen({ port: 8888, host: '0.0.0.0' });
        fastify.log.info("Server listening at http://localhost:8888");
    } catch (error) {
        fastify.log.error(error);
        process.exit(1);
    }
}

main();
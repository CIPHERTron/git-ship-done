import Fastify from 'fastify';

const server = Fastify();

server.get('/', async (req, res) => {
    return { message: 'Welcome to Git Ship Done server' }
});

async function main() {
    try {
        await server.listen({ port: 8888, host: '0.0.0.0' });
        console.log("Server listening at http://localhost:8888");
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
}

main();
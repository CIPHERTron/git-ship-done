import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { JetStreamClient, StringCodec } from 'nats';

interface TodoRequest {
    Body: {
        id?: number;
        title: string;
        description: string;
    }
}

export const createTodoController = (prisma: PrismaClient, jetStreamClient: JetStreamClient) => {
    return async (req: FastifyRequest<TodoRequest>, reply: FastifyReply) => {
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
            await jetStreamClient.publish('replicache.create', sc.encode(JSON.stringify(todo)));
    
            reply.send(todo)
        } catch (error) {
            console.log("Error creating todo:", error);
            reply.status(500).send({ error: "Internal Server Error while pushing todo to DB" });
        }
    };
}

export const updateTodoController = (prisma: PrismaClient, jetStreamClient: JetStreamClient) => {
    return async (req: FastifyRequest<TodoRequest>, reply: FastifyReply) => {
      const { id, title, description } = req.body;
  
      if (!id) {
        reply.status(400).send({ error: 'ID is required' });
        return;
      }
  
      try {
        const todo = await prisma.todo.update({
          where: { id },
          data: {
            title,
            description,
          },
        });
  
        const sc = StringCodec();
        await jetStreamClient.publish('replicache.update', sc.encode(JSON.stringify(todo)));
  
        reply.send(todo);
      } catch (error) {
        console.log('Error updating todo:', error);
        reply.status(500).send({ error: 'Internal Server Error while updating todo' });
      }
    };
};

export const deleteTodoController = (prisma: PrismaClient, jetStreamClient: JetStreamClient) => {
    return async (req: FastifyRequest<TodoRequest>, reply: FastifyReply) => {
      const { id } = req.body;
  
      try {
        const todo = await prisma.todo.delete({
          where: { id },
        });
  
        const sc = StringCodec();
        await jetStreamClient.publish('replicache.delete', sc.encode(JSON.stringify(todo)));
  
        reply.send(todo);
      } catch (error) {
        console.log('Error deleting todo:', error);
        reply.status(500).send({ error: 'Internal Server Error while deleting todo' });
      }
    };
  };
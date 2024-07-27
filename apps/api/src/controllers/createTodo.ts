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
            const message = {
                type: 'createTodo',
                data: todo
            };
            await jetStreamClient.publish('replicache.create', sc.encode(JSON.stringify(message)));
    
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
        // First, publish the update message to Replicache
        const sc = StringCodec();
        const message = {
          type: 'updateTodo',
          data: { id, title, description }
        };
        await jetStreamClient.publish('replicache.todo', sc.encode(JSON.stringify(message)));
  
        // Then, perform the database update
        const todo = await prisma.todo.update({
          where: { id },
          data: {
            title,
            description,
          },
        });
  
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
        // First, publish the delete message to Replicache
        const sc = StringCodec();
        const message = {
          type: 'deleteTodo',
          data: { id }
        };
        await jetStreamClient.publish('replicache.todo', sc.encode(JSON.stringify(message)));
  
        // Then, delete the todo from the database
        const todo = await prisma.todo.delete({
          where: { id },
        });
  
        reply.send(todo);
      } catch (error) {
        console.log('Error deleting todo:', error);
        reply.status(500).send({ error: 'Internal Server Error while deleting todo' });
      }
    };
  };
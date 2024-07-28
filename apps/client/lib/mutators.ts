import { WriteTransaction } from 'replicache';

export const CreateTodo = async (tx: WriteTransaction, args: { id: string; title: string; description: string }) => {
  await tx.put(`/todo/${args.id}`, { value: args });
};

export const UpdateTodo = async (tx: WriteTransaction, args: { id: string; title: string; description: string }) => {
  await tx.put(`/todo/${args.id}`, { value: args });
};

export const DeleteTodo = async (tx: WriteTransaction, args: { id: string }) => {
  await tx.del(`/todo/${args.id}`);
};

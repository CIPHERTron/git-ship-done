import { WriteTransaction } from "replicache";

export const CreateTodo = async (
  tx: WriteTransaction,
  args: { id: string; title: string; description: string }
) => {
  await tx.put(`/todo/${args.id}`, { value: { name: "createTodo", args } });
};

export const UpdateTodo = async (
  tx: WriteTransaction,
  args: { id: string; title: string; description: string }
) => {
  const prev = await tx.get(`/todo/${args.id}`) as any;

  const next = { ...prev, title: args.title, description: args.description };
  await tx.set(`/todo/${args.id}`, next);
};

export const DoneTodo = async (
  tx: WriteTransaction,
  args: { id: string; done: boolean }
) => {
  const prev = await tx.get(`/todo/${args.id}`) as any;

  const next = { ...prev, done: args.done };
  await tx.put(`/todo/${args.id}`, next);
};

export const DeleteTodo = async (
  tx: WriteTransaction,
  args: { id: string }
) => {
  await tx.del(`/todo/${args.id}`);
};

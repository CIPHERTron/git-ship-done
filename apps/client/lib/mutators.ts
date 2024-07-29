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
  let temp: any = {};

  console.log("previous value",prev)

  const next = { ...prev, title: args.title, description: args.description };
  await tx.set(`/todo/${args.id}`, next);
};

export const DeleteTodo = async (
  tx: WriteTransaction,
  args: { id: string }
) => {
  await tx.del(`/todo/${args.id}`);
};

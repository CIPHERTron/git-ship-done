// lib/todo.ts
import { ReadTransaction } from "replicache";

export type Todo = {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly gh_issue_id?: number;
};

export type TodoUpdate = Partial<Todo> & Pick<Todo, "id">;

export async function listTodos(tx: ReadTransaction) {
  const todos = await tx.scan({ prefix: '/todo/' }).entries().toArray();
  return todos.map(([_, value]) => value as Todo);
}

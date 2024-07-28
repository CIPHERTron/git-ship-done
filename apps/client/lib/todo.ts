// lib/todo.ts
import { ReadTransaction } from "replicache";

export interface Todo {
  id: string;
  title: string;
  description: string;
  gh_issue_id: number | null;
  createdAt: string;
}

export type TodoUpdate = Partial<Todo> & Pick<Todo, "id">;

// export async function listTodos(tx: ReadTransaction) {
//   const todos = await tx.scan({ prefix: '/todo/' }).entries().toArray();
//   return todos.map(([_, value]) => value as Todo);
// }

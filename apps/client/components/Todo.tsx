// components/TodoList.tsx
import React, { useEffect, useState } from 'react';
import { useReplicache } from '../hooks/useReplicache';
import {useSubscribe} from 'replicache-react'

interface Todo {
    id: string;
    title: string;
    description: string;
    gh_issue_id: number | null;
    createdAt: string;
}

const TodoList: React.FC = () => {
  const rep = useReplicache();
  const [todos, setTodos] = useState<Todo[]>([]);

  useEffect(() => {
    if (!rep) return;

    const syncTodos = async () => {
      const todos = await rep.query(async tx => {
        const list = await tx.scan({ prefix: '/todo/' }).entries().toArray();
        return list.map(([_, value]) => value as unknown as Todo);
      });
      setTodos(todos);
    };

    syncTodos();

    // Sync todos whenever Replicache updates
    const unsubscribe = rep.subscribe(syncTodos, {onData(result) {},});

    return () => {
      unsubscribe();
    };
  }, [rep]);


//   const todos = useSubscribe(
//     rep,
//     async tx => {
//       const list = await tx
//         .scan({prefix: '/todo/'})
//         .entries()
//         .toArray() as any as Todo[];
//       return list;
//     },
//     {default: []},
//   );
  console.log("todos", todos)

  return (
    <div>
      <h1>Todo List</h1>
      <ul>
        {todos && todos.map(todo => (
          <li key={todo.id}>
            <h2>{`${todo.id} - ${todo.title} - ${todo.description}`}</h2>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TodoList;
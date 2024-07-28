import React, { useEffect, useState } from 'react';
import { useReplicache } from '../hooks/useReplicache';
import { useSubscribe } from 'replicache-react';
import { nanoid } from 'nanoid';
import { ReadTransaction, ReadonlyJSONValue } from 'replicache';

export interface Todo {
      id: string;
      title: string;
      description: string;
      gh_issue_id: number | null;
      createdAt: string;
}

const Todo: React.FC = () => {
  const rep = useReplicache();
  // const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [renderPage, setRenderPage] = useState<boolean>(true);

 function normalizeReplicacheData<T>(data: (readonly [string, ReadonlyJSONValue])[]) {
    const arrayOfObjects = data.map(([, _value]) => _value);
  
    return arrayOfObjects;
  }

  const getallTodos = async ({ tx }: { tx: ReadTransaction }) => {
    const _todos = await tx
      .scan({
        prefix: '/todo/',
      })
      .entries()
      .toArray();

    const todos = normalizeReplicacheData<Todo>(_todos);
    return todos;
  }

  const todos = useSubscribe(
    rep,
    async (tx) => {
      return getallTodos({tx})
    },
    { default: [], dependencies: [] },
  );

  console.log("todos log:", todos);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!title || !description) {
      alert('Please fill in both title and description');
      return;
    }

    await rep?.mutate.createTodo({
      id: nanoid(),
      title,
      description,
      gh_issue_id: null,
      createdAt: new Date().toISOString(),
    });

    setTitle('');
    setDescription('');
    setRenderPage(!renderPage)
  };

  return (
    <div>
    {
      todos.map((x: any) => <p>{JSON.stringify(x)}</p>)
    }
    </div>
  );
};

export default Todo;



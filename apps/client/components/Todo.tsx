import React, { useEffect, useState } from 'react';
import { useReplicache } from '../hooks/useReplicache';
import { useSubscribe } from 'replicache-react';
import { nanoid } from 'nanoid';
import axios from 'axios'

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
  const [loading, setLoading] = useState<boolean>(true);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [renderPage, setRenderPage] = useState<boolean>(true);

  // useEffect(() => {
  //   if (!rep) return;

  //   const syncTodos = async () => {
  //     const todos = await rep.query(async tx => {
  //       const list = await tx.scan({ prefix: '/todo/' }).entries().toArray();
  //       return list.map(([_, value]) => value as unknown as Todo);
  //     });
  //     setTodos(todos);
  //   };

  //   syncTodos();

  //   const unsubscribe = rep.subscribe(syncTodos, { onData: () => {} });

  //   return () => {
  //     unsubscribe();
  //   };
  // }, [rep]);

  // const todos = useSubscribe(
  //   rep,
  //   async tx => {
  //     const list = await tx
  //       .scan({ prefix: '/todo/' })
  //       .entries()
  //       .toArray();
  //       console.log(list)
  //     return list.map(([_, value]) => value);
  //   },
  //   { default: [] },
  // );

  useEffect(() => {
    const fetchTodos = async () => {
      try {
        const response = await axios.get('http://localhost:8888/get-all-todos');
        setTodos(response.data.todos ?? []);
      } catch (error) {
        console.error('Error fetching todos:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTodos();
    console.log("useSubscribe", todos);
  }, [renderPage]);



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
        <div style={{ border: '1px solid black', padding: '16px', margin: '16px'}}>
        <form onSubmit={handleSubmit}>
        <div>
          <label>
            Title:
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </label>
        </div>
        <div>
          <label>
            Description:
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </label>
        </div>
        <button type="submit">Add Todo</button>
      </form>
        </div>
        <h1>Todo List</h1>
      <ul>
        {loading ? (
          <p>Loading...</p>
        ) : todos.length > 0 ? (
          (todos).map((todo) => (
            <li key={todo.id}>
              <h2>{`${todo.id} - ${todo.title} - ${todo.description}`}</h2>
            </li>
          ))
        ) : (
          <p>No todos found.</p>
        )}
      </ul>
    </div>
  );
};

export default TodoList;
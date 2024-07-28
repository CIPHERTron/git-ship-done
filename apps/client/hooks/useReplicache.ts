// hooks/useReplicache.ts
import { useEffect, useState } from 'react';
import { Replicache, MutatorDefs, TEST_LICENSE_KEY } from 'replicache';
import { CreateTodo, UpdateTodo, DeleteTodo } from '~/lib/mutators'; // Import your mutators

export function useReplicache() {
  const [rep, setRep] = useState<Replicache<MutatorDefs> | null>(null);
  const licenseKey = process.env.REPLICACHE_LICENSE_KEY ?? TEST_LICENSE_KEY

  if (!licenseKey) {
    throw new Error('Missing REPLICACHE_LICENSE_KEY');
  }

  useEffect(() => {
    console.log('updating replicache');
    const r = new Replicache({
      name: 'git-ship-done',
      licenseKey: licenseKey,
      pushURL: 'http://localhost:8888/replicache/push',
      pullURL: 'http://localhost:8888/replicache/pull',
      mutators: {
        createTodo: CreateTodo,
        updateTodo: UpdateTodo,
        deleteTodo: DeleteTodo,
      },
      logLevel: 'debug'
    });

    setRep(r);
    listen(r);

    return () => {
      r.close();
    };
  }, []);

  const listen = (rep: Replicache) => {
    // TODO: Listen for changes on server
  }

  return rep;
}

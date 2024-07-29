// hooks/useReplicache.ts
import { useEffect, useState } from "react";
import { Replicache, MutatorDefs, TEST_LICENSE_KEY } from "replicache";
import Pusher from "pusher-js";
import { CreateTodo, UpdateTodo, DeleteTodo, DoneTodo } from "~/lib/mutators"; // Import your mutators

export function useReplicache() {
  const [rep, setRep] = useState<Replicache<MutatorDefs> | null>(null);
  // const licenseKey = process.env.REPLICACHE_LICENSE_KEY ?? TEST_LICENSE_KEY
  const licenseKey = "lf672f65e150e4114839ecaeb545b3fe6";

  if (!licenseKey) {
    throw new Error("Missing REPLICACHE_LICENSE_KEY");
  }

  useEffect(() => {
    console.log("updating replicache");
    const r = new Replicache({
      name: "todos",
      licenseKey: licenseKey,
      pushURL: "http://localhost:8888/replicache/push",
      pullURL: "http://localhost:8888/replicache/pull",
      mutators: {
        createTodo: CreateTodo,
        updateTodo: UpdateTodo,
        deleteTodo: DeleteTodo,
        doneTodo: DoneTodo,
      },
      pullInterval: 10 * 1000,
      logLevel: "debug",
    });

    setRep(r);
    listen(r);

    return () => {
      Pusher.instances.forEach((i) => i.disconnect());
      void r.close();
    };
  }, []);

  const listen = (rep: Replicache) => {
    console.log("listening");
    // Listen for pokes, and pull whenever we get one.
    Pusher.logToConsole = true;
    const pusher = new Pusher("d80d9194733592ca3b4e", {
      cluster: "ap2",
    });
    const channel = pusher.subscribe("default");
    channel.bind("poke", async () => {
      console.log("got poked");
      await rep.pull();
    });
  };

  return rep;
}

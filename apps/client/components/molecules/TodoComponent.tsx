import React from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";

import { useToast } from "~/components/ui/use-toast";
import { TrashIcon } from "@radix-ui/react-icons";

import { useReplicache } from "~/hooks/useReplicache";
import { useSubscribe } from "replicache-react";
import {
  ReadTransaction,
  ReadonlyJSONObject,
  ReadonlyJSONValue,
} from "replicache";

import { Button } from "../ui/button";
import { sortTodosByCreatedAt } from "~/utils/dateUtils";

import CreateTodo from "../atoms/AddTodo";
import TodoTitle from "../atoms/TodoTitle";
import TodoStatusBadge from "../atoms/TodoStatusBadge";
import EditTodo from "../atoms/EditTodo";

interface Todo {
  id: string;
  title: string;
  description: string;
  done: boolean;
  gh_issue_id: number | null;
  createdAt: string;
}

interface TodoWrapper {
  value: {
    args: Todo;
  };
}

export default function TodoComponent() {
  const rep = useReplicache();
  const { toast } = useToast();

  function normalizeReplicacheData(
    data: (readonly [string, ReadonlyJSONValue])[]
  ): Todo[] {
    const todosArr = data.map(([, value]) => {
      if (typeof value === "object" && value !== null && "value" in value) {
        const wrappedValue = value as ReadonlyJSONObject;
        if (
          "value" in wrappedValue &&
          typeof wrappedValue.value === "object" &&
          wrappedValue.value !== null &&
          "args" in wrappedValue.value
        ) {
          return (wrappedValue as unknown as TodoWrapper).value.args;
        }
      }
      return value as unknown as Todo;
    });

    return todosArr;
  }

  const getallTodos = async ({ tx }: { tx: ReadTransaction }) => {
    const _todos = await tx
      .scan({
        prefix: "/todo/",
      })
      .entries()
      .toArray();

    const todos = normalizeReplicacheData(_todos);
    return todos;
  };

  const todos = useSubscribe(
    rep,
    async (tx) => {
      return getallTodos({ tx });
    },
    { default: [], dependencies: [] }
  );

  const sortedTodos = sortTodosByCreatedAt(todos);

  console.log(sortedTodos);

  const handleTodoDone = async (
    event: React.FormEvent,
    id: string,
    done: boolean
  ) => {
    event.preventDefault();

    await rep?.mutate.doneTodo({
      id,
      done: !done,
    });

    toast({
      description: `Todo with id ${id} was transitioned to ${!done ? "Done" : "Open"}`,
    });
  };

  const handleDeleteTodo = async (event: React.FormEvent, id: string) => {
    event.preventDefault();

    await rep?.mutate.deleteTodo({
      id,
    });

    toast({
      description: `Todo with id ${id} was deleted.}`,
    });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <CreateTodo rep={rep} />

      <div className="w-fit rounded-lg border">
        <Table>
          <TableCaption className="mb-4">
            Here's a list of your recent To-Dos
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px]">Task ID</TableHead>
              <TableHead className="w-[300px]">Title</TableHead>
              <TableHead className="w-[150px]">Status</TableHead>
              <TableHead className="w-[50px] text-right">Edit</TableHead>
              <TableHead className="w-[50px] text-center">Done</TableHead>
              <TableHead className="w-[50px] text-right">Delete</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedTodos.length > 0 &&
              sortedTodos.map(
                (
                  { id, title, description, gh_issue_id, createdAt, done },
                  idx
                ) => (
                  <TableRow key={id}>
                    <TableCell className="font-medium">{id}</TableCell>

                    <TableCell className="text-left">
                      <TodoTitle
                        title={title}
                        description={description}
                        createdAt={createdAt}
                        gh_issue_id={gh_issue_id}
                      />
                    </TableCell>

                    <TableCell>
                      <TodoStatusBadge done={done} />
                    </TableCell>

                    <TableCell className="text-center">
                      <EditTodo
                        rep={rep}
                        id={id}
                        title={title}
                        description={description}
                      />
                    </TableCell>

                    <TableCell className="text-center">
                      <Button
                        onClick={(e) => handleTodoDone(e, id, done)}
                        variant="link"
                      >
                        {done ? "Reopen Todo" : "Mark as Done"}
                      </Button>
                    </TableCell>

                    <TableCell className="text-center">
                      <Button
                        onClick={(e) => handleDeleteTodo(e, id)}
                        variant="destructive"
                      >
                        <TrashIcon />
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

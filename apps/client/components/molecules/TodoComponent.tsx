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

import { useReplicache } from "~/hooks/useReplicache";
import { useSubscribe } from "replicache-react";
import { ReadTransaction } from "replicache";

import { sortTodosByCreatedAt } from "~/utils/dateUtils";

import CreateTodo from "../atoms/AddTodo";
import TodoTitle from "../atoms/TodoTitle";
import TodoStatusBadge from "../atoms/TodoStatusBadge";
import EditTodo from "../atoms/EditTodo";
import TrashTodo from "../atoms/TrashTodo";
import TransitionTodo from "../atoms/TransitionTodo";
import { normalizeReplicacheData } from "~/utils/replicacheUtils";

export default function TodoComponent() {
  const rep = useReplicache();

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
                      <TransitionTodo rep={rep} id={id} done={done} />
                    </TableCell>

                    <TableCell className="text-center">
                      <TrashTodo rep={rep} id={id} />
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

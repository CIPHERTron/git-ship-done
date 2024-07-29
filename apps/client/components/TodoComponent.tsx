import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Label } from "~/components/ui/label";

import { Badge } from "~/components/ui/badge";
import { Input } from "~/components/ui/input";
import { useToast } from "~/components/ui/use-toast";
import { TrashIcon, PlusCircledIcon, Pencil1Icon } from "@radix-ui/react-icons";

import { useReplicache } from "~/hooks/useReplicache";
import { useSubscribe } from "replicache-react";
import { nanoid } from "nanoid";
import {
  ReadTransaction,
  ReadonlyJSONObject,
  ReadonlyJSONValue,
} from "replicache";
import TodoDescription from "~/components/TodoDescription";
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from "@radix-ui/react-hover-card";
import { Button } from "./ui/button";
import { sortTodosByCreatedAt } from "~/utils/dateUtils";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@radix-ui/react-popover";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "./ui/card";

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
  const [newTodoTitle, setNewTodoTitle] = useState<string>("");
  const [newTodoDescription, setNewTodoDescription] = useState<string>("");
  const [open, setOpen] = useState<boolean>(false);
  const [updatedTitle, setUpdatedTitle] = useState<string>("");
  const [updatedDescription, setUpdatedDescription] = useState<string>("");

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

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!newTodoTitle || !newTodoDescription) {
      alert("Please fill in both title and description");
      return;
    }

    await rep?.mutate.createTodo({
      id: nanoid(),
      title: newTodoTitle,
      description: newTodoDescription,
      gh_issue_id: null,
      createdAt: new Date().toISOString(),
    });

    setOpen(false);

    toast({
      description: "New todo created successfully.",
    });

    setNewTodoTitle("");
    setNewTodoDescription("");
  };

  const handleUpdateSubmit = async (event: React.FormEvent, id: string) => {
    event.preventDefault();

    if (!updatedTitle || !updatedDescription) {
      alert("Nothing has changed!!");
      return;
    }

    await rep?.mutate.updateTodo({
      id,
      title: updatedTitle,
      description: updatedDescription,
    });

    toast({
      description: "Todo updated successfully.",
    });

    setUpdatedTitle("");
    setUpdatedDescription("");
  };

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
      <div className="my-4 w-[1014px] flex flex-row justify-between">
        <div className="flex flex-row gap-2">
          <Input type="text" placeholder="Filter Todos..." />
          <Select>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todo">Todo</SelectItem>
              <SelectItem value="done">Done</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Dialog open={open}>
            <DialogTrigger asChild>
              <Button variant="default" onClick={() => setOpen(true)}>
                {" "}
                <PlusCircledIcon className="mr-2 h-4 w-4" /> Create Todo
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create Todo</DialogTitle>
                <DialogDescription>
                  Add the title & description and hit "Create"
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Title
                  </Label>
                  <Input
                    id="title"
                    value={newTodoTitle}
                    onChange={(e) => setNewTodoTitle(e.target.value)}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="username" className="text-right">
                    Description
                  </Label>
                  <Input
                    id="description"
                    value={newTodoDescription}
                    onChange={(e) => setNewTodoDescription(e.target.value)}
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <div className="flex flex-row items-center gap-4">
                    <Button type="submit" onClick={handleSubmit}>
                      Create
                    </Button>
                    <Button
                      variant={"outline"}
                      type="submit"
                      onClick={() => setOpen(false)}
                    >
                      Close
                    </Button>
                  </div>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

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
              {/* <TableHead>GitHub</TableHead> */}
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
                      <div className="flex flex-row justify-start items-center">
                        <HoverCard>
                          <HoverCardTrigger>
                            <Button className="m-0 p-0" variant={"link"}>
                              {title
                                ? `${title.slice(0, 20)} ${title.length > 20 ? "..." : ""}`
                                : ""}
                            </Button>
                          </HoverCardTrigger>
                          <HoverCardContent>
                            <TodoDescription
                              title={title}
                              description={description}
                              gh_issue_id={gh_issue_id}
                              createdAt={createdAt}
                            />
                          </HoverCardContent>
                        </HoverCard>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge variant={done ? "outline" : "default"}>
                        {done ? "Done" : "Todo"}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-center">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline">
                            <Pencil1Icon />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-fit">
                          <Card className="w-[350px]">
                            <CardHeader>
                              <CardTitle>Edit Todo</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <form>
                                <div className="grid w-full items-center gap-4">
                                  <div className="flex flex-col space-y-1.5">
                                    <Label htmlFor="name">Title</Label>
                                    <Input
                                      id="title"
                                      value={
                                        updatedTitle ? updatedTitle : title
                                      }
                                      onChange={(e) =>
                                        setUpdatedTitle(e.target.value)
                                      }
                                    />
                                  </div>
                                  <div className="flex flex-col space-y-1.5">
                                    <Label htmlFor="name">Description</Label>
                                    <Input
                                      id="description"
                                      value={
                                        updatedDescription
                                          ? updatedDescription
                                          : description
                                      }
                                      onChange={(e) =>
                                        setUpdatedDescription(e.target.value)
                                      }
                                    />
                                  </div>
                                </div>
                              </form>
                            </CardContent>
                            <CardFooter className="flex justify-end">
                              <Button
                                onClick={(e) => handleUpdateSubmit(e, id)}
                              >
                                Update
                              </Button>
                            </CardFooter>
                          </Card>
                        </PopoverContent>
                      </Popover>
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

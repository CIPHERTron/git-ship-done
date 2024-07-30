import React, { useState } from "react";
import {
  DialogHeader,
  DialogFooter,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "~/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { useToast } from "~/components/ui/use-toast";
import { PlusCircledIcon } from "@radix-ui/react-icons";
import { MutatorDefs, type Replicache } from "replicache";
import { nanoid } from "nanoid";

interface AddTodoProps {
  rep: Replicache<MutatorDefs> | null;
}

const AddTodo: React.FC<AddTodoProps> = ({ rep }) => {
  const { toast } = useToast();
  const [newTodoTitle, setNewTodoTitle] = useState<string>("");
  const [newTodoDescription, setNewTodoDescription] = useState<string>("");
  const [open, setOpen] = useState<boolean>(false);

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
  return (
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
  );
};

export default AddTodo;

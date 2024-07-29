import React, { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/components/ui/sheet";
import { Pencil1Icon } from "@radix-ui/react-icons";
import { type Replicache } from "replicache";
import { useReplicache } from "~/hooks/useReplicache";
import { useToast } from "~/components/ui/use-toast";

interface UpdateComponentProps {
  id: string;
  title: string;
  description: string;
}

const UpdateComponent: React.FC<UpdateComponentProps> = ({
  id,
  title,
  description,
}) => {
  const rep = useReplicache();
  const { toast } = useToast();
  const [updatedTitle, setUpdatedTitle] = useState<string>(title);
  const [updatedDescription, setUpdatedDescription] =
    useState<string>(description);

  console.log(updatedTitle, updatedDescription);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!updatedTitle || !updatedDescription) {
      alert("Please fill in both title and description");
      return;
    }

    // await rep?.mutate.updateTodo({
    //   id: id,
    //   title: updatedTitle,
    //   description: updatedDescription,
    // });

    toast({
      description: "New todo created successfully.",
    });

    setUpdatedTitle("");
    setUpdatedDescription("");
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="link">
          <Pencil1Icon />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Update Todo</SheetTitle>
          <SheetDescription>
            Make changes to your todo here. Click save when you're done.
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Title
            </Label>
            <Input
              id="name"
              value={updatedTitle}
              onChange={(e) => setUpdatedTitle(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="username" className="text-right">
              Description
            </Label>
            <Input
              id="username"
              value={updatedDescription}
              onChange={(e) => setUpdatedDescription(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        <SheetFooter>
          <SheetClose asChild>
            <Button type="submit">Save changes</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default UpdateComponent;

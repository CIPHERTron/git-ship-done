import React, { useState } from "react";
import {
    Popover,
    PopoverTrigger,
    PopoverContent,
  } from "~/components/ui/popover";
  import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
    CardFooter,
  } from "~/components/ui/card";
  import { Button } from "~/components/ui/button";
import { Pencil1Icon } from "@radix-ui/react-icons";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import {useToast} from '~/components/ui/use-toast'
import { MutatorDefs, Replicache } from "replicache";

interface EditTodoProps {
    rep: Replicache<MutatorDefs> | null;
    id: string;
    title: string;
    description: string;
}

const EditTodo: React.FC<EditTodoProps> = ({rep, id, title, description}) => {
    const {toast} = useToast();
    const [updatedTitle, setUpdatedTitle] = useState<string>("");
  const [updatedDescription, setUpdatedDescription] = useState<string>("");

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
    return (
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
    )
}

export default EditTodo;
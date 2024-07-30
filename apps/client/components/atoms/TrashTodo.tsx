import React from "react";
import { useToast } from "~/components/ui/use-toast";
import { Button } from "~/components/ui/button";
import { type MutatorDefs, type Replicache } from "replicache";
import { TrashIcon } from "@radix-ui/react-icons";

interface TrashTodoProps {
  rep: Replicache<MutatorDefs> | null;
  id: string;
}
const TrashTodo: React.FC<TrashTodoProps> = ({ rep, id }) => {
  const { toast } = useToast();

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
    <Button onClick={(e) => handleDeleteTodo(e, id)} variant="destructive">
      <TrashIcon />
    </Button>
  );
};

export default TrashTodo;

import React from "react";
import { Button } from "~/components/ui/button";
import { useToast } from "~/components/ui/use-toast";
import { type MutatorDefs, type Replicache } from "replicache";

interface TransitionTodoProps {
  rep: Replicache<MutatorDefs> | null;
  id: string;
  done: boolean;
}
const TransitionTodo: React.FC<TransitionTodoProps> = ({ rep, id, done }) => {
  const { toast } = useToast();

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

  return (
    <Button onClick={(e) => handleTodoDone(e, id, done)} variant="link">
      {done ? "Reopen Todo" : "Mark as Done"}
    </Button>
  );
};

export default TransitionTodo;

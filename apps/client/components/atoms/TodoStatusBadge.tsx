import React from "react";
import { Badge } from "~/components/ui/badge";

interface TodoStatusBadgeProps {
  done: boolean;
}
const TodoStatusBadge: React.FC<TodoStatusBadgeProps> = ({ done }) => {
  return (
    <Badge variant={done ? "outline" : "default"}>
      {done ? "Done" : "Todo"}
    </Badge>
  );
};

export default TodoStatusBadge;

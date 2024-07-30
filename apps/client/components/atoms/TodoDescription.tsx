import React from "react";
import { CalendarIcon } from "@radix-ui/react-icons";

import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { formatDateString } from "~/utils/dateUtils";

interface TodoDescriptionProps {
  title: string;
  description: string;
  createdAt: string;
  gh_issue_id: number | null;
}

const TodoDescription: React.FC<TodoDescriptionProps> = ({
  title,
  description,
  createdAt,
  gh_issue_id,
}) => {
  const formattedDate = formatDateString(createdAt);
  return (
    <div className="w-80 p-4 border border-slate-300 rounded-lg bg-green-50 dark:bg-green-950 flex justify-between space-x-4">
      <Avatar className="text-black dark:text-white">
        <AvatarImage src="https://github.com/shadcn.png" />
        <AvatarFallback>Todo</AvatarFallback>
      </Avatar>
      <div className="space-y-1">
        <h4 className="text-sm font-semibold">{title}</h4>
        <p className="text-sm">{description}</p>
        <div className="flex items-center pt-2">
          <CalendarIcon className="mr-2 h-4 w-4 opacity-70" />{" "}
          <span className="text-xs text-muted-foreground">{formattedDate}</span>
        </div>
      </div>
    </div>
  );
};

export default TodoDescription;

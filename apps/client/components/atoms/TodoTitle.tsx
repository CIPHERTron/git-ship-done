import React from "react";
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from "~/components/ui/hover-card";
import { Button } from "~/components/ui/button";
import { CalendarIcon } from "@radix-ui/react-icons";

import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { formatDateString } from "~/utils/dateUtils";

interface TodoTitleProps {
  title: string;
  description: string;
  gh_issue_id: number | null;
  createdAt: string;
}

const TodoTitle: React.FC<TodoTitleProps> = ({
  title,
  description,
  gh_issue_id,
  createdAt,
}) => {
  const formattedDate = formatDateString(createdAt);

  return (
    <HoverCard>
    <HoverCardTrigger>
      <Button className="m-0 p-0" variant="link">
        {title ? `${title.slice(0, 20)} ${title.length > 20 ? "..." : ""}` : ""}
      </Button>
    </HoverCardTrigger>
    <HoverCardContent className="p-0 m-0">
      <div className="w-[300px] p-2 border border-slate-300 rounded-lg bg-green-50 dark:bg-green-950 flex justify-between space-x-4">
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
    </HoverCardContent>
  </HoverCard>
  
  );
};

export default TodoTitle;

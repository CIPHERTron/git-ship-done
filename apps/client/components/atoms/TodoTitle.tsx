import React from "react";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "~/components/ui/hover-card";
import { Button } from "~/components/ui/button";
import TodoDescription from "./TodoDescription";

interface TodoTitleProps {
    title: string;
    description: string;
    gh_issue_id: number | null;
    createdAt: string;
}

const TodoTitle: React.FC<TodoTitleProps> = ({title, description, gh_issue_id, createdAt}) => {
    return (
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
    )
}

export default TodoTitle;
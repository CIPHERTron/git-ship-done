interface Todo {
  id: string;
  title: string;
  description: string;
  done: boolean;
  gh_issue_id: number | null;
  createdAt: string;
}

export const sortTodosByCreatedAt = (todos: Todo[]): Todo[] => {
  return todos.sort((a, b) => {
    const dateA = new Date(a.createdAt);
    const dateB = new Date(b.createdAt);
    return dateB.getTime() - dateA.getTime(); // Sort descending
  });
};

export const formatDateString = (isoString: string): string => {
  const date = new Date(isoString);

  const options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
    timeZoneName: "short", // Including timezone
  };

  return new Intl.DateTimeFormat("en-US", options).format(date);
};

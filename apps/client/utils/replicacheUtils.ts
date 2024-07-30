import { ReadonlyJSONObject, ReadonlyJSONValue } from "replicache";

interface Todo {
  id: string;
  title: string;
  description: string;
  done: boolean;
  gh_issue_id: number | null;
  createdAt: string;
}

interface TodoWrapper {
  value: {
    args: Todo;
  };
}

export const normalizeReplicacheData = (
  data: (readonly [string, ReadonlyJSONValue])[]
): Todo[] => {
  const todosArr = data.map(([, value]) => {
    if (typeof value === "object" && value !== null && "value" in value) {
      const wrappedValue = value as ReadonlyJSONObject;
      if (
        "value" in wrappedValue &&
        typeof wrappedValue.value === "object" &&
        wrappedValue.value !== null &&
        "args" in wrappedValue.value
      ) {
        return (wrappedValue as unknown as TodoWrapper).value.args;
      }
    }
    return value as unknown as Todo;
  });

  return todosArr;
};

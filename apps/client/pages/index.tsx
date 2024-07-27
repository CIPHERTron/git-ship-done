import { TodoList } from "~/components/TodoList";

export default function Homepage() {
  return (
    <div className="w-70 flex justify-center items-center h-screen">
      <TodoList />
    </div>
  );
}

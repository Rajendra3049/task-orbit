import { TaskForm } from "@/features/tasks/components/task-form";
import { TasksWorkspace } from "@/features/tasks/components/tasks-workspace";

export default function TasksPage() {
  return (
    <div className="space-y-4">
      <TaskForm variant="collapsible" />
      <TasksWorkspace />
    </div>
  );
}

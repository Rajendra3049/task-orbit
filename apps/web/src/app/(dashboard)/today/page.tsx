import { TaskForm } from "@/features/tasks/components/task-form";
import { TaskSections } from "@/features/tasks/components/task-sections";

export default function TodayPage() {
  return (
    <div className="space-y-4">
      <TaskForm />
      <TaskSections variant="today" />
    </div>
  );
}

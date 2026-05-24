import { TaskForm } from "@/features/tasks/components/task-form";
import { TaskSections } from "@/features/tasks/components/task-sections";

export default function InboxPage() {
  return (
    <div className="space-y-4">
      <TaskForm variant="full" />
      <TaskSections variant="inbox" />
    </div>
  );
}

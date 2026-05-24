import { DashboardHero } from "@/features/dashboard/components/dashboard-hero";
import { ProductivityTimeline } from "@/features/dashboard/components/productivity-timeline";
import { SummaryCards } from "@/features/dashboard/components/summary-cards";
import { TaskList } from "@/features/tasks/components/task-list";

export default function DashboardPage() {
  return (
    <div className="space-y-4">
      <DashboardHero />
      <SummaryCards />
      <ProductivityTimeline />
      <TaskList heading="Today's tasks" view="today" />
      <TaskList heading="Overdue tasks" view="overdue" />
    </div>
  );
}

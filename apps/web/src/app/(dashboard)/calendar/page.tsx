import { CalendarAgenda } from "@/features/calendar/components/calendar-agenda";
import { WeeklyPlannerBoard } from "@/features/calendar/components/weekly-planner-board";

export default function CalendarPage() {
  return (
    <div className="space-y-4">
      <CalendarAgenda />
      <WeeklyPlannerBoard />
    </div>
  );
}

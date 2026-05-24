import { HabitForm } from "@/features/habits/components/habit-form";
import { HabitList } from "@/features/habits/components/habit-list";

export default function HabitsPage() {
  return (
    <div className="space-y-4">
      <HabitForm />
      <HabitList />
    </div>
  );
}

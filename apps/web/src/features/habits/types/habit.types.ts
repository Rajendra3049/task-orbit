export type HabitContext = "work" | "personal" | "general";
export type HabitFrequency = "daily" | "weekly";

export type Habit = {
  id: string;
  name: string;
  context: HabitContext;
  frequency: HabitFrequency;
  streakCount: number;
  completedToday: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateHabitInput = {
  name: string;
  context: HabitContext;
  frequency: HabitFrequency;
};

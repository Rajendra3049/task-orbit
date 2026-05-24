export type GoalContext = "work" | "personal" | "general";
export type GoalStatus = "active" | "completed" | "paused";

export type Goal = {
  id: string;
  title: string;
  description: string | null;
  context: GoalContext;
  targetValue: number;
  currentValue: number;
  status: GoalStatus;
  createdAt: string;
  updatedAt: string;
};

export type CreateGoalInput = {
  title: string;
  description?: string;
  context: GoalContext;
  targetValue: number;
};

export type TaskPriority = "low" | "medium" | "high";
export type TaskContext = "work" | "personal" | "general";
export type TaskStatus = "todo" | "in_progress" | "done";

export type Task = {
  id: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  context: TaskContext;
  dueDate: string | null;
  estimatedMinutes: number;
  projectId: string | null;
  isRecurring: boolean;
  recurrencePattern: "daily" | "weekly" | "monthly" | null;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateTaskInput = {
  title: string;
  priority: TaskPriority;
  context: TaskContext;
  dueDate?: string | null;
  estimatedMinutes: number;
  projectId?: string;
  isRecurring?: boolean;
  recurrencePattern?: "daily" | "weekly" | "monthly";
};

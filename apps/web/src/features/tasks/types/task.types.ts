export type TaskPriority = "p0" | "p1" | "p2" | "p3";
export type TaskContext = "work" | "personal" | "general";
export type TaskStatus = "todo" | "in_progress" | "done";

export type Task = {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  context: TaskContext;
  dueDate: string | null;
  projectId: string | null;
  isRecurring: boolean;
  recurrencePattern: "daily" | "weekly" | "monthly" | null;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateTaskInput = {
  title: string;
  description?: string;
  priority: TaskPriority;
  context: TaskContext;
  dueDate?: string | null;
  projectId?: string;
  isRecurring?: boolean;
  recurrencePattern?: "daily" | "weekly" | "monthly";
  status?: TaskStatus;
};

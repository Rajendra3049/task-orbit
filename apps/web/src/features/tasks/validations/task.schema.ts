import { z } from "zod";

export const createTaskSchema = z.object({
  title: z.string().trim().min(3, "Task title should be at least 3 characters."),
  description: z.string().trim().optional(),
  priority: z.enum(["p0", "p1", "p2", "p3"]),
  context: z.enum(["work", "personal", "general"]),
  dueDate: z.string().optional(),
  projectId: z.string().optional(),
  isRecurring: z.boolean().optional(),
  recurrencePattern: z.enum(["daily", "weekly", "monthly"]).optional(),
});

export const updateTaskSchema = createTaskSchema.partial().extend({
  title: z.string().trim().min(3, "Task title should be at least 3 characters.").optional(),
  status: z.enum(["todo", "in_progress", "done"]).optional(),
});

export type CreateTaskSchemaValues = z.input<typeof createTaskSchema>;
export type UpdateTaskSchemaValues = z.input<typeof updateTaskSchema>;

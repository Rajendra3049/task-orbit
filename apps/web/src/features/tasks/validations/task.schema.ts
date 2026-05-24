import { z } from "zod";

export const createTaskSchema = z.object({
  title: z.string().trim().min(3, "Task title should be at least 3 characters."),
  priority: z.enum(["low", "medium", "high"]),
  context: z.enum(["work", "personal", "general"]),
  dueDate: z.string().optional(),
  estimatedMinutes: z.number().min(5, "Minimum estimate is 5 minutes.").max(480, "Maximum estimate is 480 minutes."),
  projectId: z.string().optional(),
  isRecurring: z.boolean().optional(),
  recurrencePattern: z.enum(["daily", "weekly", "monthly"]).optional(),
});

export type CreateTaskSchemaValues = z.input<typeof createTaskSchema>;

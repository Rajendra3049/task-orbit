import { format, isPast, isToday, parseISO } from "date-fns";

export function formatDueDate(dueDate: string | null) {
  if (!dueDate) return "No due date";
  const date = parseISO(dueDate);
  if (isToday(date)) return "Today";
  return format(date, "EEE, MMM d");
}

export function formatDueDateShort(dueDate: string | null) {
  if (!dueDate) return "—";
  const date = parseISO(dueDate);
  if (isToday(date)) return "Today";
  return format(date, "MMM d, yyyy");
}

export function dueDateClassName(dueDate: string | null, isCompleted: boolean) {
  if (!dueDate || isCompleted) return "text-muted-foreground";
  const date = parseISO(dueDate);
  if (isPast(date) && !isToday(date)) return "text-danger font-medium";
  if (isToday(date)) return "text-warning font-medium";
  return "text-muted-foreground";
}

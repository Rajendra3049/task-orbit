import { CalendarDays, Inbox, LayoutDashboard, ListTodo, Settings, SunMedium, FolderKanban, Flame } from "lucide-react";

export const primaryNavigation = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Inbox", href: "/inbox", icon: Inbox },
  { label: "Tasks", href: "/tasks", icon: ListTodo },
  { label: "Today", href: "/today", icon: SunMedium },
  { label: "Projects", href: "/projects", icon: FolderKanban },
  { label: "Habits", href: "/habits", icon: Flame },
  { label: "Calendar", href: "/calendar", icon: CalendarDays },
  { label: "Settings", href: "/settings", icon: Settings },
] as const;

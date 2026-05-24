import {
  Bot,
  CalendarDays,
  Flame,
  FolderKanban,
  Goal,
  Inbox,
  LayoutDashboard,
  LineChart,
  ListTodo,
  Settings,
  SunMedium,
  UsersRound,
} from "lucide-react";

export const primaryNavigation = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Inbox", href: "/inbox", icon: Inbox },
  { label: "Tasks", href: "/tasks", icon: ListTodo },
  { label: "Today", href: "/today", icon: SunMedium },
  { label: "Projects", href: "/projects", icon: FolderKanban },
  { label: "Habits", href: "/habits", icon: Flame },
  { label: "Goals", href: "/goals", icon: Goal },
  { label: "Calendar", href: "/calendar", icon: CalendarDays },
  { label: "Analytics", href: "/analytics", icon: LineChart },
  { label: "AI Assistant", href: "/assistant", icon: Bot },
  { label: "Workspaces", href: "/workspaces", icon: UsersRound },
  { label: "Settings", href: "/settings", icon: Settings },
] as const;

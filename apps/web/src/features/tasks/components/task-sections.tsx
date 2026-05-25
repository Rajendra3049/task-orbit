"use client";

import Link from "next/link";
import { LayoutGrid, List } from "lucide-react";
import { useRouter } from "next/navigation";
import { forwardRef, useMemo, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { useProjects } from "@/features/projects/hooks/use-projects";
import { TaskCard } from "@/features/tasks/components/task-card";
import { TaskFiltersBar } from "@/features/tasks/components/task-filters-bar";
import { TaskTableView } from "@/features/tasks/components/task-table-view";
import { useTasks } from "@/features/tasks/hooks/use-tasks";
import { Task } from "@/features/tasks/types/task.types";
import {
  applyModeFilter,
  applySectionQuery,
  filterByView,
  getPageCompletedTasks,
  TaskListQuery,
  TaskPageVariant,
  TaskView,
} from "@/features/tasks/utils/task-filters";
import { useUiStore } from "@/shared/store/ui-store";
import { cn } from "@/shared/lib/utils";

type TaskSectionsProps = {
  variant: TaskPageVariant;
};

type SectionConfig = {
  view: TaskView;
  heading: string;
  sectionId: string;
};

type ViewMode = "cards" | "list";

const statsShape = {
  inbox: 0,
  overdue: 0,
  today: 0,
  upcoming: 0,
  completed: 0,
};

const PAGE_CONFIG: Record<
  TaskPageVariant,
  {
    title: string;
    description: string;
    defaultSort: TaskListQuery["sort"];
    sections: SectionConfig[];
    statKeys: Array<{ key: keyof typeof statsShape; label: string }>;
  }
> = {
  inbox: {
    title: "Inbox",
    description: "Capture undated tasks and triage overdue follow-ups.",
    defaultSort: "created_desc",
    sections: [
      { view: "inbox", heading: "Inbox capture", sectionId: "inbox-capture" },
      { view: "overdue", heading: "Overdue follow-up", sectionId: "inbox-overdue" },
    ],
    statKeys: [
      { key: "inbox", label: "Inbox" },
      { key: "overdue", label: "Overdue" },
      { key: "today", label: "Today" },
      { key: "upcoming", label: "Upcoming" },
      { key: "completed", label: "Completed" },
    ],
  },
  today: {
    title: "Today",
    description: "Focus on what's due now and plan ahead.",
    defaultSort: "due_date_asc",
    sections: [
      { view: "overdue", heading: "Overdue tasks", sectionId: "today-overdue" },
      { view: "today", heading: "Today's focus list", sectionId: "today-focus" },
      { view: "upcoming", heading: "Upcoming tasks", sectionId: "today-upcoming" },
    ],
    statKeys: [
      { key: "overdue", label: "Overdue" },
      { key: "today", label: "Today" },
      { key: "upcoming", label: "Upcoming" },
      { key: "inbox", label: "Inbox" },
      { key: "completed", label: "Completed" },
    ],
  },
};

const DEFAULT_QUERY: TaskListQuery = {
  search: "",
  completion: "all",
  priority: "all",
  status: "all",
  context: "all",
  due: "all",
  projectId: "all",
  sort: "due_date_asc",
};

export function TaskSections({ variant }: TaskSectionsProps) {
  const config = PAGE_CONFIG[variant];
  const router = useRouter();
  const [query, setQuery] = useState<TaskListQuery>({ ...DEFAULT_QUERY, sort: config.defaultSort });
  const [viewMode, setViewMode] = useState<ViewMode>("cards");
  const [focusedSection, setFocusedSection] = useState<TaskView | null>(null);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  const mode = useUiStore((state) => state.mode);
  const { data, isLoading, isError } = useTasks();
  const { data: projects } = useProjects();

  const scopedTasks = useMemo(() => applyModeFilter(data ?? [], mode), [data, mode]);

  const projectNameById = useMemo(() => {
    const map = new Map<string, string>();
    (projects ?? []).forEach((project) => map.set(project.id, project.name));
    return map;
  }, [projects]);

  const stats = useMemo(() => {
    return {
      inbox: filterByView(scopedTasks, "inbox").length,
      overdue: filterByView(scopedTasks, "overdue").length,
      today: filterByView(scopedTasks, "today").length,
      upcoming: filterByView(scopedTasks, "upcoming").length,
      completed: getPageCompletedTasks(scopedTasks, variant).length,
    };
  }, [scopedTasks, variant]);

  const sectionTasks = useMemo(() => {
    if (query.completion === "completed") {
      const completed = applySectionQuery(getPageCompletedTasks(scopedTasks, variant), query);
      return [{ section: null as SectionConfig | null, tasks: completed }];
    }

    const sections = focusedSection
      ? config.sections.filter((section) => section.view === focusedSection)
      : config.sections;

    return sections.map((section) => ({
      section,
      tasks: applySectionQuery(filterByView(scopedTasks, section.view), query),
    }));
  }, [config.sections, focusedSection, query, scopedTasks, variant]);

  const combinedTasks = useMemo(() => {
    const seen = new Set<string>();
    const merged: Task[] = [];
    for (const { tasks } of sectionTasks) {
      for (const task of tasks) {
        if (seen.has(task.id)) continue;
        seen.add(task.id);
        merged.push(task);
      }
    }
    return merged;
  }, [sectionTasks]);

  const totalVisible = combinedTasks.length;
  const totalScoped = scopedTasks.length;

  const scrollToSection = (key: keyof typeof statsShape) => {
    if (key === "completed") {
      setQuery((current) => ({ ...current, completion: "completed" }));
      setFocusedSection(null);
      return;
    }

    const hasSection = config.sections.some((section) => section.view === key);
    if (!hasSection) {
      if (key === "inbox") {
        router.push("/inbox");
        return;
      }
      if (key === "today" || key === "upcoming") {
        router.push("/today");
        return;
      }
    }

    setQuery((current) => ({ ...current, completion: "all" }));
    setFocusedSection((current) => (current === key ? null : key));

    const sectionId =
      key === "inbox"
        ? "inbox-capture"
        : config.sections.find((section) => section.view === key)?.sectionId;
    if (sectionId) {
      window.requestAnimationFrame(() => {
        sectionRefs.current[sectionId]?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  };

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading tasks...</p>;
  }

  if (isError) {
    return <p className="text-sm text-danger">Unable to load tasks right now.</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">{config.title}</h1>
          <p className="text-sm text-muted-foreground">{config.description}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Showing {totalVisible} of {totalScoped} · {stats.completed} completed on this page
          </p>
        </div>

        <div className="flex rounded-xl border border-border bg-surface p-1">
          <button
            type="button"
            className={cn(
              "inline-flex cursor-pointer items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
              viewMode === "cards" ? "bg-surface-elevated text-foreground" : "text-muted-foreground",
            )}
            onClick={() => setViewMode("cards")}
            aria-pressed={viewMode === "cards"}
          >
            <LayoutGrid className="size-4" />
            Cards
          </button>
          <button
            type="button"
            className={cn(
              "inline-flex cursor-pointer items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
              viewMode === "list" ? "bg-surface-elevated text-foreground" : "text-muted-foreground",
            )}
            onClick={() => setViewMode("list")}
            aria-pressed={viewMode === "list"}
          >
            <List className="size-4" />
            List
          </button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {config.statKeys.map(({ key, label }) => (
          <StatCard
            key={key}
            label={label}
            value={stats[key]}
            isActive={
              key === "completed"
                ? query.completion === "completed"
                : query.completion === "all" && focusedSection === key
            }
            onClick={() => scrollToSection(key)}
          />
        ))}
      </div>

      <TaskFiltersBar
        query={query}
        onQueryChange={setQuery}
        projects={projects ?? []}
        idPrefix={variant}
        showCompletionTabs
      />

      {focusedSection && query.completion === "all" ? (
        <button
          type="button"
          className="cursor-pointer text-sm text-muted-foreground hover:text-foreground"
          onClick={() => setFocusedSection(null)}
        >
          Show all sections
        </button>
      ) : null}

      {viewMode === "list" ? (
        combinedTasks.length === 0 ? (
          <EmptyState variant={variant} completion={query.completion} />
        ) : (
          <TaskTableView tasks={combinedTasks} />
        )
      ) : (
        sectionTasks.map(({ section, tasks }) =>
          section ? (
            <SectionBlock
              key={section.sectionId}
              ref={(node) => {
                sectionRefs.current[section.sectionId] = node;
              }}
              heading={section.heading}
              count={tasks.length}
              tasks={tasks}
              projectNameById={projectNameById}
              emptyMessage={getEmptyMessage(section.view)}
            />
          ) : (
            <SectionBlock
              key="completed"
              heading={variant === "inbox" ? "Completed inbox tasks" : "Completed today"}
              count={tasks.length}
              tasks={tasks}
              projectNameById={projectNameById}
              emptyMessage={
                variant === "inbox"
                  ? "No completed inbox tasks yet."
                  : "No completed tasks for today yet."
              }
            />
          ),
        )
      )}
    </div>
  );
}

const SectionBlock = forwardRef<
  HTMLElement,
  {
    heading: string;
    count: number;
    tasks: Task[];
    projectNameById: Map<string, string>;
    emptyMessage: string;
  }
>(function SectionBlock({ heading, count, tasks, projectNameById, emptyMessage }, ref) {
  return (
    <section ref={ref} className="space-y-4 scroll-mt-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{heading}</h2>
        <span className="rounded-full bg-surface px-2 py-0.5 text-xs text-muted-foreground">{count}</span>
      </div>
      {tasks.length === 0 ? (
        <Card>
          <p className="text-sm text-muted-foreground">{emptyMessage}</p>
        </Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              projectName={task.projectId ? projectNameById.get(task.projectId) : null}
            />
          ))}
        </div>
      )}
    </section>
  );
});

function StatCard({
  label,
  value,
  isActive,
  onClick,
}: {
  label: string;
  value: number;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "cursor-pointer rounded-2xl border p-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        isActive ? "border-primary/50 bg-surface-elevated" : "border-border bg-surface hover:bg-surface-elevated/60",
      )}
      aria-pressed={isActive}
    >
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-2 text-xl font-semibold">{value}</p>
    </button>
  );
}

function getEmptyMessage(view: TaskView) {
  switch (view) {
    case "overdue":
      return "No overdue tasks. Great consistency.";
    case "today":
      return "You are all clear today. Create a focus task to stay productive.";
    case "upcoming":
      return "No upcoming tasks scheduled yet.";
    case "inbox":
      return "Inbox is empty. Capture ideas quickly to process later.";
    default:
      return "No tasks found for this view.";
  }
}

function EmptyState({ variant, completion }: { variant: TaskPageVariant; completion: TaskListQuery["completion"] }) {
  const message =
    completion === "completed"
      ? variant === "inbox"
        ? "No completed inbox tasks match your filters."
        : "No completed today tasks match your filters."
      : variant === "inbox"
        ? "No inbox tasks match your filters."
        : "No today tasks match your filters.";

  return (
    <Card className="space-y-3">
      <p className="text-sm text-muted-foreground">{message}</p>
      <div className="flex gap-2">
        <Link
          href="/tasks"
          className="rounded-lg border border-border bg-surface px-3 py-2 text-sm hover:bg-surface-elevated"
        >
          View all tasks
        </Link>
      </div>
    </Card>
  );
}

"use client";

import { Input } from "@/components/ui/input";
import {
  DEFAULT_TASK_LIST_QUERY,
  TaskListQuery,
  TaskSortOption,
} from "@/features/tasks/utils/task-filters";
import { PRIORITY_LABELS, selectFieldClassName, TASK_PRIORITIES } from "@/features/tasks/utils/task-priority";
import { cn } from "@/shared/lib/utils";

const filterSelectClassName = `${selectFieldClassName} h-9 min-w-[140px]`;

const SORT_OPTIONS: Array<{ value: TaskSortOption; label: string }> = [
  { value: "due_date_asc", label: "Due date (earliest)" },
  { value: "due_date_desc", label: "Due date (latest)" },
  { value: "priority_asc", label: "Priority (P0 first)" },
  { value: "priority_desc", label: "Priority (P3 first)" },
  { value: "updated_desc", label: "Recently updated" },
  { value: "created_desc", label: "Newest created" },
  { value: "created_asc", label: "Oldest created" },
  { value: "title_asc", label: "Title (A-Z)" },
  { value: "title_desc", label: "Title (Z-A)" },
];

type ProjectOption = {
  id: string;
  name: string;
};

type TaskFiltersBarProps = {
  query: TaskListQuery;
  onQueryChange: (query: TaskListQuery) => void;
  projects: ProjectOption[];
  idPrefix: string;
  showCompletionTabs?: boolean;
  showDueFilter?: boolean;
};

export function TaskFiltersBar({
  query,
  onQueryChange,
  projects,
  idPrefix,
  showCompletionTabs = false,
  showDueFilter = false,
}: TaskFiltersBarProps) {
  const updateQuery = <K extends keyof TaskListQuery>(key: K, value: TaskListQuery[K]) => {
    onQueryChange({ ...query, [key]: value });
  };

  const hasActiveFilters =
    query.priority !== "all" ||
    query.status !== "all" ||
    query.context !== "all" ||
    query.due !== "all" ||
    query.projectId !== "all" ||
    query.search.trim().length > 0;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        {showCompletionTabs ? (
          <div className="flex rounded-xl border border-border bg-surface p-1">
            {(["all", "completed"] as const).map((option) => (
              <button
                key={option}
                type="button"
                className={cn(
                  "cursor-pointer rounded-lg px-3 py-1.5 text-sm capitalize transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                  query.completion === option ? "bg-surface-elevated text-foreground" : "text-muted-foreground",
                )}
                onClick={() => updateQuery("completion", option)}
                aria-pressed={query.completion === option}
              >
                {option}
              </button>
            ))}
          </div>
        ) : null}

        <label htmlFor={`${idPrefix}-search`} className="sr-only">
          Search tasks
        </label>
        <Input
          id={`${idPrefix}-search`}
          value={query.search}
          onChange={(event) => updateQuery("search", event.target.value)}
          placeholder="Search title, description, context, or priority..."
          className="h-9 max-w-xs"
        />

        {hasActiveFilters ? (
          <button
            type="button"
            className="cursor-pointer rounded-lg border border-border px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground"
            onClick={() =>
              onQueryChange({
                ...DEFAULT_TASK_LIST_QUERY,
                completion: query.completion,
                sort: query.sort,
              })
            }
          >
            Clear filters
          </button>
        ) : null}
      </div>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <FilterField label="Priority" htmlFor={`${idPrefix}-priority`}>
          <select
            id={`${idPrefix}-priority`}
            className={filterSelectClassName}
            value={query.priority}
            onChange={(event) => updateQuery("priority", event.target.value as TaskListQuery["priority"])}
          >
            <option value="all">All priorities</option>
            {TASK_PRIORITIES.map((priority) => (
              <option key={priority} value={priority}>
                {PRIORITY_LABELS[priority]}
              </option>
            ))}
          </select>
        </FilterField>

        <FilterField label="Status" htmlFor={`${idPrefix}-status`}>
          <select
            id={`${idPrefix}-status`}
            className={filterSelectClassName}
            value={query.status}
            onChange={(event) => updateQuery("status", event.target.value as TaskListQuery["status"])}
          >
            <option value="all">All statuses</option>
            <option value="todo">To do</option>
            <option value="in_progress">In progress</option>
            <option value="done">Done</option>
          </select>
        </FilterField>

        <FilterField label="Context" htmlFor={`${idPrefix}-context`}>
          <select
            id={`${idPrefix}-context`}
            className={filterSelectClassName}
            value={query.context}
            onChange={(event) => updateQuery("context", event.target.value as TaskListQuery["context"])}
          >
            <option value="all">All contexts</option>
            <option value="work">Work</option>
            <option value="personal">Personal</option>
            <option value="general">General</option>
          </select>
        </FilterField>

        {showDueFilter ? (
          <FilterField label="Due date" htmlFor={`${idPrefix}-due`}>
            <select
              id={`${idPrefix}-due`}
              className={filterSelectClassName}
              value={query.due}
              onChange={(event) => updateQuery("due", event.target.value as TaskListQuery["due"])}
            >
              <option value="all">All due dates</option>
              <option value="overdue">Overdue</option>
              <option value="today">Today</option>
              <option value="upcoming">Upcoming</option>
              <option value="none">No due date</option>
            </select>
          </FilterField>
        ) : null}

        <FilterField label="Project" htmlFor={`${idPrefix}-project`}>
          <select
            id={`${idPrefix}-project`}
            className={filterSelectClassName}
            value={query.projectId}
            onChange={(event) => updateQuery("projectId", event.target.value)}
          >
            <option value="all">All projects</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </FilterField>

        <FilterField label="Sort by" htmlFor={`${idPrefix}-sort`}>
          <select
            id={`${idPrefix}-sort`}
            className={filterSelectClassName}
            value={query.sort}
            onChange={(event) => updateQuery("sort", event.target.value as TaskSortOption)}
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </FilterField>
      </div>
    </div>
  );
}

function FilterField({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1 block text-xs font-medium text-muted-foreground">
        {label}
      </label>
      {children}
    </div>
  );
}

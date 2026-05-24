"use client";

import { motion } from "framer-motion";
import { Bell, PanelLeft, Search } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useSaveWorkspaceMode, useWorkspaceMode } from "@/features/settings/hooks/use-workspace-mode";
import { useTasksRealtimeSync } from "@/features/tasks/hooks/use-tasks";
import { primaryNavigation } from "@/shared/constants/navigation";
import { useAuthUser, useSignOut } from "@/shared/hooks/use-auth";
import { cn } from "@/shared/lib/utils";
import { useUiStore } from "@/shared/store/ui-store";

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const isSidebarCollapsed = useUiStore((state) => state.isSidebarCollapsed);
  const setSidebarCollapsed = useUiStore((state) => state.setSidebarCollapsed);
  const mode = useUiStore((state) => state.mode);
  const setMode = useUiStore((state) => state.setMode);
  const { data: persistedMode } = useWorkspaceMode();
  const saveMode = useSaveWorkspaceMode();
  const { data: user } = useAuthUser();
  const signOut = useSignOut();
  const [modeSaveError, setModeSaveError] = useState("");
  const [searchText, setSearchText] = useState("");
  useTasksRealtimeSync();

  useEffect(() => {
    if (persistedMode) {
      setMode(persistedMode);
    }
  }, [persistedMode, setMode]);

  useEffect(() => {
    // Prefetch frequent routes to make navigation feel instant.
    primaryNavigation.forEach((item) => {
      router.prefetch(item.href);
    });
  }, [router]);

  const handleSignOut = async () => {
    try {
      await signOut.mutateAsync();
      toast.success("Signed out");
      router.push("/login");
      router.refresh();
    } catch {
      toast.error("Unable to sign out right now.");
    }
  };

  const handleModeToggle = async () => {
    const nextMode = mode === "personal" ? "office" : "personal";
    setModeSaveError("");
    setMode(nextMode);
    try {
      await saveMode.mutateAsync(nextMode);
      toast.success(`${nextMode === "office" ? "Office" : "Personal"} mode enabled.`);
    } catch {
      // Roll back UI immediately if persistence fails.
      setMode(mode);
      setModeSaveError("Could not save workspace mode. Your previous mode is restored.");
    }
  };

  const handleSearchEnter = (query: string) => {
    const q = query.trim().toLowerCase();
    if (!q) return;
    if (q.includes("task")) return router.push("/tasks");
    if (q.includes("today")) return router.push("/today");
    if (q.includes("project")) return router.push("/projects");
    if (q.includes("habit")) return router.push("/habits");
    if (q.includes("goal")) return router.push("/goals");
    if (q.includes("calendar")) return router.push("/calendar");
    if (q.includes("analytics")) return router.push("/analytics");
    if (q.includes("assistant") || q.includes("ai")) return router.push("/assistant");
    if (q.includes("workspace")) return router.push("/workspaces");
    router.push("/tasks");
  };

  return (
    <div
      className="grid min-h-screen gap-4 p-4 md:grid-cols-[auto_1fr]"
      data-theme={mode === "office" ? "office" : undefined}
    >
      <aside
        className={cn(
          "glass h-[calc(100vh-2rem)] rounded-[28px] p-3 transition-all duration-300",
          isSidebarCollapsed ? "w-[84px]" : "w-[280px]",
        )}
      >
        <div className="mb-8 flex items-center justify-between px-2 py-1">
          {!isSidebarCollapsed ? <span className="text-lg font-semibold">TaskOrbit</span> : null}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarCollapsed(!isSidebarCollapsed)}
            aria-label="Toggle sidebar"
          >
            <PanelLeft className="size-4" />
          </Button>
        </div>

        <nav className="space-y-2">
          {primaryNavigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-2xl px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                  isActive ? "bg-surface-elevated text-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <item.icon className="size-4" />
                {!isSidebarCollapsed ? <span>{item.label}</span> : null}
              </Link>
            );
          })}
        </nav>

        <div className="mt-8 rounded-2xl border border-border bg-surface p-3">
          <p className="text-xs text-muted-foreground">Mode</p>
          <button
            className="mt-2 w-full rounded-xl border border-border bg-surface-elevated p-2 text-left text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            onClick={() => void handleModeToggle()}
            disabled={saveMode.isPending}
            aria-pressed={mode === "office"}
            title="Office mode hides personal items. Personal mode shows all."
          >
            {saveMode.isPending ? "Updating mode..." : mode === "office" ? "Office Mode" : "Personal Mode"}
          </button>
          {modeSaveError ? (
            <p className="mt-2 text-xs text-warning" role="status" aria-live="polite">
              {modeSaveError}
            </p>
          ) : null}
        </div>
      </aside>

      <section className="space-y-4">
        <header className="glass sticky top-4 z-10 flex items-center justify-between rounded-[24px] px-4 py-3">
          <div className="flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2 text-sm text-muted-foreground">
            <Search className="size-4" />
            <label htmlFor="global-nav-search" className="sr-only">
              Global navigation search
            </label>
            <input
              id="global-nav-search"
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  handleSearchEnter(searchText);
                }
              }}
              placeholder="Type and press Enter (tasks, today, projects...)"
              className="min-w-[260px] rounded-md bg-transparent px-1 outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary/40"
              aria-label="Global quick navigation search"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" aria-label="Notifications" title="Notification center coming soon">
              <Bell className="size-4" />
            </Button>
            <Button variant="ghost" size="default" onClick={() => void handleSignOut()}>
              {user?.email ? `Sign out · ${user.email}` : "Sign out"}
            </Button>
          </div>
        </header>

        <motion.main
          initial={{ opacity: 0.96 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.12, ease: "easeOut" }}
        >
          {children}
        </motion.main>
      </section>
    </div>
  );
}

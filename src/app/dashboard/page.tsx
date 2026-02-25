import { createClient } from "@/lib/supabase/server";
import { CreateTaskDialog } from "@/components/tasks/create-task-dialog";
import { TasksGrid } from "@/components/tasks/tasks-grid";
import { redirect } from "next/navigation";
import { LogoutButton } from "@/components/auth/logout-button";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  const { data: tasks } = await supabase
    .from("tasks")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Worklog</h1>
            <p className="text-muted-foreground text-sm">
              Daily work entries with attachments and realtime updates
            </p>
          </div>

          {/* RIGHT SIDE ACTIONS */}
          <div className="flex items-center gap-3">
            <CreateTaskDialog />
            <LogoutButton />
          </div>
        </div>

        {/* Tasks Grid */}
        <TasksGrid initialTasks={tasks ?? []} />
      </div>
    </main>
  );
}

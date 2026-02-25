"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { TaskCard } from "./task-card";

type Task = {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  excel_url: string | null;
};

export function TasksGrid({ initialTasks }: { initialTasks: Task[] }) {
  const [tasks, setTasks] = useState(initialTasks);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);

  useEffect(() => {
    const fetchLatestTasks = async () => {
      const { data } = await supabase
        .from("tasks")
        .select("*")
        .order("created_at", { ascending: false });

      if (data) setTasks(data);
    };

    const channel = supabase
      .channel("tasks-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tasks",
        },
        async () => {
          await fetchLatestTasks();
        },
      )
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await fetchLatestTasks();
        }
      });

    // Fallback for environments where insert/update realtime can be delayed/misconfigured.
    const pollId = window.setInterval(() => {
      fetchLatestTasks();
    }, 3000);

    return () => {
      window.clearInterval(pollId);
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  return (
    <>
      {tasks.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">
          No logs yet. Add your first work entry.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      )}
    </>
  );
}

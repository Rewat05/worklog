"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import {
  taskSchema,
  TaskInput,
  TASK_DESCRIPTION_MAX_LENGTH,
  TASK_TITLE_MAX_LENGTH,
} from "@/lib/validations/task.schema";
import { createTask } from "@/actions/task.actions";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function CreateTaskDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<TaskInput>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });

  const onSubmit = (values: TaskInput) => {
    setSubmitError(null);
    const formData = new FormData();
    formData.append("title", values.title);
    formData.append("description", values.description);

    const image = (document.getElementById("image") as HTMLInputElement)
      ?.files?.[0];
    const excel = (document.getElementById("excel") as HTMLInputElement)
      ?.files?.[0];

    if (image) formData.append("image", image);
    if (excel) formData.append("excel", excel);

    startTransition(async () => {
      const result = await createTask(formData);

      if (result?.error) {
        setSubmitError(result.error);
        return;
      }

      form.reset();
      setOpen(false);
      router.refresh();
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add Log</Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Worklog Entry</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <Input
            placeholder="What did you work on today?"
            maxLength={TASK_TITLE_MAX_LENGTH}
            {...form.register("title")}
          />
          {form.formState.errors.title && (
            <p className="text-sm text-red-500">
              {form.formState.errors.title.message}
            </p>
          )}

          <Textarea
            placeholder="Summary, blockers, outcomes..."
            maxLength={TASK_DESCRIPTION_MAX_LENGTH}
            {...form.register("description")}
          />
          {form.formState.errors.description && (
            <p className="text-sm text-red-500">
              {form.formState.errors.description.message}
            </p>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Screenshot / Photo (optional)
            </label>
            <Input id="image" type="file" accept="image/*" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Report / Sheet (optional)
            </label>
            <Input id="excel" type="file" accept=".xlsx,.xls" />
          </div>

          <p className="text-xs text-muted-foreground">
            Add files when relevant to keep useful context for each worklog.
          </p>

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Adding..." : "Add Log"}
          </Button>

          {submitError && <p className="text-sm text-red-500">{submitError}</p>}
        </form>
      </DialogContent>
    </Dialog>
  );
}

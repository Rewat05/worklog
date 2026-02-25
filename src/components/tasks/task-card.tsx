"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteTask, updateTask } from "@/actions/task.actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type Task = {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  excel_url: string | null;
};

export function TaskCard({ task }: { task: Task }) {
  const router = useRouter();
  const [isDeletePending, startDeleteTransition] = useTransition();
  const [isUpdatePending, startUpdateTransition] = useTransition();
  const [isEditing, setIsEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftDescription, setDraftDescription] = useState("");
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);

  const handleDelete = () => {
    const confirmed = window.confirm("Delete this log?");
    if (!confirmed) return;

    setDeleteError(null);

    startDeleteTransition(async () => {
      const result = await deleteTask(task.id);
      if (result?.error) {
        setDeleteError(result.error);
        return;
      }

      router.refresh();
    });
  };

  const handleUpdate = () => {
    setUpdateError(null);

    startUpdateTransition(async () => {
      const result = await updateTask(task.id, draftTitle, draftDescription);
      if (result?.error) {
        setUpdateError(result.error);
        return;
      }

      setIsEditing(false);
      router.refresh();
    });
  };

  return (
    <Card className="rounded-2xl shadow-sm border">
      <CardHeader>
        {isEditing ? (
          <Input
            value={draftTitle}
            onChange={(e) => setDraftTitle(e.target.value)}
          />
        ) : (
          <CardTitle className="text-lg">{task.title}</CardTitle>
        )}
      </CardHeader>

      <CardContent className="space-y-3">
        {isEditing ? (
          <Textarea
            value={draftDescription}
            onChange={(e) => setDraftDescription(e.target.value)}
          />
        ) : (
          task.description && (
            <p className="text-sm text-muted-foreground">{task.description}</p>
          )
        )}

        {task.image_url && (
          <img
            src={task.image_url}
            alt={task.title}
            className="w-full h-40 object-cover rounded-lg border"
          />
        )}

        {task.excel_url && (
          <a
            href={task.excel_url}
            target="_blank"
            className="text-sm underline text-primary"
          >
            Open Attachment
          </a>
        )}

        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button
                type="button"
                size="sm"
                onClick={handleUpdate}
                disabled={isUpdatePending}
              >
                {isUpdatePending ? "Saving..." : "Save Changes"}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setDraftTitle("");
                  setDraftDescription("");
                  setUpdateError(null);
                  setIsEditing(false);
                }}
                disabled={isUpdatePending}
              >
                Cancel
              </Button>
            </>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setDraftTitle(task.title);
                setDraftDescription(task.description ?? "");
                setUpdateError(null);
                setIsEditing(true);
              }}
            >
              Edit Log
            </Button>
          )}

          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={isDeletePending || isUpdatePending}
          >
            {isDeletePending ? "Deleting..." : "Delete Log"}
          </Button>
        </div>

        {deleteError && <p className="text-sm text-red-500">{deleteError}</p>}
        {updateError && <p className="text-sm text-red-500">{updateError}</p>}
      </CardContent>
    </Card>
  );
}

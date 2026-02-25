"use server";

import { createClient } from "@/lib/supabase/server";
import { taskSchema } from "@/lib/validations/task.schema";
import { revalidatePath } from "next/cache";

export async function createTask(formData: FormData) {
  const supabase = await createClient();

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const image = formData.get("image") as File;
  const excel = formData.get("excel") as File;

  const validated = taskSchema.safeParse({ title, description });
  if (!validated.success) {
    return { error: validated.error.issues[0]?.message ?? "Invalid form data" };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  let imageUrl = null;
  let excelUrl = null;

  // Upload Image
  if (image && image.size > 0) {
    const filePath = `${user.id}/images/${Date.now()}-${image.name}`;
    const { error: imageUploadError } = await supabase.storage
      .from("task-files")
      .upload(filePath, image, { contentType: image.type });

    if (imageUploadError) {
      return { error: `Image upload failed: ${imageUploadError.message}` };
    }

    imageUrl = supabase.storage.from("task-files").getPublicUrl(filePath).data
      .publicUrl;
  }

  // Upload Excel
  if (excel && excel.size > 0) {
    const filePath = `${user.id}/excel/${Date.now()}-${excel.name}`;
    const { error: excelUploadError } = await supabase.storage
      .from("task-files")
      .upload(filePath, excel, { contentType: excel.type });

    if (excelUploadError) {
      return { error: `Excel upload failed: ${excelUploadError.message}` };
    }

    excelUrl = supabase.storage.from("task-files").getPublicUrl(filePath).data
      .publicUrl;
  }

  const { error: insertError } = await supabase.from("tasks").insert({
    title,
    description,
    image_url: imageUrl,
    excel_url: excelUrl,
    user_id: user.id,
  });

  if (insertError) {
    return { error: `Task creation failed: ${insertError.message}` };
  }

  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteTask(taskId: string) {
  const supabase = await createClient();

  if (!taskId) {
    return { error: "Task id is required" };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase
    .from("tasks")
    .delete()
    .eq("id", taskId)
    .eq("user_id", user.id);

  if (error) {
    return { error: `Task delete failed: ${error.message}` };
  }

  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateTask(taskId: string, title: string, description: string) {
  const supabase = await createClient();

  if (!taskId) {
    return { error: "Task id is required" };
  }

  const validated = taskSchema.safeParse({ title, description });
  if (!validated.success) {
    return { error: validated.error.issues[0]?.message ?? "Invalid form data" };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase
    .from("tasks")
    .update({ title, description })
    .eq("id", taskId)
    .eq("user_id", user.id);

  if (error) {
    return { error: `Task update failed: ${error.message}` };
  }

  revalidatePath("/dashboard");
  return { success: true };
}

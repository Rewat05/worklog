import { z } from "zod";

export const taskSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(5, "Description is too short"),
});

export type TaskInput = z.infer<typeof taskSchema>;
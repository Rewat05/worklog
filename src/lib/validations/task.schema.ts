import { z } from "zod";

export const TASK_TITLE_MIN_LENGTH = 3;
export const TASK_TITLE_MAX_LENGTH = 100;
export const TASK_DESCRIPTION_MIN_LENGTH = 5;
export const TASK_DESCRIPTION_MAX_LENGTH = 1000;

export const taskSchema = z.object({
  title: z
    .string()
    .min(
      TASK_TITLE_MIN_LENGTH,
      `Title must be at least ${TASK_TITLE_MIN_LENGTH} characters`,
    )
    .max(
      TASK_TITLE_MAX_LENGTH,
      `Title must be at most ${TASK_TITLE_MAX_LENGTH} characters`,
    ),
  description: z
    .string()
    .min(
      TASK_DESCRIPTION_MIN_LENGTH,
      `Task must be at least ${TASK_DESCRIPTION_MIN_LENGTH} characters`,
    )
    .max(
      TASK_DESCRIPTION_MAX_LENGTH,
      `Task must be at most ${TASK_DESCRIPTION_MAX_LENGTH} characters`,
    ),
});

export type TaskInput = z.infer<typeof taskSchema>;

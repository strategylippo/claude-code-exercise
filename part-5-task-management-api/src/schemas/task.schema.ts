import { z } from 'zod';

export const taskStatusEnum = z.enum(['TODO', 'IN_PROGRESS', 'DONE']);
export const priorityEnum = z.enum(['LOW', 'MEDIUM', 'HIGH']);

export const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().optional(),
  status: taskStatusEnum.optional().default('TODO'),
  priority: priorityEnum.optional().default('MEDIUM'),
  dueDate: z.string().datetime().optional(),
  assigneeId: z.string().optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  status: taskStatusEnum.optional(),
  priority: priorityEnum.optional(),
  dueDate: z.string().datetime().optional().nullable(),
});

export const assignTaskSchema = z.object({
  assigneeId: z.string().optional().nullable(),
});

export const taskFilterSchema = z.object({
  status: taskStatusEnum.optional(),
  priority: priorityEnum.optional(),
  assigneeId: z.string().optional(),
  search: z.string().optional(),
  includeDeleted: z.string().optional().transform((val) => val === 'true'),
});

export const taskIdParamSchema = z.object({
  id: z.string().min(1, 'Task ID is required'),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type AssignTaskInput = z.infer<typeof assignTaskSchema>;
export type TaskFilterInput = z.infer<typeof taskFilterSchema>;

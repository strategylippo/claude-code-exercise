// Task Controller with missing await bug

import { createTaskInDb, getTaskById, updateTaskInDb, Task } from '../services/task.service';

interface CreateTaskRequest {
  title: string;
  description: string;
  priority?: 'low' | 'medium' | 'high';
}

interface UpdateTaskRequest {
  title?: string;
  description?: string;
  status?: 'todo' | 'in-progress' | 'done';
}

export async function createTask(req: CreateTaskRequest): Promise<Task> {
  const { title, description, priority } = req;

  // Validate input
  if (!title || title.trim().length === 0) {
    throw new Error('Title is required');
  }

  // BUG: Missing await - returns Promise instead of resolved value
  const task = createTaskInDb({
    title: title.trim(),
    description: description || '',
    priority: priority || 'medium',
  });

  return task;
}

export async function getTask(taskId: string): Promise<Task> {
  if (!taskId) {
    throw new Error('Task ID is required');
  }

  const task = await getTaskById(taskId);

  if (!task) {
    throw new Error('Task not found');
  }

  return task;
}

export async function updateTask(taskId: string, req: UpdateTaskRequest): Promise<Task | null> {
  if (!taskId) {
    throw new Error('Task ID is required');
  }

  const existingTask = await getTaskById(taskId);
  if (!existingTask) {
    throw new Error('Task not found');
  }

  // BUG: Another missing await
  const updatedTask = updateTaskInDb(taskId, req);

  return updatedTask;
}

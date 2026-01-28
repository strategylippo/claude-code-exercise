// Task Service - simulates async database operations

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in-progress' | 'done';
  createdAt: Date;
  updatedAt: Date;
}

interface CreateTaskInput {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
}

// Simulated database
const tasks: Map<string, Task> = new Map();
let taskCounter = 0;

// Simulate async database operation
function simulateDbDelay(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 10));
}

export async function createTaskInDb(input: CreateTaskInput): Promise<Task> {
  await simulateDbDelay();

  const id = `task-${++taskCounter}`;
  const task: Task = {
    id,
    title: input.title,
    description: input.description,
    priority: input.priority,
    status: 'todo',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  tasks.set(id, task);
  return task;
}

export async function getTaskById(id: string): Promise<Task | null> {
  await simulateDbDelay();
  return tasks.get(id) || null;
}

export async function updateTaskInDb(
  id: string,
  updates: Partial<Task>
): Promise<Task | null> {
  await simulateDbDelay();

  const task = tasks.get(id);
  if (!task) {
    return null;
  }

  const updatedTask: Task = {
    ...task,
    ...updates,
    updatedAt: new Date(),
  };

  tasks.set(id, updatedTask);
  return updatedTask;
}

export function clearTasks(): void {
  tasks.clear();
  taskCounter = 0;
}

// Task Service with pagination bug

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'done';
  createdAt: Date;
}

interface PaginationOptions {
  page: number;
  limit: number;
}

interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Simulated database
const tasks: Task[] = [];

export function createTask(title: string, description: string): Task {
  const task: Task = {
    id: `task-${tasks.length + 1}`,
    title,
    description,
    status: 'todo',
    createdAt: new Date(),
  };
  tasks.push(task);
  return task;
}

export function getTasks(options: PaginationOptions): PaginatedResult<Task> {
  const { page, limit } = options;

  // Calculate how many items to skip based on page number
  const skip = (page - 1) * limit;

  const paginatedTasks = tasks.slice(skip, skip + limit);

  return {
    data: paginatedTasks,
    pagination: {
      page,
      limit,
      total: tasks.length,
      totalPages: Math.ceil(tasks.length / limit),
    },
  };
}

export function clearTasks(): void {
  tasks.length = 0;
}

export function getTaskCount(): number {
  return tasks.length;
}

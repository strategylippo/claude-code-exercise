// Task Service - Sample file for hook demonstration
// This is a non-security file, so hook shows brief reminder

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'done';
  createdAt: Date;
}

export class TaskService {
  private tasks: Map<string, Task> = new Map();

  async createTask(title: string, description: string): Promise<Task> {
    const task: Task = {
      id: `task-${Date.now()}`,
      title,
      description,
      status: 'todo',
      createdAt: new Date(),
    };

    this.tasks.set(task.id, task);
    return task;
  }

  async getTask(id: string): Promise<Task | null> {
    return this.tasks.get(id) || null;
  }

  async updateTaskStatus(id: string, status: Task['status']): Promise<Task | null> {
    const task = this.tasks.get(id);
    if (!task) return null;

    task.status = status;
    return task;
  }

  async deleteTask(id: string): Promise<boolean> {
    return this.tasks.delete(id);
  }
}

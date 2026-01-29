// Task Updater with race condition bug

interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  updatedAt: Date;
}

interface UpdateResult {
  success: boolean;
  task?: Task;
  error?: string;
}

// Simulated API with variable latency
class TaskApi {
  private tasks: Map<string, Task> = new Map();

  constructor() {
    // Initialize with a test task
    this.tasks.set('task-1', {
      id: 'task-1',
      title: 'Initial Title',
      description: 'Initial Description',
      status: 'todo',
      updatedAt: new Date(),
    });
  }

  async updateTask(
    taskId: string,
    updates: Partial<Task>
  ): Promise<Task> {
    // Simulate variable network latency (50-300ms)
    const latency = Math.random() * 250 + 50;
    await new Promise((resolve) => setTimeout(resolve, latency));

    const task = this.tasks.get(taskId);
    if (!task) {
      throw new Error('Task not found');
    }

    const updatedTask: Task = {
      ...task,
      ...updates,
      updatedAt: new Date(),
    };

    this.tasks.set(taskId, updatedTask);
    return updatedTask;
  }

  getTask(taskId: string): Task | undefined {
    return this.tasks.get(taskId);
  }

  reset(): void {
    this.tasks.set('task-1', {
      id: 'task-1',
      title: 'Initial Title',
      description: 'Initial Description',
      status: 'todo',
      updatedAt: new Date(),
    });
  }
}

// BUG: This updater has a race condition
export class TaskUpdater {
  private api: TaskApi;
  private currentTask: Task | null = null;

  constructor(api?: TaskApi) {
    this.api = api || new TaskApi();
  }

  async loadTask(taskId: string): Promise<Task | null> {
    const task = this.api.getTask(taskId);
    this.currentTask = task || null;
    return this.currentTask;
  }

  // BUG: No protection against out-of-order responses
  async updateTask(
    taskId: string,
    updates: Partial<Task>
  ): Promise<UpdateResult> {
    try {
      // BUG: Multiple concurrent calls can race
      // The response that arrives LAST wins, not the request that was SENT last
      const updatedTask = await this.api.updateTask(taskId, updates);

      // BUG: This overwrites currentTask regardless of which request this is
      this.currentTask = updatedTask;

      return {
        success: true,
        task: updatedTask,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  getCurrentTask(): Task | null {
    return this.currentTask;
  }

  // For testing
  getApi(): TaskApi {
    return this.api;
  }
}

// BUG: This batch updater also has race conditions
export class BatchTaskUpdater {
  private api: TaskApi;
  private pendingUpdates: Map<string, Partial<Task>> = new Map();

  constructor(api?: TaskApi) {
    this.api = api || new TaskApi();
  }

  queueUpdate(taskId: string, updates: Partial<Task>): void {
    // BUG: This doesn't merge updates, just replaces
    this.pendingUpdates.set(taskId, updates);
  }

  // BUG: No protection for concurrent flush calls
  async flush(): Promise<UpdateResult[]> {
    const results: UpdateResult[] = [];

    // BUG: If flush is called twice quickly, same updates might be sent twice
    const updates = Array.from(this.pendingUpdates.entries());
    this.pendingUpdates.clear();

    // BUG: All updates sent in parallel without coordination
    const promises = updates.map(async ([taskId, taskUpdates]) => {
      try {
        const task = await this.api.updateTask(taskId, taskUpdates);
        return { success: true, task } as UpdateResult;
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        } as UpdateResult;
      }
    });

    return Promise.all(promises);
  }

  getApi(): TaskApi {
    return this.api;
  }
}

export { TaskApi };

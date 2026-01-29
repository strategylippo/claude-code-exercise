// Task Operations with deadlock-prone code

import { lockManager } from '../utils/lock-manager';

interface Task {
  id: string;
  projectId: string;
  title: string;
  assigneeId: string | null;
  status: string;
}

interface User {
  id: string;
  name: string;
  taskCount: number;
}

interface Project {
  id: string;
  name: string;
  taskCount: number;
}

// Simulated database
const tasks: Map<string, Task> = new Map();
const users: Map<string, User> = new Map();
const projects: Map<string, Project> = new Map();

export function initializeData(): void {
  tasks.clear();
  users.clear();
  projects.clear();

  // Create users
  users.set('user-1', { id: 'user-1', name: 'Alice', taskCount: 0 });
  users.set('user-2', { id: 'user-2', name: 'Bob', taskCount: 0 });

  // Create project
  projects.set('project-1', { id: 'project-1', name: 'Main Project', taskCount: 0 });

  // Create tasks
  for (let i = 1; i <= 10; i++) {
    tasks.set(`task-${i}`, {
      id: `task-${i}`,
      projectId: 'project-1',
      title: `Task ${i}`,
      assigneeId: null,
      status: 'todo',
    });
  }
}

// BUG: Lock order is TASK → USER
export async function assignTask(
  taskId: string,
  userId: string,
  operationId: string
): Promise<boolean> {
  try {
    // BUG: Acquires task lock first
    await lockManager.acquire(`task:${taskId}`, operationId);

    // Simulate some work
    await delay(10);

    // BUG: Then acquires user lock (opposite order of transferTasks!)
    await lockManager.acquire(`user:${userId}`, operationId);

    const task = tasks.get(taskId);
    const user = users.get(userId);

    if (!task || !user) {
      return false;
    }

    // Update task
    if (task.assigneeId) {
      // Decrement old assignee count
      const oldUser = users.get(task.assigneeId);
      if (oldUser) oldUser.taskCount--;
    }

    task.assigneeId = userId;
    user.taskCount++;

    return true;
  } finally {
    lockManager.release(`user:${userId}`, operationId);
    lockManager.release(`task:${taskId}`, operationId);
  }
}

// BUG: Lock order is USER → TASK (opposite of assignTask!)
export async function transferTasks(
  fromUserId: string,
  toUserId: string,
  operationId: string
): Promise<number> {
  try {
    // BUG: Acquires user locks first
    await lockManager.acquire(`user:${fromUserId}`, operationId);
    await lockManager.acquire(`user:${toUserId}`, operationId);

    // Simulate some work
    await delay(10);

    // Find tasks assigned to fromUser
    const userTasks = Array.from(tasks.values()).filter(
      (t) => t.assigneeId === fromUserId
    );

    let transferred = 0;
    for (const task of userTasks) {
      // BUG: Then acquires task locks (opposite order of assignTask!)
      await lockManager.acquire(`task:${task.id}`, operationId);

      task.assigneeId = toUserId;
      transferred++;

      lockManager.release(`task:${task.id}`, operationId);
    }

    // Update user counts
    const fromUser = users.get(fromUserId);
    const toUser = users.get(toUserId);
    if (fromUser && toUser) {
      toUser.taskCount += transferred;
      fromUser.taskCount -= transferred;
    }

    return transferred;
  } finally {
    lockManager.release(`user:${toUserId}`, operationId);
    lockManager.release(`user:${fromUserId}`, operationId);
  }
}

// BUG: Lock order is PROJECT → TASK (yet another order!)
export async function updateProjectStats(
  projectId: string,
  operationId: string
): Promise<void> {
  try {
    // BUG: Acquires project lock first
    await lockManager.acquire(`project:${projectId}`, operationId);

    await delay(10);

    // Get all tasks for project
    const projectTasks = Array.from(tasks.values()).filter(
      (t) => t.projectId === projectId
    );

    // BUG: Then acquires task locks
    for (const task of projectTasks) {
      await lockManager.acquire(`task:${task.id}`, operationId);
    }

    // Update project
    const project = projects.get(projectId);
    if (project) {
      project.taskCount = projectTasks.length;
    }

    // Release task locks
    for (const task of projectTasks) {
      lockManager.release(`task:${task.id}`, operationId);
    }
  } finally {
    lockManager.release(`project:${projectId}`, operationId);
  }
}

// BUG: This creates a complex deadlock with three resources
export async function reassignProjectTasks(
  projectId: string,
  newAssigneeId: string,
  operationId: string
): Promise<number> {
  try {
    // Acquires: project → task → user
    await lockManager.acquire(`project:${projectId}`, operationId);

    const projectTasks = Array.from(tasks.values()).filter(
      (t) => t.projectId === projectId
    );

    let reassigned = 0;
    for (const task of projectTasks) {
      await lockManager.acquire(`task:${task.id}`, operationId);

      // BUG: Acquires user lock while holding project and task
      await lockManager.acquire(`user:${newAssigneeId}`, operationId);

      task.assigneeId = newAssigneeId;
      reassigned++;

      lockManager.release(`user:${newAssigneeId}`, operationId);
      lockManager.release(`task:${task.id}`, operationId);
    }

    return reassigned;
  } finally {
    lockManager.release(`project:${projectId}`, operationId);
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Helper to check for potential deadlock
export function detectPotentialDeadlock(): boolean {
  const log = lockManager.getAcquisitionLog();
  // Simple heuristic: if same resources locked in different orders
  // This is a simplified check
  return log.length > 10;
}

export { lockManager };

// Repository layer - simulates database queries with tracking

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: string;
  assigneeId: string | null;
  createdAt: Date;
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Comment {
  id: string;
  taskId: string;
  userId: string;
  content: string;
  createdAt: Date;
}

export interface ActivityLog {
  id: string;
  taskId: string;
  type: string;
  timestamp: Date;
}

export interface QueryStats {
  totalQueries: number;
  queryTypes: Record<string, number>;
  queryLog: string[];
}

// Query statistics tracking
let queryStats: QueryStats = {
  totalQueries: 0,
  queryTypes: {},
  queryLog: [],
};

export function resetQueryStats(): void {
  queryStats = {
    totalQueries: 0,
    queryTypes: {},
    queryLog: [],
  };
}

export function getQueryStats(): QueryStats {
  return { ...queryStats };
}

function logQuery(type: string, details: string): void {
  queryStats.totalQueries++;
  queryStats.queryTypes[type] = (queryStats.queryTypes[type] || 0) + 1;
  queryStats.queryLog.push(`${type}: ${details}`);
}

// Simulate database delay
async function dbDelay(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 5));
}

// Simulated data
const tasks: Task[] = [];
const users: User[] = [];
const comments: Comment[] = [];
const activities: ActivityLog[] = [];

// Initialize test data
export function initializeTestData(taskCount: number = 100): void {
  tasks.length = 0;
  users.length = 0;
  comments.length = 0;
  activities.length = 0;

  // Create users
  for (let i = 1; i <= 10; i++) {
    users.push({
      id: `user-${i}`,
      name: `User ${i}`,
      email: `user${i}@example.com`,
    });
  }

  // Create tasks
  for (let i = 1; i <= taskCount; i++) {
    const task: Task = {
      id: `task-${i}`,
      projectId: 'project-1',
      title: `Task ${i}`,
      description: `Description for task ${i}`,
      status: ['todo', 'in-progress', 'done'][i % 3],
      assigneeId: i % 5 === 0 ? null : `user-${(i % 10) + 1}`,
      createdAt: new Date(),
    };
    tasks.push(task);

    // Create comments for each task
    for (let j = 1; j <= 3; j++) {
      comments.push({
        id: `comment-${i}-${j}`,
        taskId: task.id,
        userId: `user-${(j % 10) + 1}`,
        content: `Comment ${j} on task ${i}`,
        createdAt: new Date(),
      });
    }

    // Create activity log for each task
    for (let j = 1; j <= 5; j++) {
      activities.push({
        id: `activity-${i}-${j}`,
        taskId: task.id,
        type: ['created', 'updated', 'commented', 'assigned', 'status_changed'][j % 5],
        timestamp: new Date(),
      });
    }
  }
}

// Individual queries (causing N+1 problem)
export async function getTaskById(taskId: string): Promise<Task | null> {
  logQuery('getTaskById', taskId);
  await dbDelay();
  return tasks.find((t) => t.id === taskId) || null;
}

export async function getTasksByProjectId(projectId: string): Promise<Task[]> {
  logQuery('getTasksByProjectId', projectId);
  await dbDelay();
  return tasks.filter((t) => t.projectId === projectId);
}

export async function getUserById(userId: string): Promise<User | null> {
  logQuery('getUserById', userId);
  await dbDelay();
  return users.find((u) => u.id === userId) || null;
}

export async function getCommentsByTaskId(taskId: string): Promise<Comment[]> {
  logQuery('getCommentsByTaskId', taskId);
  await dbDelay();
  return comments.filter((c) => c.taskId === taskId);
}

export async function getActivityLogByTaskId(taskId: string): Promise<ActivityLog[]> {
  logQuery('getActivityLogByTaskId', taskId);
  await dbDelay();
  return activities.filter((a) => a.taskId === taskId);
}

// Batch queries (for the solution)
export async function getTasksByIds(taskIds: string[]): Promise<Task[]> {
  logQuery('getTasksByIds', `[${taskIds.length} ids]`);
  await dbDelay();
  return tasks.filter((t) => taskIds.includes(t.id));
}

export async function getUsersByIds(userIds: string[]): Promise<User[]> {
  logQuery('getUsersByIds', `[${userIds.length} ids]`);
  await dbDelay();
  return users.filter((u) => userIds.includes(u.id));
}

export async function getCommentCountsByTaskIds(
  taskIds: string[]
): Promise<Map<string, number>> {
  logQuery('getCommentCountsByTaskIds', `[${taskIds.length} ids]`);
  await dbDelay();

  const counts = new Map<string, number>();
  for (const taskId of taskIds) {
    counts.set(taskId, comments.filter((c) => c.taskId === taskId).length);
  }
  return counts;
}

export async function getRecentActivitiesByTaskIds(
  taskIds: string[],
  limit: number = 5
): Promise<Map<string, ActivityLog[]>> {
  logQuery('getRecentActivitiesByTaskIds', `[${taskIds.length} ids]`);
  await dbDelay();

  const result = new Map<string, ActivityLog[]>();
  for (const taskId of taskIds) {
    result.set(
      taskId,
      activities.filter((a) => a.taskId === taskId).slice(0, limit)
    );
  }
  return result;
}

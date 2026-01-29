// Report Service with N+1 query problems

import {
  getTasksByProjectId,
  getTaskById,
  getUserById,
  getCommentsByTaskId,
  getActivityLogByTaskId,
  QueryStats,
  resetQueryStats,
  getQueryStats,
} from '../repositories';

interface TaskReport {
  id: string;
  title: string;
  status: string;
  assignee: {
    id: string;
    name: string;
    email: string;
  } | null;
  commentCount: number;
  recentActivity: Array<{
    type: string;
    timestamp: Date;
  }>;
}

interface ProjectReport {
  projectId: string;
  totalTasks: number;
  tasksByStatus: Record<string, number>;
  tasks: TaskReport[];
  generatedAt: Date;
}

export class ReportService {
  // BUG: This method has severe N+1 query problems
  async generateProjectReport(projectId: string): Promise<ProjectReport> {
    resetQueryStats();

    // Query 1: Get all tasks for project
    const tasks = await getTasksByProjectId(projectId);

    const taskReports: TaskReport[] = [];
    const tasksByStatus: Record<string, number> = {};

    // BUG: N+1 Query Pattern - loops make individual queries
    for (const task of tasks) {
      // Count by status
      tasksByStatus[task.status] = (tasksByStatus[task.status] || 0) + 1;

      // BUG: Query for each task's assignee (N queries)
      let assignee = null;
      if (task.assigneeId) {
        const user = await getUserById(task.assigneeId);
        if (user) {
          assignee = {
            id: user.id,
            name: user.name,
            email: user.email,
          };
        }
      }

      // BUG: Query for each task's comments (N queries)
      const comments = await getCommentsByTaskId(task.id);
      const commentCount = comments.length;

      // BUG: Query for each task's activity (N queries)
      const activities = await getActivityLogByTaskId(task.id);
      const recentActivity = activities.slice(0, 5).map((a) => ({
        type: a.type,
        timestamp: a.timestamp,
      }));

      taskReports.push({
        id: task.id,
        title: task.title,
        status: task.status,
        assignee,
        commentCount,
        recentActivity,
      });
    }

    return {
      projectId,
      totalTasks: tasks.length,
      tasksByStatus,
      tasks: taskReports,
      generatedAt: new Date(),
    };
  }

  // BUG: This method also has N+1 issues
  async getTasksWithAssignees(taskIds: string[]): Promise<TaskReport[]> {
    const reports: TaskReport[] = [];

    // BUG: Individual query for each task
    for (const taskId of taskIds) {
      const task = await getTaskById(taskId);
      if (!task) continue;

      // BUG: Another query for assignee
      let assignee = null;
      if (task.assigneeId) {
        const user = await getUserById(task.assigneeId);
        if (user) {
          assignee = { id: user.id, name: user.name, email: user.email };
        }
      }

      // BUG: And another for comments
      const comments = await getCommentsByTaskId(taskId);

      reports.push({
        id: task.id,
        title: task.title,
        status: task.status,
        assignee,
        commentCount: comments.length,
        recentActivity: [],
      });
    }

    return reports;
  }

  getQueryStatistics(): QueryStats {
    return getQueryStats();
  }
}

export { resetQueryStats, getQueryStats };

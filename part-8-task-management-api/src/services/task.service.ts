import { PrismaClient, Task, Prisma } from '@prisma/client';
import { CreateTaskInput, UpdateTaskInput, TaskFilterInput } from '../schemas/task.schema';
import { NotFoundError, ForbiddenError } from '../middleware/error.middleware';

const prisma = new PrismaClient();

export interface TaskWithRelations extends Task {
  creator: {
    id: string;
    name: string;
    email: string;
  };
  assignee: {
    id: string;
    name: string;
    email: string;
  } | null;
}

const taskInclude = {
  creator: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
  assignee: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
};

export const taskService = {
  async create(data: CreateTaskInput, creatorId: string): Promise<TaskWithRelations> {
    const task = await prisma.task.create({
      data: {
        title: data.title,
        description: data.description,
        status: data.status,
        priority: data.priority,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        creatorId,
        assigneeId: data.assigneeId,
      },
      include: taskInclude,
    });

    return task;
  },

  async findAll(filters: TaskFilterInput, userId: string): Promise<TaskWithRelations[]> {
    const where: Prisma.TaskWhereInput = {
      deleted: filters.includeDeleted ? undefined : false,
    };

    // Filter by status
    if (filters.status) {
      where.status = filters.status;
    }

    // Filter by priority
    if (filters.priority) {
      where.priority = filters.priority;
    }

    // Filter by assignee
    if (filters.assigneeId) {
      where.assigneeId = filters.assigneeId;
    }

    // Search by title or description
    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search } },
        { description: { contains: filters.search } },
      ];
    }

    // Only show tasks created by or assigned to the user
    where.OR = where.OR || [];
    if (Array.isArray(where.OR)) {
      const searchConditions = [...where.OR];
      where.AND = [
        {
          OR: [
            { creatorId: userId },
            { assigneeId: userId },
          ],
        },
      ];
      if (searchConditions.length > 0) {
        where.AND.push({ OR: searchConditions });
      }
      delete where.OR;
    }

    const tasks = await prisma.task.findMany({
      where,
      include: taskInclude,
      orderBy: { createdAt: 'desc' },
    });

    return tasks;
  },

  async findById(id: string, userId: string): Promise<TaskWithRelations> {
    const task = await prisma.task.findUnique({
      where: { id },
      include: taskInclude,
    });

    if (!task) {
      throw new NotFoundError('Task not found');
    }

    // Check if user has access to this task
    if (task.creatorId !== userId && task.assigneeId !== userId) {
      throw new ForbiddenError('You do not have access to this task');
    }

    return task;
  },

  async update(id: string, data: UpdateTaskInput, userId: string): Promise<TaskWithRelations> {
    // First check if task exists and user has access
    const existingTask = await this.findById(id, userId);

    // Only creator can update the task
    if (existingTask.creatorId !== userId) {
      throw new ForbiddenError('Only the task creator can update this task');
    }

    const task = await prisma.task.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        status: data.status,
        priority: data.priority,
        dueDate: data.dueDate !== undefined
          ? (data.dueDate ? new Date(data.dueDate) : null)
          : undefined,
      },
      include: taskInclude,
    });

    return task;
  },

  async delete(id: string, userId: string): Promise<TaskWithRelations> {
    // First check if task exists and user has access
    const existingTask = await this.findById(id, userId);

    // Only creator can delete the task
    if (existingTask.creatorId !== userId) {
      throw new ForbiddenError('Only the task creator can delete this task');
    }

    // Soft delete
    const task = await prisma.task.update({
      where: { id },
      data: { deleted: true },
      include: taskInclude,
    });

    return task;
  },

  async assign(id: string, assigneeId: string | null, userId: string): Promise<TaskWithRelations> {
    // First check if task exists and user has access
    const existingTask = await this.findById(id, userId);

    // Only creator can assign the task
    if (existingTask.creatorId !== userId) {
      throw new ForbiddenError('Only the task creator can assign this task');
    }

    // Verify assignee exists if provided
    if (assigneeId) {
      const assignee = await prisma.user.findUnique({
        where: { id: assigneeId },
      });

      if (!assignee) {
        throw new NotFoundError('Assignee not found');
      }
    }

    const task = await prisma.task.update({
      where: { id },
      data: { assigneeId },
      include: taskInclude,
    });

    return task;
  },
};

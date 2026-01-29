import { Response, NextFunction } from 'express';
import { taskService } from '../services/task.service';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { CreateTaskInput, UpdateTaskInput, TaskFilterInput } from '../schemas/task.schema';

export const taskController = {
  async create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const data: CreateTaskInput = req.body;
      const userId = req.user!.userId;

      const task = await taskService.create(data, userId);

      res.status(201).json({
        status: 'success',
        data: task,
      });
    } catch (error) {
      next(error);
    }
  },

  async findAll(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const filters = req.query as unknown as TaskFilterInput;
      const userId = req.user!.userId;

      const tasks = await taskService.findAll(filters, userId);

      res.json({
        status: 'success',
        data: tasks,
        count: tasks.length,
      });
    } catch (error) {
      next(error);
    }
  },

  async findById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const userId = req.user!.userId;

      const task = await taskService.findById(id, userId);

      res.json({
        status: 'success',
        data: task,
      });
    } catch (error) {
      next(error);
    }
  },

  async update(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const data: UpdateTaskInput = req.body;
      const userId = req.user!.userId;

      const task = await taskService.update(id, data, userId);

      res.json({
        status: 'success',
        data: task,
      });
    } catch (error) {
      next(error);
    }
  },

  async delete(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const userId = req.user!.userId;

      const task = await taskService.delete(id, userId);

      res.json({
        status: 'success',
        message: 'Task deleted successfully',
        data: task,
      });
    } catch (error) {
      next(error);
    }
  },

  async assign(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const { assigneeId } = req.body;
      const userId = req.user!.userId;

      const task = await taskService.assign(id, assigneeId ?? null, userId);

      res.json({
        status: 'success',
        data: task,
      });
    } catch (error) {
      next(error);
    }
  },
};

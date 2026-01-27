import { Router } from 'express';
import { taskController } from '../controllers/task.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import {
  createTaskSchema,
  updateTaskSchema,
  assignTaskSchema,
  taskFilterSchema,
  taskIdParamSchema,
} from '../schemas/task.schema';

const router = Router();

// All task routes require authentication
router.use(authenticate);

// POST /tasks - Create a new task
router.post(
  '/',
  validate({ body: createTaskSchema }),
  taskController.create
);

// GET /tasks - List all tasks (with filters)
router.get(
  '/',
  validate({ query: taskFilterSchema }),
  taskController.findAll
);

// GET /tasks/:id - Get a task by ID
router.get(
  '/:id',
  validate({ params: taskIdParamSchema }),
  taskController.findById
);

// PATCH /tasks/:id - Update a task
router.patch(
  '/:id',
  validate({ params: taskIdParamSchema, body: updateTaskSchema }),
  taskController.update
);

// DELETE /tasks/:id - Soft delete a task
router.delete(
  '/:id',
  validate({ params: taskIdParamSchema }),
  taskController.delete
);

// PATCH /tasks/:id/assign - Assign a task
router.patch(
  '/:id/assign',
  validate({ params: taskIdParamSchema, body: assignTaskSchema }),
  taskController.assign
);

export default router;

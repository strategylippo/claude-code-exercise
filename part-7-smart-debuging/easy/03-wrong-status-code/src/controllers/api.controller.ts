// API Controller with wrong status codes

interface ErrorBody {
  error: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
}

interface User {
  id: string;
  email: string;
  name: string;
}

interface ApiResponse<T = unknown> {
  statusCode: number;
  body: T | ErrorBody;
}

// Simulated database
const tasks: Map<string, Task> = new Map();
const users: Map<string, User> = new Map();
let taskCounter = 0;
let userCounter = 0;

// ============ TASK ENDPOINTS ============

export function createTask(title: string, description: string): ApiResponse<Task> {
  // Validate input
  if (!title || title.trim().length === 0) {
    // BUG: Should be 400, returns 404
    return {
      statusCode: 404,
      body: { error: 'Title is required' } ,
    };
  }

  const task: Task = {
    id: `task-${++taskCounter}`,
    title: title.trim(),
    description: description || '',
  };

  tasks.set(task.id, task);

  // BUG: Should be 201 Created, returns 200 OK
  return {
    statusCode: 200,
    body: task,
  };
}

export function getTask(taskId: string): ApiResponse<Task> {
  if (!taskId) {
    return {
      statusCode: 400,
      body: { error: 'Task ID is required' } ,
    };
  }

  const task = tasks.get(taskId);

  if (!task) {
    // BUG: Should be 404, returns 400
    return {
      statusCode: 400,
      body: { error: 'Task not found' } ,
    };
  }

  return {
    statusCode: 200,
    body: task,
  };
}

export function updateTask(
  taskId: string,
  updates: Partial<Task>
): ApiResponse<Task> {
  const task = tasks.get(taskId);

  if (!task) {
    // BUG: Should be 404, returns 400
    return {
      statusCode: 400,
      body: { error: 'Task not found' } ,
    };
  }

  const updatedTask: Task = {
    ...task,
    ...updates,
  };

  tasks.set(taskId, updatedTask);

  return {
    statusCode: 200,
    body: updatedTask,
  };
}

export function deleteTask(taskId: string): ApiResponse<{ message: string }> {
  const task = tasks.get(taskId);

  if (!task) {
    // BUG: Should be 404, returns 400
    return {
      statusCode: 400,
      body: { error: 'Task not found' } ,
    };
  }

  tasks.delete(taskId);

  return {
    statusCode: 200,
    body: { message: 'Task deleted successfully' },
  };
}

// ============ USER ENDPOINTS ============

export function registerUser(
  email: string,
  name: string
): ApiResponse<User> {
  // Validate input
  if (!email || !email.includes('@')) {
    // BUG: Should be 400, returns 404
    return {
      statusCode: 404,
      body: { error: 'Valid email is required' } ,
    };
  }

  // Check for duplicate
  const existingUser = Array.from(users.values()).find(
    (u) => u.email.toLowerCase() === email.toLowerCase()
  );

  if (existingUser) {
    // BUG: Should be 409 Conflict, returns 400
    return {
      statusCode: 400,
      body: { error: 'Email already registered' } ,
    };
  }

  const user: User = {
    id: `user-${++userCounter}`,
    email: email.toLowerCase(),
    name,
  };

  users.set(user.id, user);

  // BUG: Should be 201 Created, returns 200 OK
  return {
    statusCode: 200,
    body: user,
  };
}

export function getUser(userId: string): ApiResponse<User> {
  const user = users.get(userId);

  if (!user) {
    // BUG: Should be 404, returns 400
    return {
      statusCode: 400,
      body: { error: 'User not found' } ,
    };
  }

  return {
    statusCode: 200,
    body: user,
  };
}

// Helper to clear data for tests
export function clearData(): void {
  tasks.clear();
  users.clear();
  taskCounter = 0;
  userCounter = 0;
}

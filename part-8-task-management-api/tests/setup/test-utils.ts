import { APIRequestContext } from '@playwright/test';

const BASE_URL = 'http://localhost:4000';

export interface TestUser {
  id: string;
  email: string;
  name: string;
  token: string;
}

export interface TestTask {
  id: string;
  title: string;
  description: string | null;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  creatorId: string;
  assigneeId: string | null;
}

// Generate unique test data
export const generateTestEmail = (): string => {
  return `test-${Date.now()}-${Math.random().toString(36).substring(7)}@example.com`;
};

export const generateTestName = (): string => {
  return `Test User ${Date.now()}`;
};

// API Helper functions
export async function registerUser(
  request: APIRequestContext,
  userData?: { email?: string; name?: string; password?: string }
): Promise<TestUser> {
  const email = userData?.email ?? generateTestEmail();
  const name = userData?.name ?? generateTestName();
  const password = userData?.password ?? 'password123';

  const response = await request.post(`${BASE_URL}/auth/register`, {
    data: { email, name, password },
  });

  const json = await response.json();

  if (!response.ok()) {
    throw new Error(`Registration failed: ${JSON.stringify(json)}`);
  }

  return {
    id: json.data.user.id,
    email: json.data.user.email,
    name: json.data.user.name,
    token: json.data.token,
  };
}

export async function loginUser(
  request: APIRequestContext,
  email: string,
  password: string
): Promise<TestUser> {
  const response = await request.post(`${BASE_URL}/auth/login`, {
    data: { email, password },
  });

  const json = await response.json();

  if (!response.ok()) {
    throw new Error(`Login failed: ${JSON.stringify(json)}`);
  }

  return {
    id: json.data.user.id,
    email: json.data.user.email,
    name: json.data.user.name,
    token: json.data.token,
  };
}

export async function createTask(
  request: APIRequestContext,
  token: string,
  taskData: {
    title: string;
    description?: string;
    status?: 'TODO' | 'IN_PROGRESS' | 'DONE';
    priority?: 'LOW' | 'MEDIUM' | 'HIGH';
    assigneeId?: string;
  }
): Promise<TestTask> {
  const response = await request.post(`${BASE_URL}/tasks`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    data: taskData,
  });

  const json = await response.json();

  if (!response.ok()) {
    throw new Error(`Task creation failed: ${JSON.stringify(json)}`);
  }

  return json.data;
}

export async function getTask(
  request: APIRequestContext,
  token: string,
  taskId: string
): Promise<TestTask> {
  const response = await request.get(`${BASE_URL}/tasks/${taskId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const json = await response.json();

  if (!response.ok()) {
    throw new Error(`Get task failed: ${JSON.stringify(json)}`);
  }

  return json.data;
}

export async function updateTask(
  request: APIRequestContext,
  token: string,
  taskId: string,
  updates: Partial<Pick<TestTask, 'title' | 'description' | 'status' | 'priority'>>
): Promise<TestTask> {
  const response = await request.patch(`${BASE_URL}/tasks/${taskId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    data: updates,
  });

  const json = await response.json();

  if (!response.ok()) {
    throw new Error(`Task update failed: ${JSON.stringify(json)}`);
  }

  return json.data;
}

export async function deleteTask(
  request: APIRequestContext,
  token: string,
  taskId: string
): Promise<void> {
  const response = await request.delete(`${BASE_URL}/tasks/${taskId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok()) {
    const json = await response.json();
    throw new Error(`Task deletion failed: ${JSON.stringify(json)}`);
  }
}

export async function assignTask(
  request: APIRequestContext,
  token: string,
  taskId: string,
  assigneeId: string | null
): Promise<TestTask> {
  const response = await request.patch(`${BASE_URL}/tasks/${taskId}/assign`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    data: { assigneeId },
  });

  const json = await response.json();

  if (!response.ok()) {
    throw new Error(`Task assignment failed: ${JSON.stringify(json)}`);
  }

  return json.data;
}

export async function listTasks(
  request: APIRequestContext,
  token: string,
  filters?: {
    status?: string;
    priority?: string;
    assigneeId?: string;
    search?: string;
    includeDeleted?: boolean;
  }
): Promise<TestTask[]> {
  const params = new URLSearchParams();
  if (filters?.status) params.append('status', filters.status);
  if (filters?.priority) params.append('priority', filters.priority);
  if (filters?.assigneeId) params.append('assigneeId', filters.assigneeId);
  if (filters?.search) params.append('search', filters.search);
  if (filters?.includeDeleted) params.append('includeDeleted', 'true');

  const url = `${BASE_URL}/tasks${params.toString() ? `?${params.toString()}` : ''}`;

  const response = await request.get(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const json = await response.json();

  if (!response.ok()) {
    throw new Error(`List tasks failed: ${JSON.stringify(json)}`);
  }

  return json.data;
}

export async function listUsers(
  request: APIRequestContext,
  token: string
): Promise<Array<{ id: string; email: string; name: string }>> {
  const response = await request.get(`${BASE_URL}/users`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const json = await response.json();

  if (!response.ok()) {
    throw new Error(`List users failed: ${JSON.stringify(json)}`);
  }

  return json.data;
}

// Auth header helper
export function authHeader(token: string): { Authorization: string } {
  return { Authorization: `Bearer ${token}` };
}

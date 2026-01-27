# Task Management API - Workshop Starter

A Task Management REST API for learning QA & Regression Testing with Playwright.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Generate Prisma client
npx prisma generate

# 3. Create database
npx prisma db push

# 4. Start the server
npm run dev
```

Server runs at `http://localhost:4000`

---

## API Endpoints

### Health Check
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Check if API is running |

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login user |
| GET | `/auth/me` | Get current user (requires auth) |

### Tasks (all require authentication)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/tasks` | List all tasks |
| POST | `/tasks` | Create a task |
| GET | `/tasks/:id` | Get task by ID |
| PATCH | `/tasks/:id` | Update a task |
| DELETE | `/tasks/:id` | Soft delete a task |
| PATCH | `/tasks/:id/assign` | Assign task to user |

### Users (requires authentication)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users` | List all users |

---

## Request/Response Examples

### Register
```bash
curl -X POST http://localhost:4000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "name": "Test User", "password": "password123"}'
```

### Create Task
```bash
curl -X POST http://localhost:4000/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"title": "My Task", "priority": "HIGH"}'
```

### Filter Tasks
```bash
# By status
GET /tasks?status=TODO

# By priority
GET /tasks?priority=HIGH

# Search
GET /tasks?search=keyword

# Combined
GET /tasks?status=IN_PROGRESS&priority=HIGH&search=urgent
```

---

## Data Models

### User
| Field | Type | Notes |
|-------|------|-------|
| id | string | UUID |
| email | string | Unique |
| name | string | Min 2 chars |
| password | string | Min 6 chars (hashed) |

### Task
| Field | Type | Options |
|-------|------|---------|
| id | string | UUID |
| title | string | Required, max 200 |
| description | string | Optional |
| status | enum | `TODO`, `IN_PROGRESS`, `DONE` |
| priority | enum | `LOW`, `MEDIUM`, `HIGH` |
| creatorId | string | User who created |
| assigneeId | string | User assigned (nullable) |
| deletedAt | datetime | Soft delete timestamp |

---

## Workshop: Writing Tests

### Test Structure

```
tests/
├── setup/
│   └── test-utils.ts    # Helper functions (provided)
├── smoke/               # Critical path tests
├── sanity/              # Main feature tests
└── regression/          # Edge case tests
    ├── auth/
    └── tasks/
```

### Running Tests

```bash
# Run all tests
npm run test

# Run by tier
npm run test:smoke
npm run test:sanity
npm run test:regression

# Run specific file
npx playwright test tests/smoke/health.smoke.spec.ts
```

### Test Utilities (provided)

```typescript
import { test, expect } from '@playwright/test';
import { registerUser, createTask, authHeader } from '../setup/test-utils';

test('example test', async ({ request }) => {
  // Register a unique user
  const user = await registerUser(request);

  // Create a task
  const task = await createTask(request, user.token, {
    title: 'Test Task',
    priority: 'HIGH'
  });

  // Make authenticated request
  const response = await request.get(`/tasks/${task.id}`, {
    headers: authHeader(user.token)
  });

  expect(response.ok()).toBeTruthy();
});
```

### Available Helpers

| Function | Description |
|----------|-------------|
| `registerUser(request)` | Creates unique user, returns `{ id, email, name, token }` |
| `loginUser(request, email, password)` | Login existing user |
| `createTask(request, token, data)` | Create a task |
| `getTask(request, token, id)` | Get task by ID |
| `updateTask(request, token, id, data)` | Update a task |
| `deleteTask(request, token, id)` | Delete a task |
| `listTasks(request, token, filters?)` | List tasks with optional filters |
| `authHeader(token)` | Returns `{ Authorization: 'Bearer ...' }` |
| `generateTestEmail()` | Unique email for each test |

---

## Commands Reference

| Command | Description |
|---------|-------------|
| `npm run dev` | Start server (port 4000) |
| `npm run build` | Compile TypeScript |
| `npm run test` | Run all tests |
| `npm run test:smoke` | Run smoke tests |
| `npm run test:sanity` | Run sanity tests |
| `npm run test:regression` | Run regression tests |
| `npx prisma studio` | Open database GUI |
| `npx prisma db push --force-reset` | Reset database |

---

## Validation Rules

### Registration
- Email: Valid format, unique
- Name: 2+ characters
- Password: 6+ characters

### Task Creation
- Title: Required, 1-200 characters
- Status: `TODO` (default), `IN_PROGRESS`, `DONE`
- Priority: `LOW`, `MEDIUM` (default), `HIGH`

---

## Error Responses

```json
{
  "status": "error",
  "message": "Error description",
  "errors": [{ "field": "email", "message": "Invalid email" }]
}
```

| Status Code | Meaning |
|-------------|---------|
| 400 | Validation error |
| 401 | Unauthorized (no/invalid token) |
| 403 | Forbidden (not your resource) |
| 404 | Not found |
| 409 | Conflict (duplicate email) |
| 500 | Server error |

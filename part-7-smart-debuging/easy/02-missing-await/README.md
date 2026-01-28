# Exercise: Missing Await Bug

## Difficulty: Easy
## Time: 15-20 minutes

## Scenario

The task creation endpoint sometimes returns `undefined` for the created task, even though the task is saved to the database correctly.

### Bug Report
```
Title: Task creation returns undefined intermittently
Reporter: Frontend Team
Priority: High

Steps to reproduce:
1. POST /tasks with valid data
2. Check response body

Expected: Response contains the created task object
Actual: Response sometimes contains undefined or Promise object

Notes: The task IS created in the database, but the API response is wrong.
This happens about 50% of the time.
```

### Error Log
```
[API] POST /tasks - 201 Created
[API] Response body: undefined
[DB] Task inserted successfully: { id: 'task-123', title: 'Test Task' }
```

## Your Task

1. Run the failing test: `npm test`
2. Use Claude Code to find the missing await
3. Fix the async/await issue in `task.controller.ts`
4. Verify all tests pass

## Suggested Claude Code Approach

```
# Ask Claude to find async issues
"Scan task.controller.ts for missing await keywords or async issues"

# Or describe the symptom
"The createTask function sometimes returns undefined even though the
database insert works. What could cause this?"
```

## Files to Examine
- `src/controllers/task.controller.ts` - Contains the bug
- `src/services/task.service.ts` - Service layer (correct)
- `tests/task.spec.ts` - Failing test

## Hints (only if stuck)
<details>
<summary>Hint 1</summary>
Look for functions that call async functions but don't await them
</details>

<details>
<summary>Hint 2</summary>
Check if the return statement is awaiting the service call
</details>

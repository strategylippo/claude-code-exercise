# Exercise: Pagination Bug

## Difficulty: Easy
## Time: 15-20 minutes

## Scenario

A user reported that when viewing tasks with pagination, they see duplicate tasks on page 2 that were already shown on page 1.

### Bug Report
```
Title: Duplicate tasks appearing on page 2
Reporter: QA Team
Priority: Medium

Steps to reproduce:
1. Create 15 tasks
2. View tasks with limit=10, page=1 (shows tasks 1-10)
3. View tasks with limit=10, page=2 (should show tasks 11-15)

Expected: Page 2 shows tasks 11-15
Actual: Page 2 shows tasks 1-5 (duplicates from page 1!)
```

### Error Log
```
No errors in logs - API returns 200 OK
But data is incorrect
```

## Your Task

1. Run the failing test: `npm test`
2. Use Claude Code to identify the bug
3. Fix the pagination logic in `task.service.ts`
4. Verify all tests pass

## Suggested Claude Code Approach

```
# Start by asking Claude to analyze
"The pagination is returning duplicate results. Can you look at task.service.ts
and find the bug in the getTasks function?"

# Or use a more exploratory approach
"Why might pagination show duplicate results between pages?"
```

## Files to Examine
- `src/services/task.service.ts` - Contains the bug
- `tests/pagination.spec.ts` - Failing test

## Hints (only if stuck)
<details>
<summary>Hint 1</summary>
Look at how the `skip` value is calculated
</details>

<details>
<summary>Hint 2</summary>
The formula for skip should be: (page - 1) * limit
</details>

# Exercise: Async Race Condition Bug

## Difficulty: Medium
## Time: 25-30 minutes

## Scenario

Users are reporting that sometimes their task updates are lost. When they update a task quickly multiple times, only some updates are saved.

### Bug Report
```
Title: Task updates sometimes lost during rapid edits
Reporter: Product Team
Priority: High

Steps to reproduce:
1. Open task edit form
2. Change title to "Title A"
3. Quickly change title to "Title B"
4. Quickly change title to "Title C"
5. Refresh page

Expected: Task title is "Title C" (last update)
Actual: Task title is sometimes "Title A" or "Title B" (race condition)

This happens when users type quickly or have slow network.
The problem is intermittent - happens ~30% of the time.
```

### Technical Details
```
[Network Log]
00:00:100 POST /tasks/123 { title: "Title A" }
00:00:200 POST /tasks/123 { title: "Title B" }
00:00:300 POST /tasks/123 { title: "Title C" }
00:00:400 Response for "Title C" - 200 OK
00:00:500 Response for "Title A" - 200 OK  ← This overwrites "Title C"!
00:00:600 Response for "Title B" - 200 OK
```

## Your Task

1. Run the failing test: `npm test`
2. Use Claude Code to identify the race condition
3. Fix the async update logic in `task-updater.ts`
4. Verify all tests pass

## Suggested Claude Code Approach

```
# Ask Claude to analyze async issues
"Analyze task-updater.ts for race conditions in concurrent updates"

# Use plan mode for complex fix
"Enter plan mode to implement optimistic locking for task updates"

# Ask about patterns
"What's the best way to handle rapid concurrent updates to the same resource?"
```

## Files to Examine
- `src/services/task-updater.ts` - Contains the race condition
- `tests/concurrent-update.spec.ts` - Race condition tests

## Common Solutions
1. **Optimistic Locking** - Use version numbers
2. **Request Cancellation** - Cancel previous pending requests
3. **Debouncing** - Wait for user to stop typing
4. **Queue** - Process updates sequentially

## Hints (only if stuck)
<details>
<summary>Hint 1</summary>
The problem is that responses can arrive out of order
</details>

<details>
<summary>Hint 2</summary>
Track which request is the "latest" and ignore stale responses
</details>

<details>
<summary>Hint 3</summary>
Use a request ID or timestamp to identify the most recent request
</details>

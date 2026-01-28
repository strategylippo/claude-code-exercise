# Exercise: N+1 Query Performance Bug

## Difficulty: Hard
## Time: 40-60 minutes

## Scenario

The reporting endpoint is extremely slow. What should take 100ms is taking 10+ seconds. The database team reports seeing thousands of queries per request.

### Bug Report
```
Title: Report endpoint timeout - production incident
Reporter: DevOps Team
Priority: CRITICAL

Incident Timeline:
- 10:00 AM: New reporting feature deployed
- 10:15 AM: Database CPU spikes to 100%
- 10:20 AM: API response times increase from 100ms to 10s+
- 10:25 AM: Connection pool exhausted (100/100 connections)
- 10:30 AM: Feature disabled via feature flag

Metrics during incident:
- Database queries per request: 1,000+ (should be ~5)
- Average response time: 12,000ms (should be <200ms)
- Database connections: MAXED
- Error rate: 30% (timeouts)
```

### Technical Context
```
The report endpoint:
1. Fetches all tasks for a project
2. For each task, fetches:
   - Assignee details
   - Comment count
   - Activity history
3. Aggregates data for report

Expected: ~5 queries total using JOINs or batch loading
Actual: 1 + (N * 3) queries where N = number of tasks
For 100 tasks: 301 queries!
```

## Your Task

1. Run the failing test: `npm test`
2. Use Claude Code to identify N+1 query patterns
3. Fix the queries in `report-service.ts`
4. Verify performance tests pass

## Suggested Claude Code Approach

```
# Ask Claude to find N+1 patterns
"Analyze report-service.ts for N+1 query problems"

# Ask about optimization
"How can I batch these database queries to reduce from N+1 to constant queries?"

# Use plan mode for systematic fix
"Enter plan mode to optimize the report generation queries"
```

## Files to Examine
- `src/services/report-service.ts` - Contains N+1 queries
- `src/repositories/` - Database query methods
- `tests/performance.spec.ts` - Performance tests

## N+1 Query Pattern Explained
```typescript
// BAD: N+1 Query Pattern
const tasks = await getTasksForProject(projectId); // 1 query
for (const task of tasks) {
  task.assignee = await getUserById(task.assigneeId); // N queries!
}

// GOOD: Batch Loading
const tasks = await getTasksForProject(projectId); // 1 query
const userIds = tasks.map(t => t.assigneeId);
const users = await getUsersByIds(userIds); // 1 query
// Then map users to tasks
```

## Hints (only if stuck)
<details>
<summary>Hint 1</summary>
Look for loops that make database queries inside them
</details>

<details>
<summary>Hint 2</summary>
Collect all IDs first, then batch fetch all related data
</details>

<details>
<summary>Hint 3</summary>
Use Promise.all for parallel fetches, but batch the IDs first
</details>

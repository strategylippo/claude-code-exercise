# Exercise: Deadlock Scenario Bug

## Difficulty: Hard
## Time: 40-60 minutes

## Scenario

The application occasionally freezes completely. API requests hang indefinitely, and the only solution is to restart the server. This happens under high load.

### Bug Report
```
Title: Application hangs under concurrent operations
Reporter: SRE Team
Priority: CRITICAL

Symptoms:
- Application becomes unresponsive
- All requests timeout
- CPU is low (not spinning)
- No errors in logs (just silence)
- Affects all endpoints once it happens

Trigger Pattern:
- More likely with concurrent task assignments
- More likely during bulk operations
- Happens when multiple users edit same project

Recovery:
- Only server restart fixes it
- Database shows locked rows
```

### Technical Analysis
```
Thread Dump shows:
- Thread 1: Waiting for Lock A, holding Lock B
- Thread 2: Waiting for Lock B, holding Lock A
→ Classic deadlock pattern

Affected Operations:
1. assignTask() - locks task, then locks user
2. transferTasks() - locks user, then locks tasks
3. updateProjectStats() - locks project, then locks tasks
```

## Your Task

1. Run the failing test: `npm test`
2. Use Claude Code to identify deadlock patterns
3. Fix the locking order in `task-operations.ts`
4. Verify all tests pass (including concurrent tests)

## Suggested Claude Code Approach

```
# Ask Claude to find deadlock patterns
"Analyze task-operations.ts for potential deadlocks. Look for:
- Operations that acquire multiple locks
- Inconsistent lock ordering
- Missing lock timeouts"

# Use plan mode for systematic fix
"Enter plan mode to fix the deadlock issues"

# Ask about patterns
"What's the proper way to handle multiple locks to prevent deadlocks?"
```

## Files to Examine
- `src/services/task-operations.ts` - Contains deadlock-prone code
- `src/utils/lock-manager.ts` - Lock implementation
- `tests/concurrent.spec.ts` - Concurrent operation tests

## Deadlock Prevention Rules
1. **Lock Ordering** - Always acquire locks in the same order
2. **Lock Timeout** - Don't wait forever for locks
3. **Lock Scope** - Hold locks for minimum time
4. **Single Lock** - Use one higher-level lock when possible

## Hints (only if stuck)
<details>
<summary>Hint 1</summary>
Map out which locks each operation acquires and in what order
</details>

<details>
<summary>Hint 2</summary>
Define a global lock ordering: project → user → task
</details>

<details>
<summary>Hint 3</summary>
Consider using a single transaction lock instead of multiple fine-grained locks
</details>

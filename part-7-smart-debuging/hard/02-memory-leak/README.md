# Exercise: Memory Leak Bug

## Difficulty: Hard
## Time: 40-60 minutes

## Scenario

The API server's memory usage grows continuously over time until it crashes with an Out Of Memory (OOM) error. This happens every 24-48 hours in production.

### Bug Report
```
Title: Server crashes with OOM every 24-48 hours
Reporter: DevOps Team
Priority: CRITICAL

Memory Pattern:
- Server starts: 200 MB
- After 6 hours: 500 MB
- After 12 hours: 1 GB
- After 24 hours: 2 GB → OOM CRASH

Recent Changes (past week):
1. Added WebSocket support for real-time updates
2. Implemented in-memory cache for frequently accessed data
3. Added event emitter for task notifications
4. Implemented file upload with temporary storage

Observations:
- Memory never decreases, even during low traffic
- Restarts temporarily fix the issue
- Growth rate is proportional to traffic
```

### Memory Profile
```
Heap Snapshot Analysis:
- Large number of detached EventEmitter listeners
- Cache entries never being evicted
- Circular references in notification system
- Unclosed file handles accumulating
```

## Your Task

1. Run the failing test: `npm test`
2. Use Claude Code to identify memory leaks
3. Fix the memory leaks in multiple files
4. Verify memory tests pass

## Suggested Claude Code Approach

```
# Ask Claude to find memory leaks
"Analyze the codebase for memory leaks, focusing on:
- Event listeners not being removed
- Cache without eviction
- Circular references
- Unclosed resources"

# Use plan mode for systematic fix
"Enter plan mode to fix all memory leaks in this application"

# Ask about specific patterns
"What causes memory leaks with EventEmitter in Node.js?"
```

## Files to Examine
- `src/services/cache-service.ts` - In-memory cache
- `src/services/notification-service.ts` - Event emitters
- `src/services/websocket-service.ts` - WebSocket connections
- `src/services/file-service.ts` - File operations
- `tests/memory.spec.ts` - Memory tests

## Common Memory Leak Patterns
1. **Event Listeners** - Not removing listeners when done
2. **Cache without TTL** - Data stays forever
3. **Closures** - Capturing large objects in callbacks
4. **Circular References** - Objects referencing each other
5. **Unclosed Resources** - Files, connections, streams

## Hints (only if stuck)
<details>
<summary>Hint 1</summary>
Check for event listeners that are added but never removed
</details>

<details>
<summary>Hint 2</summary>
Look at the cache - does it ever evict old entries?
</details>

<details>
<summary>Hint 3</summary>
Check for closures that capture references to large objects
</details>

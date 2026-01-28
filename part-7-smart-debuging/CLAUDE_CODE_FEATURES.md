# Claude Code Features Cheatsheet

## Quick Reference for Debugging Exercises

### Basic Interactions

```bash
# Start Claude Code
claude

# Ask a question
"Why is this test failing?"

# Ask about specific file
"Analyze src/services/task.service.ts for bugs"

# Get explanation
"Explain what this function does"
```

### Plan Mode

Use plan mode for complex, multi-step debugging tasks.

```bash
# Enter plan mode
"Enter plan mode to debug this issue"

# Claude will:
# 1. Explore the codebase
# 2. Identify the problem
# 3. Create a step-by-step fix plan
# 4. Ask for your approval before making changes
```

**When to use:**
- Multi-file bugs
- Performance issues
- Architecture problems
- When you want to review the approach first

### Code Search & Exploration

```bash
# Find files
"Find all files that handle authentication"

# Search for patterns
"Search for all async functions without try-catch"

# Understand code flow
"Trace the execution flow from login to dashboard"

# Find usages
"Where is the getUserById function called?"
```

### Debugging Prompts

```bash
# General debugging
"Debug the error: [paste error message]"

# Specific analysis
"Analyze this code for race conditions"
"What could cause this memory leak?"
"Find the N+1 query problem"

# Root cause analysis
"Why might this function return undefined sometimes?"
"What could cause intermittent test failures?"
```

### Asking About Patterns

```bash
# Best practices
"What's the best way to handle this scenario?"

# Alternatives
"What are different ways to fix this?"

# Prevention
"How can I prevent this bug in the future?"
```

### Making Changes

```bash
# Fix request
"Fix the pagination bug in task.service.ts"

# Targeted fix
"Add proper error handling to the auth flow"

# Refactor
"Refactor this to use batch loading instead of N+1 queries"
```

### Common Debugging Scenarios

#### 1. Test Failure
```
"This test is failing: [paste test name or error]
Help me understand why and fix it"
```

#### 2. Performance Issue
```
"The API is slow. Analyze this code for:
- N+1 queries
- Missing indexes
- Inefficient algorithms"
```

#### 3. Race Condition
```
"This code has intermittent failures.
Check for race conditions in async operations"
```

#### 4. Memory Leak
```
"Memory usage grows over time. Find potential leaks:
- Event listeners not removed
- Cache without eviction
- Closures capturing large objects"
```

#### 5. Security Issue
```
"Review this code for security vulnerabilities:
- Input validation bypass
- Prototype pollution
- Injection attacks"
```

### Tips for Effective Debugging with Claude

1. **Provide Context**
   - Include error messages
   - Describe what you expected vs what happened
   - Mention recent changes

2. **Be Specific**
   - Point to specific files
   - Describe the exact behavior
   - Include reproduction steps

3. **Use Plan Mode for Complex Issues**
   - Multi-file problems
   - When you want to review the approach
   - For learning purposes

4. **Iterate**
   - Ask follow-up questions
   - Request alternative approaches
   - Ask "why" to understand root causes

5. **Verify Fixes**
   - Run tests after changes
   - Ask Claude to verify the fix addresses the issue
   - Check for side effects

### Exercise-Specific Prompts

#### Easy Exercises
```
"Look at the pagination calculation in task.service.ts"
"Find the missing await in task.controller.ts"
"Check if the HTTP status codes follow REST conventions"
```

#### Medium Exercises
```
"Analyze validator.ts for type confusion vulnerabilities"
"Find the race condition in the task updater"
"Debug the token refresh timing issue"
```

#### Hard Exercises
```
"This code has N+1 query performance issues.
Show me all the places where queries happen inside loops"

"Find all memory leak patterns:
- EventEmitter listeners
- Unbounded caches
- Unclosed resources"

"Map out the lock acquisition order in each function
to identify deadlock potential"
```

### Useful Follow-up Questions

After getting a fix:
- "Why does this fix work?"
- "Could this bug occur elsewhere in the codebase?"
- "What test should I add to catch this in the future?"
- "Are there any edge cases this fix doesn't handle?"

### MCP (Model Context Protocol)

If you have MCP servers configured (like Playwright MCP):

```bash
# Use Playwright MCP for browser testing
"Run the login test with Playwright"

# Debug test failures
"Analyze the Playwright trace for this failure"
```

### Slash Commands (if configured)

```bash
/debug       # Start debugging session
/fix         # Apply a fix
/explain     # Get detailed explanation
/test        # Run tests
```

---

## Remember

Claude Code is your debugging partner. The more context you provide, the better assistance you'll get. Don't hesitate to ask "why" and request explanations - understanding the root cause helps prevent future bugs!

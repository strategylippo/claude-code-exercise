# Exercise: Auth Token Expiry Bug

## Difficulty: Medium
## Time: 25-30 minutes

## Scenario

Users are getting logged out unexpectedly, even when they're actively using the app. The auth token refresh logic seems to have issues.

### Bug Report
```
Title: Users get logged out while actively using the app
Reporter: Customer Support
Priority: High

Symptoms:
1. User is actively working
2. Suddenly gets "Session expired" error
3. Has to log in again
4. Happens approximately every 15 minutes

User feedback:
"I was in the middle of editing a task when suddenly I got logged out.
I had only been working for about 15 minutes and hadn't been idle at all."

Expected behavior:
- Token should refresh automatically before expiry
- Active users should never see "Session expired"
```

### Technical Context
```
Token Configuration:
- Access token expires in: 15 minutes
- Refresh token expires in: 7 days
- Token refresh should happen at: 80% of expiry time (12 minutes)

Current Behavior:
- Token refresh sometimes doesn't trigger
- Sometimes refresh happens too late
- Edge cases around token timing not handled
```

## Your Task

1. Run the failing test: `npm test`
2. Use Claude Code to find the token refresh bugs
3. Fix the auth logic in `auth-manager.ts`
4. Verify all tests pass

## Suggested Claude Code Approach

```
# Ask Claude to analyze auth flow
"Review auth-manager.ts and find bugs in the token refresh logic"

# Ask about edge cases
"What edge cases should be handled in token refresh logic?"

# Use plan mode
"Enter plan mode to fix the token expiry and refresh mechanism"
```

## Files to Examine
- `src/auth/auth-manager.ts` - Contains the buggy auth logic
- `tests/auth.spec.ts` - Token expiry tests

## Hints (only if stuck)
<details>
<summary>Hint 1</summary>
Check how the refresh timer is calculated and cleared
</details>

<details>
<summary>Hint 2</summary>
What happens if the token is refreshed but the timer isn't updated?
</details>

<details>
<summary>Hint 3</summary>
Consider what happens when multiple API calls trigger refresh simultaneously
</details>

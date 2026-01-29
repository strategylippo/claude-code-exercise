# Exercise: Wrong Status Code Bug

## Difficulty: Easy
## Time: 15-20 minutes

## Scenario

The API is returning incorrect HTTP status codes for various scenarios. The frontend team is having trouble handling errors because the status codes don't match the actual error conditions.

### Bug Report
```
Title: Incorrect HTTP status codes returned
Reporter: Frontend Team
Priority: Medium

Issues found:
1. Creating a task returns 200 instead of 201 Created
2. Duplicate email registration returns 400 instead of 409 Conflict
3. Accessing non-existent task returns 400 instead of 404 Not Found
4. Invalid input returns 404 instead of 400 Bad Request

The response bodies have correct error messages, but status codes are wrong.
```

### API Response Examples
```
# Creating task (should be 201, returns 200)
POST /tasks → 200 OK ❌

# Duplicate email (should be 409, returns 400)
POST /auth/register (duplicate) → 400 Bad Request ❌

# Task not found (should be 404, returns 400)
GET /tasks/nonexistent → 400 Bad Request ❌

# Invalid input (should be 400, returns 404)
POST /tasks (missing title) → 404 Not Found ❌
```

## Your Task

1. Run the failing test: `npm test`
2. Use Claude Code to identify the wrong status codes
3. Fix the status codes in `api.controller.ts`
4. Verify all tests pass

## Suggested Claude Code Approach

```
# Ask Claude to review status codes
"Review api.controller.ts and check if the HTTP status codes follow
REST conventions"

# Or ask for specific fixes
"The API returns wrong status codes. Can you check:
- Create should return 201
- Not found should return 404
- Conflict should return 409
- Bad request should return 400"
```

## Files to Examine
- `src/controllers/api.controller.ts` - Contains the bugs
- `tests/api.spec.ts` - Failing tests

## HTTP Status Code Reference
| Code | Name | When to Use |
|------|------|-------------|
| 200 | OK | Successful GET, PUT, PATCH |
| 201 | Created | Successful POST that creates resource |
| 400 | Bad Request | Invalid input, validation errors |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate resource (e.g., email exists) |

## Hints (only if stuck)
<details>
<summary>Hint 1</summary>
Look at each response and match it with the correct HTTP status code
</details>

<details>
<summary>Hint 2</summary>
The error types are: VALIDATION_ERROR, NOT_FOUND, CONFLICT
</details>

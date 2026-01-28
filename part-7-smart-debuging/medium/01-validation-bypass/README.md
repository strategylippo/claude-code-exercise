# Exercise: Validation Bypass Bug

## Difficulty: Medium
## Time: 25-30 minutes

## Scenario

The QA team discovered that validation rules can be bypassed by submitting data in unexpected formats. This is a security vulnerability that allows invalid data into the system.

### Bug Report
```
Title: Input validation can be bypassed
Reporter: Security Team
Priority: CRITICAL

Vulnerabilities found:
1. Sending array instead of string bypasses string length validation
2. Prototype pollution possible via __proto__ property
3. Numeric strings bypass type checking
4. Empty objects pass required field validation

Example payloads that should fail but pass:
- { "title": ["a","b","c"] } - Array bypasses minLength check
- { "title": "Test", "__proto__": { "admin": true } } - Prototype pollution
- { "priority": "999" } - String instead of number passes
- { "title": {} } - Object passes empty string check
```

### Security Impact
- Invalid data corrupts database
- Prototype pollution can escalate privileges
- Type confusion can cause crashes

## Your Task

1. Run the failing test: `npm test`
2. Use Claude Code to identify validation weaknesses
3. Fix the validation in `validator.ts`
4. Verify all tests pass

## Suggested Claude Code Approach

```
# Ask Claude to analyze security
"Review validator.ts for security vulnerabilities and validation bypasses"

# Or use plan mode for systematic fix
"Enter plan mode to fix all validation bypass vulnerabilities"

# Ask for specific analysis
"What happens if someone sends an array where a string is expected?"
"How can I prevent prototype pollution in JavaScript?"
```

## Files to Examine
- `src/validators/validator.ts` - Contains the buggy validation
- `tests/validation.spec.ts` - Security tests (failing)

## Hints (only if stuck)
<details>
<summary>Hint 1</summary>
JavaScript typeof [] returns "object", not "array"
</details>

<details>
<summary>Hint 2</summary>
Use Object.hasOwn() or explicit property checks to prevent prototype pollution
</details>

<details>
<summary>Hint 3</summary>
Always check the actual type with typeof or Array.isArray()
</details>

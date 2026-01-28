# Project Instructions

## Available Commands

### `/security-review`

A built-in security review command that performs a comprehensive security-focused code review of changes on the current branch.

**What it does:**
- Analyzes git diff content for security vulnerabilities
- Reviews modified files for potential security issues
- Identifies high-confidence vulnerabilities with real exploitation potential

**Security categories examined:**
- Input validation vulnerabilities (SQL injection, command injection, XXE, path traversal)
- Authentication & authorization issues (bypass logic, privilege escalation, session flaws)
- Crypto & secrets management (hardcoded keys, weak algorithms)
- Injection & code execution (RCE, deserialization, XSS)
- Data exposure (sensitive data logging, PII handling, API leakage)

**Output format:**
- Markdown report with file location, line number, severity, category
- Description, exploit scenario, and fix recommendation for each finding
- Severity levels: HIGH, MEDIUM, LOW
- Confidence scoring (only reports findings with >80% confidence)

**Usage:**
```
/security-review
```

## Security Review Hook Integration

When you edit a security-sensitive file (files matching patterns: auth, password, token, secret, credential, jwt, session, cookie, api.key, encryption, hash, login, register) and the hook displays the "SECURITY-SENSITIVE FILE MODIFIED" warning, you MUST automatically run the `/security-review` command on that file immediately after the edit completes.

Do not wait for user confirmation - trigger the security review automatically when the hook warning appears.

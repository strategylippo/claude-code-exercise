# Hook Demo Project

This project demonstrates how Claude Code hooks work with security review reminders.

## What This Demo Shows

When you edit files in this project using Claude Code:

1. **Security-sensitive files** (auth, password, token, etc.) → Shows prominent security warning
2. **Regular files** → Shows brief reminder

## Setup

The hooks are already configured in `.claude/settings.json`:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "security-review-reminder.sh",
            "timeout": 5
          }
        ]
      }
    ]
  }
}
```

## Try It Out

### 1. Edit a Security File

Ask Claude to modify `src/auth/auth.service.ts`:

```
"Add input validation to the login function in auth.service.ts"
```

**Expected:** You'll see a prominent security warning box suggesting `/security-review`

### 2. Edit a Regular File

Ask Claude to modify `src/tasks/task.service.ts`:

```
"Add a getAllTasks method to task.service.ts"
```

**Expected:** You'll see a brief reminder about security review

### 3. Run Security Review

After seeing the reminder:

```
/security-review
```

Or review specific file:

```
/security-review src/auth/auth.service.ts
```

## Project Structure

```
hook-demo-project/
├── .claude/
│   ├── settings.json              # Hook configuration
│   └── hooks/
│       └── security-review-reminder.sh  # Hook script
├── src/
│   ├── auth/
│   │   └── auth.service.ts        # Security-sensitive file
│   └── tasks/
│       └── task.service.ts        # Regular file
└── README.md
```

## How the Hook Works

1. Claude edits a file (Write or Edit tool)
2. `PostToolUse` hook triggers
3. `security-review-reminder.sh` runs with the file path
4. Script checks if path contains security keywords
5. Shows appropriate reminder message

## Customizing

Edit `.claude/hooks/security-review-reminder.sh` to:
- Add more security patterns
- Change the reminder messages
- Log to different locations
- Integrate with other tools

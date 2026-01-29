#!/bin/bash
# Security Review Reminder Hook
# This script runs after every Write/Edit operation

FILE_PATH="$1"
LOG_FILE="$CLAUDE_PROJECT_DIR/.claude/hooks/security-changes.log"

# Security-sensitive patterns to watch for
SECURITY_PATTERNS="auth|password|token|secret|credential|jwt|session|cookie|api.key|encryption|hash|login|register"

# Get just the filename for display
FILENAME=$(basename "$FILE_PATH" 2>/dev/null || echo "$FILE_PATH")

# Check if the file path matches security patterns
if echo "$FILE_PATH" | grep -iE "$SECURITY_PATTERNS" > /dev/null 2>&1; then
    echo ""
    echo "┌────────────────────────────────────────────────────────────┐"
    echo "│  🔐 SECURITY-SENSITIVE FILE MODIFIED                       │"
    echo "├────────────────────────────────────────────────────────────┤"
    echo "│  File: $FILENAME"
    echo "│                                                            │"
    echo "│  ⚠️  Run security review:                                  │"
    echo "│      /security-review                                      │"
    echo "│                                                            │"
    echo "│  Or review this specific file:                             │"
    echo "│      /security-review $FILE_PATH"
    echo "└────────────────────────────────────────────────────────────┘"
    echo ""

    # Log the change
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Security file modified: $FILE_PATH" >> "$LOG_FILE"
else
    # For non-security files, just show a brief reminder
    echo "📝 File modified: $FILENAME | Consider /security-review for security checks"
fi

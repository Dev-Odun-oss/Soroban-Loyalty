#!/bin/bash

# Script to check if CHANGELOG.md has been updated

CHANGELOG_FILE="CHANGELOG.md"
PR_BRANCH=$(git rev-parse --abbrev-ref HEAD)

echo "🔍 Checking if CHANGELOG.md has been updated..."

# Check if CHANGELOG exists
if [ ! -f "$CHANGELOG_FILE" ]; then
    echo "❌ ERROR: CHANGELOG.md does not exist!"
    exit 1
fi

# Check if Unreleased section exists
if ! grep -q "## \[Unreleased\]" "$CHANGELOG_FILE"; then
    echo "❌ ERROR: No [Unreleased] section found in CHANGELOG.md"
    echo "Please add an [Unreleased] section at the top of CHANGELOG.md"
    exit 1
fi

# Check if there are entries under Unreleased
UNRELEASED_CONTENT=$(sed -n '/## \[Unreleased\]/,/## \[/p' "$CHANGELOG_FILE" | grep -E "^### (Added|Changed|Deprecated|Removed|Fixed|Security)")
if [ -z "$UNRELEASED_CONTENT" ]; then
    echo "⚠️  WARNING: No categories found under [Unreleased] section"
    echo "Please add at least one category (Added, Changed, Fixed, etc.)"
    exit 1
fi

echo "✅ CHANGELOG.md has been properly updated!"
exit 0

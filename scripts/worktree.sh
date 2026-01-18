#!/bin/bash

# Worktree management script for Linear issues
# Usage:
#   ./scripts/worktree.sh start DRI-123 "brief-description"
#   ./scripts/worktree.sh stop DRI-123

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
PARENT_DIR="$(dirname "$PROJECT_DIR")"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_success() { echo -e "${GREEN}✓${NC} $1"; }
print_error() { echo -e "${RED}✗${NC} $1"; }
print_info() { echo -e "${YELLOW}→${NC} $1"; }

# Start a new worktree for an issue
start_worktree() {
    local issue_id="$1"
    local description="$2"

    if [ -z "$issue_id" ]; then
        print_error "Usage: $0 start <ISSUE-ID> [description]"
        print_info "Example: $0 start DRI-123 add-user-auth"
        exit 1
    fi

    # Default description if not provided
    if [ -z "$description" ]; then
        description="issue"
    fi

    local branch_name="feature/${issue_id}-${description}"
    local worktree_path="${PARENT_DIR}/drift-${issue_id}"

    print_info "Creating worktree for ${issue_id}..."

    # Check if worktree already exists
    if [ -d "$worktree_path" ]; then
        print_error "Worktree already exists at ${worktree_path}"
        exit 1
    fi

    # Fetch latest from origin
    print_info "Fetching latest from origin..."
    cd "$PROJECT_DIR"
    git fetch origin main

    # Create worktree with new branch from main
    print_info "Creating worktree at ${worktree_path}..."
    git worktree add -b "$branch_name" "$worktree_path" origin/main

    # Copy essential files
    print_info "Copying configuration files..."
    cp "$PROJECT_DIR/.env" "$worktree_path/" 2>/dev/null || print_info "No .env file to copy"
    cp "$PROJECT_DIR/.mcp.json" "$worktree_path/" 2>/dev/null || print_info "No .mcp.json file to copy"
    cp -r "$PROJECT_DIR/.claude" "$worktree_path/" 2>/dev/null || print_info "No .claude directory to copy"

    # Install dependencies
    print_info "Installing dependencies..."
    cd "$worktree_path"
    npm install --legacy-peer-deps

    print_success "Worktree created successfully!"
    echo ""
    echo "  Path:   ${worktree_path}"
    echo "  Branch: ${branch_name}"
    echo ""
    print_info "To start working:"
    echo "  cd ${worktree_path}"
    echo "  claude"
}

# Stop and clean up a worktree
stop_worktree() {
    local issue_id="$1"

    if [ -z "$issue_id" ]; then
        print_error "Usage: $0 stop <ISSUE-ID>"
        print_info "Example: $0 stop DRI-123"
        exit 1
    fi

    local worktree_path="${PARENT_DIR}/drift-${issue_id}"

    print_info "Cleaning up worktree for ${issue_id}..."

    cd "$PROJECT_DIR"

    # Find the branch name for this worktree
    local branch_name=$(git worktree list --porcelain | grep -A2 "$worktree_path" | grep "branch" | sed 's/branch refs\/heads\///')

    if [ -z "$branch_name" ]; then
        # Try to find branch by pattern
        branch_name=$(git branch | grep "$issue_id" | tr -d ' *')
    fi

    # Remove worktree
    if [ -d "$worktree_path" ]; then
        print_info "Removing worktree..."
        git worktree remove "$worktree_path" --force
        print_success "Worktree removed"
    else
        print_info "Worktree not found at ${worktree_path}"
    fi

    # Delete local branch
    if [ -n "$branch_name" ]; then
        print_info "Deleting local branch ${branch_name}..."
        git branch -D "$branch_name" 2>/dev/null && print_success "Local branch deleted" || print_info "Local branch not found"

        # Delete remote branch
        print_info "Deleting remote branch..."
        git push origin --delete "$branch_name" 2>/dev/null && print_success "Remote branch deleted" || print_info "Remote branch not found or already deleted"
    fi

    # Prune stale references
    print_info "Pruning stale references..."
    git worktree prune
    git remote prune origin

    print_success "Cleanup complete for ${issue_id}!"
}

# List all worktrees
list_worktrees() {
    print_info "Current worktrees:"
    echo ""
    git worktree list
}

# Main
case "$1" in
    start|new|create)
        start_worktree "$2" "$3"
        ;;
    stop|end|cleanup|clean|delete|remove)
        stop_worktree "$2"
        ;;
    list|ls)
        list_worktrees
        ;;
    *)
        echo "Worktree management for Linear issues"
        echo ""
        echo "Usage:"
        echo "  $0 start <ISSUE-ID> [description]  - Create new worktree"
        echo "  $0 stop <ISSUE-ID>                 - Remove worktree and delete branch"
        echo "  $0 list                            - List all worktrees"
        echo ""
        echo "Examples:"
        echo "  $0 start DRI-123 user-auth"
        echo "  $0 stop DRI-123"
        ;;
esac

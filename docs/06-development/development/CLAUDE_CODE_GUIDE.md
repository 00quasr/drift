# Claude Code Agent & Skill Guide

**Last Updated**: January 2026
**Version**: 1.0

## Overview

This guide explains how to use the custom agents and skills configured for the Drift project. These tools help maintain code quality, enforce patterns, and accelerate development with AI assistance.

## Quick Reference

### 5 Custom Agents (Specialized AI Workers)
| Agent | When to Use | Invocation |
|-------|-------------|------------|
| **supabase-assistant** | Database queries, migrations, RLS policies | `Use supabase-assistant to...` |
| **drift-reviewer** | Code review after changes | `Use drift-reviewer to review my changes` |
| **event-optimizer** | Performance optimization, UX improvements | `Use event-optimizer to analyze...` |
| **security-auditor** | Security reviews, content moderation | `Use security-auditor to check...` |
| **maintenance-agent** | Update agents/skills (monthly) | `Use maintenance-agent to review all agents` |

### 3 Custom Skills (Knowledge Guides)
| Skill | Auto-Triggers When | Manual Use |
|-------|-------------------|------------|
| **supabase-query-helper** | "How do I query...", "Show me the schema" | Ask database-related questions |
| **drift-component-generator** | "Create a component", "Build a form" | Ask UI/component questions |
| **drift-api-patterns** | "Create an API route", "Add auth" | Ask API development questions |

---

## Detailed Agent Reference

### 1. supabase-assistant 🗄️

**Purpose**: Database expert for Supabase queries, schema design, and RLS policies

**Use this agent when**:
- Creating or modifying database tables
- Writing complex SQL queries
- Setting up Row Level Security policies
- Applying database migrations
- Optimizing query performance
- Generating TypeScript types from schema

**Auto-loads skill**: `supabase-query-helper`

**Example commands**:
```
Use supabase-assistant to create a bookmarks table with RLS policies

Use supabase-assistant to optimize the events query with venue joins

Use supabase-assistant to review my migration before applying

Use supabase-assistant to explain the current RLS policies for venues
```

**Key features**:
- ✅ Direct access to Supabase MCP tools
- ✅ Can execute SQL queries and apply migrations
- ✅ Checks security advisors automatically
- ✅ Generates TypeScript types after schema changes

---

### 2. drift-reviewer 🔍

**Purpose**: Expert code reviewer for Next.js, React, TypeScript, and Supabase integration

**Use this agent when**:
- After completing a feature or bug fix
- Before creating a pull request
- When you want code quality feedback
- To ensure design system compliance
- To check for security vulnerabilities
- To validate TypeScript usage

**Use proactively**: This agent should be used AFTER writing significant code

**Example commands**:
```
Use drift-reviewer to review my latest changes

Use drift-reviewer to check this component for accessibility issues

Use drift-reviewer to validate the security of my new API route

Use drift-reviewer to ensure this matches our design system
```

**What it checks**:
- ✅ TypeScript type safety
- ✅ Component structure and shadcn/ui patterns
- ✅ Supabase integration correctness
- ✅ API route security
- ✅ Performance considerations
- ✅ Accessibility compliance
- ✅ Design system consistency

**Output format**:
- 🔴 **Critical Issues** (must fix)
- 🟡 **Important Issues** (should fix)
- 🟢 **Suggestions** (nice to have)

---

### 3. event-optimizer ⚡

**Purpose**: Performance and UX specialist for event discovery features

**Use this agent when**:
- Search/discovery pages are slow
- Optimizing database queries
- Improving component render performance
- Implementing caching strategies
- Analyzing bundle size
- Fixing mobile performance issues
- Optimizing real-time subscriptions

**Example commands**:
```
Use event-optimizer to analyze the trending page performance

Use event-optimizer to optimize this search query

Use event-optimizer to improve mobile performance for the events page

Use event-optimizer to implement caching for venue listings
```

**Performance targets**:
- Search results: < 500ms
- Trending page: < 1s
- Filter interactions: < 200ms
- Real-time updates: 60fps, no jank

**Provides**:
- Query optimization suggestions
- Component memoization patterns
- Bundle size reduction strategies
- Caching implementation
- Before/after benchmarks

---

### 4. security-auditor 🔐

**Purpose**: Security specialist for content moderation, API protection, and data safety

**Use this agent when**:
- Creating new API routes
- Implementing authentication flows
- Setting up content moderation
- Reviewing RLS policies
- Checking for vulnerabilities
- Before deploying security-critical features
- Auditing file upload handling

**Example commands**:
```
Use security-auditor to audit my API routes

Use security-auditor to review RLS policies for the new bookmarks table

Use security-auditor to check if this image upload is secure

Use security-auditor to validate the authentication flow
```

**Security checklist covers**:
- ✅ Authentication & authorization
- ✅ Row Level Security policies
- ✅ API input validation
- ✅ Content moderation
- ✅ File upload security
- ✅ Role-based access control
- ✅ Data privacy & GDPR
- ✅ OWASP Top 10 vulnerabilities

**Output includes**:
- Vulnerability severity (Critical/High/Medium/Low)
- Risk assessment
- Proof of concept (how to exploit)
- Specific code fix
- Verification steps

---

### 5. maintenance-agent 🔄

**Purpose**: Keeps all agents and skills up-to-date with the evolving codebase

**Use this agent when**:
- Monthly maintenance reviews (recommended)
- After major architectural changes
- After design system updates
- After database schema migrations
- When adding new features/patterns
- Before major releases

**Example commands**:
```
Use maintenance-agent to review all agents and skills

Use maintenance-agent to validate agents (report only)

Use maintenance-agent to update supabase-assistant after migration

Use maintenance-agent to check if component-generator is current
```

**What it does**:
1. Scans all 5 agents and 3 skills
2. Compares documented patterns vs actual code
3. Checks git history for recent changes
4. Identifies outdated information
5. Generates detailed report with findings
6. Proposes updates (with user approval)

**Maintenance schedule**:
- **Monthly** (15-30 min): Quick validation, critical updates
- **Quarterly** (1-2 hours): Deep review, comprehensive updates
- **As needed** (30 min): After major changes

---

## Detailed Skill Reference

Skills automatically load when you ask relevant questions. You don't need to explicitly invoke them.

### 1. supabase-query-helper 🗄️

**Auto-triggers when you ask**:
- "How do I query the venues table?"
- "Show me the database schema"
- "Generate TypeScript types"
- "Write a migration for..."
- "How do I set up RLS policies?"
- "Join events with venues"

**What it teaches**:
- SQL query patterns for Supabase client
- Database schema (all 11 tables)
- TypeScript type generation
- RLS policy examples
- Migration best practices
- Performance optimization (indexes, pagination)
- Real-time subscription setup

**Supporting documentation**: `SCHEMA_REFERENCE.md` with detailed table documentation

**Example questions**:
```
How do I query events with their venue information?
→ Shows join pattern with select syntax

What's the schema for the reviews table?
→ Provides complete table documentation

How do I create a migration for a new bookmarks table?
→ Shows migration structure with RLS policies
```

---

### 2. drift-component-generator ⚛️

**Auto-triggers when you ask**:
- "Create a new component"
- "Build a form for..."
- "How do I use EntityCard?"
- "What colors should I use?"
- "Make a search input"
- "Show me the design system"

**What it teaches**:
- 90s rave cyber aesthetic patterns
- Color system (neon cyan, magenta, yellow)
- Typography (UPPERCASE, tracking-wider, bold)
- Spacing tokens (section/subsection/element/tight)
- Component patterns (EntityCard, ClassicLoader, EntityViews)
- shadcn/ui component usage
- Framer Motion animations
- Form patterns with React Hook Form & Zod
- Responsive design breakpoints

**Design principles**:
- Pure black backgrounds (#000000)
- UPPERCASE text with wide letter spacing
- Bold typography
- Neon accent colors
- Angular, geometric design
- Glassmorphism effects

**Example questions**:
```
Create a venue card component
→ Shows EntityCard usage with proper styling

How do I build a form with validation?
→ Provides React Hook Form + Zod pattern

What's the color for primary buttons?
→ Shows design system colors and usage
```

---

### 3. drift-api-patterns 🚀

**Auto-triggers when you ask**:
- "Create an API route for..."
- "How do I add authentication?"
- "Validate API input"
- "Handle errors in API routes"
- "Implement content moderation"
- "Set up CORS"

**What it teaches**:
- Standard API route structure
- Authentication patterns (session verification)
- Input validation (query params, body, Zod)
- Error handling with proper status codes
- Content moderation integration
- Role-based access control
- Ownership verification
- Security best practices
- Rate limiting patterns

**API structure**:
1. Authentication
2. Input validation
3. Database query
4. Return response
5. Error handling

**Example questions**:
```
Create a POST endpoint for creating venues
→ Shows complete route with auth, validation, error handling

How do I verify user ownership before updating?
→ Shows ownership check pattern

Implement image moderation in upload endpoint
→ Shows OpenAI moderation integration
```

---

## Common Workflows

### Workflow 1: Create a New Feature

**Example**: Adding a bookmarks feature

```bash
# Step 1: Database setup
> Use supabase-assistant to create a bookmarks table with RLS policies
# Agent creates migration, applies it, generates types

# Step 2: API route
> Create an API route for managing bookmarks
# drift-api-patterns skill guides you through structure

# Step 3: Component
> Create a bookmark button component
# drift-component-generator skill guides design

# Step 4: Code review
> Use drift-reviewer to review my bookmark feature
# Agent checks all code for quality, security, consistency

# Step 5: Performance check
> Use event-optimizer to ensure bookmarks load efficiently
# Agent suggests caching, query optimizations

# Step 6: Security audit
> Use security-auditor to audit the bookmarks API
# Agent validates auth, RLS, input validation
```

### Workflow 2: Performance Optimization

**Example**: Slow search page

```bash
# Step 1: Analyze
> Use event-optimizer to analyze search page performance
# Agent profiles queries, components, bundle size

# Step 2: Database optimization
> Use supabase-assistant to optimize the search query
# Agent adds indexes, improves joins

# Step 3: Verify
> Use event-optimizer to benchmark the improvements
# Agent measures before/after performance
```

### Workflow 3: Security Review

**Example**: Pre-deployment security audit

```bash
# Step 1: API audit
> Use security-auditor to audit all API routes
# Agent checks auth, validation, error handling

# Step 2: Database audit
> Use supabase-assistant to review all RLS policies
# Agent validates policies for all tables

# Step 3: Content moderation
> Use security-auditor to verify content moderation implementation
# Agent checks image and text moderation

# Step 4: Fix issues
# Apply recommended fixes

# Step 5: Re-audit
> Use security-auditor to verify fixes
# Agent confirms vulnerabilities are resolved
```

### Workflow 4: Monthly Maintenance

**Example**: Keep agents/skills current

```bash
# Step 1: Run maintenance
> Use maintenance-agent to review all agents and skills
# Agent scans code, compares with documentation

# Step 2: Review report
# Agent shows outdated patterns, missing coverage

# Step 3: Apply updates
# Choose to apply all, review individually, or skip

# Step 4: Verify
> Use maintenance-agent to validate all agents
# Agent confirms everything is current
```

---

## Quick Start Cheat Sheet

### For New Team Members

**First time setup**:
1. Clone the repo (agents/skills come with it in `.claude/`)
2. Install Claude Code CLI
3. Start coding - agents/skills work automatically!

**Try these commands to get familiar**:
```bash
# Test a skill
"How do I query the venues table with ratings?"

# Test an agent
"Use drift-reviewer to review this file"

# See what's available
"What agents and skills are available?"

# Get help
"How do I use the supabase-assistant agent?"
```

### For Daily Development

**When writing code**:
- Ask questions naturally - skills will auto-trigger
- Use agents explicitly for reviews and audits
- Run drift-reviewer after completing features

**When working with database**:
- Use `supabase-assistant` for all database work
- It has direct access to Supabase MCP tools
- Can execute queries and apply migrations

**When optimizing**:
- Use `event-optimizer` for performance issues
- Use `security-auditor` before deploying

**Monthly**:
- Run `maintenance-agent` to keep docs current

---

## Best Practices

### 1. Use Agents Proactively

**Good** ✅:
```
[After writing code]
> Use drift-reviewer to review my changes
```

**Bad** ❌:
```
[Writing code with bugs]
[Committing without review]
[Discovering bugs later]
```

### 2. Combine Agents for Complex Tasks

**Example**: Full feature review
```bash
> Use drift-reviewer to review code quality
> Use security-auditor to check security
> Use event-optimizer to verify performance
```

### 3. Trust the Agents' Expertise

Agents are specialized and deeply knowledgeable about:
- supabase-assistant: Database best practices
- drift-reviewer: Code quality standards
- event-optimizer: Performance patterns
- security-auditor: Security vulnerabilities
- maintenance-agent: Documentation accuracy

### 4. Keep Documentation Current

Run maintenance-agent monthly to ensure:
- Agents reflect actual code patterns
- Skills teach current best practices
- Examples are up-to-date

### 5. Share Knowledge with Team

When agents suggest improvements:
- Share findings in PRs
- Update team documentation
- Add to code review checklists

---

## Troubleshooting

### Agent Not Triggering

**Problem**: "Use agent-name" doesn't work

**Solution**:
1. Check agent name spelling (use exact name from `.claude/agents/`)
2. Ensure `.claude/agents/agent-name.md` exists
3. Try: "What agents are available?"

### Skill Not Auto-Loading

**Problem**: Skill doesn't trigger on relevant questions

**Solution**:
1. Skills trigger based on description keywords
2. Be specific in your question
3. Manually reference: "Using drift-component-generator, how do I..."

### Agent Gives Outdated Advice

**Problem**: Agent references old patterns

**Solution**:
1. Run: "Use maintenance-agent to update [agent-name]"
2. The maintenance agent will update based on current code

### MCP Tools Not Working

**Problem**: supabase-assistant can't use MCP tools

**Solution**:
1. Check `.claude/.mcp.json` is configured
2. Verify Supabase credentials in environment
3. Restart Claude Code session

---

## Integration with Existing Docs

This guide complements:

- **CLAUDE.md** (root) - Project-level instructions for Claude
- **DEVELOPMENT_GUIDE.md** - General development setup
- **CONTRIBUTING.md** - Contribution guidelines
- **security_guideline_document.mdc** - Security requirements
- **PROJECT_STATUS.md** - Current project status

**When to use each**:
- **CLAUDE.md**: Claude reads this automatically for context
- **DEVELOPMENT_GUIDE.md**: New developers setting up environment
- **CLAUDE_CODE_GUIDE.md** (this doc): Using agents and skills
- **CONTRIBUTING.md**: Submitting pull requests
- **security_guideline_document.mdc**: Security implementation details

---

## Advanced Usage

### Custom Agent Workflows

Create your own workflows by chaining agents:

```bash
# Full feature pipeline
> Use supabase-assistant to set up database
> [Implement feature]
> Use drift-reviewer to review code
> Use security-auditor to audit security
> Use event-optimizer to check performance
> [Deploy]
```

### Integrating with Git Hooks

Add to `.git/hooks/pre-commit`:
```bash
#!/bin/bash
echo "Running drift-reviewer..."
# Add your review command here
```

### CI/CD Integration

Add to `.github/workflows/`:
```yaml
- name: Security Audit
  run: |
    # Run security-auditor as part of CI
    # Can be automated with CLI
```

---

## Maintenance Schedule

### Daily
- Use skills naturally while coding
- Run drift-reviewer after completing features

### Weekly
- Review agent suggestions from the week
- Share learnings with team

### Monthly (Required)
- Run: `Use maintenance-agent to review all agents and skills`
- Apply critical updates
- Review report for trends

### Quarterly
- Deep maintenance review (1-2 hours)
- Update all agents and skills comprehensively
- Review and improve agent effectiveness
- Add new patterns discovered

### After Major Changes
- Run maintenance-agent after:
  - Database migrations
  - Design system updates
  - Architecture changes
  - New feature additions
  - Dependency upgrades

---

## Team Onboarding

### For New Developers

**Week 1**: Familiarize
- Read this guide
- Try asking skills questions
- Observe agent outputs

**Week 2**: Practice
- Use drift-reviewer on your PRs
- Ask supabase-query-helper about schema
- Use drift-component-generator for UI work

**Week 3**: Master
- Use agents proactively
- Combine agents for complex tasks
- Suggest improvements to agents

### For Team Leads

**Responsibilities**:
- Ensure team uses agents consistently
- Run monthly maintenance reviews
- Update agents based on team feedback
- Share agent insights in retrospectives

---

## Metrics & Success Criteria

Track these metrics:

### Code Quality
- % of PRs reviewed by drift-reviewer before submission
- Number of issues caught by agents before deployment
- Reduction in bugs related to common patterns

### Performance
- Search response time improvements
- Bundle size reductions
- Query optimization success rate

### Security
- Vulnerabilities caught by security-auditor
- % of API routes audited before deployment
- RLS policy coverage

### Documentation
- Agent accuracy rate (maintenance-agent reports)
- Time to onboard new developers
- Reduction in "how do I..." questions

---

## FAQ

### Q: Do I need to use agents for every task?
**A**: No. Use agents when you need expertise (database, security, performance) or quality checks (code review). Skills trigger automatically.

### Q: Can I modify agents and skills?
**A**: Yes! Agents/skills are in `.claude/agents/` and `.claude/skills/`. Edit them to match your needs. Run maintenance-agent to validate changes.

### Q: What if an agent gives wrong advice?
**A**: Run maintenance-agent to update it with current patterns. Report the issue so documentation can be improved.

### Q: How do agents differ from ChatGPT/Copilot?
**A**: Agents are specialized for Drift's codebase, have direct tool access (Supabase MCP), and follow your exact patterns and style.

### Q: Can agents make changes to code?
**A**: Yes, agents can use Edit tool. However, they will ask permission for significant changes. You maintain full control.

### Q: Do agents work offline?
**A**: No, Claude Code requires internet connection. However, skills documentation is local in `.claude/skills/`.

---

## Resources

### Documentation
- [Claude Code CLI Docs](https://claude.com/code)
- [Claude Agent SDK](https://platform.claude.com/docs/agent-sdk)
- [Supabase MCP Server](https://github.com/supabase/mcp-server-supabase)

### Project Docs
- `/docs/README.md` - Documentation index
- `/docs/CLAUDE.md` - Claude context
- `/docs/PROJECT_STATUS.md` - Current status
- `.claude/agents/` - Agent definitions
- `.claude/skills/` - Skill definitions

### Quick Links
- [GitHub Repository](https://github.com/your-org/drift)
- [Supabase Dashboard](https://app.supabase.com)
- [Vercel Deployment](https://drift.vercel.app)

---

## Feedback & Improvements

Help improve the agents and skills:

1. **Report Issues**: When agents give outdated advice
2. **Suggest Patterns**: Share new patterns you discover
3. **Request Features**: Suggest new agents or skills
4. **Share Success**: Tell us when agents save time

**How to contribute**:
- Open GitHub issue with `[Agent Improvement]` tag
- Suggest edits to agent markdown files
- Share in team retros

---

**Remember**: Agents and skills are tools to enhance your productivity, not replace your judgment. Use them to move faster, but always review and understand the suggestions.

**Questions?** Ask in the team chat or open a GitHub discussion.

---

*Last updated: January 2026 | Version: 1.0 | Maintained by: Development Team*

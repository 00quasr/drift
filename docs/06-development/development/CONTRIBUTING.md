# Contributing to Drift

Thank you for your interest in contributing to Drift! This document provides guidelines and information for contributors.

## Code of Conduct

By participating in this project, you agree to abide by our code of conduct:

- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on constructive feedback
- Respect different viewpoints and experiences
- Show empathy towards community members

## Getting Started

### Prerequisites

- Node.js 20.x or higher
- npm 9.x or higher
- Git
- Supabase account (for database access)

### Development Setup

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/your-username/drift.git
   cd drift
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Set up environment variables:
   ```bash
   cp env.example .env.local
   # Update .env.local with your Supabase credentials
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

## Development Workflow

### Branch Naming

Use descriptive branch names with prefixes:
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Test additions/updates

Examples:
- `feature/venue-search-filters`
- `fix/review-rating-validation`
- `docs/api-endpoint-updates`

### Commit Messages

Follow conventional commits format:
```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Test additions/updates
- `chore`: Maintenance tasks

Examples:
```
feat(venues): add advanced search filters
fix(reviews): validate rating values before submission
docs(api): update endpoint documentation
```

### Pull Request Process

1. Create a feature branch from `main`
2. Make your changes
3. Add/update tests if applicable
4. Ensure all checks pass:
   ```bash
   npm run lint
   npm run type-check
   npm run build
   ```
5. Update documentation if needed
6. Submit a pull request with:
   - Clear title and description
   - Link to related issues
   - Screenshots for UI changes
   - Test instructions

### Code Review Guidelines

**For Authors:**
- Provide clear PR descriptions
- Respond to feedback promptly
- Make requested changes
- Resolve merge conflicts

**For Reviewers:**
- Be constructive and specific
- Test changes locally when possible
- Approve when satisfied
- Request changes if needed

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Define proper types and interfaces
- Avoid `any` type when possible
- Use strict mode settings

### React/Next.js

- Use functional components with hooks
- Follow React best practices
- Use Next.js App Router conventions
- Implement proper error boundaries

### Styling

- Use Tailwind CSS for styling
- Follow mobile-first approach
- Use shadcn/ui components when available
- Maintain consistent spacing and typography

### API Development

- Follow RESTful conventions
- Use proper HTTP status codes
- Implement comprehensive error handling
- Add input validation and sanitization
- Document all endpoints

### Database

- Use Supabase client methods
- Implement Row Level Security (RLS)
- Follow naming conventions
- Create proper migrations

## Testing

### Unit Tests
```bash
npm run test
```

### Type Checking
```bash
npm run type-check
```

### Linting
```bash
npm run lint
npm run lint:fix
```

## Documentation

### API Documentation
- Update `docs/api/` for API changes
- Include request/response examples
- Document error codes and messages

### Code Documentation
- Add JSDoc comments for functions
- Document complex business logic
- Include usage examples

### README Updates
- Keep installation instructions current
- Update feature lists
- Maintain accurate project structure

## Issue Reporting

### Bug Reports

Include:
- Clear description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Environment details (OS, browser, etc.)
- Screenshots/videos if applicable

### Feature Requests

Include:
- Clear description of the feature
- Use cases and benefits
- Proposed implementation (if applicable)
- Mockups or wireframes (if applicable)

## Security

### Reporting Security Issues

Do not report security vulnerabilities through public GitHub issues. Instead:
1. Email security@drift.com (if available)
2. Use GitHub's private vulnerability reporting
3. Provide detailed information about the vulnerability

### Security Best Practices

- Never commit secrets or API keys
- Use environment variables for sensitive data
- Validate and sanitize all user inputs
- Follow authentication best practices
- Implement proper authorization checks

## Performance

### Guidelines

- Optimize images and assets
- Implement proper caching
- Use lazy loading where appropriate
- Monitor bundle size
- Follow Core Web Vitals best practices

### Testing Performance

```bash
npm run analyze  # Analyze bundle size
npm run build    # Check build performance
```

## Accessibility

### Requirements

- Follow WCAG 2.1 AA guidelines
- Use semantic HTML elements
- Implement proper ARIA attributes
- Ensure keyboard navigation
- Test with screen readers

### Tools

- Use Radix UI for accessible components
- Test with accessibility dev tools
- Include accessibility in PR reviews

## Release Process

### Versioning

We follow semantic versioning (SemVer):
- `MAJOR.MINOR.PATCH`
- Major: Breaking changes
- Minor: New features (backward compatible)
- Patch: Bug fixes (backward compatible)

### Release Checklist

1. Update version in `package.json`
2. Update `CHANGELOG.md`
3. Create release notes
4. Tag the release
5. Deploy to production
6. Announce the release

## Community

### Communication Channels

- GitHub Issues - Bug reports and feature requests
- GitHub Discussions - General discussions
- Discord - Real-time chat (coming soon)

### Getting Help

- Check existing issues and discussions
- Read the documentation
- Ask questions in discussions
- Join community channels

## Recognition

Contributors will be recognized:
- In the `CONTRIBUTORS.md` file
- In release notes for significant contributions
- Through GitHub's contributor statistics

Thank you for contributing to Drift! 🎵
# Contributing to Aura

Thank you for your interest in contributing to Aura! This document provides guidelines and instructions for contributing.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)

## 📜 Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment. Please:

- Be respectful and considerate in all interactions
- Welcome newcomers and help them get started
- Focus on constructive feedback
- Accept responsibility for your mistakes and learn from them

## 🚀 Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm 9.x or higher
- Git

### Fork and Clone

1. **Fork the repository** on GitHub

2. **Clone your fork**

   ```bash
   git clone https://github.com/YOUR_USERNAME/aura.git
   cd aura
   ```

3. **Add upstream remote**

   ```bash
   git remote add upstream https://github.com/shubhams167/aura.git
   ```

4. **Install dependencies**

   ```bash
   npm install
   ```

5. **Start the development server**

   ```bash
   npm run dev
   ```

## 💻 Development Workflow

### Creating a Branch

Always create a new branch for your work:

```bash
# Update your local main branch
git checkout main
git pull upstream main

# Create a new branch
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

### Branch Naming Convention

- `feature/` - New features (e.g., `feature/stock-chart`)
- `fix/` - Bug fixes (e.g., `fix/login-validation`)
- `docs/` - Documentation updates (e.g., `docs/api-guide`)
- `refactor/` - Code refactoring (e.g., `refactor/auth-logic`)
- `style/` - UI/styling changes (e.g., `style/dark-mode`)

### Running Tests

Before submitting a PR, ensure your code passes all checks:

```bash
# Run linting
npm run lint

# Build the project
npm run build
```

## 🔄 Pull Request Process

1. **Update your branch** with the latest changes from upstream:

   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Push your branch** to your fork:

   ```bash
   git push origin feature/your-feature-name
   ```

3. **Create a Pull Request** on GitHub with:
   - A clear, descriptive title
   - A detailed description of changes
   - Screenshots for UI changes
   - Reference to related issues (if any)

4. **Address review feedback** promptly and push updates

5. **Squash commits** if requested before merging

### PR Checklist

- [ ] Code follows the project's coding standards
- [ ] Self-reviewed my code for obvious issues
- [ ] Added/updated comments for complex logic
- [ ] Tested changes locally
- [ ] No console errors or warnings
- [ ] UI is responsive across different screen sizes
- [ ] Dark/light mode works correctly

## 📝 Coding Standards

### TypeScript

- Use TypeScript for all new files
- Define proper types and interfaces
- Avoid `any` type unless absolutely necessary
- Export types that may be reused

```typescript
// ✅ Good
interface UserProps {
  name: string;
  email: string;
}

// ❌ Avoid
const user: any = { ... };
```

### React Components

- Use functional components with hooks
- Keep components focused and single-purpose
- Extract reusable logic into custom hooks
- Use proper prop typing

```tsx
// ✅ Good
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: "primary" | "secondary";
}

export function Button({ label, onClick, variant = "primary" }: ButtonProps) {
  return (
    <button onClick={onClick} className={styles[variant]}>
      {label}
    </button>
  );
}
```

### Styling

- Use Tailwind CSS for styling
- Follow mobile-first responsive design
- Use CSS variables for theme colors
- Keep class names organized (layout → spacing → typography → colors)

```tsx
// ✅ Good - organized classes
<div className="flex items-center gap-4 px-6 py-4 text-lg font-medium text-zinc-900 dark:text-white">

// ❌ Avoid - unorganized
<div className="text-zinc-900 px-6 py-4 flex dark:text-white items-center font-medium text-lg gap-4">
```

### File Organization

- Place components in `/components`
- Place page-specific components in `/app/[route]`
- Place utilities in `/lib`
- Place validation schemas in `/lib/validations`

## 📌 Commit Guidelines

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `style` - Code style changes (formatting, etc.)
- `refactor` - Code refactoring
- `perf` - Performance improvements
- `test` - Adding or updating tests
- `chore` - Maintenance tasks

### Examples

```bash
feat(auth): add Google OAuth login
fix(navbar): correct mobile menu alignment
docs(readme): update installation instructions
style(button): improve hover animation
refactor(forms): extract validation logic to separate file
```

## 🐛 Reporting Bugs

When reporting bugs, please include:

1. A clear, descriptive title
2. Steps to reproduce the issue
3. Expected behavior
4. Actual behavior
5. Screenshots (if applicable)
6. Browser and OS information

## 💡 Suggesting Features

We welcome feature suggestions! Please:

1. Check existing issues to avoid duplicates
2. Provide a clear use case
3. Describe the expected behavior
4. Consider implementation complexity

## ❓ Questions?

If you have questions, feel free to:

- Open a GitHub Discussion
- Create an issue with the `question` label

---

Thank you for contributing to Aura! 🚀

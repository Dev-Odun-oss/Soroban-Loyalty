# Contributor Onboarding Guide

Welcome to the Soroban Loyalty project! This guide will walk you through everything you need to know to make your first contribution, from setting up your development environment to submitting your first pull request.

---

## Table of Contents

1. [Before You Start](#before-you-start)
2. [Environment Setup](#environment-setup)
3. [Finding Your First Issue](#finding-your-first-issue)
4. [Making Your First Contribution](#making-your-first-contribution)
5. [Testing Your Changes](#testing-your-changes)
6. [Submitting a Pull Request](#submitting-a-pull-request)
7. [After Your PR is Submitted](#after-your-pr-is-submitted)
8. [Getting Help](#getting-help)

---

## Before You Start

### What is Soroban Loyalty?

Soroban Loyalty is a blockchain-based loyalty rewards platform built on the Stellar network using Soroban smart contracts. The project consists of:

- **Smart Contracts** (Rust): Token, Campaign, and Rewards contracts
- **Backend** (Node.js/TypeScript): API server and blockchain event indexer
- **Frontend** (Next.js/React): User interface for merchants and customers
- **Database** (PostgreSQL): Off-chain data storage

### Prerequisites Knowledge

While we welcome contributors of all skill levels, familiarity with the following will be helpful:

- **For Smart Contracts**: Rust programming, blockchain concepts
- **For Backend**: Node.js, TypeScript, REST APIs
- **For Frontend**: React, Next.js, TypeScript
- **For Documentation**: Markdown, technical writing

Don't worry if you're not an expert in all areas—we have issues labeled for different skill levels!

---

## Environment Setup

### Step 1: Install Required Tools

Follow the detailed setup instructions in the [README.md](../README.md#prerequisites). You'll need:

1. **Rust** (for smart contracts)
   ```bash
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   rustup target add wasm32-unknown-unknown
   ```

2. **Stellar CLI** (for contract deployment)
   ```bash
   # macOS
   brew install stellar-cli
   
   # Linux
   cargo install --locked stellar-cli
   ```

3. **Docker & Docker Compose** (for local development)
   - Download from [docker.com](https://docs.docker.com/get-docker/)

4. **Node.js 20+** (for backend and frontend)
   ```bash
   # macOS
   brew install node@20
   
   # Linux (using nvm)
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
   nvm install 20
   ```

5. **Git** (for version control)
   ```bash
   # macOS
   brew install git
   
   # Linux
   sudo apt-get install git
   ```

### Step 2: Fork and Clone the Repository

1. **Fork the repository** on GitHub:
   - Navigate to [github.com/your-org/soroban-loyalty](https://github.com/your-org/soroban-loyalty)
   - Click the "Fork" button in the top-right corner
   - This creates a copy of the repository under your GitHub account

2. **Clone your fork** to your local machine:
   ```bash
   git clone https://github.com/YOUR-USERNAME/soroban-loyalty.git
   cd soroban-loyalty
   ```

3. **Add the upstream remote** (to keep your fork in sync):
   ```bash
   git remote add upstream https://github.com/your-org/soroban-loyalty.git
   git remote -v  # Verify remotes are set up correctly
   ```

### Step 3: Set Up Environment Variables

```bash
cp .env.example .env
```

Edit `.env` with your preferred text editor and configure the necessary variables. The defaults work for local development.

### Step 4: Start the Development Environment

**Option A: Using Docker (Recommended for beginners)**

```bash
docker-compose up --build
```

This starts all services:
- Soroban local node: `http://localhost:8000`
- Backend API: `http://localhost:3001`
- Frontend: `http://localhost:3000`
- PostgreSQL: `localhost:5432`

**Option B: Running Services Individually**

If you prefer to run services separately (useful when working on specific components):

```bash
# Terminal 1: Start PostgreSQL
docker-compose up postgres -d

# Terminal 2: Start Backend
cd backend
npm install
npm run dev

# Terminal 3: Start Frontend
cd frontend
npm install
npm run dev
```

### Step 5: Verify Your Setup

1. **Check the frontend**: Open [http://localhost:3000](http://localhost:3000) in your browser
2. **Check the backend**: Visit [http://localhost:3001/health](http://localhost:3001/health)
3. **Run tests**: 
   ```bash
   # Test smart contracts
   cargo test
   
   # Test backend (if tests exist)
   cd backend
   npm test
   
   # Test frontend (if tests exist)
   cd frontend
   npm test
   ```

If everything works, you're ready to start contributing! 🎉

---

## Finding Your First Issue

### Good First Issues

We label beginner-friendly issues with `good first issue`. These are:
- Well-defined with clear acceptance criteria
- Relatively small in scope
- Don't require deep knowledge of the entire codebase
- Have helpful context and guidance

### How to Find Issues

1. **Browse the Issues page**: [github.com/your-org/soroban-loyalty/issues](https://github.com/your-org/soroban-loyalty/issues)

2. **Filter by label**:
   - `good first issue` - Perfect for newcomers
   - `documentation` - Writing or improving docs
   - `bug` - Fixing broken functionality
   - `enhancement` - Adding new features
   - `frontend` - React/Next.js work
   - `backend` - Node.js/API work
   - `smart-contracts` - Rust/Soroban work

3. **Use GitHub's filter syntax**:
   ```
   is:issue is:open label:"good first issue"
   ```

### Claiming an Issue

Before starting work:

1. **Read the issue carefully** - Make sure you understand the requirements
2. **Check if it's already assigned** - Look for "Assignees" on the right sidebar
3. **Comment on the issue** - Say something like:
   ```
   Hi! I'd like to work on this issue. Is it still available?
   ```
4. **Wait for confirmation** - A maintainer will assign it to you or provide guidance

**Pro tip**: Don't work on multiple issues simultaneously until you've completed your first contribution.

---

## Making Your First Contribution

### Step 1: Sync Your Fork

Before starting work, make sure your fork is up to date:

```bash
# Fetch the latest changes from upstream
git fetch upstream

# Switch to your main branch
git checkout main

# Merge upstream changes
git merge upstream/main

# Push updates to your fork
git push origin main
```

### Step 2: Create a Feature Branch

**Always** create a new branch for your work. Never commit directly to `main`.

```bash
# Create and switch to a new branch
git checkout -b feature/your-feature-name-issue-number

# Examples:
git checkout -b feature/add-user-guide-96
git checkout -b fix/responsive-layout-30
git checkout -b docs/onboarding-guide-367
```

**Branch naming conventions**:
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `refactor/` - Code refactoring
- Always include the issue number at the end

### Step 3: Make Your Changes

Now you can start coding! Here are some tips:

**For Smart Contracts (Rust)**:
- Follow Rust naming conventions (snake_case for functions)
- Add tests for new functionality
- Run `cargo fmt` to format your code
- Run `cargo clippy` to catch common mistakes

**For Backend (TypeScript)**:
- Follow existing code style
- Add JSDoc comments for functions
- Update API documentation if you change endpoints
- Test your changes with Postman or curl

**For Frontend (React/TypeScript)**:
- Use functional components with hooks
- Follow the existing component structure
- Ensure responsive design (mobile, tablet, desktop)
- Test in multiple browsers if possible

**For Documentation**:
- Use clear, concise language
- Include code examples where helpful
- Check spelling and grammar
- Follow the existing documentation structure

### Step 4: Commit Your Changes

Make small, focused commits with clear messages:

```bash
# Stage your changes
git add path/to/changed/files

# Or stage all changes (use carefully)
git add .

# Commit with a descriptive message
git commit -m "Add onboarding guide for new contributors

- Create docs/onboarding.md with step-by-step guide
- Cover environment setup, finding issues, and PR process
- Include examples and troubleshooting tips

Closes #367"
```

**Good commit message format**:
```
Short summary (50 chars or less)

More detailed explanation if needed. Wrap at 72 characters.
Explain what changed and why, not how.

- Use bullet points for multiple changes
- Reference issue numbers

Closes #123
```

**Pro tips**:
- Write commit messages in the imperative mood ("Add feature" not "Added feature")
- First line should be a summary, followed by a blank line
- Include `Closes #issue-number` to auto-close the issue when merged

---

## Testing Your Changes

Before submitting your PR, thoroughly test your changes:

### For Smart Contracts

```bash
# Run all contract tests
cargo test

# Run tests for a specific contract
cargo test -p soroban-loyalty-token
cargo test -p soroban-loyalty-campaign
cargo test -p soroban-loyalty-rewards

# Run with verbose output
cargo test -- --nocapture
```

### For Backend

```bash
cd backend

# Run tests (if available)
npm test

# Start the server and test manually
npm run dev

# Test API endpoints
curl http://localhost:3001/health
curl http://localhost:3001/campaigns
```

### For Frontend

```bash
cd frontend

# Run tests (if available)
npm test

# Start development server
npm run dev

# Test in browser at http://localhost:3000
# Test responsive design using browser DevTools
```

### Manual Testing Checklist

- [ ] Code builds without errors
- [ ] All tests pass
- [ ] New functionality works as expected
- [ ] Existing functionality still works (no regressions)
- [ ] Responsive design works on mobile, tablet, and desktop (for frontend)
- [ ] No console errors or warnings
- [ ] Code follows project style guidelines

---

## Submitting a Pull Request

### Step 1: Push Your Branch

```bash
# Push your branch to your fork
git push origin feature/your-feature-name-issue-number

# If this is your first push of this branch
git push -u origin feature/your-feature-name-issue-number
```

### Step 2: Create the Pull Request

1. **Go to GitHub**: Navigate to your fork on GitHub
2. **Click "Compare & pull request"**: GitHub usually shows this button after you push
3. **Fill out the PR template**:

   **Title**: Use a clear, descriptive title
   ```
   Add onboarding guide for new contributors
   ```

   **Description**: Explain what you changed and why
   ```markdown
   ## Description
   This PR adds a comprehensive onboarding guide for new contributors.

   ## Changes
   - Created `docs/onboarding.md` with step-by-step instructions
   - Covers environment setup, finding issues, and PR workflow
   - Added troubleshooting section for common issues
   - Updated `CONTRIBUTING.md` to link to the new guide

   ## Testing
   - Followed the guide on a fresh macOS machine
   - Verified all commands work as expected
   - Tested links and formatting

   ## Screenshots (if applicable)
   N/A - Documentation only

   Closes #367
   ```

4. **Select reviewers**: If you know who should review, request them
5. **Add labels**: Add relevant labels (e.g., `documentation`, `good first issue`)
6. **Link the issue**: Make sure your description includes `Closes #367`

### Step 3: Respond to Feedback

Maintainers will review your PR and may request changes:

1. **Read feedback carefully** - Understand what's being asked
2. **Ask questions** - If something is unclear, ask for clarification
3. **Make requested changes**:
   ```bash
   # Make your changes
   git add .
   git commit -m "Address review feedback"
   git push origin feature/your-feature-name-issue-number
   ```
4. **Respond to comments** - Let reviewers know you've addressed their feedback
5. **Be patient and respectful** - Reviews take time, and feedback helps improve the project

### Common Review Feedback

- **Code style issues**: Run formatters (`cargo fmt`, `npm run lint`)
- **Missing tests**: Add tests for new functionality
- **Documentation**: Add or update comments and docs
- **Breaking changes**: Ensure backward compatibility
- **Performance**: Optimize inefficient code

---

## After Your PR is Submitted

### What Happens Next?

1. **Automated checks run**: CI/CD pipelines test your code
2. **Maintainers review**: Usually within 1-3 days
3. **You address feedback**: Make any requested changes
4. **PR is approved**: Maintainer approves your changes
5. **PR is merged**: Your code becomes part of the project! 🎉

### After Your PR is Merged

1. **Sync your fork**:
   ```bash
   git checkout main
   git fetch upstream
   git merge upstream/main
   git push origin main
   ```

2. **Delete your feature branch** (optional but recommended):
   ```bash
   # Delete local branch
   git branch -d feature/your-feature-name-issue-number
   
   # Delete remote branch
   git push origin --delete feature/your-feature-name-issue-number
   ```

3. **Celebrate!** 🎊 You're now a contributor to Soroban Loyalty!

### Your Contribution is Recognized

- Your name appears in the commit history
- You're listed as a contributor on GitHub
- You've helped improve an open-source project!

---

## Getting Help

### Common Issues and Solutions

#### Issue: "Permission denied" when pushing

**Solution**: Make sure you're pushing to your fork, not the upstream repository:
```bash
git remote -v  # Check your remotes
git push origin feature/your-branch  # Push to your fork
```

#### Issue: "Merge conflicts"

**Solution**: Sync your branch with the latest main:
```bash
git fetch upstream
git merge upstream/main
# Resolve conflicts in your editor
git add .
git commit -m "Resolve merge conflicts"
git push origin feature/your-branch
```

#### Issue: "Tests failing locally"

**Solution**: Make sure your environment is set up correctly:
```bash
# For Rust
cargo clean
cargo test

# For Node.js
rm -rf node_modules
npm install
npm test
```

#### Issue: "Docker containers won't start"

**Solution**: 
```bash
# Stop all containers
docker-compose down

# Remove volumes and restart
docker-compose down -v
docker-compose up --build
```

### Where to Ask Questions

1. **GitHub Issues**: Comment on the issue you're working on
2. **GitHub Discussions**: For general questions about the project
3. **Pull Request Comments**: For questions about your specific PR
4. **Discord/Slack**: If the project has a community chat (check README)

### Resources

- **Project README**: [README.md](../README.md) - Setup and architecture
- **API Documentation**: Check `backend/src/routes/` for endpoint details
- **Smart Contract Docs**: See inline comments in `contracts/*/src/lib.rs`
- **Stellar Documentation**: [developers.stellar.org](https://developers.stellar.org/)
- **Soroban Documentation**: [soroban.stellar.org](https://soroban.stellar.org/)

---

## Best Practices for Contributors

### Do's ✅

- **Do** read the issue carefully before starting
- **Do** ask questions if something is unclear
- **Do** write tests for your code
- **Do** follow the existing code style
- **Do** make small, focused commits
- **Do** update documentation when needed
- **Do** be patient and respectful in discussions
- **Do** test your changes thoroughly

### Don'ts ❌

- **Don't** work on issues that are already assigned
- **Don't** commit directly to the main branch
- **Don't** submit PRs without testing
- **Don't** include unrelated changes in your PR
- **Don't** force push after a PR is under review (unless requested)
- **Don't** take feedback personally—it's about the code, not you

---

## Next Steps

Now that you've completed your first contribution, consider:

1. **Take on more complex issues** - Build on your experience
2. **Help review other PRs** - Share your knowledge
3. **Improve documentation** - Help future contributors
4. **Participate in discussions** - Share ideas for new features
5. **Become a regular contributor** - Join the core team!

---

## Thank You!

Thank you for contributing to Soroban Loyalty! Every contribution, no matter how small, helps make this project better. We're excited to have you as part of our community.

Happy coding! 🚀

---

**Questions?** Open an issue or reach out to the maintainers. We're here to help!

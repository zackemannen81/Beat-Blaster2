# Contributing to Beat Blaster 2

We love receiving contributions from the community and are thrilled that you're interested in making Beat Blaster 2 even better. To ensure a smooth and collaborative process, we've established a few guidelines that we ask you to follow.

## Code of Conduct

To maintain a welcoming and inclusive environment, we expect all contributors to adhere to our [Code of Conduct](CODE_OF_CONDUCT.md). Please take a moment to read it before you begin.

## How to Contribute

There are many ways to contribute to Beat Blaster 2, and we appreciate them all:

- **Reporting Bugs:** If you encounter a bug, please [open an issue](https://github.com/zackemannen81/Beat-Blaster2/issues) and provide a detailed description, including steps to reproduce it.
- **Suggesting Enhancements:** Have an idea for a new feature or an improvement to an existing one? We'd love to hear it! [Open an issue](https://github.com/zackemannen81/Beat-Blaster2/issues) to share your thoughts.
- **Submitting Pull Requests:** If you're ready to contribute code, you can submit a pull request. Here's how:

    1. **Fork the Repository:** Create your own copy of the repository to work on.
    2. **Create a Branch:** Make a new branch for your changes, giving it a descriptive name (e.g., `feature/new-power-up` or `fix/player-collision-bug`).
    3. **Make Your Changes:** Write your code and add or update tests as needed.
    4. **Commit Your Changes:** Use clear and concise commit messages that explain the purpose of your changes.
    5. **Push to Your Branch:** Push your changes to your forked repository.
    6. **Open a Pull Request:** Submit a pull request to the `main` branch of the main repository. Provide a detailed description of your changes and any relevant information.

## Coding Style

To maintain consistency throughout the codebase, we follow a specific coding style. Before submitting a pull request, please ensure your code adheres to our style guidelines. You can check your code by running the linter:

```bash
npm run lint
```

## Worktree Workflow

To avoid stepping on each other's tasks, we use two Git worktrees per contributor:

- **Implementation worktree:** your feature branch lives here. All gameplay/editor changes are developed in this checkout.
- **Coordination worktree:** a separate checkout that stays on `main`. Use it to update `docs/dev-journal.md`, task status notes, or other coordination artifacts, then commit and push immediately so the whole team sees progress.

### Setup

```bash
git worktree add ../bb2-main main   # creates ../bb2-main pointing at main
```

### Daily flow

1. **Log progress first:** in the `main` worktree (`../bb2-main`), update the journal/task files and commit + push. Example:
   ```bash
   cd ../bb2-main
   git pull --ff-only
   # edit docs/dev-journal.md, tasks/... as needed
   git add docs/dev-journal.md tasks/
   git commit -m "chore: log GAMEPLAY-001 progress"
   git push origin main
   ```
2. **Implement features:** switch back to your feature worktree, create or update your feature branch, and continue development with confidence no one will miss your status updates.
3. **Sync often:** run `git fetch` in both worktrees so `main` stays current before logging new work.

This workflow keeps status updates visible on `main` while isolating feature development, reducing cross-task interference.

## Questions and Support

If you have any questions or need help with the contribution process, feel free to reach out to us by [opening an issue](https://github.com/zackemannen81/Beat-Blaster2/issues).

Thank you for your interest in contributing to Beat Blaster 2! We look forward to your contributions.

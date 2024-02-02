# Contributing Guidelines

## Introduction

This document outlines the process and guidelines for contributing. As this is a private project, contributions are limited to members within the organization, and no external contributions will be accepted.

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Branching Strategy](#branching-strategy)
3. [Pull Request Process](#pull-request-process)
4. [Code Review Guidelines](#code-review-guidelines)
5. [Commit Message Conventions](#commit-message-conventions)
6. [Issue Tracking](#issue-tracking)
7. [License](#license)

## Code of Conduct

All contributors are expected to adhere to the [Code of Conduct](CODE_OF_CONDUCT.md). Make sure to read and follow these guidelines during your interactions within the project.

## Branching Strategy

We follow a branching strategy with the following branch naming conventions:

- Feature branches: `feature#<task-id> - <task-name>`
- Bugfix branches: `bugfix#<task-id> - <task-name>`
- Hotfix branches: `hotfix#<task-id> - <task-name>`

## Pull Request Process

### Raising a Pull Request

1. **Clone the Repository**
   - Clone the repository to your local machine.
     ```bash
     git clone https://github.com/organization-name/your-repo.git
     ```

2. **Create a New Branch**
   - Create a new branch for your feature, bugfix, or hotfix.
     ```bash
     git checkout -b feature#<task-id> - <task-name>
     ```

3. **Make Changes and Commit**
   - Make your changes and commit them with a descriptive commit message.
     ```bash
     git commit -m "feature#<task-id>: Your descriptive commit message"
     ```

4. **Push Changes to the Repository**
   - Push your changes to the repository.
     ```bash
     git push origin feature#<task-id> - <task-name>
     ```

5. **Open a Pull Request to `develop`**
   - Navigate to the repository on GitHub.
   - Switch to the branch you just created.
   - Click on "New Pull Request."
   - Select the `develop` branch as the base branch.
   - Provide a clear title and description for your pull request.

6. **Code Review**
   - Await code review from team members.
   - Address any feedback or comments from reviewers promptly.

7. **Merge into `develop`**
   - After approval, the pull request will be merged into the `develop` branch.

### Merging into `main` (Release Process)

1. **Create a Pull Request to `main` from a Feature Branch**
   - Create a pull request from the feature branch to the `main` branch.
   - Ensure that the feature branch has been thoroughly reviewed and tested successfully.

2. **Code Review for `main`**
   - Await code review for the pull request against the `main` branch.
   - Address any feedback or comments from reviewers promptly.

3. **Merge into `main`**
   - After approval, the pull request will be merged into the `main` branch, marking a new release.

## Code Review Guidelines

- All changes must pass code review before being merged.
- Ensure your code is well-documented and follows coding standards.
- Address any feedback or comments from reviewers promptly.

## Commit Message Conventions

Follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) specification for commit messages.

## Issue Tracking

- Create issues for new features, bug fixes, or any enhancements.
- Reference the issue number in your branch name, commit messages, and pull request.

## License

By contributing to this project, you agree that your contributions will be licensed under the [LICENSE](LICENSE) of the project.

# Contributing Guidelines


## Introduction


This document outlines the process and guidelines for contributing.


## Table of Contents


1. [Code of Conduct](#code-of-conduct)
2. [Pull Request Process](#pull-request-process)
3. [Code Review Guidelines](#code-review-guidelines)
4. [Commit Message Conventions](#commit-message-conventions)
5. [License](#license)


## Code of Conduct


All contributors are expected to adhere to the [Code of Conduct](CODE_OF_CONDUCT.md). Make sure to read and follow these guidelines during your interactions within the project.




## Guidelines for open source contribution


### Pull Request Process
1. **Fork the repository**
   - This to be used for adding new features or bug fixes




2. **Clone the Repository**
   - Clone the repository to your local machine from the forked Repo.
     ```bash
     git clone https://github.com/account-name/your-repo.git
     ```


3.  **Create a New Branch**
   - Create a new branch for your feature, bugfix.
   - Branching Strategy:
      - Feature branches: `feature#<feature-name>`
      - Bugfix branches: `bugfix#<bug-name>`
   - Once your feature is ready and tested thoroughly, prepare it to create a Pull request




4. **IMPORTANT :- Before creating a Pull Request**
   - Create a local build for React.js code using the build command in the Frontend directory using the proper env variables. Refer sample env for same
      ```
       npm run build
      ```
   - script is configured by default in the package.json file.  
   - This step is only for Frontend changes.  


5. **Push the changes / New features to the forked repository**
   - Once your Build is generated, create a pull request.
   - Push your local feature/Bugfix branch to your repo.


6. **Create a pull request and add details about the features in PR**
   - On your github account create a Pull request with the main branch.
   - In the PR message add all the required information about the feature/bugfix and raise a PR with parent repo.


## Code Review Guidelines

- All changes must pass code review before being merged for contribution.
- Ensure your code is well-documented and follows coding standards.
- Address any feedback or comments from reviewers promptly.


## Commit Message Conventions


Follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) specification for commit messages.


## License


By contributing to this project, you agree that your contributions will be licensed under the [LICENSE](LICENSE) of the project.



# NerdyBuddy

## Overview

**NerdyBuddy** is a SaaS project designed to enhance policy improvement processes through Animation, Business Process Documentation (BPD), and AI.

## Technology Stack

- **Backends**:
  - **FastAPI** (AI services)
  - **Node.js with Express** (Portal)
- **Database**: PostgreSQL

## Key Features

- **Animated Educational Content**
- **Centralized Document Management**
- **AI-driven Document Analysis and Feedback**
- **Customized Training Programs**

## Getting Started

### FastAPI

1. Navigate to the FastAPI directory:
   ```bash
   cd src/ai
    python -m venv venv
    source venv/bin/activate  # On MacOS Linux
    venv\Scripts\activate     # On Windows
    pip install -r requirements.txt
    uvicorn src.ai.main:app --reload
   ```

### Node.js

1. Navigate to the Portal directory:

```bash
  cd src/portal
  npm install
  npx nodemon src/main.js
```


### Feature Branches

Used to develop new features or major changes. They are based on the dev branch and merged back after the work is done.

Pattern: feature/{short-description}
Examples:
feature/login-authentication
feature/user-profile
feature/api-refactor


### Bugfix Branches
Used to fix bugs during development or for post-release issues. These branches are typically created from dev or stage.

Pattern: bugfix/{short-description}
Examples:
bugfix/fix-typo-dashboard
bugfix/login-issue
bugfix/api-error-handling


### Hotfix Branches
For critical fixes that need to go directly into production. These are created from master and then merged back to master, stage, and dev.

Pattern: hotfix/{short-description}
Examples:
hotfix/security-patch
hotfix/payment-fix

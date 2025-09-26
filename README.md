# Restaurant Management System

## Overview

**Restaurant Management System** is a comprehensive SaaS platform designed to manage restaurants, menus, and their operations. The system supports multi-tenant architecture with restaurant chains, branches, and detailed menu management.

## Technology Stack

- **Backend**: Node.js with Express and TypeScript
- **Database**: PostgreSQL with TypeORM
- **Authentication**: JWT-based authentication
- **File Storage**: AWS S3 integration
- **Queue System**: BullMQ for background jobs
- **Email**: Nodemailer integration

## Key Features

- **Restaurant Management**
  - Create parent restaurants and branches
  - Multi-tenant architecture
  - Restaurant hierarchy support
- **Menu Management**
  - Multiple menu types (Main, Breakfast, Lunch, etc.)
  - Menu status management (Active, Draft, Archived)
  - Menu duplication and versioning
- **Menu Modifiers**
  - Customizable modifiers for menu items
  - Pricing and description management
  - Required/optional modifier settings
- **User Management**
  - Role-based access control
  - Tenant isolation
  - User analytics and reporting
- **File Management**
  - Image upload and processing
  - Document management
  - AWS S3 integration

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- Redis (for queue management)
- AWS S3 account (for file storage)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd restaurant
   ```

2. Navigate to the portal directory:
   ```bash
   cd portal
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your database and AWS credentials
   ```

5. Start the development server:
   ```bash
   npm run dev
   # or
   npx nodemon --exec ts-node src/app.ts
   ```

### Database Setup

The application uses TypeORM with PostgreSQL. Database tables will be created automatically when you start the application.

### API Documentation

The API endpoints are organized as follows:

- **Restaurants**: `/api/restaurant/*`
- **Menus**: `/api/menu/*`
- **Menu Modifiers**: `/api/menu-modifier/*`
- **Users**: `/api/users/*`
- **Authentication**: `/api/auth/*`


## Project Structure

```
portal/
├── src/
│   ├── config/          # Database and Redis configuration
│   ├── controllers/     # API controllers
│   ├── entity/          # TypeORM entities
│   ├── helper/          # Utility functions
│   ├── middlewares/     # Authentication and permission middlewares
│   ├── queues/          # Background job processing
│   ├── routes/          # API routes
│   ├── services/        # Business logic services
│   ├── types/           # TypeScript type definitions
│   └── utils/           # Utility functions
├── package.json
└── tsconfig.json
```

## API Endpoints

### Restaurant Management
- `POST /api/restaurant/create` - Create parent restaurant
- `POST /api/restaurant/create-branch` - Create restaurant branch
- `GET /api/restaurant/` - Get all restaurants
- `GET /api/restaurant/:id` - Get restaurant by ID
- `GET /api/restaurant/:parentId/branches` - Get restaurant branches
- `PUT /api/restaurant/:id` - Update restaurant
- `DELETE /api/restaurant/:id` - Delete restaurant

### Menu Management
- `POST /api/menu/create` - Create menu
- `GET /api/menu/` - Get all menus
- `GET /api/menu/:id` - Get menu by ID
- `GET /api/menu/restaurant/:restaurantId` - Get menus by restaurant
- `PUT /api/menu/:id` - Update menu
- `DELETE /api/menu/:id` - Delete menu

### Menu Modifier Management
- `POST /api/menu-modifier/create` - Create menu modifier
- `GET /api/menu-modifier/` - Get all modifiers
- `GET /api/menu-modifier/:id` - Get modifier by ID
- `GET /api/menu-modifier/menu-item/:menuItemId` - Get modifiers by menu
- `PUT /api/menu-modifier/:id` - Update modifier
- `DELETE /api/menu-modifier/:id` - Delete modifier

## Development Workflow

### Feature Branches
Used to develop new features or major changes. They are based on the dev branch and merged back after the work is done.

Pattern: `feature/{short-description}`
Examples:
- `feature/restaurant-analytics`
- `feature/menu-import-export`
- `feature/payment-integration`

### Bugfix Branches
Used to fix bugs during development or for post-release issues. These branches are typically created from dev or stage.

Pattern: `bugfix/{short-description}`
Examples:
- `bugfix/restaurant-deletion-issue`
- `bugfix/menu-validation-error`
- `bugfix/authentication-bug`

### Hotfix Branches
For critical fixes that need to go directly into production. These are created from master and then merged back to master, stage, and dev.

Pattern: `hotfix/{short-description}`
Examples:
- `hotfix/security-patch`
- `hotfix/database-connection-fix`
- `hotfix/critical-api-fix`

# Bluethub Monorepo

A modern monorepo for the bluethub application, managed with Turborepo and pnpm.

## 🏗️ Architecture

This monorepo contains:

- **`apps/web`** - React frontend application with Vite
- **`apps/landing`** - Marketing landing page with React and Vite
- **`packages/typescript-config`** - Shared TypeScript configurations
- **`packages/eslint-config`** - Shared ESLint configurations

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ (recommended)
- pnpm 8+

### Installation

```bash
# Install dependencies
pnpm install
```

### Development

```bash
# Run all apps in development mode
pnpm dev

# Run specific apps
pnpm web:dev      # Web app only
pnpm landing:dev  # Landing page only
```

### Building

```bash
# Build all apps
pnpm build

# Build specific app
pnpm turbo build --filter=@bluethub/web
pnpm turbo build --filter=@bluethub/landing
```

### Other Commands

```bash
# Lint all packages
pnpm lint

# Type check all packages
pnpm type-check

# Clean all build artifacts
pnpm clean

# Format code
pnpm format
```

## 📁 Project Structure

```
bluethub/
├── apps/
│   ├── api/                 # API server
│   │   ├── src/
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── web/                 # React web app
│   │   ├── src/
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── landing/             # Landing page
│       ├── src/
│       ├── package.json
│       └── tsconfig.json
├── packages/
│   ├── typescript-config/   # Shared TypeScript configs
│   └── eslint-config/       # Shared ESLint configs
├── package.json             # Root package.json
├── turbo.json              # Turborepo configuration
├── pnpm-workspace.yaml     # pnpm workspace configuration
└── .npmrc                  # pnpm configuration
```

## 🔧 Configuration

### Turborepo

The monorepo uses Turborepo for task orchestration and caching. Configuration is in `turbo.json`.

### pnpm Workspaces

Workspaces are defined in `pnpm-workspace.yaml` and include all `apps/*` and `packages/*` directories.

### TypeScript

Shared TypeScript configurations are available:

- `@bluethub/typescript-config/base.json` - Base configuration
- `@bluethub/typescript-config/node.json` - Node.js configuration
- `@bluethub/typescript-config/react-library.json` - React configuration

### ESLint

Shared ESLint configuration is available as `@bluethub/eslint-config`.

## 📦 Shared Packages

### @bluethub/shared

Contains shared types and utilities:

```typescript
import { User, ApiResponse, API_ENDPOINTS } from "@bluethub/shared";
```

Available exports:

## 🌐 Applications

### Web App (`apps/web`)

- **Framework**: React with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **Port**: 5173

### Landing Page (`apps/landing`)

- **Framework**: React with TypeScript
- **Build Tool**: Vite
- **Port**: 3001

## 🔄 Development Workflow

1. Make changes in any app or package
2. Use `pnpm dev` to run all apps in development mode
3. Use `pnpm build` to build all apps
4. Use `pnpm lint` to check code quality
5. Use `pnpm type-check` to validate TypeScript types

## 🚀 Deployment

Each app can be deployed independently:

```bash
# Build specific app for production
pnpm turbo build --filter=@bluethub/api
pnpm turbo build --filter=@bluethub/web
pnpm turbo build --filter=@bluethub/landing
```

## 📝 Scripts

### Root Scripts

- `pnpm dev` - Start all apps in development mode
- `pnpm build` - Build all apps
- `pnpm lint` - Lint all packages
- `pnpm type-check` - Type check all packages
- `pnpm clean` - Clean build artifacts
- `pnpm format` - Format code with Prettier

### App-specific Scripts

- `pnpm web:dev` - Start web app only
- `pnpm landing:dev` - Start landing page only

## 🤝 Contributing

1. Make changes in the appropriate app or package
2. Ensure all builds pass: `pnpm build`
3. Ensure linting passes: `pnpm lint`
4. Ensure type checking passes: `pnpm type-check`
5. Commit your changes

## 📄 License

This project is private and proprietary.

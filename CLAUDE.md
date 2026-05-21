# CLAUDE.md - AI Agent Guidelines

This file guides AI agents (like Claude Code) on build commands, code style, and architectural patterns of this GAS Monorepo repository.

## 🚀 Build and Development Commands

All active development is parameterized by project name. Use the following commands:

### 1. Build Orchestration
- **Build a project**: `PROJECT=<project-name> FRONTEND=<vue|vanilla> node scripts/build.js`
  *(e.g., `PROJECT=sample-vue FRONTEND=vue node scripts/build.js`)*
- **Clean output**: Handled automatically by the build script, but manually: `PROJECT=<project-name> node -e "const fs=require('fs'); fs.rmSync('./projects/' + process.env.PROJECT + '/dist', {recursive:true, force:true})"`

### 2. Local Development Server
- **Vue Dev Server**: `PROJECT=<project-name> FRONTEND=vue npm run dev:vue`
- **Vanilla Dev Server**: `PROJECT=<project-name> FRONTEND=vanilla npm run dev:vanilla`

### 3. Testing and Code Quality
- **Run all unit tests**: `npm run test`
- **Typecheck code**: `npm run typecheck` (Checks all projects and shared libraries under ES2019 settings)
- **Format code**: `npm run format` (Prettier)

---

## 📂 Repository Structure

```text
.
├── src/
│   └── shared/                  # Shared utility code
│       └── backend/             # Shared GAS Backend (DI, Logger, Mail, Repositories, API client)
│           ├── core/
│           ├── api/             # GAS Web App API Client (api.ts)
│           ├── services/
│           └── repositories/
├── projects/                    # Independent GAS Projects (Up to 50+)
│   ├── <project-name>/
│   │   ├── src/
│   │   │   ├── backend/         # Project entrypoint index.ts & business logic
│   │   │   └── frontend/        # Vue / Vanilla frontend files
│   │   ├── appsscript.json      # GAS Project Manifest
│   │   ├── .clasp.json          # clasp deployment link
│   │   └── dist/                # Output of esbuild & vite bundles (target of clasp push)
├── package.json                 # Single centralized package.json (Shared dependencies)
├── tsconfig.json                # Parameterized TS compiler config (Targets ES2019!)
├── esbuild.js                   # Common esbuild engine
└── vite.config.ts               # Common Vite bundler
```

---

## 🎨 Coding and Architectural Rules

1. **ES2019 Compliance (CRITICAL)**:
   - Always target **`ES2019`** compilation output. GAS's V8 engine cannot correctly evaluate newer compiled JS class formats containing modern private variables/member initializers.
   - Do not use modern JS classes' private properties (`#property`) unless compiling to ES2019.

2. **Imports & Code Sharing**:
   - Small projects must import shared backend helpers from `src/shared/backend/` using relative imports (e.g. `import { LoggerService } from "../../../../src/shared/backend/services/LoggerService"`).
   - Keep project folders lightweight: they should NOT contain local `package.json`, `tsconfig.json`, or `node_modules` folders.

3. **Backend Structure**:
   - Use the **DI Container** (`src/shared/backend/core/container.ts`) to wire up dependencies.
   - Database operations must inherit from `IRepository<T>` and use `SheetRepository<T>` for Google Sheet database interactions.
   - Write logs via `LoggerService` to maintain standardized, clean log formats.

4. **Frontend Structure**:
   - Bundle all CSS (Tailwind/Custom) and Javascript directly into a single file (`vite-plugin-singlefile`) so it can be served cleanly in Apps Script's `HtmlService`.

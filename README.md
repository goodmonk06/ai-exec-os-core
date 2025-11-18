# ai-exec-os-core

会社全体のタスク・プロジェクト・エージェントを束ねるAI OS中枢バックエンド。ワークフロー定義・ジョブキュー・マルチエージェント実行のコア。

## Overview

**ai-exec-os-core** is a central orchestration backend for managing AI agents, workflows, and job execution across your organization. It provides a robust foundation for:

- **Agent Management** - Define and configure multiple AI agents (GPT-4, Claude, etc.)
- **Workflow Orchestration** - Create multi-step workflows with dependencies
- **Job Queue** - BullMQ-powered job processing with Redis
- **Execution Tracking** - Complete job history and logs
- **Scalable Architecture** - Designed for production use with Docker support

## Tech Stack

- **Runtime**: Node.js 20+
- **Language**: TypeScript
- **Web Framework**: Fastify
- **Database**: PostgreSQL + Prisma ORM
- **Job Queue**: BullMQ + Redis
- **Validation**: Zod
- **Testing**: Vitest
- **Containerization**: Docker & Docker Compose

## Domain Model

### Core Entities

```
Agent
├─ id: string
├─ name: string
├─ model: string (e.g., "gpt-4", "claude-sonnet-4")
├─ tools: json (available capabilities)
└─ config: json (model parameters)

Workflow
├─ id: string
├─ name: string
├─ definition: json (steps, dependencies, config)
└─ jobs: Job[]

Job
├─ id: string
├─ workflowId: string
├─ status: pending | running | succeeded | failed
├─ input: json
├─ output: json
├─ error: json
└─ logs: JobLog[]

JobLog
├─ id: string
├─ jobId: string
├─ level: info | warn | error | debug
├─ message: string
└─ meta: json
```

### Relationships

- A **Workflow** contains a definition with multiple steps
- Each step can reference an **Agent**
- Triggering a **Workflow** creates a **Job**
- **Jobs** are processed by BullMQ workers
- **JobLogs** capture execution details

## Getting Started

### Requirements

- Node.js 20+
- Docker & Docker Compose
- `curl` and `jq` (for E2E testing)

### Setup

#### 1. Clone and Install

```bash
git clone <your-repo-url>
cd ai-exec-os-core
npm install
```

#### 2. Environment Setup

```bash
cp .env.example .env
# Edit .env with your configuration
```

Example `.env` for local development:

```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ai_exec_os
REDIS_URL=redis://localhost:6379
```

#### 3. Start Infrastructure

**Option A: Development (Infrastructure Only)**

```bash
# Start PostgreSQL and Redis only
docker-compose -f docker-compose.dev.yml up -d
```

**Option B: Full Stack (All Services)**

```bash
# Build and start all services including app
docker-compose up -d --build
```

#### 4. Database Setup

```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run db:migrate

# Seed demo data
npm run db:seed
```

#### 5. Run Development Server

**If using Option A (infrastructure only):**

```bash
npm run dev
```

**If using Option B (full stack):**

Server is already running in Docker at `http://localhost:3000`

### Verify Installation

```bash
# Health check
curl http://localhost:3000/health

# List seeded agents
curl http://localhost:3000/agents | jq .

# List seeded workflows
curl http://localhost:3000/workflows | jq .
```

## Example Flow: Vertical Slice

This demonstrates the complete end-to-end workflow:

### 1. Create an Agent

```bash
curl -X POST http://localhost:3000/agents \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Custom Agent",
    "description": "A custom GPT-4 agent",
    "model": "gpt-4",
    "tools": {
      "analysis": true,
      "summarization": true
    },
    "config": {
      "temperature": 0.7,
      "maxTokens": 2000
    }
  }'
```

### 2. Create a Workflow

```bash
curl -X POST http://localhost:3000/workflows \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Analysis Workflow",
    "description": "Analyzes input data",
    "definition": {
      "steps": [
        {
          "id": "analyze",
          "action": "analyzeData",
          "description": "Analyze the input"
        }
      ],
      "config": {
        "timeout": 60000
      }
    }
  }'
```

### 3. Trigger Workflow

```bash
# Replace <workflow-id> with actual ID from step 2
curl -X POST http://localhost:3000/workflows/<workflow-id>/trigger \
  -H "Content-Type: application/json" \
  -d '{
    "input": {
      "data": "Sample data to analyze"
    }
  }'
```

### 4. Check Job Status

```bash
# Replace <job-id> with actual ID from step 3
curl http://localhost:3000/jobs/<job-id> | jq .
```

### Automated E2E Test

Run the complete flow automatically:

```bash
./scripts/test-e2e-flow.sh
```

This script:
1. ✅ Checks server health
2. ✅ Lists agents and workflows
3. ✅ Triggers a workflow
4. ✅ Monitors job execution
5. ✅ Displays logs and results

## API Endpoints

### Agents

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/agents` | Create a new agent |
| `GET` | `/agents` | List all agents |
| `GET` | `/agents/:id` | Get agent by ID |
| `PUT` | `/agents/:id` | Update agent |
| `DELETE` | `/agents/:id` | Delete agent |

### Workflows

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/workflows` | Create a new workflow |
| `GET` | `/workflows` | List all workflows |
| `GET` | `/workflows/:id` | Get workflow by ID |
| `POST` | `/workflows/:id/trigger` | Trigger workflow (creates job) |
| `PUT` | `/workflows/:id` | Update workflow |
| `DELETE` | `/workflows/:id` | Delete workflow |

### Jobs

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/jobs` | List all jobs (filterable by `?workflowId=xxx&status=pending`) |
| `GET` | `/jobs/:id` | Get job by ID with logs |

### Health

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Server health check |

## Development Commands

```bash
# Development
npm run dev              # Start dev server with hot reload
npm run build            # Compile TypeScript
npm start                # Start production server

# Testing
npm test                 # Run tests with Vitest
npm run test:coverage    # Run tests with coverage

# Linting
npm run lint             # Check code quality
npm run lint:fix         # Auto-fix linting issues

# Database
npm run db:migrate       # Run Prisma migrations
npm run db:push          # Push schema changes (dev only)
npm run db:seed          # Seed demo data
npm run db:studio        # Open Prisma Studio GUI
npm run prisma:generate  # Generate Prisma Client
```

## Project Structure

```
ai-exec-os-core/
├── src/
│   ├── config/           # Environment configuration
│   ├── db/               # Prisma client
│   ├── modules/
│   │   ├── agents/       # Agent CRUD + routes
│   │   ├── workflows/    # Workflow CRUD + routes
│   │   └── jobs/         # Job management + BullMQ queue
│   ├── worker/           # BullMQ worker + execution logic
│   ├── __tests__/        # Unit & integration tests
│   └── server.ts         # Fastify server entry point
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── seed.ts           # Demo data seeding
├── scripts/
│   └── test-e2e-flow.sh  # E2E test automation
├── docker-compose.yml    # Production Docker setup
├── docker-compose.dev.yml # Development Docker setup
├── Dockerfile            # App container definition
└── README.md
```

## Demo Credentials & Data

After running `npm run db:seed`, you'll have:

### Agents (3)
- **GPT-4 Analyzer** - Text analysis and summarization
- **Claude Sonnet Researcher** - Research and reporting
- **Code Assistant** - Code review and generation

### Workflows (3)
- **Data Analysis Pipeline** - Multi-step analysis workflow
- **Code Review Workflow** - Code review automation
- **Simple Echo Workflow** - Basic test workflow

### Sample Job
- 1 completed job for the Echo Workflow (for testing)

## Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Watch mode
npm test -- --watch
```

Test coverage includes:
- Agent service CRUD operations
- Workflow service operations
- Worker execution logic
- Mock agent execution

## Docker Production Deployment

```bash
# Build and start all services
docker-compose up -d --build

# View logs
docker-compose logs -f app

# Stop all services
docker-compose down

# Rebuild after code changes
docker-compose up -d --build app
```

The app will be available at `http://localhost:3000`

## Future Extensions

### Short-term
- [ ] Real LLM API integration (OpenAI, Anthropic)
- [ ] Enhanced workflow definition language
- [ ] Conditional branching in workflows
- [ ] Parallel step execution
- [ ] Workflow scheduling (cron-like)

### Medium-term
- [ ] Authentication & authorization (JWT)
- [ ] Multi-tenancy support
- [ ] Webhook notifications
- [ ] Job retry policies & exponential backoff
- [ ] Metrics & monitoring (Prometheus)

### Long-term
- [ ] Web UI for workflow design
- [ ] GraphQL API
- [ ] Agent marketplace
- [ ] Cost tracking & budgeting
- [ ] Human-in-the-loop approvals

## Architecture Notes

### Current Design

- **Monolithic Structure**: Single Node.js process handles API + worker
- **Suitable for**: Development, small-scale production
- **Scales to**: ~1000s of jobs/day

### Production Scaling

For high-volume production:

1. **Separate Worker Process**
   ```bash
   # Run worker independently
   ts-node src/worker/index.ts
   ```

2. **Multiple Workers**
   - Deploy multiple worker instances
   - BullMQ handles distribution automatically

3. **Database Connection Pooling**
   - Configure Prisma connection pool
   - Consider PgBouncer for high concurrency

4. **Redis Clustering**
   - Use Redis Cluster for job queue
   - Enable Redis persistence

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests (`npm test`)
5. Run linter (`npm run lint:fix`)
6. Commit (`git commit -m 'Add amazing feature'`)
7. Push (`git push origin feature/amazing-feature`)
8. Open a Pull Request

## License

MIT

---

**Built with ❤️ for AI workflow orchestration**

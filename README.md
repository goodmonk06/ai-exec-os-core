# ai-exec-os-core

会社全体のタスク・プロジェクト・エージェントを束ねるAI OS中枢バックエンド。ワークフロー定義・ジョブキュー・マルチエージェント実行のコア。

## Tech Stack

Node.js, TypeScript, Fastify/Express, PostgreSQL, Redis, BullMQ

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL
- Redis

### Installation

```bash
# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your database and Redis URLs

# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate
```

### Running the Server

```bash
# Development mode
npm run dev

# Production build
npm run build
npm start
```

Server will start on `http://localhost:3000`

## API Endpoints

### Agents

- `POST /agents` - Create a new agent
- `GET /agents` - List all agents
- `GET /agents/:id` - Get agent by ID
- `PUT /agents/:id` - Update agent
- `DELETE /agents/:id` - Delete agent

### Workflows

- `POST /workflows` - Create a new workflow
- `GET /workflows` - List all workflows
- `GET /workflows/:id` - Get workflow by ID
- `POST /workflows/:id/trigger` - Trigger workflow execution (creates a job)
- `PUT /workflows/:id` - Update workflow
- `DELETE /workflows/:id` - Delete workflow

### Jobs

- `GET /jobs` - List all jobs (with optional filters: ?workflowId=xxx&status=pending)
- `GET /jobs/:id` - Get job by ID with logs

### Health Check

- `GET /health` - Server health check

## Architecture

```
src/
├── config/         # Environment configuration
├── db/             # Prisma client setup
├── modules/
│   ├── agents/     # Agent management
│   ├── workflows/  # Workflow management
│   └── jobs/       # Job & queue management
├── worker/         # BullMQ worker for job execution
└── server.ts       # Fastify server entry point
```

## License

MIT

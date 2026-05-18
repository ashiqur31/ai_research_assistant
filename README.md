# AI Research Assistant

A full-stack AI research workspace that takes a user query, searches the web, extracts structured evidence with OpenAI, evaluates the output, caches finished reports, and presents the result in a readable Next.js dashboard.

The project is split into three runtime pieces:

- Express API for job creation, polling, history, metrics, and server-sent progress events.
- BullMQ worker for Tavily search, OpenAI extraction, deduplication, evaluation, and report generation.
- Next.js frontend for launching research jobs, watching progress, opening cached reports, and viewing report quality metrics.

## Features

- Web research through Tavily Search.
- Structured claim, quote, and statistic extraction with OpenAI.
- JSON cleanup, validation, and normalization for model output.
- Semantic deduplication of repeated findings.
- Citation/source attribution for extracted evidence.
- Quality scoring for citation coverage, diversity, grounding, completeness, and hallucination risk.
- Markdown report generation with a readable frontend renderer.
- Queue-based processing with BullMQ and Redis.
- PostgreSQL-backed report cache through Prisma.
- Redis cache for fast repeat lookups.
- Server-sent events for live pipeline progress.
- Cost and token tracking for extraction and embedding calls.

## Tech Stack

Backend:

- Node.js
- TypeScript
- Express
- BullMQ
- Redis
- PostgreSQL
- Prisma
- OpenAI API
- Tavily Search API
- Pino logger

Frontend:

- Next.js 16
- React 19
- Tailwind CSS 4
- TypeScript

## Project Structure

```text
.
├── frontend/                 # Next.js dashboard
│   ├── app/                  # App Router entry points
│   ├── components/           # UI, research, metrics, and layout components
│   ├── hooks/                # Research, history, metrics, and progress hooks
│   ├── services/             # Frontend API client
│   └── types/                # Frontend TypeScript types
├── prisma/                   # Prisma schema and migrations
├── src/
│   ├── config/               # Env and Redis config
│   ├── controllers/          # Express request handlers
│   ├── queues/               # BullMQ queue setup
│   ├── routes/               # API route definitions
│   ├── services/             # AI, cache, extraction, evaluation, report services
│   ├── tools/                # Tavily integration
│   ├── types/                # Backend data types and schemas
│   ├── utils/                # Parsing, retries, metrics, logging, dedupe helpers
│   └── workers/              # BullMQ research worker
└── README.md
```

## How It Works

```text
User submits query in frontend
  -> Express API validates request and checks PostgreSQL cache
  -> API enqueues a BullMQ research job
  -> Worker searches the web with Tavily
  -> Worker extracts structured findings from each source with OpenAI
  -> Worker deduplicates claims, quotes, and statistics
  -> Worker evaluates quality and grounding
  -> Worker generates a final report
  -> Worker stores the report in PostgreSQL and Redis
  -> Frontend polls job status and listens for progress events
  -> Frontend renders the completed report in the dashboard
```

## Prerequisites

- Node.js 20 or newer.
- npm.
- PostgreSQL database.
- Redis server.
- OpenAI API key.
- Tavily API key.

## Environment Variables

Create a root `.env` file from the example:

```bash
cp .env.example .env
```

Root environment variables:

```env
PORT=3001
DATABASE_URL=postgresql://user:password@localhost:5432/research_assistant
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_URL=
OPENAI_API_KEY=your_openai_api_key
TAVILY_API_KEY=your_tavily_api_key
CORS_ORIGINS=http://localhost:3000
RESEARCH_CACHE_TTL_SECONDS=86400
```

Notes:

- Use either `REDIS_URL` or `REDIS_HOST` plus `REDIS_PORT`.
- `CORS_ORIGINS` is comma-separated if you need multiple frontend origins.
- The frontend defaults to `http://localhost:3001`. To override it, create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
```

## Installation

Install backend dependencies:

```bash
npm install
```

Install frontend dependencies:

```bash
cd frontend
npm install
cd ..
```

Set up the database:

```bash
npx prisma migrate dev
```

If you only need to regenerate the Prisma client:

```bash
npx prisma generate
```

## Running Locally

Start Redis and PostgreSQL first.

Then run these in separate terminals from the project root:

```bash
npm run dev
```

```bash
npm run worker
```

Start the frontend from `frontend/`:

```bash
cd frontend
npm run dev
```

Open the dashboard:

```text
http://localhost:3000
```

The API defaults to:

```text
http://localhost:3001
```

## Scripts

Root scripts:

| Command | Description |
|---|---|
| `npm run dev` | Start the Express API with `ts-node-dev`. |
| `npm run worker` | Start the BullMQ research worker. |
| `npm run build` | Type-check the backend with `tsc --noEmit`. |
| `npm run typecheck` | Same as `build`; runs TypeScript checking only. |

Frontend scripts:

| Command | Description |
|---|---|
| `npm run dev` | Start Next.js in Webpack dev mode. |
| `npm run dev:turbo` | Start Next.js with Turbopack. |
| `npm run build` | Build the frontend with Webpack. |
| `npm run build:turbo` | Build the frontend with Turbopack. |
| `npm run start` | Start a production Next.js server after building. |
| `npm run lint` | Run ESLint for the frontend. |

## API Reference

### Health Check

```http
GET /health
```

Returns basic service status.

### Create Research Job

```http
POST /research
Content-Type: application/json

{
  "query": "Compare current RAG evaluation methods"
}
```

Responses:

- `202` with a `jobId` when a new job is queued.
- `200` with `cached: true` and a report when the query is already cached.
- `400` when `query` is missing or empty.

### Get Job Status

```http
GET /research/:id
```

Returns the BullMQ job state, result, and failure reason when available.

### Stream Job Progress

```http
GET /research/:id/stream
```

Streams progress updates as server-sent events. The frontend uses this for the live pipeline timeline.

### Get Research History

```http
GET /research/history
```

Returns the 20 most recent cached reports from PostgreSQL.

### Get Metrics

```http
GET /research/metrics
```

Returns in-memory token, cost, extraction, and embedding counters from the current worker process.

## Data Model

Reports are persisted in PostgreSQL using Prisma:

```prisma
model ResearchCache {
  id        String   @id @default(cuid())
  query     String   @unique
  report    String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

Redis is used for:

- BullMQ queue storage.
- Fast research result cache.
- Pub/sub progress updates for SSE.

## Development Notes

- Start both the API and worker. The API only enqueues jobs; the worker does the actual research pipeline.
- The worker concurrency is currently `1`, which keeps OpenAI/Tavily usage controlled during local development.
- The frontend uses Webpack by default because it is more stable for this project locally. Turbopack remains available through the `dev:turbo` and `build:turbo` scripts.
- Cached PostgreSQL results are keyed by normalized query text.
- Tavily returns up to 5 sources per query in the current implementation.
- If Tavily or OpenAI credentials are missing, the pipeline will not produce useful research output.

## Common Commands

Check backend types:

```bash
npm run typecheck
```

Check frontend linting:

```bash
cd frontend
npm run lint
```

Build frontend:

```bash
cd frontend
npm run build
```

Reset generated frontend build artifacts if local dev gets slow:

```bash
rm -rf frontend/.next
```

## Troubleshooting

`Job not moving from queued`

Make sure the worker is running:

```bash
npm run worker
```

`Failed to create research job`

Check that Redis is running and the API can connect to it.

`History endpoint fails`

Check `DATABASE_URL`, confirm PostgreSQL is running, and run:

```bash
npx prisma migrate dev
```

`Frontend cannot reach backend`

Confirm the API is running on `http://localhost:3001` and that `CORS_ORIGINS` includes the frontend origin.

`Frontend dev server is slow or hangs`

Stop the frontend server, remove generated build artifacts, and restart:

```bash
rm -rf frontend/.next
cd frontend
npm run dev
```

## Project Status

Active development. Current focus areas include improving report readability, pipeline reliability, source grounding, and production-style orchestration.

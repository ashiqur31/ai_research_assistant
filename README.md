# AI Research Assistant

An AI-powered research assistant built with TypeScript, Node.js, Tavily, and OpenAI that performs multi-source web research, extracts structured findings, validates AI outputs, and generates citation-backed markdown reports.

This project focuses on production-style AI orchestration rather than simple chatbot interactions. It demonstrates how to build reliable AI pipelines with structured outputs, validation layers, concurrency control, retry mechanisms, cost tracking, and source-grounded generation.

## Features

* Web research using Tavily Search API
* Parallel content extraction using OpenAI
* Structured JSON extraction with Zod validation
* Automatic JSON cleaning and normalization
* Deduplication of repeated findings
* Citation-backed report generation
* Source attribution for every finding
* Retry logic and fault-tolerant execution
* Token usage and cost tracking
* Logging and observability with Pino
* Queue-based processing support using BullMQ
* Markdown research report generation

## Tech Stack

* TypeScript
* Node.js
* OpenAI API
* Tavily Search API
* Zod
* BullMQ
* Redis
* Prisma
* PostgreSQL
* Pino Logger

## Architecture

```text
User Query
   ↓
Tavily Search
   ↓
Parallel Extraction
   ↓
OpenAI Structured Processing
   ↓
JSON Cleaning & Normalization
   ↓
Zod Validation
   ↓
Deduplication
   ↓
Citation Verification
   ↓
Markdown Report Generation
```

## Example Capabilities

* Research topics across multiple web sources
* Extract claims, quotes, and statistics
* Generate grounded research summaries
* Track AI token usage and estimated cost
* Handle malformed AI outputs gracefully
* Continue processing even when some sources fail

## Goals of the Project

This project was built to explore:

* AI orchestration systems
* Structured AI outputs
* Reliable LLM pipelines
* Retrieval-augmented generation (RAG)
* Observability and monitoring
* Production-grade backend architecture
* Cost-aware AI engineering

## Future Improvements

* Semantic deduplication using embeddings
* Streaming report generation
* Advanced citation verification
* Vector search integration
* Multi-agent orchestration
* Frontend dashboard
* Research history and caching
* Source credibility scoring

## Running the Project

```bash
npm install
npm run dev
```

## Environment Variables

```env
OPENAI_API_KEY=your_key
TAVILY_API_KEY=your_key
```

## Project Status

Active development — currently focused on improving reliability, citation grounding, and production-grade orchestration.

# jira-util (Backend Only)

`jira-util` is a backend service for securely fetching and summarizing Jira activity.

> Note: This repository intentionally does **not** include any browser extension/frontend code.

## Scope

This project provides:
- Atlassian OAuth middleware endpoints (`/api/oauth/*`)
- Jira activity query endpoint with JQL filtering (`/api/jira/activity`)
- AI-assisted issue summarization (`lib/summarize.js`)
- Sanitized, privacy-first API payloads for downstream clients

## Repository layout

- `api/oauth/start.js` — starts Atlassian OAuth flow and sets state cookie.
- `api/oauth/callback.js` — validates state and exchanges authorization code for tokens.
- `api/jira/activity.js` — fetches filtered issues and enriches with summaries.
- `lib/jira.js` — Jira REST search helper and issue sanitization.
- `lib/summarize.js` — OpenAI summary helper with fallback behavior.
- `docs/architecture.md` — high-level backend architecture and API contract.

## Environment variables

Required:
- `ATLASSIAN_CLIENT_ID`
- `ATLASSIAN_CLIENT_SECRET`
- `ATLASSIAN_REDIRECT_URI`

Optional:
- `OPENAI_API_KEY` (enables AI summaries)
- `SESSION_SIGNING_SECRET` (recommended for stronger session/state handling)

## Quick start

1. Configure environment variables.
2. Deploy the `api/` handlers in your Vercel project.
3. Call:
   - `GET /api/oauth/start`
   - `GET /api/oauth/callback`
   - `GET /api/jira/activity`

## Current limitations

- OAuth state and token persistence are scaffold-level and should be hardened for production.
- Origin allowlists, CSRF protections, and durable encrypted token storage are still recommended before live rollout.

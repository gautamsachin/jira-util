# Jira AI Catchup Engine

Serverless backend for a browser extension that turns noisy Jira activity into concise daily catchups.

## What it does

- OAuth orchestration (authorization code exchange + refresh token flow)
- Jira cloudId discovery through Atlassian accessible resources
- JQL-powered issue fetches via Jira Search API
- Mention and status extraction from ticket metadata/comments
- Optional AI summarization (OpenAI Responses API) with secure server-side API keys
- Strict extension-only CORS

## API endpoint

`POST /api/catchup`

### Actions

1. `oauth_exchange`
   - Input: `code`, optional `redirectUri`
   - Output: OAuth token payload + accessible resources
2. `refresh_token`
   - Input: `refreshToken`
   - Output: refreshed token payload
3. `catchup`
   - Input: `accessToken`, `jql`, optional `cloudId`, `siteUrl`, `maxResults`
   - Output: structured issue summaries with mentions

## Environment variables

Copy `.env.example` and set:

- `ATLASSIAN_CLIENT_ID`
- `ATLASSIAN_CLIENT_SECRET`
- `ATLASSIAN_REDIRECT_URI`
- `EXTENSION_ORIGIN` (`chrome-extension://<id>`)
- `OPENAI_API_KEY` (optional)
- `OPENAI_MODEL` (optional)
- `REQUEST_TIMEOUT_MS` (optional)

## Local checks

```bash
npm test
```

## Deploy

Deploy to Vercel as a Node.js serverless project.

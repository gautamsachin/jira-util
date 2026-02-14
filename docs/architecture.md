# Architecture Overview

## 1. OAuth Middleware (Backend on Vercel)

### OAuth start: `GET /api/oauth/start`
- Generates `state` and stores it server-side.
- Redirects user to Atlassian authorization URL.

### OAuth callback: `GET /api/oauth/callback`
- Verifies `state`.
- Exchanges code for access/refresh token.
- Stores token securely (server-side only).

## 2. Intelligent Filter (JQL)

Default JQL used by backend:

```jql
(assignee = currentUser() OR watcher = currentUser() OR comment ~ currentUser())
AND statusCategory != Done
ORDER BY updated DESC
```

This narrows results to active work where user involvement is likely.

## 3. AI Summarization Layer

- Backend fetches description + recent comments for each issue.
- Summarizer produces 2-3 bullets:
  - Progress/state
  - Blockers/risks
  - Required next action

## 4. Privacy-First API Contract

Returned payload excludes raw tokens and unnecessary fields:

```json
{
  "items": [
    {
      "key": "PROJ-101",
      "title": "Fix OAuth callback",
      "status": "In Progress",
      "url": "https://example.atlassian.net/browse/PROJ-101",
      "summary": [
        "Callback fails when state is missing.",
        "Need strict state validation before token exchange.",
        "Add test coverage for expired sessions."
      ]
    }
  ]
}
```

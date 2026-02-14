# Jira Util: Privacy-First Jira Pulse API

A lightweight backend for checking Jira updates with secure OAuth, focused JQL filtering, AI summarization, and a sanitized API response.

## What this repository contains

- **Vercel Node.js middleware** (`api/`) for OAuth and Jira data access.
- **Shared utilities** (`lib/`) for Jira API calls and AI summarization.
- **Architecture notes** (`docs/`) describing the backend flow.

## Core ideas implemented

1. **Secure OAuth Middleware**
   - OAuth handshake and token exchange handled server-side only.
2. **Intelligent Filter with JQL**
   - Backend searches for issues where the user is assigned or mentioned.
3. **AI Summarization Layer**
   - Ticket descriptions/comments are distilled into short bullet summaries.
4. **Privacy-First Bridge**
   - API returns a minimal, sanitized payload for any consuming client.

## Quick start

1. Set Vercel environment variables:
   - `ATLASSIAN_CLIENT_ID`
   - `ATLASSIAN_CLIENT_SECRET`
   - `ATLASSIAN_REDIRECT_URI`
   - `SESSION_SIGNING_SECRET`
   - `OPENAI_API_KEY` (optional for AI summaries)
2. Deploy `api/` and `lib/` to Vercel.
3. Call the API from your preferred client.

## Suggested next steps

- Replace state cookie placeholder with signed session storage.
- Add encrypted token storage with rotation.
- Enforce CSRF checks and strict origin allowlists.
- Add user-specific JQL customization and pagination.

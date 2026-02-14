import {
  exchangeCodeForToken,
  getAccessibleResources,
  refreshAccessToken,
  resolveCloudId,
  searchIssues
} from './atlassian.js';
import { getConfig } from './config.js';
import { HttpError } from './http.js';
import { summarizeIssues } from './summarizer.js';

function parseJson(req) {
  if (!req.body) return {};
  if (typeof req.body === 'object') return req.body;
  try {
    return JSON.parse(req.body);
  } catch {
    throw new HttpError(400, 'Invalid JSON body');
  }
}

export async function processRequest(req) {
  const config = getConfig();
  const body = parseJson(req);
  const action = body.action;

  if (!action) {
    throw new HttpError(400, 'Missing action in request body');
  }

  if (action === 'oauth_exchange') {
    if (!body.code) {
      throw new HttpError(400, 'Missing authorization code');
    }
    const tokenResponse = await exchangeCodeForToken(config, body.code, body.redirectUri);
    const resources = await getAccessibleResources(tokenResponse.access_token, config.requestTimeoutMs);

    return {
      token: tokenResponse,
      resources
    };
  }

  if (action === 'refresh_token') {
    if (!body.refreshToken) {
      throw new HttpError(400, 'Missing refreshToken');
    }

    return {
      token: await refreshAccessToken(config, body.refreshToken)
    };
  }

  if (action === 'catchup') {
    if (!body.accessToken || !body.jql) {
      throw new HttpError(400, 'Missing accessToken or jql');
    }

    const resources = await getAccessibleResources(body.accessToken, config.requestTimeoutMs);
    const cloudId = resolveCloudId(resources, body.cloudId, body.siteUrl);
    const maxResults = Math.min(Math.max(Number(body.maxResults || 20), 1), 50);

    const searchResult = await searchIssues(body.accessToken, cloudId, body.jql, maxResults, config.requestTimeoutMs);
    const summaries = await summarizeIssues(searchResult.issues || [], config);

    return {
      cloudId,
      issueCount: searchResult.total || summaries.length,
      issues: summaries
    };
  }

  throw new HttpError(400, `Unsupported action: ${action}`);
}

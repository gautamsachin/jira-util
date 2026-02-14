import { fetchJson, HttpError } from './http.js';

const OAUTH_TOKEN_URL = 'https://auth.atlassian.com/oauth/token';
const ACCESSIBLE_RESOURCES_URL = 'https://api.atlassian.com/oauth/token/accessible-resources';

export async function exchangeCodeForToken(config, code, redirectUri) {
  return fetchJson(
    OAUTH_TOKEN_URL,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        client_id: config.atlassianClientId,
        client_secret: config.atlassianClientSecret,
        code,
        redirect_uri: redirectUri || config.atlassianRedirectUri
      })
    },
    config.requestTimeoutMs
  );
}

export async function refreshAccessToken(config, refreshToken) {
  return fetchJson(
    OAUTH_TOKEN_URL,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'refresh_token',
        client_id: config.atlassianClientId,
        client_secret: config.atlassianClientSecret,
        refresh_token: refreshToken
      })
    },
    config.requestTimeoutMs
  );
}

export async function getAccessibleResources(accessToken, timeoutMs) {
  return fetchJson(
    ACCESSIBLE_RESOURCES_URL,
    { headers: { Authorization: `Bearer ${accessToken}` } },
    timeoutMs
  );
}

export function resolveCloudId(resources, preferredCloudId, preferredUrl) {
  if (!Array.isArray(resources) || resources.length === 0) {
    throw new HttpError(404, 'No accessible Jira resources found for this user');
  }

  if (preferredCloudId) {
    const exact = resources.find((resource) => resource.id === preferredCloudId);
    if (!exact) {
      throw new HttpError(403, 'Provided cloudId is not accessible for this user');
    }

    return exact.id;
  }

  if (preferredUrl) {
    const matchByUrl = resources.find((resource) => resource.url === preferredUrl);
    if (matchByUrl) {
      return matchByUrl.id;
    }
  }

  return resources[0].id;
}

export async function searchIssues(accessToken, cloudId, jql, maxResults, timeoutMs) {
  const searchUrl = new URL(`https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/search/jql`);
  searchUrl.searchParams.set('jql', jql);
  searchUrl.searchParams.set('maxResults', String(maxResults));
  searchUrl.searchParams.set('fields', 'summary,status,description,comment,updated,assignee,creator');

  try {
    return await fetchJson(
      searchUrl,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json'
        }
      },
      timeoutMs
    );
  } catch (error) {
    if (error instanceof HttpError && error.status === 429) {
      throw new HttpError(429, 'Jira API rate limit reached. Please retry shortly.', error.details);
    }

    throw error;
  }
}

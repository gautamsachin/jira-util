const ATLASSIAN_API_BASE = 'https://api.atlassian.com';

async function searchIssues({ cloudId, accessToken, jql, maxResults = 10 }) {
  const url = `${ATLASSIAN_API_BASE}/ex/jira/${cloudId}/rest/api/3/search`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    body: JSON.stringify({
      jql,
      maxResults,
      fields: ['summary', 'status', 'description', 'comment', 'assignee']
    })
  });

  if (!response.ok) {
    throw new Error(`Jira search failed: ${response.status}`);
  }

  return response.json();
}

function sanitizeIssue(issue, siteBaseUrl) {
  return {
    key: issue.key,
    title: issue.fields?.summary || 'Untitled issue',
    status: issue.fields?.status?.name || 'Unknown',
    url: `${siteBaseUrl}/browse/${issue.key}`
  };
}

module.exports = {
  searchIssues,
  sanitizeIssue
};

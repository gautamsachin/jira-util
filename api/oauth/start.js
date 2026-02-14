function buildAuthorizeUrl({ clientId, redirectUri, state }) {
  const params = new URLSearchParams({
    audience: 'api.atlassian.com',
    client_id: clientId,
    scope: 'read:jira-work read:jira-user offline_access',
    redirect_uri: redirectUri,
    state,
    response_type: 'code',
    prompt: 'consent'
  });

  return `https://auth.atlassian.com/authorize?${params.toString()}`;
}

module.exports = async function handler(req, res) {
  const state = crypto.randomUUID();

  // TODO: persist state securely (signed cookie, KV, or Redis)
  res.setHeader('Set-Cookie', `oauth_state=${state}; HttpOnly; Secure; SameSite=Lax; Path=/`);

  const authorizeUrl = buildAuthorizeUrl({
    clientId: process.env.ATLASSIAN_CLIENT_ID,
    redirectUri: process.env.ATLASSIAN_REDIRECT_URI,
    state
  });

  res.status(302).setHeader('Location', authorizeUrl).end();
};

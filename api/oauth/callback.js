async function exchangeCodeForToken(code) {
  const response = await fetch('https://auth.atlassian.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'authorization_code',
      client_id: process.env.ATLASSIAN_CLIENT_ID,
      client_secret: process.env.ATLASSIAN_CLIENT_SECRET,
      code,
      redirect_uri: process.env.ATLASSIAN_REDIRECT_URI
    })
  });

  if (!response.ok) throw new Error('OAuth token exchange failed');
  return response.json();
}

module.exports = async function handler(req, res) {
  const { code, state } = req.query;
  const cookie = req.headers.cookie || '';
  const stateMatch = cookie.match(/oauth_state=([^;]+)/);
  const storedState = stateMatch?.[1];

  if (!code || !state || !storedState || state !== storedState) {
    return res.status(400).json({ error: 'Invalid OAuth state' });
  }

  const tokenSet = await exchangeCodeForToken(code);

  // TODO: Store encrypted token set server-side per user session.
  res.setHeader('Set-Cookie', 'oauth_state=; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=Lax');
  return res.status(200).json({ connected: true, expires_in: tokenSet.expires_in });
};

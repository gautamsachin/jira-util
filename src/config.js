const required = [
  'ATLASSIAN_CLIENT_ID',
  'ATLASSIAN_CLIENT_SECRET',
  'ATLASSIAN_REDIRECT_URI',
  'EXTENSION_ORIGIN'
];

export function getConfig() {
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length) {
    throw new Error(`Missing environment variables: ${missing.join(', ')}`);
  }

  return {
    atlassianClientId: process.env.ATLASSIAN_CLIENT_ID,
    atlassianClientSecret: process.env.ATLASSIAN_CLIENT_SECRET,
    atlassianRedirectUri: process.env.ATLASSIAN_REDIRECT_URI,
    extensionOrigin: process.env.EXTENSION_ORIGIN,
    aiApiKey: process.env.OPENAI_API_KEY,
    aiModel: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    requestTimeoutMs: Number(process.env.REQUEST_TIMEOUT_MS || '12000')
  };
}

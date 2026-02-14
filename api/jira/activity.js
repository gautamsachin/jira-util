const { searchIssues, sanitizeIssue } = require('../../lib/jira');
const { summarizeIssue } = require('../../lib/summarize');

module.exports = async function handler(req, res) {
  // TODO: replace placeholder auth with secure per-user session lookup.
  const accessToken = req.headers.authorization?.replace('Bearer ', '');
  const cloudId = req.query.cloudId;
  const siteBaseUrl = req.query.siteBaseUrl;

  if (!accessToken || !cloudId || !siteBaseUrl) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  const jql = req.query.jql || '(assignee = currentUser() OR watcher = currentUser() OR comment ~ currentUser()) AND statusCategory != Done ORDER BY updated DESC';

  const result = await searchIssues({
    cloudId,
    accessToken,
    jql,
    maxResults: 8
  });

  const items = await Promise.all(
    (result.issues || []).map(async (issue) => {
      const sanitized = sanitizeIssue(issue, siteBaseUrl);
      const summary = await summarizeIssue({
        issue,
        openAiApiKey: process.env.OPENAI_API_KEY
      });
      return { ...sanitized, summary };
    })
  );

  return res.status(200).json({ items });
};

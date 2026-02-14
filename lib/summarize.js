async function summarizeIssue({ issue, openAiApiKey }) {
  const fallback = [
    'No AI summary available.',
    'Open the issue for full context.',
    'Consider adding OPENAI_API_KEY for summaries.'
  ];

  if (!openAiApiKey) return fallback;

  const comments = (issue.fields?.comment?.comments || [])
    .slice(-5)
    .map((c) => c.body?.content?.[0]?.content?.[0]?.text || '')
    .filter(Boolean)
    .join('\n');

  const prompt = [
    'Summarize this Jira issue in exactly 2-3 short bullet points:',
    `Title: ${issue.fields?.summary || ''}`,
    `Status: ${issue.fields?.status?.name || ''}`,
    `Description: ${JSON.stringify(issue.fields?.description || {})}`,
    `Recent comments: ${comments}`
  ].join('\n');

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${openAiApiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2
    })
  });

  if (!res.ok) return fallback;

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content || '';
  const bullets = text
    .split('\n')
    .map((line) => line.replace(/^[-•\d.\s]+/, '').trim())
    .filter(Boolean)
    .slice(0, 3);

  return bullets.length ? bullets : fallback;
}

module.exports = { summarizeIssue };

function walkAdf(node, cb) {
  if (!node || typeof node !== 'object') return;
  cb(node);

  if (Array.isArray(node.content)) {
    for (const child of node.content) {
      walkAdf(child, cb);
    }
  }
}

export function extractMentions(adfNode) {
  const mentions = new Set();

  walkAdf(adfNode, (node) => {
    if (node.type === 'mention' && node.attrs?.text) {
      mentions.add(node.attrs.text);
    }
  });

  return Array.from(mentions);
}

export function extractText(adfNode) {
  const chunks = [];
  walkAdf(adfNode, (node) => {
    if (node.type === 'text' && node.text) {
      chunks.push(node.text);
    }
  });
  return chunks.join(' ').replace(/\s+/g, ' ').trim();
}

function localSummary(issue) {
  const status = issue.fields?.status?.name || 'Unknown';
  const assignee = issue.fields?.assignee?.displayName || 'Unassigned';
  const descriptionText = extractText(issue.fields?.description).slice(0, 240);

  return `${issue.key}: ${issue.fields?.summary || 'No summary'} | Status: ${status} | Assignee: ${assignee}${descriptionText ? ` | Context: ${descriptionText}` : ''}`;
}

export async function summarizeIssues(issues, config) {
  const normalized = issues.map((issue) => {
    const comments = issue.fields?.comment?.comments || [];
    const allMentions = new Set([
      ...extractMentions(issue.fields?.description),
      ...comments.flatMap((comment) => extractMentions(comment.body))
    ]);

    return {
      key: issue.key,
      summary: issue.fields?.summary,
      status: issue.fields?.status?.name,
      updated: issue.fields?.updated,
      mentions: Array.from(allMentions),
      quickSummary: localSummary(issue)
    };
  });

  if (!config.aiApiKey || normalized.length === 0) {
    return normalized;
  }

  const prompt = normalized
    .map((item) => `${item.key} | ${item.summary} | ${item.status} | mentions: ${item.mentions.join(', ')}`)
    .join('\n');

  const aiResponse = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.aiApiKey}`
    },
    body: JSON.stringify({
      model: config.aiModel,
      input: `Generate concise Jira daily catchup bullet points from:\n${prompt}`
    })
  });

  if (!aiResponse.ok) {
    return normalized;
  }

  const aiJson = await aiResponse.json();
  const aiText = aiJson.output_text || '';

  return normalized.map((item) => ({
    ...item,
    aiSummary: aiText
  }));
}

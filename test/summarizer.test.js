import test from 'node:test';
import assert from 'node:assert/strict';
import { extractMentions, extractText, summarizeIssues } from '../src/summarizer.js';

test('extractMentions reads ADF mention nodes', () => {
  const adf = {
    type: 'doc',
    content: [
      { type: 'paragraph', content: [{ type: 'mention', attrs: { text: '@alex' } }] },
      { type: 'paragraph', content: [{ type: 'mention', attrs: { text: '@sam' } }] }
    ]
  };

  assert.deepEqual(extractMentions(adf).sort(), ['@alex', '@sam']);
});

test('extractText flattens ADF text nodes', () => {
  const adf = {
    type: 'doc',
    content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Hello' }, { type: 'text', text: 'world' }] }]
  };

  assert.equal(extractText(adf), 'Hello world');
});

test('summarizeIssues returns local summaries without AI key', async () => {
  const issues = [
    {
      key: 'JIRA-1',
      fields: {
        summary: 'Fix bug',
        status: { name: 'In Progress' },
        updated: '2024-10-01',
        assignee: { displayName: 'Casey' },
        description: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'A bug' }] }] },
        comment: { comments: [] }
      }
    }
  ];

  const out = await summarizeIssues(issues, { aiApiKey: '' });
  assert.equal(out[0].key, 'JIRA-1');
  assert.equal(out[0].status, 'In Progress');
  assert.ok(out[0].quickSummary.includes('Fix bug'));
});

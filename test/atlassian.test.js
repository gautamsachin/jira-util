import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveCloudId } from '../src/atlassian.js';

test('resolveCloudId prefers explicit cloudId', () => {
  const resources = [
    { id: '1', url: 'https://a.atlassian.net' },
    { id: '2', url: 'https://b.atlassian.net' }
  ];

  assert.equal(resolveCloudId(resources, '2'), '2');
});

test('resolveCloudId resolves by site URL then fallback', () => {
  const resources = [
    { id: '1', url: 'https://a.atlassian.net' },
    { id: '2', url: 'https://b.atlassian.net' }
  ];

  assert.equal(resolveCloudId(resources, undefined, 'https://b.atlassian.net'), '2');
  assert.equal(resolveCloudId(resources), '1');
});

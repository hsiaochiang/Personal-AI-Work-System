const assert = require('assert');
const fs = require('fs');
const path = require('path');

const memoryDedupUtils = require('../web/public/js/memory-dedup-utils.js');
const memoryHealthUtils = require('../web/public/js/memory-health-utils.js');

function buildFiles(entries) {
  return memoryHealthUtils.buildMemoryApiPayload(entries, { now: '2026-04-04' }).files;
}

function testDedupGrouping() {
  const files = buildFiles([
    {
      filename: 'preference-rules.md',
      content: '# Preference Rules\n\n## 2026-04-01\n- 保持輸出精簡 <!-- source: copilot -->\n\n## 2026-04-03\n- 保持輸出精簡 <!-- source: chatgpt -->\n- 先規劃後落地 <!-- source: plain -->\n',
    },
    {
      filename: 'task-patterns.md',
      content: '# Task Patterns\n\n## 2026-04-04\n- 保持輸出精簡 <!-- source: plain -->\n',
    },
  ]);

  const payload = memoryDedupUtils.buildDedupSuggestionPayload(files);
  assert.strictEqual(payload.summary.groupCount, 1, 'should only group duplicates within the same file');
  assert.strictEqual(payload.summary.duplicateItemCount, 2);
  assert.strictEqual(payload.groups[0].primaryItemId, 'preference-rules.md::0::0');
  assert.strictEqual(payload.groups[0].similarityLabel, '完全重複');
}

function testNearDuplicateGrouping() {
  const files = buildFiles([
    {
      filename: 'task-patterns.md',
      content: '# Task Patterns\n\n## 2026-04-01\n- 先規劃再落地 <!-- source: plain -->\n\n## 2026-04-03\n- 先規劃後落地 <!-- source: plain -->\n',
    },
  ]);

  const payload = memoryDedupUtils.buildDedupSuggestionPayload(files);
  assert.strictEqual(payload.summary.groupCount, 1, 'short Chinese variants should still form a near-duplicate group');
  assert.strictEqual(payload.groups[0].similarityLabel, '高度相似');
  assert.ok(payload.groups[0].similarity >= 0.58);
}

function testMergeRewrite() {
  const markdown = '# Preference Rules\n\n## 2026-04-01\n- 保持輸出精簡 <!-- source: copilot -->\n\n## 2026-04-03\n- 保持輸出精簡 <!-- source: chatgpt -->\n- 先規劃後落地 <!-- source: plain -->\n';
  const rewritten = memoryDedupUtils.applyMemoryDedupAction(markdown, 'preference-rules.md', {
    action: 'merge',
    itemIds: ['preference-rules.md::0::0', 'preference-rules.md::1::0'],
    primaryItemId: 'preference-rules.md::0::0',
    mergedContent: '保持輸出精簡',
    mergedSource: 'copilot',
  });

  assert.ok(rewritten.includes('- 保持輸出精簡 <!-- source: copilot -->'));
  assert.ok(!rewritten.includes('chatgpt'));
  assert.ok(rewritten.includes('先規劃後落地'));
}

function testDeleteRewrite() {
  const markdown = '# Preference Rules\n\n## 2026-04-01\n- 保持輸出精簡 <!-- source: copilot -->\n- 偏好白話表達 <!-- source: plain -->\n\n## 2026-04-03\n- 保持輸出精簡 <!-- source: chatgpt -->\n';
  const rewritten = memoryDedupUtils.applyMemoryDedupAction(markdown, 'preference-rules.md', {
    action: 'delete',
    targetItemId: 'preference-rules.md::1::0',
  });

  assert.ok(!rewritten.includes('chatgpt'));
  assert.ok(rewritten.includes('保持輸出精簡'));
  assert.ok(rewritten.includes('偏好白話表達'));
}

function testRejectsMalformedMergePrimary() {
  const markdown = '# Preference Rules\n\n## 2026-04-01\n- alpha <!-- source: copilot -->\n- beta <!-- source: plain -->\n\n## 2026-04-02\n- alpha <!-- source: chatgpt -->\n- gamma <!-- source: plain -->\n';

  assert.throws(() => {
    memoryDedupUtils.applyMemoryDedupAction(markdown, 'preference-rules.md', {
      action: 'merge',
      itemIds: ['preference-rules.md::0::0', 'preference-rules.md::1::0'],
      primaryItemId: 'preference-rules.md::1::1',
      mergedContent: 'merged alpha',
      mergedSource: 'plain',
    });
  }, /primary item 必須屬於本次 duplicate group/);
}

function testRejectsDeleteOutsideDedupGroup() {
  const markdown = '# Preference Rules\n\n## 2026-04-01\n- alpha <!-- source: copilot -->\n- beta <!-- source: plain -->\n\n## 2026-04-02\n- alpha <!-- source: chatgpt -->\n';

  assert.throws(() => {
    memoryDedupUtils.applyMemoryDedupAction(markdown, 'preference-rules.md', {
      action: 'delete',
      targetItemId: 'preference-rules.md::0::1',
    });
  }, /找不到可刪除的 duplicate item/);
}

function testStaticContracts() {
  const memoryHtml = fs.readFileSync(path.join(__dirname, '../web/public/memory.html'), 'utf8');
  assert.ok(memoryHtml.includes('id="memory-dedup-overview"'));
  assert.ok(memoryHtml.includes('/js/memory-dedup-utils.js'));

  const memoryJs = fs.readFileSync(path.join(__dirname, '../web/public/js/memory.js'), 'utf8');
  assert.ok(memoryJs.includes('getMemoryDedupUtilsAPI'));
  assert.ok(memoryJs.includes('/api/memory/dedup'));
  assert.ok(memoryJs.includes('handleDedupMerge'));

  const serverJs = fs.readFileSync(path.join(__dirname, '../web/server.js'), 'utf8');
  assert.ok(serverJs.includes('/api/memory/dedup'));
  assert.ok(serverJs.includes('attachDedupToMemoryPayload'));
}

function main() {
  testDedupGrouping();
  testNearDuplicateGrouping();
  testMergeRewrite();
  testDeleteRewrite();
  testRejectsMalformedMergePrimary();
  testRejectsDeleteOutsideDedupGroup();
  testStaticContracts();
  console.log('verify_memory_dedup_suggestions: PASS');
}

main();

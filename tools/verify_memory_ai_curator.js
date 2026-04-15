const assert = require('assert');
const fs = require('fs');
const path = require('path');

const memorySourceUtils = require('../web/public/js/memory-source-utils.js');
const memoryHealthUtils = require('../web/public/js/memory-health-utils.js');

function testDetailedParsingBuildsStableItemIds() {
  const markdown = '# Preference Rules\n\n## 2026-04-01\n- 保持輸出精簡 <!-- source: copilot -->\n- 偏好白話表達 <!-- source: plain -->\n\n## 2026-04-03\n- 先規劃後落地 <!-- source: plain -->\n';
  const groups = memorySourceUtils.parseDetailedMemoryMarkdown(markdown, 'preference-rules.md');
  const items = groups.flatMap(group => group.items);

  assert.strictEqual(items.length, 3);
  assert.strictEqual(items[0].itemId, 'preference-rules.md::0::0');
  assert.strictEqual(items[1].itemId, 'preference-rules.md::0::1');
  assert.strictEqual(items[2].itemId, 'preference-rules.md::1::0');
}

function testRemoveMemoryItemByIdDeletesOnlyTargetLine() {
  const markdown = '# Preference Rules\n\n## 2026-04-01\n- 保持輸出精簡 <!-- source: copilot -->\n- 偏好白話表達 <!-- source: plain -->\n\n## 2026-04-03\n- 先規劃後落地 <!-- source: plain -->\n';
  const rewritten = memorySourceUtils.removeMemoryItemById(markdown, 'preference-rules.md', 'preference-rules.md::0::1');

  assert.ok(!rewritten.includes('偏好白話表達'));
  assert.ok(rewritten.includes('保持輸出精簡'));
  assert.ok(rewritten.includes('先規劃後落地'));
}

function testRemoveMemoryItemByIdRejectsMissingTarget() {
  const markdown = '# Preference Rules\n\n## 2026-04-01\n- alpha <!-- source: plain -->\n';

  assert.throws(() => {
    memorySourceUtils.removeMemoryItemById(markdown, 'preference-rules.md', 'preference-rules.md::9::9');
  }, /找不到 itemId/);
}

function testMemoryApiPayloadIncludesItemIds() {
  const payload = memoryHealthUtils.buildMemoryApiPayload([
    {
      filename: 'preference-rules.md',
      content: '# Preference Rules\n\n## 2026-04-01\n- 保持輸出精簡 <!-- source: copilot -->\n',
    },
  ], { now: '2026-04-15' });

  const item = payload.files[0].groups[0].items[0];
  assert.strictEqual(item.itemId, 'preference-rules.md::0::0');
  assert.strictEqual(item.groupTitle, '2026-04-01');
  assert.ok(item.health);
}

function testStaticContracts() {
  const memoryJs = fs.readFileSync(path.join(__dirname, '../web/public/js/memory.js'), 'utf8');
  assert.ok(memoryJs.includes('/api/memory/item/delete'));
  assert.ok(memoryJs.includes('/api/memory/ai-curate'));
  assert.ok(memoryJs.includes('cleanupFilterMode'));
  assert.ok(memoryJs.includes('handleMemoryAICurate'));

  const memoryHtml = fs.readFileSync(path.join(__dirname, '../web/public/memory.html'), 'utf8');
  assert.ok(memoryHtml.includes('scrollIntoView'));
  assert.ok(memoryHtml.includes('category-'));

  const serverJs = fs.readFileSync(path.join(__dirname, '../web/server.js'), 'utf8');
  assert.ok(serverJs.includes('/api/memory/item/delete'));
  assert.ok(serverJs.includes('/api/memory/ai-curate'));
  assert.ok(serverJs.includes('removeMemoryItemById'));
}

function main() {
  testDetailedParsingBuildsStableItemIds();
  testRemoveMemoryItemByIdDeletesOnlyTargetLine();
  testRemoveMemoryItemByIdRejectsMissingTarget();
  testMemoryApiPayloadIncludesItemIds();
  testStaticContracts();
  console.log('verify_memory_ai_curator: PASS');
}

main();

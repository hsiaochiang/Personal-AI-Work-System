const assert = require('assert');
const fs = require('fs');
const path = require('path');

const memoryHealthUtils = require('../web/public/js/memory-health-utils.js');

function main() {
  const payload = memoryHealthUtils.buildMemoryApiPayload(
    [
      {
        filename: 'preference-rules.md',
        content: [
          '# Preference Rules',
          '',
          '## 提取於 2026-04-01',
          '',
          '- 保留來源可信度 <!-- source: copilot -->',
          '- 最近更新但沒有來源',
          '',
          '## 使用原則',
          '',
          '- Legacy 條目沒有日期 <!-- source: copilot -->',
        ].join('\n'),
      },
      {
        filename: 'decision-log.md',
        content: [
          '# Decision Log',
          '',
          '## 2024-01-01',
          '',
          '- 舊決策需要重新確認',
        ].join('\n'),
      },
    ],
    { now: '2026-04-04' }
  );

  assert.strictEqual(payload.files.length, 2);
  assert.strictEqual(payload.files[0].content.includes('保留來源可信度'), true);
  assert.strictEqual(payload.summary.totalItems, 4);
  assert.strictEqual(payload.summary.healthyCount, 1);
  assert.strictEqual(payload.summary.reviewCount, 2);
  assert.strictEqual(payload.summary.staleCount, 1);
  assert.strictEqual(payload.summary.needsAttentionCount, 3);
  assert.strictEqual(payload.summary.staleRatio, 25);

  const healthyItem = payload.files[0].groups[0].items[0];
  assert.strictEqual(healthyItem.health.status, 'healthy');
  assert.strictEqual(healthyItem.health.extractedAt, '2026-04-01');
  assert.ok(healthyItem.health.reason.includes('Copilot'));

  const missingSourceItem = payload.files[0].groups[0].items[1];
  assert.strictEqual(missingSourceItem.health.status, 'review');
  assert.ok(missingSourceItem.health.reason.includes('缺少來源標記'));

  const reviewItem = payload.files[0].groups[1].items[0];
  assert.strictEqual(reviewItem.health.status, 'review');
  assert.ok(reviewItem.health.reason.includes('缺少日期'));

  const staleItem = payload.files[1].groups[0].items[0];
  assert.strictEqual(staleItem.health.status, 'stale');
  assert.ok(staleItem.health.reason.includes('過期風險'));

  assert.deepStrictEqual(memoryHealthUtils.getMemoryHealthPresentation('review'), {
    label: '待確認',
    className: 'health-review',
  });

  const memoryHtml = fs.readFileSync(path.join(__dirname, '../web/public/memory.html'), 'utf8');
  assert.ok(memoryHtml.includes('id="kpi-stale-ratio"'));
  assert.ok(memoryHtml.includes('id="kpi-cleanup"'));
  assert.ok(memoryHtml.includes('id="memory-health-overview"'));
  assert.ok(memoryHtml.includes('/js/memory-health-utils.js'));

  const memoryJs = fs.readFileSync(path.join(__dirname, '../web/public/js/memory.js'), 'utf8');
  assert.ok(memoryJs.includes('getMemoryHealthUtilsAPI'));
  assert.ok(memoryJs.includes('memory-item-health-reason'));

  console.log('verify_memory_health_scoring: PASS');
}

main();

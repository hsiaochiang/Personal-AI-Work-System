const assert = require('assert');
const fs = require('fs');
const path = require('path');

const ruleConflictUtils = require('../web/public/js/rule-conflict-utils.js');

function testStyleConflictDetection() {
  const rules = [
    {
      id: 'pref-1',
      category: '偏好規則',
      title: '保持輸出精簡',
      body: '- 規則：回答應保持精簡，避免過長鋪陳',
    },
    {
      id: 'pref-2',
      category: '偏好規則',
      title: '需要詳細說明',
      body: '- 規則：重要設計決策應詳細說明，完整展開理由',
    },
  ];

  const enriched = ruleConflictUtils.enrichRulesWithConflicts(rules);
  assert.strictEqual(enriched.summary.pairCount, 1);
  assert.strictEqual(enriched.summary.conflictRuleCount, 2);
  assert.strictEqual(enriched.conflicts[0].signalLabel, '精簡 vs 詳細');
  assert.ok(enriched.rules[0].conflictReasons[0].reason.includes('偏向'));
}

function testNegationConflictDetection() {
  const rules = [
    {
      id: 'task-1',
      category: '任務模式',
      title: '先規劃再落地',
      body: '- 規則：避免過早跳入實作，先整理目標與策略',
    },
    {
      id: 'task-2',
      category: '任務模式',
      title: '直接開始實作',
      body: '- 規則：方向大致確定後，直接開始實作並快速落地',
    },
  ];

  const enriched = ruleConflictUtils.enrichRulesWithConflicts(rules);
  assert.strictEqual(enriched.summary.pairCount >= 1, true);
  assert.ok(enriched.conflicts.some(conflict => conflict.signalLabel.includes('先規劃')));
}

function testSameCategoryGuard() {
  const rules = [
    {
      id: 'pref-1',
      category: '偏好規則',
      title: '偏好白話表達',
      body: '- 規則：偏好白話、直覺的語句',
    },
    {
      id: 'output-1',
      category: '輸出模式',
      title: '使用專業術語',
      body: '- 規則：必要時使用較專業的術語',
    },
  ];

  const enriched = ruleConflictUtils.enrichRulesWithConflicts(rules);
  assert.strictEqual(enriched.summary.pairCount, 0);
  assert.strictEqual(enriched.summary.conflictRuleCount, 0);
}

function testStaticContracts() {
  const decisionsHtml = fs.readFileSync(path.join(__dirname, '../web/public/decisions.html'), 'utf8');
  assert.ok(decisionsHtml.includes('id="rule-conflict-overview"'));
  assert.ok(decisionsHtml.includes('/js/rule-conflict-utils.js'));

  const decisionsJs = fs.readFileSync(path.join(__dirname, '../web/public/js/decisions.js'), 'utf8');
  assert.ok(decisionsJs.includes('getRuleConflictUtilsAPI'));
  assert.ok(decisionsJs.includes('renderRuleConflictOverview'));
  assert.ok(decisionsJs.includes('rule-conflict-details'));

  const serverJs = fs.readFileSync(path.join(__dirname, '../web/server.js'), 'utf8');
  assert.ok(serverJs.includes("if (url.pathname === '/api/rules')"));
  assert.ok(serverJs.includes("sendJSON(res, 200, { files: results })"));
}

function main() {
  testStyleConflictDetection();
  testNegationConflictDetection();
  testSameCategoryGuard();
  testStaticContracts();
  console.log('verify_rule_conflict_detection_v2: PASS');
}

main();

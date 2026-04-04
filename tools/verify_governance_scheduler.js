const assert = require('assert');
const fs = require('fs');
const path = require('path');

const governanceSchedulerUtils = require('../web/public/js/governance-scheduler-utils.js');
const serverModule = require('../web/server.js');

function testConfigParsing() {
  const raw = fs.readFileSync(path.join(__dirname, '../web/governance.json'), 'utf8');
  const config = governanceSchedulerUtils.parseGovernanceConfig(raw, {
    configPath: 'web/governance.json',
  });

  assert.strictEqual(config.enabled, true);
  assert.strictEqual(config.dueCheck, 'startup');
  assert.ok(Array.isArray(config.checks));
  assert.strictEqual(config.checks.length, 4);
  assert.strictEqual(config.checks[0].frequencyLabel, '每週');
  assert.strictEqual(config.warnings.length, 0);
}

function testDueCheckAndSeverity() {
  const config = governanceSchedulerUtils.parseGovernanceConfig({
    enabled: true,
    dueCheck: 'startup',
    checks: [
      {
        id: 'memory-health',
        enabled: true,
        frequency: 'weekly',
        lastReviewedOn: '2026-03-20',
        dueCheck: {
          source: 'memory',
          metric: 'needsAttentionCount',
          attentionThreshold: 1,
        },
      },
      {
        id: 'rules-conflict',
        enabled: true,
        frequency: 'monthly',
        lastReviewedOn: '2026-03-01',
        dueCheck: {
          source: 'rulesConflict',
          metric: 'pairCount',
          attentionThreshold: 1,
        },
      },
    ],
  }, {
    configPath: 'web/governance.json',
  });

  const payload = governanceSchedulerUtils.buildGovernanceProjectSnapshot(config, {
    projectId: 'demo',
    projectName: '測試專案',
    memorySummary: {
      needsAttentionCount: 3,
      staleCount: 1,
    },
    dedupSummary: {
      groupCount: 0,
      duplicateItemCount: 0,
    },
    sharedKnowledgeSummary: {
      groupCount: 0,
      projectCount: 0,
    },
    ruleConflictSummary: {
      pairCount: 0,
      conflictRuleCount: 0,
    },
  }, {
    now: '2026-04-04',
    configPath: 'web/governance.json',
  });

  assert.strictEqual(payload.enabled, true);
  assert.strictEqual(payload.summary.dueCount, 2);
  assert.strictEqual(payload.summary.attentionCount, 1);
  assert.strictEqual(payload.summary.routineCount, 1);

  const memoryTodo = payload.todos.find(todo => todo.checkId === 'memory-health');
  assert.ok(memoryTodo);
  assert.strictEqual(memoryTodo.severity, 'attention');
  assert.ok(memoryTodo.summary.includes('3 條記憶需要優先確認'));
  assert.ok(memoryTodo.manualNote.includes('lastReviewedOn'));

  const ruleTodo = payload.todos.find(todo => todo.checkId === 'rules-conflict');
  assert.ok(ruleTodo);
  assert.strictEqual(ruleTodo.severity, 'routine');
  assert.ok(ruleTodo.summary.includes('目前沒有新衝突'));
}

function testDisabledFallback() {
  const payload = governanceSchedulerUtils.buildGovernanceProjectSnapshot({
    enabled: false,
    dueCheck: 'startup',
    checks: [],
    warnings: ['disabled'],
    configPath: 'web/governance.json',
  }, {
    projectId: 'demo',
    projectName: '測試專案',
  }, {
    now: '2026-04-04',
  });

  assert.strictEqual(payload.enabled, false);
  assert.strictEqual(payload.summary.dueCount, 0);
  assert.deepStrictEqual(payload.todos, []);
  assert.ok(payload.warnings.includes('disabled'));
}

function testServerSnapshot() {
  serverModule.refreshGovernanceSnapshots(new Date('2026-04-04T00:00:00.000Z'));
  const snapshot = serverModule.getGovernanceSnapshotForProject({
    currentProject: {
      id: 'personal-ai',
      name: '個人 AI 工作系統',
      path: path.resolve(__dirname, '..'),
    },
  });

  assert.strictEqual(snapshot.enabled, true);
  assert.strictEqual(snapshot.configPath, 'web/governance.json');
  assert.ok(Array.isArray(snapshot.todos));
  assert.ok(typeof snapshot.summary.dueCount === 'number');
}

function testStaticContracts() {
  const overviewHtml = fs.readFileSync(path.join(__dirname, '../web/public/index.html'), 'utf8');
  assert.ok(overviewHtml.includes('id="governance-content"'));

  const overviewJs = fs.readFileSync(path.join(__dirname, '../web/public/js/overview.js'), 'utf8');
  assert.ok(overviewJs.includes("apiFetch('/api/governance')"));
  assert.ok(overviewJs.includes('renderGovernance('));
  assert.ok(overviewJs.includes('manualNote'));

  const styleCss = fs.readFileSync(path.join(__dirname, '../web/public/css/style.css'), 'utf8');
  assert.ok(styleCss.includes('.governance-summary'));
  assert.ok(styleCss.includes('.governance-todo-card'));

  const serverJs = fs.readFileSync(path.join(__dirname, '../web/server.js'), 'utf8');
  assert.ok(serverJs.includes('governanceSchedulerUtils'));
  assert.ok(serverJs.includes("'/api/governance'"));
  assert.ok(serverJs.includes('refreshGovernanceSnapshots'));
}

function main() {
  testConfigParsing();
  testDueCheckAndSeverity();
  testDisabledFallback();
  testServerSnapshot();
  testStaticContracts();
  console.log('verify_governance_scheduler: PASS');
}

main();

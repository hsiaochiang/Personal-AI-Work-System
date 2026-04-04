const assert = require('assert');
const fs = require('fs');
const path = require('path');
const childProcess = require('child_process');

const memoryHealthUtils = require('../web/public/js/memory-health-utils.js');
const sharedKnowledgeUtils = require('../web/public/js/shared-knowledge-utils.js');

function buildFiles(entries) {
  return memoryHealthUtils.buildMemoryApiPayload(entries, { now: '2026-04-04' }).files;
}

function buildProject(projectId, projectName, entries) {
  return {
    projectId,
    projectName,
    files: buildFiles(entries),
  };
}

function testCrossProjectGrouping() {
  const payload = sharedKnowledgeUtils.buildSharedKnowledgePayload([
    buildProject('personal-ai', '個人 AI 工作系統', [
      {
        filename: 'preference-rules.md',
        content: '# Preference Rules\n\n## 2026-04-04\n- 偏好白話、清楚、可直接理解的表達 <!-- source: copilot -->\n- 在實作前先完成較完整的規劃 <!-- source: plain -->\n',
      },
    ]),
    buildProject('mock-test', '測試專案', [
      {
        filename: 'preference-rules.md',
        content: '# Preference Rules\n\n## 2026-04-04\n- 偏好白話、清楚、可直接理解的表達 <!-- source: plain -->\n- 在實作前先完成較完整的規劃 <!-- source: plain -->\n',
      },
    ]),
  ], { currentProjectId: 'personal-ai' });

  assert.strictEqual(payload.summary.groupCount, 2);
  assert.ok(payload.groups.every(group => group.projectIds.includes('personal-ai')));
  assert.ok(payload.groups.every(group => group.projectIds.includes('mock-test')));
  assert.ok(payload.groups.every(group => group.filename === 'preference-rules.md'));
}

function testSameFilenameGuard() {
  const payload = sharedKnowledgeUtils.buildSharedKnowledgePayload([
    buildProject('personal-ai', '個人 AI 工作系統', [
      {
        filename: 'preference-rules.md',
        content: '# Preference Rules\n\n## 2026-04-04\n- 先規劃再落地 <!-- source: plain -->\n',
      },
    ]),
    buildProject('mock-test', '測試專案', [
      {
        filename: 'task-patterns.md',
        content: '# Task Patterns\n\n## 2026-04-04\n- 先規劃再落地 <!-- source: plain -->\n',
      },
    ]),
  ], { currentProjectId: 'personal-ai' });

  assert.strictEqual(payload.summary.groupCount, 0, 'different filenames must not form shared groups');
}

function testCurrentProjectFiltering() {
  const payload = sharedKnowledgeUtils.buildSharedKnowledgePayload([
    buildProject('personal-ai', '個人 AI 工作系統', [
      {
        filename: 'preference-rules.md',
        content: '# Preference Rules\n\n## 2026-04-04\n- 偏好白話表達 <!-- source: plain -->\n',
      },
    ]),
    buildProject('mock-test', '測試專案', [
      {
        filename: 'preference-rules.md',
        content: '# Preference Rules\n\n## 2026-04-04\n- 偏好白話表達 <!-- source: plain -->\n',
      },
    ]),
    buildProject('other-project', '其他專案', [
      {
        filename: 'task-patterns.md',
        content: '# Task Patterns\n\n## 2026-04-04\n- 先規劃再落地 <!-- source: plain -->\n',
      },
      {
        filename: 'task-patterns.md',
        content: '# Task Patterns\n\n## 2026-04-04\n- 先規劃再落地 <!-- source: plain -->\n',
      },
    ]),
  ], { currentProjectId: 'personal-ai' });

  assert.strictEqual(payload.summary.groupCount, 1);
  assert.ok(payload.groups.every(group => group.projectIds.includes('personal-ai')));
}

function testLowSignalMetadataIsIgnored() {
  const payload = sharedKnowledgeUtils.buildSharedKnowledgePayload([
    buildProject('personal-ai', '個人 AI 工作系統', [
      {
        filename: 'preference-rules.md',
        content: '# Preference Rules\n\n## 2026-04-04\n- 狀態：已確認\n- 偏好白話表達 <!-- source: plain -->\n',
      },
    ]),
    buildProject('mock-test', '測試專案', [
      {
        filename: 'preference-rules.md',
        content: '# Preference Rules\n\n## 2026-04-04\n- 狀態：已確認\n- 偏好白話表達 <!-- source: plain -->\n',
      },
    ]),
  ]);

  assert.strictEqual(payload.summary.groupCount, 1, 'status metadata should not create a separate shared candidate');
  assert.ok(payload.groups.every(group => group.sharedSummary !== '狀態：已確認'));
}

function testReportMarkdown() {
  const payload = sharedKnowledgeUtils.buildSharedKnowledgePayload([
    buildProject('personal-ai', '個人 AI 工作系統', [
      {
        filename: 'preference-rules.md',
        content: '# Preference Rules\n\n## 2026-04-04\n- 偏好白話表達 <!-- source: plain -->\n',
      },
    ]),
    buildProject('mock-test', '測試專案', [
      {
        filename: 'preference-rules.md',
        content: '# Preference Rules\n\n## 2026-04-04\n- 偏好白話表達 <!-- source: plain -->\n',
      },
    ]),
  ]);

  const markdown = sharedKnowledgeUtils.buildSharedKnowledgeReportMarkdown(payload, {
    generatedAt: '2026-04-04T12:00:00.000Z',
  });

  assert.ok(markdown.includes('# Shared Knowledge Candidates'));
  assert.ok(markdown.includes('Generated at: 2026-04-04T12:00:00.000Z'));
  assert.ok(markdown.includes('Snapshot path: docs/shared/shared-knowledge-candidates.md'));
  assert.ok(markdown.includes('[個人 AI 工作系統] 偏好白話表達'));
}

function testStaticContracts() {
  const memoryHtml = fs.readFileSync(path.join(__dirname, '../web/public/memory.html'), 'utf8');
  assert.ok(memoryHtml.includes('id="memory-shared-overview"'));
  assert.ok(memoryHtml.includes('/js/shared-knowledge-utils.js'));

  const memoryJs = fs.readFileSync(path.join(__dirname, '../web/public/js/memory.js'), 'utf8');
  assert.ok(memoryJs.includes('updateSharedKnowledgeOverview'));
  assert.ok(memoryJs.includes('sharedKnowledge'));
  assert.ok(memoryJs.includes('suggestion-only'));

  const serverJs = fs.readFileSync(path.join(__dirname, '../web/server.js'), 'utf8');
  assert.ok(serverJs.includes('sharedKnowledgeUtils'));
  assert.ok(serverJs.includes('sharedKnowledge: buildSharedKnowledgeForProject'));
}

function testGeneratorOutput() {
  const repoRoot = path.resolve(__dirname, '..');
  childProcess.execFileSync(process.execPath, ['tools/generate_shared_knowledge_report.js'], {
    cwd: repoRoot,
    stdio: 'pipe',
  });

  const snapshotPath = path.join(repoRoot, 'docs/shared/shared-knowledge-candidates.md');
  const markdown = fs.readFileSync(snapshotPath, 'utf8');
  assert.ok(markdown.includes('# Shared Knowledge Candidates'));
  assert.ok(markdown.includes('個人 AI 工作系統'));
  assert.ok(markdown.includes('測試專案'));
}

function main() {
  testCrossProjectGrouping();
  testSameFilenameGuard();
  testCurrentProjectFiltering();
  testLowSignalMetadataIsIgnored();
  testReportMarkdown();
  testStaticContracts();
  testGeneratorOutput();
  console.log('verify_cross_project_shared_knowledge: PASS');
}

main();

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const memorySourceUtils = require('../web/public/js/memory-source-utils.js');

function main() {
  const chatgptLine = memorySourceUtils.buildAttributedMemoryListItem(
    '這一輪只做最小安全修改\n不要擴大到 Change 6',
    'chatgpt'
  );
  assert.strictEqual(chatgptLine, '- 這一輪只做最小安全修改 <!-- source: chatgpt -->');

  const parsedLine = memorySourceUtils.parseAttributedMemoryListItem(chatgptLine);
  assert.deepStrictEqual(parsedLine, {
    content: '這一輪只做最小安全修改',
    source: 'chatgpt',
  });

  const markdown = [
    '# Preference Rules',
    '',
    '## 提取於 2026-04-03',
    '',
    chatgptLine,
    memorySourceUtils.buildAttributedMemoryListItem('沿用既有 writeback whitelist', 'copilot'),
    '- 沒有 metadata 的 legacy 條目',
    memorySourceUtils.buildAttributedMemoryListItem('保留 custom tool label', 'custom:gemini'),
  ].join('\n');

  const groups = memorySourceUtils.parseMemoryMarkdown(markdown);
  assert.strictEqual(groups.length, 1);
  assert.strictEqual(groups[0].title, '提取於 2026-04-03');
  assert.strictEqual(groups[0].items.length, 4);
  assert.deepStrictEqual(groups[0].items[0], {
    content: '這一輪只做最小安全修改',
    source: 'chatgpt',
  });
  assert.deepStrictEqual(groups[0].items[2], {
    content: '沒有 metadata 的 legacy 條目',
    source: '',
  });

  assert.deepStrictEqual(memorySourceUtils.getMemorySourcePresentation('plain'), {
    label: 'Plain',
    className: 'source-plain',
  });
  assert.deepStrictEqual(memorySourceUtils.getMemorySourcePresentation('custom:gemini'), {
    label: 'gemini',
    className: 'source-custom',
  });

  const extractHtml = fs.readFileSync(path.join(__dirname, '../web/public/extract.html'), 'utf8');
  const memoryHtml = fs.readFileSync(path.join(__dirname, '../web/public/memory.html'), 'utf8');
  assert.ok(extractHtml.includes('/js/memory-source-utils.js'));
  assert.ok(memoryHtml.includes('/js/memory-source-utils.js'));

  console.log('verify_source_attribution_in_memory: PASS');
}

main();

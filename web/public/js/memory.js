/* ─── Memory Review page logic ─── */

/** Display name mapping for memory files */
const CATEGORY_LABELS = {
  'decision-log.md': '決策紀錄',
  'output-patterns.md': '輸出模式',
  'preference-rules.md': '偏好規則',
  'project-context.md': '專案背景',
  'skill-candidates.md': '技能候選',
  'task-patterns.md': '任務模式',
};

const CATEGORY_ICONS = {
  'decision-log.md': 'gavel',
  'output-patterns.md': 'format_list_bulleted',
  'preference-rules.md': 'tune',
  'project-context.md': 'info',
  'skill-candidates.md': 'school',
  'task-patterns.md': 'pattern',
};

document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('memory-content');
  const kpiTotal = document.getElementById('kpi-total');
  const kpiFiles = document.getElementById('kpi-files');

  showLoading(container);

  try {
    const data = await apiFetch('/api/memory');

    if (!data.files || data.files.length === 0) {
      showEmpty(container, 'folder_open', '尚無記憶檔案');
      return;
    }

    // KPIs
    let totalItems = 0;
    const parsed = data.files.map(f => {
      const entries = parseMemoryFile(f.content);
      totalItems += entries.reduce((sum, g) => sum + g.items.length, 0);
      return { filename: f.filename, groups: entries };
    });

    if (kpiFiles) kpiFiles.textContent = data.files.length;
    if (kpiTotal) kpiTotal.textContent = totalItems;

    renderMemory(container, parsed);
  } catch (err) {
    showError(container, '無法載入記憶資料: ' + err.message);
  }
});

/**
 * Parse a memory markdown file into groups of items.
 * Groups are ## or ### headings, items are - list entries.
 */
function parseMemoryFile(md) {
  const groups = [];
  let currentGroup = null;
  const lines = md.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();

    // Detect group headers (## or ###)
    const headerMatch = trimmed.match(/^#{2,3}\s+(.+)$/);
    if (headerMatch) {
      currentGroup = { title: headerMatch[1], items: [] };
      groups.push(currentGroup);
      continue;
    }

    // Collect list items under current group
    if (currentGroup && trimmed.startsWith('- ')) {
      currentGroup.items.push(trimmed.replace(/^-\s*/, ''));
    }
  }

  return groups;
}

function renderMemory(container, files) {
  container.innerHTML = '';

  files.forEach(file => {
    const category = document.createElement('div');
    category.className = 'memory-category';

    // Category header
    const header = document.createElement('div');
    header.className = 'memory-category-header';

    const icon = document.createElement('span');
    icon.className = 'material-symbols-outlined';
    icon.textContent = CATEGORY_ICONS[file.filename] || 'description';
    icon.style.color = 'var(--primary)';
    header.appendChild(icon);

    const h3 = document.createElement('h3');
    h3.textContent = CATEGORY_LABELS[file.filename] || file.filename.replace('.md', '');
    header.appendChild(h3);

    const totalItems = file.groups.reduce((sum, g) => sum + g.items.length, 0);
    const count = document.createElement('span');
    count.className = 'memory-count';
    count.textContent = totalItems + ' 條';
    header.appendChild(count);

    category.appendChild(header);

    // Groups and items
    file.groups.forEach(group => {
      if (group.items.length === 0) return;

      // Group sub-header
      const subHeader = document.createElement('div');
      subHeader.style.fontSize = '0.8125rem';
      subHeader.style.fontWeight = '600';
      subHeader.style.color = 'var(--on-surface-variant)';
      subHeader.style.marginTop = '0.75rem';
      subHeader.style.marginBottom = '0.375rem';
      subHeader.textContent = group.title;
      category.appendChild(subHeader);

      // Items
      group.items.forEach(item => {
        const card = document.createElement('div');
        card.className = 'memory-item';

        // Check for key: value pattern
        const kvMatch = item.match(/^(.+?)[:：]\s*(.+)$/);
        if (kvMatch) {
          const title = document.createElement('div');
          title.className = 'memory-item-title';
          title.textContent = kvMatch[1];
          card.appendChild(title);

          const body = document.createElement('div');
          body.className = 'memory-item-body';
          body.textContent = kvMatch[2];
          card.appendChild(body);
        } else {
          const body = document.createElement('div');
          body.className = 'memory-item-body';
          body.textContent = item;
          card.appendChild(body);
        }

        category.appendChild(card);
      });
    });

    container.appendChild(category);
  });
}

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

function getMemorySourceUtilsAPI() {
  if (!window.MemorySourceUtils) {
    throw new Error('MemorySourceUtils 未載入');
  }
  return window.MemorySourceUtils;
}

function getMemoryHealthUtilsAPI() {
  if (!window.MemoryHealthUtils) {
    throw new Error('MemoryHealthUtils 未載入');
  }
  return window.MemoryHealthUtils;
}

function formatPercent(value) {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return '—';
  }

  return `${value % 1 === 0 ? value.toFixed(0) : value.toFixed(1)}%`;
}

function updateHealthOverview(summary) {
  const overview = document.getElementById('memory-health-overview');
  if (!overview) {
    return;
  }

  overview.innerHTML = '';

  const title = document.createElement('div');
  title.className = 'memory-health-overview-title';
  title.textContent = '知識健康度概覽';
  overview.appendChild(title);

  const copy = document.createElement('div');
  copy.className = 'memory-health-overview-copy';
  copy.textContent = summary.totalItems
    ? `目前共有 ${summary.totalItems} 條記憶，其中 ${summary.needsAttentionCount} 條建議優先檢查，${summary.staleCount} 條已進入過期風險。`
    : '目前尚無可評分的記憶條目。';
  overview.appendChild(copy);

  const legend = document.createElement('div');
  legend.className = 'memory-health-overview-legend';

  ['healthy', 'review', 'stale'].forEach(status => {
    const presentation = getMemoryHealthUtilsAPI().getMemoryHealthPresentation(status);
    if (!presentation) {
      return;
    }

    const badge = document.createElement('span');
    badge.className = `health-badge ${presentation.className}`;
    badge.textContent = presentation.label;
    legend.appendChild(badge);
  });

  overview.appendChild(legend);
}

document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('memory-content');
  const kpiTotal = document.getElementById('kpi-total');
  const kpiFiles = document.getElementById('kpi-files');
  const kpiStaleRatio = document.getElementById('kpi-stale-ratio');
  const kpiCleanup = document.getElementById('kpi-cleanup');

  showLoading(container);

  try {
    const data = await apiFetch('/api/memory');

    if (!data.files || data.files.length === 0) {
      showEmpty(container, 'folder_open', '尚無記憶檔案');
      return;
    }

    // KPIs
    const parsed = data.files.map(f => {
      const groups = Array.isArray(f.groups) ? f.groups : parseMemoryFile(f.content);
      return { filename: f.filename, groups };
    });
    const summary = data.summary || getMemoryHealthUtilsAPI().buildMemoryApiPayload(data.files).summary;

    if (kpiFiles) kpiFiles.textContent = data.files.length;
    if (kpiTotal) kpiTotal.textContent = summary.totalItems;
    if (kpiStaleRatio) kpiStaleRatio.textContent = formatPercent(summary.staleRatio);
    if (kpiCleanup) kpiCleanup.textContent = summary.needsAttentionCount;

    updateHealthOverview(summary);

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
  return getMemorySourceUtilsAPI().parseMemoryMarkdown(md);
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
        if (item.health && item.health.status) {
          card.classList.add(`memory-item-${item.health.status}`);
        }

        const sourcePresentation = getMemorySourceUtilsAPI().getMemorySourcePresentation(item.source);
        const healthPresentation = item.health
          ? getMemoryHealthUtilsAPI().getMemoryHealthPresentation(item.health.status)
          : null;

        if (sourcePresentation || healthPresentation) {
          const headerRow = document.createElement('div');
          headerRow.className = 'memory-item-header';

          const badges = document.createElement('div');
          badges.className = 'memory-item-badges';

          if (healthPresentation) {
            const healthBadge = document.createElement('span');
            healthBadge.className = `health-badge ${healthPresentation.className}`;
            healthBadge.textContent = healthPresentation.label;
            badges.appendChild(healthBadge);
          }

          if (sourcePresentation) {
            const badge = document.createElement('span');
            badge.className = `source-badge ${sourcePresentation.className}`;
            badge.textContent = sourcePresentation.label;
            badges.appendChild(badge);
          }

          headerRow.appendChild(badges);

          card.appendChild(headerRow);
        }

        if (item.health && item.health.reason) {
          const reason = document.createElement('div');
          reason.className = 'memory-item-health-reason';
          reason.textContent = item.health.reason;
          card.appendChild(reason);
        }

        // Check for key: value pattern
        const kvMatch = item.content.match(/^(.+?)[:：]\s*(.+)$/);
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
          body.textContent = item.content;
          card.appendChild(body);
        }

        category.appendChild(card);
      });
    });

    container.appendChild(category);
  });
}

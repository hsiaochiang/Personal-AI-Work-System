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

let memoryPageRefs = null;
let dedupActionPending = false;
let dedupStatusMessage = null;
let cleanupFilterMode = 'all';
let latestMemoryFiles = [];

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

function getMemoryDedupUtilsAPI() {
  if (!window.MemoryDedupUtils) {
    throw new Error('MemoryDedupUtils 未載入');
  }
  return window.MemoryDedupUtils;
}

function getSharedKnowledgeUtilsAPI() {
  if (!window.SharedKnowledgeUtils) {
    throw new Error('SharedKnowledgeUtils 未載入');
  }
  return window.SharedKnowledgeUtils;
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

function updateSharedKnowledgeOverview(sharedKnowledge) {
  const overview = document.getElementById('memory-shared-overview');
  if (!overview) {
    return;
  }

  getSharedKnowledgeUtilsAPI();
  overview.innerHTML = '';

  const title = document.createElement('div');
  title.className = 'memory-shared-overview-title';
  title.textContent = '共用知識候選';
  overview.appendChild(title);

  const summary = sharedKnowledge && sharedKnowledge.summary ? sharedKnowledge.summary : {
    groupCount: 0,
    candidateItemCount: 0,
    projectCount: 0,
    categoryCount: 0,
  };
  const groups = sharedKnowledge && Array.isArray(sharedKnowledge.groups) ? sharedKnowledge.groups : [];
  const snapshotPath = sharedKnowledge && sharedKnowledge.snapshotPath
    ? sharedKnowledge.snapshotPath
    : 'docs/shared/shared-knowledge-candidates.md';

  const copy = document.createElement('div');
  copy.className = 'memory-shared-overview-copy';
  copy.textContent = summary.groupCount
    ? `目前找到 ${summary.groupCount} 組跨專案候選，共涉及 ${summary.projectCount} 個專案與 ${summary.categoryCount} 類記憶。這些內容仍屬 suggestion-only，需人工確認後再決定是否整理成正式 shared layer。`
    : '目前沒有偵測到足夠穩定的跨專案共用知識候選。若不同專案開始重複記錄相同偏好或模式，這裡會先以 suggestion-only 方式提醒。';
  overview.appendChild(copy);

  const note = document.createElement('div');
  note.className = 'memory-shared-overview-note';
  note.textContent = `Snapshot：${snapshotPath}`;
  overview.appendChild(note);

  if (!summary.groupCount) {
    return;
  }

  const stats = document.createElement('div');
  stats.className = 'memory-shared-stats';
  stats.appendChild(createBadge(`${summary.candidateItemCount} 條候選`, 'memory-shared-stat'));
  stats.appendChild(createBadge(`${summary.projectCount} 個專案`, 'memory-shared-stat'));
  overview.appendChild(stats);

  groups.forEach(group => {
    const card = document.createElement('div');
    card.className = 'memory-shared-group';

    const header = document.createElement('div');
    header.className = 'memory-shared-group-header';

    const meta = document.createElement('div');
    meta.className = 'memory-shared-group-meta';

    const metaTitle = document.createElement('div');
    metaTitle.className = 'memory-shared-group-title';
    metaTitle.textContent = CATEGORY_LABELS[group.filename] || group.filename;
    meta.appendChild(metaTitle);

    const metaSub = document.createElement('div');
    metaSub.className = 'memory-shared-group-sub';
    metaSub.textContent = `${group.projectCount} 個專案 · ${group.similarityLabel} · 相似度 ${formatPercent(group.similarity * 100)}`;
    meta.appendChild(metaSub);

    header.appendChild(meta);
    card.appendChild(header);

    const summaryCopy = document.createElement('div');
    summaryCopy.className = 'memory-shared-group-summary';
    summaryCopy.textContent = group.sharedSummary
      ? `建議 shared 摘要：${group.sharedSummary}。${group.primaryReason || ''}`
      : '建議先人工整理成一條可跨專案重用的 shared 摘要。';
    card.appendChild(summaryCopy);

    const projectList = document.createElement('div');
    projectList.className = 'memory-shared-projects';
    const projectNames = Array.from(new Set((group.items || []).map(item => item.projectName)));
    projectNames.forEach(projectName => {
      projectList.appendChild(createBadge(projectName, 'memory-shared-project-badge'));
    });
    card.appendChild(projectList);

    (group.items || []).forEach(item => {
      const itemCard = document.createElement('div');
      itemCard.className = 'memory-shared-item';

      const badges = document.createElement('div');
      badges.className = 'memory-shared-item-badges';
      badges.appendChild(createBadge(item.projectName, 'memory-shared-project-badge'));

      if (item.health && item.health.status) {
        const healthPresentation = getMemoryHealthUtilsAPI().getMemoryHealthPresentation(item.health.status);
        if (healthPresentation) {
          badges.appendChild(createBadge(healthPresentation.label, `health-badge ${healthPresentation.className}`));
        }
      }

      const sourcePresentation = getMemorySourceUtilsAPI().getMemorySourcePresentation(item.source);
      if (sourcePresentation) {
        badges.appendChild(createBadge(sourcePresentation.label, `source-badge ${sourcePresentation.className}`));
      }

      itemCard.appendChild(badges);

      const content = document.createElement('div');
      content.className = 'memory-shared-item-content';
      content.textContent = item.content;
      itemCard.appendChild(content);

      const sub = document.createElement('div');
      sub.className = 'memory-shared-item-sub';
      sub.textContent = item.groupTitle || '未標示群組';
      itemCard.appendChild(sub);

      card.appendChild(itemCard);
    });

    overview.appendChild(card);
  });
}

function renderDedupStatus(overview) {
  if (!dedupStatusMessage) {
    return;
  }

  const banner = document.createElement('div');
  banner.className = `memory-dedup-status ${dedupStatusMessage.kind || 'info'}`;
  banner.textContent = dedupStatusMessage.message;
  overview.appendChild(banner);
}

function createBadge(text, className) {
  const badge = document.createElement('span');
  badge.className = className;
  badge.textContent = text;
  return badge;
}

function buildMemoryCategoryId(filename) {
  return `category-${String(filename || '').replace(/\.md$/i, '')}`;
}

function updateCleanupFilterUI() {
  const cleanupValue = memoryPageRefs && memoryPageRefs.kpiCleanup;
  const cleanupCard = cleanupValue ? cleanupValue.closest('.kpi-card') : null;
  if (!cleanupCard) {
    return;
  }

  cleanupCard.classList.toggle('kpi-active', cleanupFilterMode === 'needsAttention');
  cleanupCard.style.cursor = 'pointer';
  cleanupCard.title = cleanupFilterMode === 'needsAttention'
    ? '點擊顯示全部記憶條目'
    : '點擊只看需要清理的條目';
}

function setDedupButtonsDisabled(disabled) {
  dedupActionPending = disabled;
  document.querySelectorAll('[data-dedup-action]').forEach(button => {
    button.disabled = disabled;
  });
}

function updateDedupOverview(dedup) {
  const overview = document.getElementById('memory-dedup-overview');
  if (!overview) {
    return;
  }

  getMemoryDedupUtilsAPI();
  overview.innerHTML = '';

  const title = document.createElement('div');
  title.className = 'memory-dedup-overview-title';
  title.textContent = '疑似重複建議';
  overview.appendChild(title);

  const summary = dedup && dedup.summary ? dedup.summary : {
    groupCount: 0,
    duplicateItemCount: 0,
    exactGroupCount: 0,
    nearGroupCount: 0,
  };
  const groups = dedup && Array.isArray(dedup.groups) ? dedup.groups : [];

  const copy = document.createElement('div');
  copy.className = 'memory-dedup-overview-copy';
  copy.textContent = summary.groupCount
    ? `目前找到 ${summary.groupCount} 組疑似重複，共涉及 ${summary.duplicateItemCount} 條記憶。所有整理操作都需要你手動確認，且會先建立 backup。`
    : '目前沒有找到足夠接近的重複條目。之後若同一類記憶被反覆寫回，這裡會顯示可整理的建議群組。';
  overview.appendChild(copy);

  renderDedupStatus(overview);

  if (!summary.groupCount) {
    return;
  }

  const stats = document.createElement('div');
  stats.className = 'memory-dedup-stats';
  stats.appendChild(createBadge(`${summary.exactGroupCount} 組完全重複`, 'memory-dedup-stat'));
  stats.appendChild(createBadge(`${summary.nearGroupCount} 組高度相似`, 'memory-dedup-stat'));
  overview.appendChild(stats);

  groups.forEach(group => {
    const groupCard = document.createElement('div');
    groupCard.className = 'memory-dedup-group';

    const header = document.createElement('div');
    header.className = 'memory-dedup-group-header';

    const meta = document.createElement('div');
    meta.className = 'memory-dedup-group-meta';

    const metaTitle = document.createElement('div');
    metaTitle.className = 'memory-dedup-group-title';
    metaTitle.textContent = CATEGORY_LABELS[group.filename] || group.filename;
    meta.appendChild(metaTitle);

    const metaSub = document.createElement('div');
    metaSub.className = 'memory-dedup-group-sub';
    metaSub.textContent = `${group.itemCount} 條候選 · ${group.similarityLabel} · 相似度 ${formatPercent(group.similarity * 100)}`;
    meta.appendChild(metaSub);

    header.appendChild(meta);

    const mergeButton = document.createElement('button');
    mergeButton.className = 'btn btn-secondary';
    mergeButton.type = 'button';
    mergeButton.dataset.dedupAction = 'merge';
    mergeButton.innerHTML = '<span class="material-symbols-outlined">merge</span>合併為一條';
    mergeButton.addEventListener('click', () => handleDedupMerge(group));
    header.appendChild(mergeButton);

    groupCard.appendChild(header);

    const recommendation = document.createElement('div');
    recommendation.className = 'memory-dedup-group-recommendation';
    const primary = group.items.find(item => item.itemId === group.primaryItemId);
    recommendation.textContent = primary
      ? `建議保留：${primary.content}。${group.primaryReason || ''}`
      : '建議保留目前較健康、較完整的一條。';
    groupCard.appendChild(recommendation);

    group.items.forEach(item => {
      const itemCard = document.createElement('div');
      itemCard.className = 'memory-dedup-item';

      const badges = document.createElement('div');
      badges.className = 'memory-dedup-item-badges';

      if (item.itemId === group.primaryItemId) {
        badges.appendChild(createBadge('建議保留', 'memory-dedup-primary-badge'));
      }

      if (item.health && item.health.status) {
        const healthPresentation = getMemoryHealthUtilsAPI().getMemoryHealthPresentation(item.health.status);
        if (healthPresentation) {
          badges.appendChild(createBadge(healthPresentation.label, `health-badge ${healthPresentation.className}`));
        }
      }

      const sourcePresentation = getMemorySourceUtilsAPI().getMemorySourcePresentation(item.source);
      if (sourcePresentation) {
        badges.appendChild(createBadge(sourcePresentation.label, `source-badge ${sourcePresentation.className}`));
      }

      itemCard.appendChild(badges);

      const content = document.createElement('div');
      content.className = 'memory-dedup-item-content';
      content.textContent = item.content;
      itemCard.appendChild(content);

      const sub = document.createElement('div');
      sub.className = 'memory-dedup-item-sub';
      sub.textContent = item.groupTitle;
      itemCard.appendChild(sub);

      if (item.itemId !== group.primaryItemId) {
        const deleteButton = document.createElement('button');
        deleteButton.className = 'btn-text';
        deleteButton.type = 'button';
        deleteButton.dataset.dedupAction = 'delete';
        deleteButton.innerHTML = '<span class="material-symbols-outlined">delete</span>刪除這條';
        deleteButton.addEventListener('click', () => handleDedupDelete(group, item));
        itemCard.appendChild(deleteButton);
      }

      groupCard.appendChild(itemCard);
    });

    overview.appendChild(groupCard);
  });

  setDedupButtonsDisabled(dedupActionPending);
}

async function handleDedupMerge(group) {
  if (dedupActionPending) {
    return;
  }

  const confirmed = window.confirm('將這組疑似重複條目合併為一條？系統會先備份原始 memory 檔案。');
  if (!confirmed) {
    return;
  }

  await runDedupAction({
    filename: group.filename,
    action: 'merge',
    itemIds: group.items.map(item => item.itemId),
    primaryItemId: group.primaryItemId,
    mergedContent: group.mergeCandidate && group.mergeCandidate.content,
    mergedSource: group.mergeCandidate && group.mergeCandidate.source,
  }, '已完成合併，並重新整理 dedup 建議。');
}

async function handleDedupDelete(group, item) {
  if (dedupActionPending) {
    return;
  }

  const confirmed = window.confirm(`刪除這條疑似重複記憶？\n\n${item.content}`);
  if (!confirmed) {
    return;
  }

  await runDedupAction({
    filename: group.filename,
    action: 'delete',
    targetItemId: item.itemId,
  }, '已刪除指定條目，並重新整理 dedup 建議。');
}

async function runDedupAction(body, successMessage) {
  try {
    setDedupButtonsDisabled(true);
    await apiPost('/api/memory/dedup', body);
    dedupStatusMessage = {
      kind: 'success',
      message: successMessage,
    };
    await loadMemoryData();
  } catch (error) {
    dedupStatusMessage = {
      kind: 'error',
      message: `整理失敗：${error.message}`,
    };
    updateDedupOverview({ summary: { groupCount: 0, duplicateItemCount: 0, exactGroupCount: 0, nearGroupCount: 0 }, groups: [] });
  } finally {
    setDedupButtonsDisabled(false);
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  memoryPageRefs = {
    container: document.getElementById('memory-content'),
    kpiTotal: document.getElementById('kpi-total'),
    kpiFiles: document.getElementById('kpi-files'),
    kpiStaleRatio: document.getElementById('kpi-stale-ratio'),
    kpiCleanup: document.getElementById('kpi-cleanup'),
  };

  const cleanupCard = memoryPageRefs.kpiCleanup && memoryPageRefs.kpiCleanup.closest('.kpi-card');
  if (cleanupCard) {
    cleanupCard.addEventListener('click', () => {
      cleanupFilterMode = cleanupFilterMode === 'needsAttention' ? 'all' : 'needsAttention';
      updateCleanupFilterUI();
      renderMemory(memoryPageRefs.container, latestMemoryFiles, cleanupFilterMode);
    });
    updateCleanupFilterUI();
  }

  showLoading(memoryPageRefs.container);
  await loadMemoryData();
});

async function loadMemoryData() {
  const { container, kpiTotal, kpiFiles, kpiStaleRatio, kpiCleanup } = memoryPageRefs;

  try {
    const data = await apiFetch('/api/memory');

    if (!data.files || data.files.length === 0) {
      showEmpty(container, 'folder_open', '尚無記憶檔案');
      updateSharedKnowledgeOverview(null);
      updateDedupOverview(null);
      updateHealthOverview({
        totalItems: 0,
        needsAttentionCount: 0,
        staleCount: 0,
      });
      return;
    }

    const parsed = data.files.map(file => ({
      filename: file.filename,
      groups: Array.isArray(file.groups) ? file.groups : parseMemoryFile(file.content, file.filename),
    }));
    const summary = data.summary || getMemoryHealthUtilsAPI().buildMemoryApiPayload(data.files).summary;
    latestMemoryFiles = parsed;

    if (kpiFiles) kpiFiles.textContent = data.files.length;
    if (kpiTotal) kpiTotal.textContent = summary.totalItems;
    if (kpiStaleRatio) kpiStaleRatio.textContent = formatPercent(summary.staleRatio);
    if (kpiCleanup) kpiCleanup.textContent = summary.needsAttentionCount;
    if (cleanupFilterMode === 'needsAttention' && !summary.needsAttentionCount) {
      cleanupFilterMode = 'all';
    }
    updateCleanupFilterUI();

    updateSharedKnowledgeOverview(data.sharedKnowledge);
    updateDedupOverview(data.dedup);
    updateHealthOverview(summary);
    renderMemory(container, parsed, cleanupFilterMode);
  } catch (error) {
    showError(container, '無法載入記憶資料: ' + error.message);
  }
}

/**
 * Parse a memory markdown file into groups of items.
 * Groups are ## or ### headings, items are - list entries.
 */
function parseMemoryFile(md, filename) {
  return getMemorySourceUtilsAPI().parseMemoryMarkdown(md, { filename });
}

async function handleMemoryItemDelete(filename, itemId, content) {
  if (!itemId) {
    alert('刪除失敗：缺少條目識別資訊，請重新整理後再試。');
    return;
  }

  const confirmed = window.confirm(`確認刪除此條目？\n\n${content.slice(0, 160)}`);
  if (!confirmed) {
    return;
  }

  try {
    await apiPost('/api/memory/item/delete', { filename, itemId });
    await loadMemoryData();
  } catch (error) {
    alert(`刪除失敗：${error.message}`);
  }
}

async function handleMemoryAICurate(filename, categoryEl, triggerButton) {
  const existing = categoryEl.querySelector('.memory-curate-panel');
  if (existing) {
    existing.remove();
  }

  const button = triggerButton || categoryEl.querySelector('.memory-curate-btn');
  if (!button) {
    return;
  }

  const originalLabel = button.innerHTML;
  button.disabled = true;
  button.textContent = '分析中…';

  try {
    const data = await apiPost('/api/memory/ai-curate', { filename });
    const panel = document.createElement('div');
    panel.className = 'memory-curate-panel';
    panel.innerHTML = `
      <div class="memory-curate-panel-header">
        <div>
          <strong>AI 整理建議</strong>
          <div class="memory-curate-summary">${escapeHTML(data.summary || '（無摘要）')}</div>
        </div>
      </div>
      <div class="memory-curate-diff">
        <div class="memory-curate-side">
          <div class="memory-curate-label">原始內容</div>
          <pre class="memory-curate-pre">${escapeHTML(data.original || '')}</pre>
        </div>
        <div class="memory-curate-side">
          <div class="memory-curate-label">AI 改善版本</div>
          <pre class="memory-curate-pre">${escapeHTML(data.improved || '')}</pre>
        </div>
      </div>
      <div class="memory-curate-actions">
        <button class="btn btn-primary" type="button" data-curate-action="confirm">確認覆寫</button>
        <button class="btn btn-ghost" type="button" data-curate-action="skip">略過</button>
      </div>`;

    panel.querySelector('[data-curate-action="skip"]').addEventListener('click', () => {
      panel.remove();
    });

    panel.querySelector('[data-curate-action="confirm"]').addEventListener('click', async () => {
      try {
        await apiPost('/api/memory/write', {
          filename: data.filename,
          content: data.improved,
        });
        panel.remove();
        await loadMemoryData();
      } catch (error) {
        alert(`覆寫失敗：${error.message}`);
      }
    });

    categoryEl.appendChild(panel);
  } catch (error) {
    const hint = /尚未設定 Gemini API key/i.test(error.message)
      ? ' 請先到 /settings 儲存 Gemini API key。'
      : '';
    alert(`AI 整理失敗：${error.message}${hint}`);
  } finally {
    button.disabled = false;
    button.innerHTML = originalLabel;
  }
}

function renderMemory(container, files, filterMode = 'all') {
  container.innerHTML = '';
  let renderedCategoryCount = 0;

  files.forEach(file => {
    const visibleGroups = (file.groups || [])
      .map(group => ({
        ...group,
        items: (group.items || []).filter(item => (
          filterMode !== 'needsAttention'
          || (item.health && item.health.status !== 'healthy')
        )),
      }))
      .filter(group => (group.items || []).length > 0);

    if (!visibleGroups.length) {
      return;
    }

    const category = document.createElement('div');
    category.className = 'memory-category';
    category.id = buildMemoryCategoryId(file.filename);

    const header = document.createElement('div');
    header.className = 'memory-category-header';

    const icon = document.createElement('span');
    icon.className = 'material-symbols-outlined';
    icon.textContent = CATEGORY_ICONS[file.filename] || 'description';
    icon.style.color = 'var(--primary)';
    header.appendChild(icon);

    const heading = document.createElement('h3');
    heading.textContent = CATEGORY_LABELS[file.filename] || file.filename.replace('.md', '');
    header.appendChild(heading);

    const totalItems = file.groups.reduce((sum, group) => sum + group.items.length, 0);
    const count = document.createElement('span');
    count.className = 'memory-count';
    count.textContent = `${visibleGroups.reduce((sum, group) => sum + group.items.length, 0)} / ${totalItems} 條`;
    header.appendChild(count);

    const curateBtn = document.createElement('button');
    curateBtn.className = 'btn btn-ghost btn-sm memory-curate-btn';
    curateBtn.type = 'button';
    curateBtn.innerHTML = '<span class="material-symbols-outlined">auto_awesome</span>AI 整理';
    curateBtn.addEventListener('click', () => handleMemoryAICurate(file.filename, category, curateBtn));
    header.appendChild(curateBtn);

    category.appendChild(header);

    visibleGroups.forEach(group => {
      if (group.items.length === 0) {
        return;
      }

      const subHeader = document.createElement('div');
      subHeader.className = 'memory-group-header';
      subHeader.textContent = group.title;
      category.appendChild(subHeader);

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
            badges.appendChild(createBadge(healthPresentation.label, `health-badge ${healthPresentation.className}`));
          }

          if (sourcePresentation) {
            badges.appendChild(createBadge(sourcePresentation.label, `source-badge ${sourcePresentation.className}`));
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

        if (item.itemId) {
          const deleteBtn = document.createElement('button');
          deleteBtn.className = 'btn-icon memory-item-delete';
          deleteBtn.type = 'button';
          deleteBtn.title = '刪除此條目';
          deleteBtn.innerHTML = '<span class="material-symbols-outlined">delete</span>';
          deleteBtn.addEventListener('click', () => handleMemoryItemDelete(file.filename, item.itemId, item.content));
          card.appendChild(deleteBtn);
        }

        category.appendChild(card);
      });
    });

    container.appendChild(category);
    renderedCategoryCount += 1;
  });

  if (!renderedCategoryCount) {
    showEmpty(
      container,
      filterMode === 'needsAttention' ? 'task_alt' : 'folder_open',
      filterMode === 'needsAttention'
        ? '目前沒有需要優先清理的記憶條目。'
        : '尚無記憶檔案'
    );
  }
}

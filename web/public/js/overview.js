/* ─── Overview page logic ─── */

document.addEventListener('DOMContentLoaded', async () => {
  const phaseContainer = document.getElementById('phase-content');
  const governanceContainer = document.getElementById('governance-content');

  showLoading(phaseContainer);
  if (governanceContainer) {
    showLoading(governanceContainer);
  }

  try {
    const [roadmapData, governanceData] = await Promise.all([
      apiFetch('/api/roadmap'),
      apiFetch('/api/governance').catch(() => null),
    ]);
    const phases = parseRoadmap(roadmapData.content);

    if (phases.length === 0) {
      showEmpty(phaseContainer, 'dashboard', '尚無 Phase 資料');
    } else {
      renderKPIs(phases);
      renderPhaseTable(phaseContainer, phases);
    }

    renderGovernance(governanceContainer, governanceData);
  } catch (err) {
    showError(phaseContainer, '無法載入 roadmap: ' + err.message);
    if (governanceContainer) {
      showError(governanceContainer, '無法載入治理待辦');
    }
  }
});

/**
 * Parse roadmap.md to extract phase table rows.
 * Expected format: | Done | Phase | 使用者做得到的事 | 狀態 |
 */
function parseRoadmap(md) {
  const phases = [];
  const lines = md.split('\n');

  for (const line of lines) {
    // Match: | [x] or [ ] | Phase N or Spec | description | status |
    const match = line.match(
      /\|\s*\[([x ])\]\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|/i
    );
    if (match) {
      const done = match[1].toLowerCase() === 'x';
      const phase = match[2].trim();
      const description = match[3].trim();
      const status = match[4].trim();
      phases.push({ done, phase, description, status });
    }
  }

  return phases;
}

function renderKPIs(phases) {
  const total = phases.length;
  const done = phases.filter(p => p.done).length;
  const nextPhase = phases.find(p => !p.done);
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  const kpiTotal = document.getElementById('kpi-total');
  const kpiDone = document.getElementById('kpi-done');
  const kpiNext = document.getElementById('kpi-next');
  const kpiProgress = document.getElementById('kpi-progress');

  if (kpiTotal) kpiTotal.textContent = total;
  if (kpiDone) kpiDone.textContent = done;
  if (kpiNext) kpiNext.textContent = nextPhase ? nextPhase.phase : '—';
  if (kpiProgress) kpiProgress.textContent = pct + '%';
}

function renderPhaseTable(container, phases) {
  container.innerHTML = '';

  const table = document.createElement('table');
  table.className = 'phase-table';

  // Header
  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  ['狀態', 'Phase', '使用者做得到的事', '進度'].forEach(text => {
    const th = document.createElement('th');
    th.textContent = text;
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);
  table.appendChild(thead);

  // Body
  const tbody = document.createElement('tbody');
  phases.forEach(p => {
    const tr = document.createElement('tr');

    // Status icon
    const tdStatus = document.createElement('td');
    const badge = document.createElement('span');
    if (p.done) {
      badge.className = 'status-badge status-done';
      badge.textContent = '✓ 完成';
    } else if (p.status.includes('下一步') || p.status.includes('←')) {
      badge.className = 'status-badge status-next';
      badge.textContent = '→ 下一步';
    } else {
      badge.className = 'status-badge status-pending';
      badge.textContent = '未開始';
    }
    tdStatus.appendChild(badge);
    tr.appendChild(tdStatus);

    // Phase name
    const tdPhase = document.createElement('td');
    tdPhase.textContent = p.phase;
    tdPhase.style.fontWeight = '600';
    tr.appendChild(tdPhase);

    // Description
    const tdDesc = document.createElement('td');
    tdDesc.textContent = p.description;
    tr.appendChild(tdDesc);

    // Status text
    const tdProgress = document.createElement('td');
    tdProgress.textContent = p.status.replace(/[*←]/g, '').trim();
    tdProgress.style.fontSize = '0.8125rem';
    tdProgress.style.color = 'var(--on-surface-variant)';
    tr.appendChild(tdProgress);

    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  container.appendChild(table);
}

function renderGovernance(container, payload) {
  if (!container) {
    return;
  }

  if (!payload) {
    showError(container, '無法載入治理待辦');
    return;
  }

  container.innerHTML = '';

  const summary = payload.summary || { dueCount: 0, attentionCount: 0, routineCount: 0 };
  const warnings = Array.isArray(payload.warnings) ? payload.warnings : [];

  if (!payload.enabled) {
    const wrap = document.createElement('div');
    wrap.className = 'governance-state governance-state-disabled';
    wrap.innerHTML = `
      <div class="governance-state-title">治理排程目前停用</div>
      <div class="governance-state-copy">如需啟用，請更新 ${escapeHTML(payload.configPath || 'web/governance.json')}。目前 Overview 只顯示 roadmap，不會主動產生治理待辦。</div>
    `;
    container.appendChild(wrap);
    return;
  }

  const summaryWrap = document.createElement('div');
  summaryWrap.className = 'governance-summary';
  summaryWrap.innerHTML = `
    <div>
      <div class="governance-summary-title">Startup Due-check Snapshot</div>
      <div class="governance-summary-copy">server 啟動時已檢查目前專案的治理排程。系統只提醒，不會自動更新設定或改寫任何 knowledge source。</div>
      <div class="governance-summary-note">Checked at: ${escapeHTML(payload.checkedAt || '—')} · Config: ${escapeHTML(payload.configPath || 'web/governance.json')}</div>
    </div>
    <div class="governance-summary-stats">
      <div class="governance-stat">
        <span class="governance-stat-value">${summary.dueCount || 0}</span>
        <span class="governance-stat-label">到期待辦</span>
      </div>
      <div class="governance-stat">
        <span class="governance-stat-value">${summary.attentionCount || 0}</span>
        <span class="governance-stat-label">優先確認</span>
      </div>
      <div class="governance-stat">
        <span class="governance-stat-value">${summary.routineCount || 0}</span>
        <span class="governance-stat-label">例行巡檢</span>
      </div>
    </div>
  `;
  container.appendChild(summaryWrap);

  if (warnings.length) {
    const warning = document.createElement('div');
    warning.className = 'governance-warning';
    warning.textContent = warnings.join(' ｜ ');
    container.appendChild(warning);
  }

  const todos = Array.isArray(payload.todos) ? payload.todos : [];
  if (todos.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'governance-state governance-state-empty';
    empty.innerHTML = `
      <div class="governance-state-title">目前沒有到期的治理待辦</div>
      <div class="governance-state-copy">當健康度、疑似重複、規則衝突或 shared knowledge 巡檢到期時，這裡會先以 suggestion-only 方式提醒。</div>
    `;
    container.appendChild(empty);
    return;
  }

  const list = document.createElement('div');
  list.className = 'governance-todo-list';
  todos.forEach(todo => {
    const card = document.createElement('div');
    card.className = `governance-todo-card severity-${todo.severity || 'routine'}`;
    card.innerHTML = `
      <div class="governance-todo-head">
        <div>
          <div class="governance-todo-title">${escapeHTML(todo.title || '治理待辦')}</div>
          <div class="governance-todo-meta">${escapeHTML(todo.frequencyLabel || todo.frequency || '排程')} · 上次確認 ${escapeHTML(todo.lastReviewedOn || '—')} · 已逾期 ${escapeHTML(String(todo.overdueDays || 0))} 天</div>
        </div>
        <span class="status-badge ${todo.severity === 'attention' ? 'status-next' : 'status-pending'}">${todo.severity === 'attention' ? '需人工確認' : '例行巡檢'}</span>
      </div>
      <div class="governance-todo-copy">${escapeHTML(todo.summary || '')}</div>
      <div class="governance-todo-footer">
        <a class="btn btn-secondary" href="${escapeHTML(todo.route || '/')}">前往 ${escapeHTML(todo.route || '/')}</a>
        <span class="governance-todo-note">${escapeHTML(todo.manualNote || '確認後請手動更新設定。')}</span>
      </div>
    `;
    list.appendChild(card);
  });
  container.appendChild(list);
}

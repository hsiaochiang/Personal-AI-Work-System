/* ─── Overview page logic ─── */

document.addEventListener('DOMContentLoaded', async () => {
  const phaseContainer = document.getElementById('phase-content');
  const kpiTotal = document.getElementById('kpi-total');
  const kpiDone = document.getElementById('kpi-done');
  const kpiNext = document.getElementById('kpi-next');
  const kpiProgress = document.getElementById('kpi-progress');

  showLoading(phaseContainer);

  try {
    const data = await apiFetch('/api/roadmap');
    const phases = parseRoadmap(data.content);

    if (phases.length === 0) {
      showEmpty(phaseContainer, 'dashboard', '尚無 Phase 資料');
      return;
    }

    renderKPIs(phases);
    renderPhaseTable(phaseContainer, phases);
  } catch (err) {
    showError(phaseContainer, '無法載入 roadmap: ' + err.message);
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

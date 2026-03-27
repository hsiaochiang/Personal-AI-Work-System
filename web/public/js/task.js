/* ─── Current Task page logic ─── */

document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('task-content');
  showLoading(container);

  try {
    const data = await apiFetch('/api/current-task');
    const task = parseCurrentTask(data.content);
    renderTask(container, task);
  } catch (err) {
    showError(container, '無法載入當前任務: ' + err.message);
  }
});

/**
 * Parse current-task.md into structured fields.
 * Extracts ## sections and - Key: Value pairs.
 */
function parseCurrentTask(md) {
  const result = {
    name: '',
    owner: '',
    lastUpdated: '',
    goal: '',
    scopeIn: '',
    scopeOut: '',
    constraints: '',
    done: [],
    inProgress: [],
    nextStep: [],
    validationStatus: [],
  };

  const lines = md.split('\n');
  let currentSection = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Detect section headers
    if (trimmed.startsWith('## ')) {
      currentSection = trimmed.replace('## ', '').toLowerCase().trim();
      continue;
    }

    // Parse key-value pairs in Task section
    if (currentSection === 'task') {
      const kv = trimmed.match(/^-\s*(.+?):\s*(.+)$/);
      if (kv) {
        const key = kv[1].toLowerCase().trim();
        const val = kv[2].trim();
        if (key === 'name') result.name = val;
        if (key === 'owner agent') result.owner = val;
        if (key === 'last updated on') result.lastUpdated = val;
      }
    }

    // Parse Goal section (multi-line)
    if (currentSection === 'goal' && trimmed.startsWith('- ')) {
      result.goal += (result.goal ? '\n' : '') + trimmed.replace(/^-\s*/, '');
    }

    // Parse Scope
    if (currentSection === 'scope' && trimmed.startsWith('- ')) {
      if (trimmed.toLowerCase().startsWith('- in scope:')) {
        result.scopeIn = trimmed.replace(/^-\s*In scope:\s*/i, '');
      } else if (trimmed.toLowerCase().startsWith('- out of scope:')) {
        result.scopeOut = trimmed.replace(/^-\s*Out of scope:\s*/i, '');
      }
    }

    // Parse Constraints
    if (currentSection === 'constraints' && trimmed.startsWith('- ')) {
      result.constraints += (result.constraints ? '\n' : '') + trimmed.replace(/^-\s*/, '');
    }

    // Parse Done
    if (currentSection === 'done' && trimmed.startsWith('- ')) {
      result.done.push(trimmed.replace(/^-\s*/, ''));
    }

    // Parse In Progress
    if (currentSection === 'in progress' && trimmed.startsWith('- ')) {
      result.inProgress.push(trimmed.replace(/^-\s*/, ''));
    }

    // Parse Next Step
    if (currentSection === 'next step' && trimmed.startsWith('- ')) {
      result.nextStep.push(trimmed.replace(/^-\s*/, ''));
    }

    // Parse Validation Status
    if (currentSection === 'validation status' && trimmed.startsWith('- ')) {
      result.validationStatus.push(trimmed.replace(/^-\s*/, ''));
    }
  }

  return result;
}

function renderTask(container, task) {
  container.innerHTML = '';

  if (!task.name) {
    showEmpty(container, 'task_alt', '尚無當前任務資料');
    return;
  }

  // Task Identity
  const identity = createSection('assignment', '任務資訊');
  addField(identity, '任務名稱', task.name);
  addField(identity, '負責 Agent', task.owner);
  addField(identity, '最後更新', task.lastUpdated);
  container.appendChild(identity);

  // Goal
  if (task.goal) {
    const goalSec = createSection('flag', '目標');
    const p = document.createElement('p');
    p.textContent = task.goal;
    p.style.fontSize = '0.875rem';
    goalSec.appendChild(p);
    container.appendChild(goalSec);
  }

  // Scope
  const scopeSec = createSection('target', 'Scope');
  if (task.scopeIn) addField(scopeSec, 'In Scope', task.scopeIn);
  if (task.scopeOut) addField(scopeSec, 'Out of Scope', task.scopeOut);
  container.appendChild(scopeSec);

  // Constraints
  if (task.constraints) {
    const cSec = createSection('block', '限制條件');
    task.constraints.split('\n').forEach(c => {
      const li = document.createElement('div');
      li.className = 'task-field';
      li.textContent = '• ' + c;
      li.style.fontSize = '0.875rem';
      cSec.appendChild(li);
    });
    container.appendChild(cSec);
  }

  // Execution Status
  const execSec = createSection('pending_actions', '執行狀態');
  addListBlock(execSec, '已完成', task.done, 'status-done');
  addListBlock(execSec, '進行中', task.inProgress, 'status-next');
  addListBlock(execSec, '下一步', task.nextStep, 'status-pending');
  container.appendChild(execSec);

  // Validation
  if (task.validationStatus.length > 0) {
    const vSec = createSection('verified', '驗證狀態');
    addListBlock(vSec, '', task.validationStatus);
    container.appendChild(vSec);
  }
}

function createSection(icon, title) {
  const sec = document.createElement('div');
  sec.className = 'task-section';
  const h3 = document.createElement('h3');
  const ic = document.createElement('span');
  ic.className = 'material-symbols-outlined';
  ic.textContent = icon;
  h3.appendChild(ic);
  const text = document.createTextNode(title);
  h3.appendChild(text);
  sec.appendChild(h3);
  return sec;
}

function addField(parent, label, value) {
  const row = document.createElement('div');
  row.className = 'task-field';
  const lbl = document.createElement('span');
  lbl.className = 'task-field-label';
  lbl.textContent = label;
  row.appendChild(lbl);
  const val = document.createElement('span');
  val.className = 'task-field-value';
  val.textContent = value;
  row.appendChild(val);
  parent.appendChild(row);
}

function addListBlock(parent, title, items, badgeClass) {
  if (items.length === 0 && title) {
    const row = document.createElement('div');
    row.className = 'task-field';
    const lbl = document.createElement('span');
    lbl.className = 'task-field-label';
    lbl.textContent = title;
    row.appendChild(lbl);
    const val = document.createElement('span');
    val.className = 'task-field-value';
    val.textContent = '—';
    val.style.color = 'var(--on-surface-variant)';
    row.appendChild(val);
    parent.appendChild(row);
    return;
  }

  if (title) {
    const header = document.createElement('div');
    header.style.marginBottom = '0.25rem';
    if (badgeClass) {
      const badge = document.createElement('span');
      badge.className = 'status-badge ' + badgeClass;
      badge.textContent = title;
      header.appendChild(badge);
    } else {
      header.textContent = title;
      header.style.fontWeight = '600';
      header.style.fontSize = '0.8125rem';
      header.style.color = 'var(--on-surface-variant)';
    }
    parent.appendChild(header);
  }

  const ul = document.createElement('ul');
  ul.className = 'task-list';
  items.forEach(item => {
    const li = document.createElement('li');
    li.textContent = item;
    ul.appendChild(li);
  });
  parent.appendChild(ul);
}

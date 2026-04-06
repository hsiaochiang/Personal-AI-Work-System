/* ─── Shared utilities ─── */

/**
 * Fetch JSON from API endpoint (GET).
 * @param {string} endpoint - e.g. '/api/roadmap'
 * @returns {Promise<Object>}
 */
async function apiFetch(endpoint) {
  const url = new URL(endpoint, location.origin);
  try {
    const saved = localStorage.getItem('selectedProject');
    if (saved) {
      const p = JSON.parse(saved);
      if (p.id) url.searchParams.set('projectId', p.id);
    }
  } catch { /* ignore */ }

  const res = await fetch(url.toString());
  if (!res.ok) {
    let errorMsg = `API ${endpoint}: ${res.status}`;
    try {
      const errData = await res.json();
      if (errData.error) errorMsg = errData.error;
    } catch { /* ignore */ }
    throw new Error(errorMsg);
  }
  return res.json();
}

/**
 * Send JSON to API endpoint (POST).
 * @param {string} endpoint - e.g. '/api/memory/write'
 * @param {Object} body - JSON body
 * @returns {Promise<Object>}
 */
async function apiPost(endpoint, body) {
  const url = new URL(endpoint, location.origin);
  try {
    const saved = localStorage.getItem('selectedProject');
    if (saved) {
      const p = JSON.parse(saved);
      if (p.id) url.searchParams.set('projectId', p.id);
    }
  } catch { /* ignore */ }

  const res = await fetch(url.toString(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    let errorMsg = `API ${endpoint}: ${res.status}`;
    try {
      const errData = await res.json();
      if (errData.error) errorMsg = errData.error;
    } catch { /* ignore */ }
    throw new Error(errorMsg);
  }
  return res.json();
}

/**
 * Escape HTML to prevent XSS. All dynamic content must pass through this.
 * @param {string} str
 * @returns {string}
 */
function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/**
 * Show loading state in a container.
 * @param {HTMLElement} el
 */
function showLoading(el) {
  el.innerHTML = '';
  const wrap = document.createElement('div');
  wrap.className = 'loading';
  wrap.innerHTML = '<div class="spinner"></div>';
  const span = document.createElement('span');
  span.textContent = '載入中…';
  wrap.appendChild(span);
  el.appendChild(wrap);
}

/**
 * Show error state in a container.
 * @param {HTMLElement} el
 * @param {string} message
 */
function showError(el, message) {
  el.innerHTML = '';
  const wrap = document.createElement('div');
  wrap.className = 'error-state';
  const icon = document.createElement('span');
  icon.className = 'material-symbols-outlined';
  icon.textContent = 'error';
  wrap.appendChild(icon);
  const text = document.createElement('span');
  text.textContent = message;
  wrap.appendChild(text);
  el.appendChild(wrap);
}

/**
 * Show empty state in a container.
 * @param {HTMLElement} el
 * @param {string} icon
 * @param {string} message
 */
function showEmpty(el, icon, message) {
  el.innerHTML = '';
  const wrap = document.createElement('div');
  wrap.className = 'empty-state';
  const ic = document.createElement('span');
  ic.className = 'material-symbols-outlined';
  ic.textContent = icon;
  wrap.appendChild(ic);
  const p = document.createElement('p');
  p.textContent = message;
  wrap.appendChild(p);
  el.appendChild(wrap);
}

/* ─── Navigation highlighting ─── */
document.addEventListener('DOMContentLoaded', () => {
  const meta = window.__APP_META__;

  // 1. Update <title> to include project name and environment tag
  if (meta) {
    const envTag = meta.env === 'production' ? 'PROD' : 'DEV';
    document.title = `${document.title} — ${meta.projectName} [${envTag}:${meta.port}]`;
  }

  // 2. Highlight active nav link (match on pathname only, ignore query string)
  const current = location.pathname.replace(/\/$/, '') || '/';
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href') || '';
    const linkPath = href.split('?')[0].replace(/\/$/, '') || '/';
    if (linkPath === current) {
      link.classList.add('active');
    }

    // 3. Append projectId to nav links so URL always carries project identity
    if (meta && meta.projectId && href.startsWith('/')) {
      try {
        const u = new URL(href, location.origin);
        if (!u.searchParams.has('projectId')) {
          u.searchParams.set('projectId', meta.projectId);
          link.setAttribute('href', u.pathname + '?' + u.searchParams.toString());
        }
      } catch { /* ignore malformed href */ }
    }
  });

  // 4. Sidebar project name — prefer __APP_META__ over localStorage
  const projectEl = document.getElementById('sidebar-project-name');
  if (projectEl) {
    if (meta) {
      const envLabel = meta.env === 'production' ? ' [PROD]' : ' [DEV]';
      projectEl.textContent = (meta.projectName || '個人 AI 工作系統') + envLabel;
    } else {
      try {
        const saved = localStorage.getItem('selectedProject');
        if (saved) {
          const p = JSON.parse(saved);
          projectEl.textContent = p.name || '個人 AI 工作系統';
        }
      } catch { /* ignore */ }
    }
  }
});

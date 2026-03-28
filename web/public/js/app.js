/* ─── Shared utilities ─── */

/**
 * Fetch JSON from API endpoint.
 * @param {string} endpoint - e.g. '/api/roadmap'
 * @returns {Promise<Object>}
 */
async function apiFetch(endpoint) {
  const res = await fetch(endpoint);
  if (!res.ok) throw new Error(`API ${endpoint}: ${res.status}`);
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
  const current = location.pathname.replace(/\/$/, '') || '/';
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href').replace(/\/$/, '') || '/';
    if (href === current) {
      link.classList.add('active');
    }
  });

  // Sidebar project name
  const projectEl = document.getElementById('sidebar-project-name');
  if (projectEl) {
    try {
      const saved = localStorage.getItem('selectedProject');
      if (saved) {
        const p = JSON.parse(saved);
        projectEl.textContent = p.name || '個人 AI 工作系統';
      }
    } catch { /* ignore */ }
  }
});

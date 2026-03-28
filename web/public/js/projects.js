/* ─── Projects Hub ─── */

document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('projects-container');
  showLoading(container);
  try {
    const data = await apiFetch('/api/projects');
    renderProjects(data.projects || []);
  } catch (err) {
    showError(container, '無法載入專案清單: ' + err.message);
  }
});

function getSelectedProject() {
  try {
    const saved = localStorage.getItem('selectedProject');
    return saved ? JSON.parse(saved) : null;
  } catch { return null; }
}

function selectProject(project) {
  localStorage.setItem('selectedProject', JSON.stringify(project));
  document.querySelectorAll('.project-card').forEach(card => {
    card.classList.toggle('active', card.dataset.id === project.id);
  });
  const nameEl = document.getElementById('sidebar-project-name');
  if (nameEl) nameEl.textContent = project.name;
}

function renderProjects(projects) {
  const container = document.getElementById('projects-container');
  const selected = getSelectedProject();

  if (!projects.length) {
    showEmpty(container, 'folder_open', '尚無專案設定');
    return;
  }

  container.innerHTML = '';
  const grid = document.createElement('div');
  grid.className = 'projects-grid';

  projects.forEach(project => {
    const isActive = selected && selected.id === project.id;
    const card = document.createElement('div');
    card.className = 'project-card' + (isActive ? ' active' : '');
    card.dataset.id = project.id;
    card.innerHTML = `
      <div class="project-card-name">${escapeHTML(project.name)}</div>
      <div class="project-card-desc">${escapeHTML(project.description || '')}</div>
      <div class="project-card-path">${escapeHTML(project.path || '')}</div>
      <div class="project-card-actions">
        <button class="btn btn-primary btn-sm btn-select" data-id="${escapeHTML(project.id)}">
          <span class="material-symbols-outlined" style="font-size:14px">check_circle</span>
          設為目前專案
        </button>
      </div>
    `;
    grid.appendChild(card);
  });

  container.appendChild(grid);

  grid.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn-select');
    if (!btn) return;
    const id = btn.dataset.id;
    const project = projects.find(p => p.id === id);
    if (project) selectProject(project);
  });
}

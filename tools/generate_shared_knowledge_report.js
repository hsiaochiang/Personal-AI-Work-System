const fs = require('fs');
const path = require('path');

const memoryHealthUtils = require('../web/public/js/memory-health-utils.js');
const memoryDedupUtils = require('../web/public/js/memory-dedup-utils.js');
const sharedKnowledgeUtils = require('../web/public/js/shared-knowledge-utils.js');

const repoRoot = path.resolve(__dirname, '..');
const projectsFile = path.join(repoRoot, 'web', 'projects.json');
const sharedDir = path.join(repoRoot, 'docs', 'shared');
const snapshotPath = path.join(repoRoot, sharedKnowledgeUtils.SNAPSHOT_PATH);

function readProjects() {
  const raw = fs.readFileSync(projectsFile, 'utf8');
  const data = JSON.parse(raw);
  return Array.isArray(data.projects) ? data.projects : [];
}

function readMemoryEntries(projectRoot) {
  const memoryDir = path.join(projectRoot, 'docs', 'memory');
  try {
    return fs.readdirSync(memoryDir)
      .filter(file => file.endsWith('.md'))
      .sort((left, right) => left.localeCompare(right))
      .map(file => ({
        filename: file,
        content: fs.readFileSync(path.join(memoryDir, file), 'utf8'),
      }));
  } catch {
    return [];
  }
}

function buildProjectCatalog(projects) {
  return projects.map(project => {
    const payload = memoryDedupUtils.attachDedupToMemoryPayload(
      memoryHealthUtils.buildMemoryApiPayload(readMemoryEntries(path.resolve(project.path)))
    );

    return {
      projectId: project.id,
      projectName: project.name,
      files: payload.files,
    };
  });
}

function main() {
  const projects = readProjects();
  const payload = sharedKnowledgeUtils.buildSharedKnowledgePayload(buildProjectCatalog(projects));
  const markdown = sharedKnowledgeUtils.buildSharedKnowledgeReportMarkdown(payload, {
    generatedAt: new Date().toISOString(),
  });

  fs.mkdirSync(sharedDir, { recursive: true });
  fs.writeFileSync(snapshotPath, markdown, 'utf8');

  console.log(`generate_shared_knowledge_report: wrote ${path.relative(repoRoot, snapshotPath)}`);
  console.log(`generate_shared_knowledge_report: groups=${payload.summary.groupCount}`);
}

main();

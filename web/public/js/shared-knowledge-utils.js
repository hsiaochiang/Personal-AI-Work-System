(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory(
      require('./memory-source-utils.js'),
      require('./memory-health-utils.js'),
      require('./memory-dedup-utils.js')
    );
    return;
  }

  root.SharedKnowledgeUtils = factory(
    root.MemorySourceUtils,
    root.MemoryHealthUtils,
    root.MemoryDedupUtils
  );
})(typeof globalThis !== 'undefined' ? globalThis : this, function (memorySourceUtils, memoryHealthUtils, memoryDedupUtils) {
  if (!memorySourceUtils || !memoryHealthUtils || !memoryDedupUtils) {
    throw new Error('SharedKnowledgeUtils 需要 MemorySourceUtils、MemoryHealthUtils 與 MemoryDedupUtils');
  }

  const DEFAULT_THRESHOLD = 0.63;
  const SNAPSHOT_PATH = 'docs/shared/shared-knowledge-candidates.md';
  const EXCLUDED_FILES = new Set(['decision-log.md']);
  const EXCLUDED_CONTENT_PATTERNS = [
    /^狀態[:：]/,
    /^來源依據[:：]/,
    /^目前無/,
    /^目前沒有/,
  ];

  function roundScore(value) {
    return Math.round(value * 100) / 100;
  }

  function createUnionFind(size) {
    const parent = Array.from({ length: size }, (_, index) => index);

    function find(index) {
      if (parent[index] !== index) {
        parent[index] = find(parent[index]);
      }
      return parent[index];
    }

    function union(left, right) {
      const leftRoot = find(left);
      const rightRoot = find(right);
      if (leftRoot !== rightRoot) {
        parent[rightRoot] = leftRoot;
      }
    }

    return { find, union };
  }

  function isEligibleFile(filename) {
    return typeof filename === 'string'
      && filename.endsWith('.md')
      && !filename.startsWith('.')
      && !EXCLUDED_FILES.has(filename);
  }

  function isMeaningfulSharedCandidateContent(content) {
    const normalized = String(content || '').trim();
    if (normalized.length < 4) {
      return false;
    }

    return !EXCLUDED_CONTENT_PATTERNS.some(pattern => pattern.test(normalized));
  }

  function flattenProjectMemory(project) {
    const files = Array.isArray(project && project.files) ? project.files : [];
    const flattened = [];

    files.forEach(file => {
      if (!file || !isEligibleFile(file.filename)) {
        return;
      }

      const groups = Array.isArray(file.groups)
        ? file.groups
        : memoryHealthUtils.enrichMemoryGroups(file.content || '');

      groups.forEach((group, groupIndex) => {
        const items = Array.isArray(group && group.items) ? group.items : [];
        items.forEach((item, itemIndex) => {
          if (!item || !isMeaningfulSharedCandidateContent(item.content)) {
            return;
          }

          flattened.push({
            itemId: `${project.projectId}::${file.filename}::${groupIndex}::${itemIndex}`,
            projectId: project.projectId,
            projectName: project.projectName,
            filename: file.filename,
            groupTitle: group.title || '',
            content: item.content,
            source: item.source || '',
            health: item.health || null,
          });
        });
      });
    });

    return flattened;
  }

  function buildCrossProjectGroups(items, options) {
    const threshold = options && typeof options.threshold === 'number'
      ? options.threshold
      : DEFAULT_THRESHOLD;

    if (!Array.isArray(items) || items.length < 2) {
      return [];
    }

    const byFilename = new Map();
    items.forEach(item => {
      if (!byFilename.has(item.filename)) {
        byFilename.set(item.filename, []);
      }
      byFilename.get(item.filename).push(item);
    });

    let groupCounter = 0;
    const results = [];

    byFilename.forEach(filenameItems => {
      if (filenameItems.length < 2) {
        return;
      }

      const unionFind = createUnionFind(filenameItems.length);
      const pairs = [];

      for (let leftIndex = 0; leftIndex < filenameItems.length; leftIndex += 1) {
        for (let rightIndex = leftIndex + 1; rightIndex < filenameItems.length; rightIndex += 1) {
          if (filenameItems[leftIndex].projectId === filenameItems[rightIndex].projectId) {
            continue;
          }

          const similarity = memoryDedupUtils.calculateSimilarity(
            filenameItems[leftIndex].content,
            filenameItems[rightIndex].content
          );

          if (similarity.score < threshold) {
            continue;
          }

          unionFind.union(leftIndex, rightIndex);
          pairs.push({
            leftIndex,
            rightIndex,
            score: similarity.score,
            kind: similarity.kind,
          });
        }
      }

      if (!pairs.length) {
        return;
      }

      const grouped = new Map();
      filenameItems.forEach((item, index) => {
        const root = unionFind.find(index);
        if (!grouped.has(root)) {
          grouped.set(root, []);
        }
        grouped.get(root).push(item);
      });

      grouped.forEach(groupItems => {
        const projectIds = Array.from(new Set(groupItems.map(item => item.projectId))).sort();
        if (projectIds.length < 2) {
          return;
        }

        const primary = memoryDedupUtils.pickPrimaryItem(groupItems);
        const groupItemIds = new Set(groupItems.map(item => item.itemId));
        const pairScores = pairs.filter(pair => (
          groupItemIds.has(filenameItems[pair.leftIndex].itemId)
          && groupItemIds.has(filenameItems[pair.rightIndex].itemId)
        ));
        const similarity = pairScores.length
          ? Math.max(...pairScores.map(pair => pair.score))
          : 1;
        const exact = pairScores.length > 0 && pairScores.every(pair => pair.kind === 'exact');

        groupCounter += 1;
        results.push({
          id: `shared::${groupItems[0].filename}::${groupCounter}`,
          filename: groupItems[0].filename,
          similarity: roundScore(similarity),
          similarityLabel: exact ? '跨專案完全重複' : '跨專案高度相似',
          projectIds,
          projectCount: projectIds.length,
          itemCount: groupItems.length,
          primaryItemId: primary ? primary.itemId : '',
          primaryReason: primary
            ? `建議以 ${primary.projectName} 的版本作為 shared 摘要起點`
            : '建議保留較完整的一條作為 shared 摘要起點',
          sharedSummary: primary ? primary.content : '',
          items: groupItems
            .slice()
            .sort((left, right) => left.itemId.localeCompare(right.itemId))
            .map(item => ({
              itemId: item.itemId,
              projectId: item.projectId,
              projectName: item.projectName,
              filename: item.filename,
              groupTitle: item.groupTitle,
              content: item.content,
              source: item.source,
              health: item.health,
            })),
        });
      });
    });

    return results.sort((left, right) => {
      if (right.similarity !== left.similarity) {
        return right.similarity - left.similarity;
      }
      return left.filename.localeCompare(right.filename);
    });
  }

  function summarizeGroups(groups) {
    const uniqueProjects = new Set();
    const uniqueFiles = new Set();

    (groups || []).forEach(group => {
      uniqueFiles.add(group.filename);
      (group.projectIds || []).forEach(projectId => uniqueProjects.add(projectId));
    });

    return {
      groupCount: (groups || []).length,
      candidateItemCount: (groups || []).reduce((count, group) => count + (group.itemCount || 0), 0),
      exactGroupCount: (groups || []).filter(group => group.similarityLabel === '跨專案完全重複').length,
      nearGroupCount: (groups || []).filter(group => group.similarityLabel !== '跨專案完全重複').length,
      projectCount: uniqueProjects.size,
      categoryCount: uniqueFiles.size,
    };
  }

  function buildSharedKnowledgePayload(projects, options) {
    const flattened = (projects || []).flatMap(flattenProjectMemory);
    const groups = buildCrossProjectGroups(flattened, options);
    const currentProjectId = options && options.currentProjectId ? options.currentProjectId : '';
    const filteredGroups = currentProjectId
      ? groups.filter(group => group.projectIds.includes(currentProjectId))
      : groups;

    return {
      currentProjectId,
      snapshotPath: SNAPSHOT_PATH,
      summary: summarizeGroups(filteredGroups),
      groups: filteredGroups,
    };
  }

  function buildSharedKnowledgeReportMarkdown(payload, options) {
    const generatedAt = options && options.generatedAt
      ? options.generatedAt
      : new Date().toISOString();
    const groups = Array.isArray(payload && payload.groups) ? payload.groups : [];
    const summary = payload && payload.summary ? payload.summary : summarizeGroups(groups);
    const lines = [
      '# Shared Knowledge Candidates',
      '',
      '> 本檔由 `tools/generate_shared_knowledge_report.js` 產生。',
      '> 目的：整理跨專案重複出現的 shared knowledge 候選；僅供人工審核，不代表已正式整合進 shared layer。',
      '',
      `- Generated at: ${generatedAt}`,
      `- Snapshot path: ${SNAPSHOT_PATH}`,
      `- Candidate groups: ${summary.groupCount}`,
      `- Projects involved: ${summary.projectCount}`,
      `- Categories involved: ${summary.categoryCount}`,
      '',
    ];

    if (!groups.length) {
      lines.push('## 狀態');
      lines.push('');
      lines.push('- 目前沒有偵測到足夠穩定的跨專案 shared knowledge 候選。');
      lines.push('');
      return `${lines.join('\n')}\n`;
    }

    lines.push('## Candidate Groups');
    lines.push('');

    groups.forEach((group, index) => {
      const projectNames = Array.from(new Set(group.items.map(item => item.projectName))).join('、');
      lines.push(`### Group ${index + 1} — ${group.filename}`);
      lines.push('');
      lines.push(`- Similarity: ${group.similarityLabel}（${Math.round(group.similarity * 100)}%）`);
      lines.push(`- Projects: ${projectNames}`);
      lines.push(`- Suggested shared summary: ${group.sharedSummary || '—'}`);
      lines.push(`- Note: ${group.primaryReason || '請人工確認是否值得升級為 shared knowledge'}`);
      lines.push('');
      group.items.forEach(item => {
        lines.push(`- [${item.projectName}] ${item.content}`);
      });
      lines.push('');
    });

    return `${lines.join('\n')}\n`;
  }

  return {
    DEFAULT_THRESHOLD,
    SNAPSHOT_PATH,
    buildCrossProjectGroups,
    buildSharedKnowledgePayload,
    buildSharedKnowledgeReportMarkdown,
    flattenProjectMemory,
    isEligibleFile,
    isMeaningfulSharedCandidateContent,
    summarizeGroups,
  };
});

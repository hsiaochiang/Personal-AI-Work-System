(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
    return;
  }

  root.MemorySourceUtils = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const SOURCE_COMMENT_RE = /\s*<!--\s*source:\s*([a-z0-9:-]+)\s*-->\s*$/i;

  function normalizeMemorySource(source) {
    if (typeof source !== 'string') {
      return '';
    }

    return source.trim().toLowerCase();
  }

  function sanitizeMemoryListContent(rawContent) {
    if (typeof rawContent !== 'string') {
      return '';
    }

    return rawContent
      .split('\n')[0]
      .replace(/^[-*•>#\d.)\s]+/, '')
      .trim();
  }

  function buildAttributedMemoryListItem(rawContent, source) {
    const content = sanitizeMemoryListContent(rawContent);
    const normalizedSource = normalizeMemorySource(source);

    if (!content) {
      return '';
    }

    return normalizedSource
      ? `- ${content} <!-- source: ${normalizedSource} -->`
      : `- ${content}`;
  }

  function parseAttributedMemoryListItem(line) {
    if (typeof line !== 'string') {
      return null;
    }

    const trimmed = line.trim();
    if (!trimmed.startsWith('- ')) {
      return null;
    }

    const withoutBullet = trimmed.replace(/^-\s*/, '');
    const match = withoutBullet.match(SOURCE_COMMENT_RE);
    const content = match
      ? withoutBullet.slice(0, match.index).trim()
      : withoutBullet.trim();
    const source = match ? normalizeMemorySource(match[1]) : '';

    return {
      content,
      source,
    };
  }

  function buildMemoryItemId(filename, groupIndex, itemIndex) {
    const normalizedFilename = typeof filename === 'string' ? filename.trim() : '';
    return `${normalizedFilename}::${groupIndex}::${itemIndex}`;
  }

  function parseDetailedMemoryMarkdown(md, filename) {
    const groups = [];
    let currentGroup = null;
    let groupIndex = -1;
    let itemIndex = 0;
    const lines = String(md || '').split('\n');

    lines.forEach((line, lineIndex) => {
      const trimmed = line.trim();

      const headerMatch = trimmed.match(/^#{2,3}\s+(.+)$/);
      if (headerMatch) {
        groupIndex += 1;
        itemIndex = 0;
        currentGroup = {
          title: headerMatch[1],
          groupIndex,
          lineIndex,
          items: [],
        };
        groups.push(currentGroup);
        return;
      }

      if (!currentGroup || !trimmed.startsWith('- ')) {
        return;
      }

      const item = parseAttributedMemoryListItem(trimmed);
      if (!item || !item.content) {
        return;
      }

      currentGroup.items.push({
        itemId: filename ? buildMemoryItemId(filename, currentGroup.groupIndex, itemIndex) : '',
        groupIndex: currentGroup.groupIndex,
        itemIndex,
        groupTitle: currentGroup.title,
        lineIndex,
        rawLine: line,
        indent: (line.match(/^\s*/) || [''])[0],
        content: item.content,
        source: item.source,
      });
      itemIndex += 1;
    });

    return groups;
  }

  function parseMemoryMarkdown(md, options) {
    const filename = options && typeof options.filename === 'string' ? options.filename.trim() : '';
    const detailedGroups = parseDetailedMemoryMarkdown(md, filename);

    return detailedGroups.map(group => ({
      title: group.title,
      groupIndex: group.groupIndex,
      lineIndex: group.lineIndex,
      items: group.items.map(item => ({
        itemId: item.itemId,
        groupIndex: item.groupIndex,
        itemIndex: item.itemIndex,
        groupTitle: item.groupTitle,
        lineIndex: item.lineIndex,
        rawLine: item.rawLine,
        indent: item.indent,
        content: item.content,
        source: item.source,
      })),
    }));
  }

  function removeMemoryItemById(markdown, filename, itemId) {
    const normalizedItemId = typeof itemId === 'string' ? itemId.trim() : '';
    if (!normalizedItemId) {
      throw new Error('itemId 為必填');
    }

    const detailedGroups = parseDetailedMemoryMarkdown(markdown, filename);
    const targetItem = detailedGroups
      .flatMap(group => group.items || [])
      .find(item => item.itemId === normalizedItemId);

    if (!targetItem) {
      throw new Error(`找不到 itemId: ${normalizedItemId}`);
    }

    const lines = String(markdown || '').split('\n');
    lines.splice(targetItem.lineIndex, 1);
    return lines.join('\n').replace(/\n{3,}/g, '\n\n');
  }

  function getMemorySourcePresentation(source) {
    const normalizedSource = normalizeMemorySource(source);

    if (!normalizedSource) {
      return null;
    }

    if (normalizedSource === 'chatgpt') {
      return { label: 'ChatGPT', className: 'source-chatgpt' };
    }

    if (normalizedSource === 'chatgpt-api') {
      return { label: 'ChatGPT API', className: 'source-chatgpt-api' };
    }

    if (normalizedSource === 'gemini') {
      return { label: 'Gemini', className: 'source-gemini' };
    }

    if (normalizedSource === 'gemini-llm') {
      return { label: 'AI 建議', className: 'source-gemini' };
    }

    if (normalizedSource === 'claude') {
      return { label: 'Claude', className: 'source-claude' };
    }

    if (normalizedSource === 'copilot') {
      return { label: 'Copilot', className: 'source-copilot' };
    }

    if (normalizedSource === 'plain') {
      return { label: 'Plain', className: 'source-plain' };
    }

    if (normalizedSource.startsWith('custom:')) {
      return {
        label: normalizedSource.slice('custom:'.length) || 'Custom',
        className: 'source-custom',
      };
    }

    return {
      label: normalizedSource,
      className: 'source-custom',
    };
  }

  return {
    buildMemoryItemId,
    buildAttributedMemoryListItem,
    getMemorySourcePresentation,
    normalizeMemorySource,
    parseDetailedMemoryMarkdown,
    parseAttributedMemoryListItem,
    parseMemoryMarkdown,
    removeMemoryItemById,
    sanitizeMemoryListContent,
  };
});

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory(
      require('./memory-source-utils.js'),
      require('./memory-health-utils.js')
    );
    return;
  }

  root.MemoryDedupUtils = factory(root.MemorySourceUtils, root.MemoryHealthUtils);
})(typeof globalThis !== 'undefined' ? globalThis : this, function (memorySourceUtils, memoryHealthUtils) {
  if (!memorySourceUtils || !memoryHealthUtils) {
    throw new Error('MemoryDedupUtils 需要 MemorySourceUtils 與 MemoryHealthUtils');
  }

  const DEFAULT_THRESHOLD = 0.58;

  function roundScore(value) {
    return Math.round(value * 100) / 100;
  }

  function normalizeMemoryComparisonText(value) {
    return String(value || '')
      .normalize('NFKC')
      .toLowerCase()
      .replace(/<!--[\s\S]*?-->/g, ' ')
      .replace(/[^\p{Letter}\p{Number}]+/gu, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function tokenizeMemoryText(value) {
    const normalized = normalizeMemoryComparisonText(value);
    if (!normalized) {
      return [];
    }

    const tokens = new Set();
    normalized.split(' ').forEach(token => {
      if (token.length >= 2) {
        tokens.add(token);
      }
    });

    const squashed = normalized.replace(/\s+/g, '');
    if (squashed.length >= 2) {
      for (let index = 0; index < squashed.length - 1; index += 1) {
        tokens.add(squashed.slice(index, index + 2));
      }
    } else if (squashed) {
      tokens.add(squashed);
    }

    return Array.from(tokens);
  }

  function buildCharacterBigrams(value) {
    const normalized = normalizeMemoryComparisonText(value).replace(/\s+/g, '');
    if (!normalized) {
      return [];
    }

    if (normalized.length < 2) {
      return [normalized];
    }

    const bigrams = [];
    for (let index = 0; index < normalized.length - 1; index += 1) {
      bigrams.push(normalized.slice(index, index + 2));
    }
    return Array.from(new Set(bigrams));
  }

  function calculateSetJaccard(leftValues, rightValues) {
    const leftSet = new Set(leftValues);
    const rightSet = new Set(rightValues);
    if (leftSet.size === 0 || rightSet.size === 0) {
      return 0;
    }

    let intersection = 0;
    leftSet.forEach(value => {
      if (rightSet.has(value)) {
        intersection += 1;
      }
    });

    const union = new Set([...leftSet, ...rightSet]).size || 1;
    return intersection / union;
  }

  function calculateSetDice(leftValues, rightValues) {
    const leftSet = new Set(leftValues);
    const rightSet = new Set(rightValues);
    if (leftSet.size === 0 || rightSet.size === 0) {
      return 0;
    }

    let intersection = 0;
    leftSet.forEach(value => {
      if (rightSet.has(value)) {
        intersection += 1;
      }
    });

    return (2 * intersection) / (leftSet.size + rightSet.size);
  }

  function calculateSimilarity(left, right) {
    const leftNormalized = normalizeMemoryComparisonText(left);
    const rightNormalized = normalizeMemoryComparisonText(right);

    if (!leftNormalized || !rightNormalized) {
      return { score: 0, kind: 'none' };
    }

    if (leftNormalized === rightNormalized) {
      return { score: 1, kind: 'exact' };
    }

    const tokenScore = calculateSetJaccard(
      tokenizeMemoryText(leftNormalized),
      tokenizeMemoryText(rightNormalized)
    );
    const charScore = calculateSetDice(
      buildCharacterBigrams(leftNormalized),
      buildCharacterBigrams(rightNormalized)
    );

    if (tokenScore === 0 && charScore === 0) {
      return { score: 0, kind: 'none' };
    }

    let score = Math.max(tokenScore, charScore);

    if (
      Math.min(leftNormalized.length, rightNormalized.length) >= 12
      && (leftNormalized.includes(rightNormalized) || rightNormalized.includes(leftNormalized))
    ) {
      score = Math.max(score, 0.84);
    }

    return {
      score: roundScore(score),
      kind: score >= 0.99 ? 'exact' : 'near',
    };
  }

  function buildItemId(filename, groupIndex, itemIndex) {
    return `${filename}::${groupIndex}::${itemIndex}`;
  }

  function parseDetailedMemoryMarkdown(markdown, filename, options) {
    const lines = String(markdown || '').split(/\r?\n/);
    const healthGroups = Array.isArray(options && options.healthGroups)
      ? options.healthGroups
      : memoryHealthUtils.enrichMemoryGroups(markdown, options);

    const groups = [];
    let currentGroup = null;
    let groupIndex = -1;
    let itemIndex = 0;

    lines.forEach((line, lineIndex) => {
      const trimmed = line.trim();
      const headerMatch = trimmed.match(/^#{2,3}\s+(.+)$/);
      if (headerMatch) {
        groupIndex += 1;
        itemIndex = 0;
        currentGroup = {
          filename,
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

      const parsedItem = memorySourceUtils.parseAttributedMemoryListItem(trimmed);
      if (!parsedItem || !parsedItem.content) {
        return;
      }

      const health = healthGroups[groupIndex]
        && healthGroups[groupIndex].items
        && healthGroups[groupIndex].items[itemIndex]
        ? healthGroups[groupIndex].items[itemIndex].health
        : null;

      currentGroup.items.push({
        itemId: buildItemId(filename, groupIndex, itemIndex),
        filename,
        groupIndex,
        itemIndex,
        groupTitle: currentGroup.title,
        lineIndex,
        rawLine: line,
        indent: (line.match(/^\s*/) || [''])[0],
        content: parsedItem.content,
        source: parsedItem.source,
        health,
      });
      itemIndex += 1;
    });

    return groups;
  }

  function flattenDetailedGroups(groups) {
    return (groups || []).flatMap(group => group.items || []);
  }

  function getItemScore(item) {
    return item && item.health && typeof item.health.score === 'number'
      ? item.health.score
      : 0;
  }

  function pickPrimaryItem(items) {
    return (items || [])
      .slice()
      .sort((left, right) => {
        const healthDiff = getItemScore(right) - getItemScore(left);
        if (healthDiff !== 0) {
          return healthDiff;
        }

        const sourceDiff = Number(Boolean(memorySourceUtils.normalizeMemorySource(right.source)))
          - Number(Boolean(memorySourceUtils.normalizeMemorySource(left.source)));
        if (sourceDiff !== 0) {
          return sourceDiff;
        }

        const lengthDiff = right.content.length - left.content.length;
        if (lengthDiff !== 0) {
          return lengthDiff;
        }

        return left.itemId.localeCompare(right.itemId);
      })[0] || null;
  }

  function buildPrimaryReason(primary, items) {
    if (!primary) {
      return '';
    }

    const highestScore = items.every(item => getItemScore(primary) >= getItemScore(item));
    const longest = items.every(item => primary.content.length >= item.content.length);
    const hasKnownSource = Boolean(memorySourceUtils.normalizeMemorySource(primary.source));

    if (highestScore && longest && hasKnownSource) {
      return '健康度較高、內容較完整，且保留已知來源';
    }

    if (highestScore && hasKnownSource) {
      return '健康度較高，且保留已知來源';
    }

    if (longest) {
      return '內容較完整，適合作為保留版本';
    }

    return '依健康度與內容完整度作為推薦保留項目';
  }

  function buildMergeCandidate(primary, items) {
    const mergedSource = memorySourceUtils.normalizeMemorySource(primary && primary.source)
      || items
        .map(item => memorySourceUtils.normalizeMemorySource(item.source))
        .find(Boolean)
      || '';

    return {
      content: primary ? primary.content : '',
      source: mergedSource,
    };
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

  function buildDedupGroupsForFile(file, options) {
    const detailedGroups = parseDetailedMemoryMarkdown(file.content, file.filename, {
      healthGroups: file.groups,
      now: options && options.now,
    });
    const items = flattenDetailedGroups(detailedGroups);
    const threshold = options && typeof options.threshold === 'number'
      ? options.threshold
      : DEFAULT_THRESHOLD;

    if (items.length < 2) {
      return [];
    }

    const pairs = [];
    const unionFind = createUnionFind(items.length);

    for (let leftIndex = 0; leftIndex < items.length; leftIndex += 1) {
      for (let rightIndex = leftIndex + 1; rightIndex < items.length; rightIndex += 1) {
        const similarity = calculateSimilarity(items[leftIndex].content, items[rightIndex].content);
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

    if (pairs.length === 0) {
      return [];
    }

    const grouped = new Map();
    items.forEach((item, index) => {
      const root = unionFind.find(index);
      if (!grouped.has(root)) {
        grouped.set(root, []);
      }
      grouped.get(root).push(item);
    });

    let groupCounter = 0;
    return Array.from(grouped.values())
      .filter(groupItems => groupItems.length >= 2)
      .map(groupItems => {
        groupCounter += 1;
        const primary = pickPrimaryItem(groupItems);
        const pairScores = pairs
          .filter(pair => groupItems.some(item => item.itemIndex === items[pair.leftIndex].itemIndex && item.groupIndex === items[pair.leftIndex].groupIndex)
            && groupItems.some(item => item.itemIndex === items[pair.rightIndex].itemIndex && item.groupIndex === items[pair.rightIndex].groupIndex));
        const similarity = pairScores.length
          ? Math.max(...pairScores.map(pair => pair.score))
          : 1;
        const exact = pairScores.length > 0 && pairScores.every(pair => pair.kind === 'exact');

        return {
          id: `${file.filename}::dedup::${groupCounter}`,
          filename: file.filename,
          similarity: roundScore(similarity),
          similarityLabel: exact ? '完全重複' : '高度相似',
          itemCount: groupItems.length,
          primaryItemId: primary ? primary.itemId : '',
          primaryReason: buildPrimaryReason(primary, groupItems),
          mergeCandidate: buildMergeCandidate(primary, groupItems),
          items: groupItems
            .slice()
            .sort((left, right) => left.itemId.localeCompare(right.itemId))
            .map(item => ({
              itemId: item.itemId,
              filename: item.filename,
              groupTitle: item.groupTitle,
              content: item.content,
              source: item.source,
              health: item.health,
            })),
        };
      })
      .sort((left, right) => {
        if (right.similarity !== left.similarity) {
          return right.similarity - left.similarity;
        }

        return left.filename.localeCompare(right.filename);
      });
  }

  function buildDedupSuggestionPayload(files, options) {
    const groups = (files || []).flatMap(file => buildDedupGroupsForFile(file, options));
    const summary = {
      groupCount: groups.length,
      duplicateItemCount: groups.reduce((count, group) => count + group.itemCount, 0),
      exactGroupCount: groups.filter(group => group.similarityLabel === '完全重複').length,
      nearGroupCount: groups.filter(group => group.similarityLabel !== '完全重複').length,
    };

    return { summary, groups };
  }

  function normalizeItemIds(itemIds) {
    return Array.from(new Set(Array.isArray(itemIds) ? itemIds : []))
      .filter(Boolean)
      .sort();
  }

  function buildCurrentDedupGroupsForMarkdown(markdown, filename, options) {
    return buildDedupGroupsForFile({
      filename,
      content: markdown,
    }, options);
  }

  function findDedupGroupByItemIds(markdown, filename, itemIds, options) {
    const normalizedItemIds = normalizeItemIds(itemIds);
    if (normalizedItemIds.length < 2) {
      return null;
    }

    return buildCurrentDedupGroupsForMarkdown(markdown, filename, options).find(group => {
      const groupItemIds = normalizeItemIds((group.items || []).map(item => item.itemId));
      return groupItemIds.length === normalizedItemIds.length
        && groupItemIds.every((itemId, index) => itemId === normalizedItemIds[index]);
    }) || null;
  }

  function isItemInAnyDedupGroup(markdown, filename, itemId, options) {
    if (!itemId) {
      return false;
    }

    return buildCurrentDedupGroupsForMarkdown(markdown, filename, options)
      .some(group => (group.items || []).some(item => item.itemId === itemId));
  }

  function attachDedupToMemoryPayload(payload, options) {
    return {
      files: payload.files || [],
      summary: payload.summary || {},
      dedup: buildDedupSuggestionPayload(payload.files || [], options),
    };
  }

  function rewriteMarkdownLines(markdown, replaceMap, removeLineIndexes) {
    const hadTrailingNewline = String(markdown || '').endsWith('\n');
    const lines = String(markdown || '').split(/\r?\n/);
    const nextLines = [];

    lines.forEach((line, lineIndex) => {
      if (removeLineIndexes.has(lineIndex)) {
        return;
      }

      if (replaceMap.has(lineIndex)) {
        nextLines.push(replaceMap.get(lineIndex));
        return;
      }

      nextLines.push(line);
    });

    const rewritten = nextLines.join('\n').replace(/\n{3,}/g, '\n\n');
    return hadTrailingNewline ? `${rewritten}\n` : rewritten;
  }

  function applyMemoryDedupAction(markdown, filename, request) {
    const action = request && request.action;
    const detailedGroups = parseDetailedMemoryMarkdown(markdown, filename);
    const items = flattenDetailedGroups(detailedGroups);
    const itemMap = new Map(items.map(item => [item.itemId, item]));

    if (action === 'merge') {
      const itemIds = normalizeItemIds(request.itemIds);
      if (itemIds.length < 2) {
        throw new Error('merge 需要至少兩個 itemIds');
      }

      const matchedGroup = findDedupGroupByItemIds(markdown, filename, itemIds);
      if (!matchedGroup) {
        throw new Error('找不到可合併的 duplicate group，或 group 已變更');
      }

      const groupItems = itemIds.map(itemId => {
        const item = itemMap.get(itemId);
        if (!item) {
          throw new Error(`找不到可合併的 memory item：${itemId}`);
        }
        return item;
      });

      const requestedPrimaryItemId = request.primaryItemId || matchedGroup.primaryItemId;
      if (!itemIds.includes(requestedPrimaryItemId)) {
        throw new Error('primary item 必須屬於本次 duplicate group');
      }

      const primaryItem = itemMap.get(requestedPrimaryItemId) || pickPrimaryItem(groupItems);
      if (!primaryItem) {
        throw new Error('找不到 primary item');
      }

      const mergedContent = memorySourceUtils.sanitizeMemoryListContent(
        request.mergedContent || primaryItem.content
      ) || primaryItem.content;
      const mergedSource = memorySourceUtils.normalizeMemorySource(request.mergedSource)
        || buildMergeCandidate(primaryItem, groupItems).source;
      const nextPrimaryLine = `${primaryItem.indent}${memorySourceUtils.buildAttributedMemoryListItem(mergedContent, mergedSource)}`;

      const removeLineIndexes = new Set(
        groupItems
          .filter(item => item.itemId !== primaryItem.itemId)
          .map(item => item.lineIndex)
      );
      const replaceMap = new Map([[primaryItem.lineIndex, nextPrimaryLine]]);

      return rewriteMarkdownLines(markdown, replaceMap, removeLineIndexes);
    }

    if (action === 'delete') {
      if (!isItemInAnyDedupGroup(markdown, filename, request.targetItemId)) {
        throw new Error('找不到可刪除的 duplicate item，或 group 已變更');
      }

      const targetItem = itemMap.get(request.targetItemId);
      if (!targetItem) {
        throw new Error(`找不到可刪除的 memory item：${request.targetItemId}`);
      }

      return rewriteMarkdownLines(markdown, new Map(), new Set([targetItem.lineIndex]));
    }

    throw new Error(`不支援的 dedup action：${action}`);
  }

  return {
    DEFAULT_THRESHOLD,
    applyMemoryDedupAction,
    attachDedupToMemoryPayload,
    buildDedupSuggestionPayload,
    buildItemId,
    buildCharacterBigrams,
    buildCurrentDedupGroupsForMarkdown,
    calculateSimilarity,
    findDedupGroupByItemIds,
    isItemInAnyDedupGroup,
    normalizeMemoryComparisonText,
    normalizeItemIds,
    parseDetailedMemoryMarkdown,
    pickPrimaryItem,
    tokenizeMemoryText,
  };
});

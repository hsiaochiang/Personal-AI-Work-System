(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
    return;
  }

  root.GovernanceSchedulerUtils = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const FREQUENCY_MAP = {
    weekly: { label: '每週', days: 7 },
    monthly: { label: '每月', days: 30 },
  };

  const CHECK_DEFAULTS = {
    'memory-health': {
      title: '記憶健康度巡檢',
      route: '/memory',
      buildSummary(signalCount, projectData) {
        if (signalCount > 0) {
          return `目前有 ${signalCount} 條記憶需要優先確認，其中 ${projectData.memorySummary.staleCount || 0} 條已進入過期風險。`;
        }
        return '目前沒有待確認記憶，但本次例行健康度巡檢已到期。';
      },
    },
    'memory-dedup': {
      title: '疑似重複整理巡檢',
      route: '/memory',
      buildSummary(signalCount, projectData) {
        if (signalCount > 0) {
          return `目前有 ${signalCount} 組疑似重複，涉及 ${projectData.dedupSummary.duplicateItemCount || 0} 條記憶。`;
        }
        return '目前沒有新的重複群組，但本次 dedup 例行巡檢已到期。';
      },
    },
    'rules-conflict': {
      title: '規則衝突巡檢',
      route: '/decisions',
      buildSummary(signalCount) {
        if (signalCount > 0) {
          return `目前有 ${signalCount} 組待人工確認的規則衝突，建議前往 /decisions 檢視 explanation。`;
        }
        return '目前沒有新衝突，但本次規則巡檢已到期。';
      },
    },
    'shared-knowledge': {
      title: '共用知識候選巡檢',
      route: '/memory',
      buildSummary(signalCount, projectData) {
        if (signalCount > 0) {
          return `目前有 ${signalCount} 組跨專案共用知識候選，涉及 ${projectData.sharedKnowledgeSummary.projectCount || 0} 個專案。`;
        }
        return '目前沒有新的跨專案共用知識候選，但本次 shared review 已到期。';
      },
    },
  };

  function pad2(value) {
    return String(value).padStart(2, '0');
  }

  function normalizeDateOnly(value) {
    if (!value) {
      return '';
    }

    if (value instanceof Date && !Number.isNaN(value.getTime())) {
      return value.toISOString().slice(0, 10);
    }

    const text = String(value).trim();
    const match = text.match(/(\d{4})[/-](\d{1,2})[/-](\d{1,2})/);
    if (!match) {
      return '';
    }

    return `${match[1]}-${pad2(match[2])}-${pad2(match[3])}`;
  }

  function dateOnlyToUTC(dateOnly) {
    const match = normalizeDateOnly(dateOnly).match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!match) {
      return null;
    }

    return Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  }

  function addDays(dateOnly, days) {
    const utcValue = dateOnlyToUTC(dateOnly);
    if (utcValue === null) {
      return '';
    }

    return normalizeDateOnly(new Date(utcValue + days * 86400000));
  }

  function diffDays(fromDateOnly, toDateOnly) {
    const fromUTC = dateOnlyToUTC(fromDateOnly);
    const toUTC = dateOnlyToUTC(toDateOnly);
    if (fromUTC === null || toUTC === null) {
      return null;
    }

    return Math.floor((toUTC - fromUTC) / 86400000);
  }

  function getFrequencyMeta(frequencyKey) {
    return FREQUENCY_MAP[frequencyKey] || null;
  }

  function parseGovernanceConfig(input, options) {
    const warnings = [];
    let parsed;

    if (typeof input === 'string') {
      try {
        parsed = JSON.parse(input);
      } catch (error) {
        parsed = {};
        warnings.push(`無法解析治理設定：${error.message}`);
      }
    } else if (input && typeof input === 'object') {
      parsed = input;
    } else {
      parsed = {};
    }

    const checks = Array.isArray(parsed.checks) ? parsed.checks : [];
    const normalizedChecks = checks.map((check, index) => {
      const defaults = CHECK_DEFAULTS[check.id] || {};
      const frequencyMeta = getFrequencyMeta(check.frequency);
      if (!frequencyMeta) {
        warnings.push(`check ${check.id || index} 使用未知 frequency：${check.frequency || '未提供'}`);
      }

      const lastReviewedOn = normalizeDateOnly(check.lastReviewedOn);
      if (!lastReviewedOn) {
        warnings.push(`check ${check.id || index} 缺少合法的 lastReviewedOn`);
      }

      const dueCheck = check.dueCheck && typeof check.dueCheck === 'object'
        ? check.dueCheck
        : {};

      return {
        id: String(check.id || `check-${index}`),
        enabled: check.enabled !== false,
        title: String(check.title || defaults.title || check.id || `治理檢查 ${index + 1}`),
        route: String(check.route || defaults.route || '/'),
        frequency: frequencyMeta ? check.frequency : 'weekly',
        frequencyLabel: (frequencyMeta || FREQUENCY_MAP.weekly).label,
        frequencyDays: (frequencyMeta || FREQUENCY_MAP.weekly).days,
        lastReviewedOn,
        dueCheck: {
          source: String(dueCheck.source || ''),
          metric: String(dueCheck.metric || ''),
          attentionThreshold: Number.isFinite(Number(dueCheck.attentionThreshold))
            ? Number(dueCheck.attentionThreshold)
            : 1,
        },
      };
    });

    return {
      enabled: parsed.enabled !== false,
      dueCheck: parsed.dueCheck === 'startup' ? 'startup' : 'startup',
      checks: normalizedChecks,
      warnings,
      configPath: options && options.configPath ? options.configPath : 'web/governance.json',
    };
  }

  function getSourceSummary(projectData, sourceKey) {
    if (sourceKey === 'memory') {
      return projectData.memorySummary || {};
    }

    if (sourceKey === 'dedup') {
      return projectData.dedupSummary || {};
    }

    if (sourceKey === 'sharedKnowledge') {
      return projectData.sharedKnowledgeSummary || {};
    }

    if (sourceKey === 'rulesConflict') {
      return projectData.ruleConflictSummary || {};
    }

    return {};
  }

  function getSignalCount(check, projectData) {
    const sourceSummary = getSourceSummary(projectData, check.dueCheck.source);
    const rawValue = sourceSummary[check.dueCheck.metric];
    return Number.isFinite(Number(rawValue)) ? Number(rawValue) : 0;
  }

  function getDueMeta(check, now) {
    const nowDateOnly = normalizeDateOnly(now || new Date());
    if (!check.lastReviewedOn || !nowDateOnly) {
      return {
        isDue: false,
        nextDueOn: '',
        overdueDays: null,
        nowDateOnly,
      };
    }

    const nextDueOn = addDays(check.lastReviewedOn, check.frequencyDays);
    const overdueDays = diffDays(nextDueOn, nowDateOnly);
    return {
      isDue: overdueDays !== null && overdueDays >= 0,
      nextDueOn,
      overdueDays: overdueDays !== null && overdueDays >= 0 ? overdueDays : 0,
      nowDateOnly,
    };
  }

  function buildTodo(check, projectData, now) {
    const dueMeta = getDueMeta(check, now);
    if (!check.enabled || !dueMeta.isDue) {
      return null;
    }

    const defaults = CHECK_DEFAULTS[check.id] || {};
    const signalCount = getSignalCount(check, projectData);
    const attentionThreshold = Number.isFinite(check.dueCheck.attentionThreshold)
      ? check.dueCheck.attentionThreshold
      : 1;
    const severity = signalCount >= attentionThreshold ? 'attention' : 'routine';
    const summary = typeof defaults.buildSummary === 'function'
      ? defaults.buildSummary(signalCount, projectData)
      : '治理巡檢已到期，請人工確認。';

    return {
      id: `${projectData.projectId}:${check.id}`,
      checkId: check.id,
      title: check.title,
      route: check.route,
      frequency: check.frequency,
      frequencyLabel: check.frequencyLabel,
      lastReviewedOn: check.lastReviewedOn,
      nextDueOn: dueMeta.nextDueOn,
      overdueDays: dueMeta.overdueDays,
      signalCount,
      severity,
      summary,
      suggestionOnly: true,
      manualNote: `確認後請手動更新 ${projectData.configPath || 'web/governance.json'} 的 lastReviewedOn。`,
    };
  }

  function buildGovernanceProjectSnapshot(configInput, projectData, options) {
    const checkedAt = (options && options.now ? new Date(options.now) : new Date()).toISOString();
    const config = configInput && configInput.checks
      ? configInput
      : parseGovernanceConfig(configInput, options);

    if (!config.enabled) {
      return {
        projectId: projectData.projectId,
        projectName: projectData.projectName,
        checkedAt,
        enabled: false,
        configPath: config.configPath,
        dueCheck: config.dueCheck,
        warnings: config.warnings || [],
        summary: {
          dueCount: 0,
          attentionCount: 0,
          routineCount: 0,
        },
        todos: [],
      };
    }

    const todos = (config.checks || [])
      .map(check => buildTodo(check, {
        ...projectData,
        configPath: config.configPath,
      }, options && options.now))
      .filter(Boolean)
      .sort((left, right) => {
        if (left.severity !== right.severity) {
          return left.severity === 'attention' ? -1 : 1;
        }

        if (right.overdueDays !== left.overdueDays) {
          return right.overdueDays - left.overdueDays;
        }

        return left.title.localeCompare(right.title);
      });

    return {
      projectId: projectData.projectId,
      projectName: projectData.projectName,
      checkedAt,
      enabled: true,
      configPath: config.configPath,
      dueCheck: config.dueCheck,
      warnings: config.warnings || [],
      summary: {
        dueCount: todos.length,
        attentionCount: todos.filter(todo => todo.severity === 'attention').length,
        routineCount: todos.filter(todo => todo.severity !== 'attention').length,
      },
      todos,
    };
  }

  return {
    CHECK_DEFAULTS,
    FREQUENCY_MAP,
    buildGovernanceProjectSnapshot,
    diffDays,
    getDueMeta,
    normalizeDateOnly,
    parseGovernanceConfig,
  };
});

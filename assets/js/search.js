// ============================================
// 全站全文搜索 — 精准 / 模糊双模式
// ============================================
(function () {
  var searchInput = document.getElementById('search-page-input');
  if (!searchInput) return;

  var resultsContainer = document.getElementById('search-results');
  var emptyHint = document.getElementById('search-empty');
  var noResultsHint = document.getElementById('search-no-results');
  var modeFuzzyLabel = document.getElementById('mode-fuzzy-label');
  var modeExactLabel = document.getElementById('mode-exact-label');
  var searchData = [];
  var debounceTimer = null;
  var searchMode = 'fuzzy'; // 'fuzzy' | 'exact'
  var searchDataLoaded = false;

  // 立即从 URL 读取初始查询，避免竞态条件
  var params = new URLSearchParams(window.location.search);
  var initialQuery = params.get('q') || '';
  if (initialQuery) {
    searchInput.value = initialQuery;
  }

  // 显示加载状态
  if (emptyHint && emptyHint.querySelector('.empty-state__text')) {
    emptyHint.querySelector('.empty-state__text').textContent = '正在加载搜索索引...';
  }

  // ---- 搜索模式切换 ----
  function setMode(mode) {
    searchMode = mode;
    if (modeFuzzyLabel && modeExactLabel) {
      modeFuzzyLabel.classList.toggle('is-active', mode === 'fuzzy');
      modeExactLabel.classList.toggle('is-active', mode === 'exact');
    }
    // 如果输入框已有内容且数据已加载，重新搜索
    var query = searchInput.value;
    if (query.trim() && searchDataLoaded) {
      doSearch(query);
    }
  }

  if (modeFuzzyLabel) {
    modeFuzzyLabel.addEventListener('click', function () {
      this.querySelector('input').checked = true;
      setMode('fuzzy');
    });
  }
  if (modeExactLabel) {
    modeExactLabel.addEventListener('click', function () {
      this.querySelector('input').checked = true;
      setMode('exact');
    });
  }

  // ---- 加载搜索索引 ----
  var searchUrl = searchInput.getAttribute('data-search-url') || '/geology-atlas/search.json';

  function onSearchDataLoaded(data) {
    searchData = data;
    searchDataLoaded = true;

    // 恢复提示文字
    if (emptyHint && emptyHint.querySelector('.empty-state__text')) {
      emptyHint.querySelector('.empty-state__text').textContent = '输入关键词开始搜索';
    }

    // 仅在用户未修改输入框时，使用 URL 初始查询自动搜索
    var currentInput = searchInput.value.trim();
    if (initialQuery && currentInput === initialQuery) {
      doSearch(initialQuery);
    } else if (currentInput && currentInput !== initialQuery) {
      // 用户已修改输入，用当前内容搜索（不回退到 URL 参数）
      doSearch(currentInput);
    }
    // 否则显示初始提示
  }

  function onSearchDataError(err) {
    console.warn('搜索索引加载失败: ' + err.message);
    searchDataLoaded = true;

    if (emptyHint && emptyHint.querySelector('.empty-state__text')) {
      emptyHint.querySelector('.empty-state__text').textContent = '搜索索引加载失败，请刷新页面重试';
    }

    if (resultsContainer) {
      resultsContainer.innerHTML = '<div class="empty-state"><div class="empty-state__icon">⚠️</div><p class="empty-state__text">搜索索引加载失败，请刷新页面重试</p></div>';
    }
  }

  fetch(searchUrl)
    .then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    })
    .then(onSearchDataLoaded)
    .catch(function (err) {
      // 仅当主 URL 失败时尝试备用路径
      var fallbackUrl = '/geology-atlas/search.json';
      if (fallbackUrl === searchUrl) {
        // 已经在用这个 URL，直接报错
        onSearchDataError(err);
        return;
      }
      fetch(fallbackUrl)
        .then(function (res) {
          if (!res.ok) throw new Error('HTTP ' + res.status);
          return res.json();
        })
        .then(onSearchDataLoaded)
        .catch(function (err2) {
          onSearchDataError(err2);
        });
    });

  // ---- 高亮 ----
  function highlight(text, query) {
    if (!query) return text;
    var escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return text.replace(new RegExp('(' + escaped + ')', 'gi'),
      '<mark class="search-highlight">$1</mark>');
  }

  // ---- 搜索核心 ----
  function doSearch(query) {
    if (!searchDataLoaded) return; // 数据未就绪，不搜索

    var q = query.trim();
    if (!q) {
      if (resultsContainer) resultsContainer.innerHTML = '';
      if (emptyHint) emptyHint.style.display = '';
      if (noResultsHint) noResultsHint.style.display = 'none';
      updateMeta(0);
      return;
    }
    if (emptyHint) emptyHint.style.display = 'none';

    var qLower = q.toLowerCase();
    var results;

    if (searchMode === 'exact') {
      // 精准搜索：仅匹配标题
      results = searchData.filter(function (item) {
        var titleText = (item.title + ' ' + (item.title_en || '')).toLowerCase();
        return titleText.indexOf(qLower) !== -1;
      });
    } else {
      // 模糊搜索：匹配标题、摘要、正文、标签
      results = searchData.filter(function (item) {
        var text = (item.title + ' ' + (item.title_en || '') + ' ' +
                    (item.summary || '') + ' ' + (item.content || '') + ' ' +
                    (item.tags || []).join(' ')).toLowerCase();
        return text.indexOf(qLower) !== -1;
      });
    }

    // 标题匹配排前面
    results.sort(function (a, b) {
      var aTitle = (a.title || '').toLowerCase().indexOf(qLower) >= 0 ? 1 : 0;
      var bTitle = (b.title || '').toLowerCase().indexOf(qLower) >= 0 ? 1 : 0;
      if (aTitle !== bTitle) return bTitle - aTitle;
      return (a.category || '').localeCompare(b.category || '');
    });

    if (resultsContainer) {
      if (results.length === 0) {
        resultsContainer.innerHTML = '';
        if (noResultsHint) {
          noResultsHint.style.display = '';
          var hintText = noResultsHint.querySelector('.empty-state__text');
          if (hintText) {
            if (searchMode === 'exact') {
              hintText.textContent = '标题中没有找到匹配，试试切换到「模糊搜索」';
            } else {
              hintText.textContent = '没有找到匹配的结果，试试其他关键词';
            }
          }
        }
      } else {
        if (noResultsHint) noResultsHint.style.display = 'none';
        resultsContainer.innerHTML = results.map(function (item) {
          return '<article class="card" data-category="' + (item.category || '') + '">' +
            '<a href="' + item.url + '" class="card__link">' +
            '<div class="card__image">' +
            '<img src="' + (item.thumbnail || '/geology-atlas/assets/images/placeholder.svg') + '" alt="' + item.title + '" loading="lazy" />' +
            '<span class="card__badge" style="background-color:' + (item.category_color || '#888') + '">' + (item.category_name || '') + '</span>' +
            '</div>' +
            '<div class="card__body">' +
            '<h3 class="card__title">' + highlight(item.title || '', q) + '</h3>' +
            '<p class="card__summary">' + highlight((item.summary || '').substring(0, 100), q) + '</p>' +
            '</div>' +
            '</a>' +
            '</article>';
        }).join('');
      }
    }
    updateMeta(results.length);
  }

  function updateMeta(count) {
    var metaEl = document.getElementById('search-meta');
    if (!metaEl) {
      var resultsDiv = document.querySelector('.search-page__results');
      if (resultsDiv) {
        var div = document.createElement('div');
        div.id = 'search-meta';
        div.className = 'search-page__meta';
        resultsDiv.parentNode.insertBefore(div, resultsDiv);
        metaEl = div;
      }
    }
    if (metaEl) {
      var modeLabel = searchMode === 'exact' ? '精准搜索（仅标题）' : '模糊搜索（全部字段）';
      if (count > 0) {
        metaEl.innerHTML = '<span class="search-page__count">' + modeLabel + '：找到 <strong>' + count + '</strong> 个结果</span>' +
          '<span class="search-page__hint">按 <kbd>Ctrl+K</kbd> 快速聚焦</span>';
      } else if (searchInput.value.trim()) {
        metaEl.innerHTML = '<span class="search-page__count">' + modeLabel + '：未找到匹配</span>';
      } else {
        metaEl.innerHTML = '<span class="search-page__hint">按 <kbd>Ctrl+K</kbd> 快速聚焦搜索</span>';
      }
    }
  }

  // ---- 输入事件（防抖） ----
  searchInput.addEventListener('input', function () {
    var query = this.value;
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(function () {
      doSearch(query);
      var newUrl = window.location.pathname;
      if (query.trim()) {
        newUrl += '?q=' + encodeURIComponent(query.trim());
      }
      if (window.history && window.history.replaceState) {
        window.history.replaceState({}, '', newUrl);
      }
    }, 250);
  });

  // Enter 立即搜索
  searchInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      clearTimeout(debounceTimer);
      doSearch(this.value);
    }
  });
})();

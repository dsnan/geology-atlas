// ============================================
// 分类筛选 + 实时搜索 — 增强版
// ============================================
(function () {
  const filterBar = document.getElementById('filter-bar');
  if (!filterBar) return;

  const tabs = filterBar.querySelectorAll('.filter-tab');
  const searchInput = document.getElementById('filter-search');
  const cardGrid = document.getElementById('card-grid');
  if (!cardGrid) return;
  const cards = cardGrid.querySelectorAll('.card');
  const noResults = document.getElementById('no-results');
  const resultCount = document.getElementById('result-count');

  let activeFilter = 'all';
  let debounceTimer = null;

  // 检查是否有默认筛选
  tabs.forEach(function (tab) {
    if (tab.dataset.default === 'true') {
      activeFilter = tab.dataset.filter;
      tabs.forEach(function (t) { t.classList.remove('active'); });
      tab.classList.add('active');
    }
  });

  // 岩石子分类映射（父分类 → 子分类列表）
  var parentMap = {
    rocks: ['igneous', 'sedimentary', 'metamorphic']
  };

  function matchCategory(cardCat, filter) {
    if (filter === 'all') return true;
    // 直接匹配
    if (cardCat === filter) return true;
    // 检查 data-parent 属性
    var cardParent = arguments.callee.caller ? null : null; // placeholder, we handle below
    return false;
  }

  function cardMatchesFilter(card, filter) {
    if (filter === 'all') return true;
    var cat = card.dataset.category;
    var parent = card.dataset.parent;
    // 直接分类匹配
    if (cat === filter) return true;
    // 父分类匹配（如筛选"岩石"时匹配火成岩/沉积岩/变质岩）
    if (parent === filter) return true;
    // 如果筛选的是父分类，检查子分类
    if (parentMap[filter] && parentMap[filter].indexOf(cat) >= 0) return true;
    return false;
  }

  function updateCards() {
    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
    let visible = 0;

    cards.forEach(function (card) {
      const cat = card.dataset.category;
      const title = (card.querySelector('.card__title') || {}).textContent || '';
      const summary = (card.querySelector('.card__summary') || {}).textContent || '';
      const text = (title + ' ' + summary).toLowerCase();

      const matchFilter = cardMatchesFilter(card, activeFilter);
      const matchSearch = !query || text.indexOf(query) !== -1;

      if (matchFilter && matchSearch) {
        card.classList.remove('is-hidden');
        visible++;
      } else {
        card.classList.add('is-hidden');
      }
    });

    if (resultCount) {
      if (query || activeFilter !== 'all') {
        resultCount.textContent = '显示 ' + visible + ' 个条目';
      } else {
        resultCount.textContent = '共 ' + cards.length + ' 个条目';
      }
    }
    if (noResults) {
      noResults.style.display = visible === 0 ? '' : 'none';
    }
  }

  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      tabs.forEach(function (t) { t.classList.remove('active'); });
      tab.classList.add('active');
      activeFilter = tab.dataset.filter;
      updateCards();
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', function () {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(updateCards, 200);
    });
  }

  // 初始化
  updateCards();
})();

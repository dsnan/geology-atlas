// ============================================
// 分类筛选 + 实时搜索
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

  // 检查是否有默认筛选
  tabs.forEach(function (tab) {
    if (tab.dataset.default === 'true') {
      activeFilter = tab.dataset.filter;
      tabs.forEach(function (t) { t.classList.remove('active'); });
      tab.classList.add('active');
    }
  });

  function updateCards() {
    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
    let visible = 0;

    cards.forEach(function (card) {
      const cat = card.dataset.category;
      const title = (card.querySelector('.card__title') || {}).textContent || '';
      const summary = (card.querySelector('.card__summary') || {}).textContent || '';
      const text = (title + ' ' + summary).toLowerCase();

      const matchFilter = activeFilter === 'all' || cat === activeFilter;
      const matchSearch = !query || text.indexOf(query) !== -1;

      if (matchFilter && matchSearch) {
        card.classList.remove('is-hidden');
        visible++;
      } else {
        card.classList.add('is-hidden');
      }
    });

    if (resultCount) {
      resultCount.textContent = '显示 ' + visible + ' 个条目';
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
    searchInput.addEventListener('input', updateCards);
  }

  // 初始化计数
  updateCards();
})();

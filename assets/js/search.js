// ============================================
// 全站全文搜索
// ============================================
(function () {
  const searchInput = document.getElementById('search-page-input');
  if (!searchInput) return;

  const resultsContainer = document.getElementById('search-results');
  const emptyHint = document.getElementById('search-empty');
  const noResultsHint = document.getElementById('search-no-results');
  let searchData = [];

  // 加载搜索索引
  fetch('/geology-atlas/search.json')
    .then(function (res) { return res.json(); })
    .then(function (data) {
      searchData = data;
      // 检查 URL 参数
      var params = new URLSearchParams(window.location.search);
      var q = params.get('q');
      if (q) {
        searchInput.value = q;
        doSearch(q);
      }
    })
    .catch(function () {
      console.warn('搜索索引加载失败');
    });

  function doSearch(query) {
    var q = query.toLowerCase().trim();
    if (!q) {
      if (resultsContainer) resultsContainer.innerHTML = '';
      if (emptyHint) emptyHint.style.display = '';
      if (noResultsHint) noResultsHint.style.display = 'none';
      return;
    }
    if (emptyHint) emptyHint.style.display = 'none';

    var results = searchData.filter(function (item) {
      var text = (item.title + ' ' + item.title_en + ' ' + item.summary + ' ' + item.content + ' ' + (item.tags || []).join(' ')).toLowerCase();
      return text.indexOf(q) !== -1;
    });

    if (resultsContainer) {
      if (results.length === 0) {
        resultsContainer.innerHTML = '';
        if (noResultsHint) noResultsHint.style.display = '';
      } else {
        if (noResultsHint) noResultsHint.style.display = 'none';
        resultsContainer.innerHTML = results.map(function (item) {
          return '<article class="card" data-category="' + item.category + '">' +
            '<a href="' + item.url + '" class="card__link">' +
            '<div class="card__image">' +
            '<img src="' + item.thumbnail + '" alt="' + item.title + '" loading="lazy" />' +
            '<span class="card__badge" style="background-color:' + item.category_color + '">' + item.category_name + '</span>' +
            '</div>' +
            '<div class="card__body">' +
            '<h3 class="card__title">' + item.title + '</h3>' +
            '<p class="card__summary">' + (item.summary || '').substring(0, 80) + '</p>' +
            '</div>' +
            '</a>' +
            '</article>';
        }).join('');
      }
    }
  }

  searchInput.addEventListener('input', function () {
    doSearch(this.value);
  });
})();

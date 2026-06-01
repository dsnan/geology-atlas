// ============================================
// 全局 UI 增强
// ============================================
(function () {
  // ---- 返回顶部按钮 ----
  const scrollTopBtn = document.getElementById('scroll-top');
  if (scrollTopBtn) {
    let scrollTicking = false;
    window.addEventListener('scroll', function () {
      if (!scrollTicking) {
        requestAnimationFrame(function () {
          if (window.scrollY > 400) {
            scrollTopBtn.classList.add('visible');
          } else {
            scrollTopBtn.classList.remove('visible');
          }
          scrollTicking = false;
        });
        scrollTicking = true;
      }
    });

    scrollTopBtn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ---- 键盘快捷键 ----
  document.addEventListener('keydown', function (e) {
    // Ctrl+K 或 / 聚焦搜索框
    if ((e.ctrlKey && e.key === 'k') || (e.key === '/' && !e.ctrlKey && !e.metaKey)) {
      // 不要拦截输入框内的 /
      if (e.key === '/' && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable)) {
        return;
      }
      e.preventDefault();
      const searchInput = document.getElementById('search-page-input') || document.getElementById('hero-search');
      if (searchInput) {
        searchInput.focus();
        searchInput.select();
      }
    }

    // Escape 取消搜索焦点
    if (e.key === 'Escape') {
      if (document.activeElement && document.activeElement.tagName === 'INPUT') {
        document.activeElement.blur();
      }
    }
  });

  // ---- 为 Hero 搜索添加视觉反馈 ----
  const heroSearch = document.getElementById('hero-search');
  if (heroSearch) {
    heroSearch.addEventListener('focus', function () {
      this.closest('.hero__search').classList.add('is-focused');
    });
    heroSearch.addEventListener('blur', function () {
      this.closest('.hero__search').classList.remove('is-focused');
    });
  }

  // ---- 平滑滚动所有锚链接 ----
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var targetId = this.getAttribute('href').slice(1);
      if (!targetId) return;
      var target = document.getElementById(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
})();

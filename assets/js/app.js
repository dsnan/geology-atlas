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

    // 搜索跳转：JS监听表单提交（第二层保护，兼容移动端虚拟键盘搜索按钮）
    var heroForm = heroSearch.closest('form');
    if (heroForm) {
      heroForm.addEventListener('submit', function(e) {
        e.preventDefault();
        var q = heroSearch.value.trim();
        if (q) {
          window.location.href = '/geology-atlas/pages/search/?q=' + encodeURIComponent(q);
        }
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

  // ---- 移动端导航菜单 ----
  const navToggle = document.getElementById('nav-toggle');
  const navMenu = document.getElementById('nav-menu');
  const navOverlay = document.getElementById('nav-overlay');
  const navClose = document.getElementById('nav-menu-close');
  const body = document.body;

  // 滚动锁定辅助函数（保持滚动位置，避免移动端跳动）
  var scrollY = 0;

  function lockScroll() {
    scrollY = window.scrollY;
    body.style.position = 'fixed';
    body.style.top = '-' + scrollY + 'px';
    body.style.width = '100%';
    body.style.overflow = 'hidden';
  }

  function unlockScroll() {
    body.style.position = '';
    body.style.top = '';
    body.style.width = '';
    body.style.overflow = '';
    window.scrollTo(0, scrollY);
  }

  function openMenu() {
    navToggle.classList.add('is-open');
    navToggle.setAttribute('aria-expanded', 'true');
    navMenu.classList.add('is-open');
    navOverlay.classList.add('is-open');
    lockScroll();
  }

  function closeMenu() {
    navToggle.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
    navMenu.classList.remove('is-open');
    navOverlay.classList.remove('is-open');
    unlockScroll();
  }

  if (navToggle && navMenu && navOverlay && navClose) {
    navToggle.addEventListener('click', function () {
      if (navMenu.classList.contains('is-open')) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    navClose.addEventListener('click', closeMenu);
    navOverlay.addEventListener('click', closeMenu);

    // 点击菜单内链接后自动关闭
    navMenu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        closeMenu();
      });
    });

    // ESC 关闭菜单
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        // 优先关闭公告弹窗
        var announcementOverlay = document.getElementById('announcement-overlay');
        if (announcementOverlay && announcementOverlay.classList.contains('is-open')) {
          closeAnnouncement();
          return;
        }
        // 其次关闭移动端菜单
        if (navMenu.classList.contains('is-open')) {
          closeMenu();
          navToggle.focus();
        }
      }
    });
  }

  // ---- 公告弹窗 ----
  var announcementOverlay = document.getElementById('announcement-overlay');
  var announcementClose = document.getElementById('announcement-close');
  var announcementModal = document.getElementById('announcement-modal');

  function openAnnouncement() {
    if (!announcementOverlay) return;
    announcementOverlay.classList.add('is-open');
    lockScroll();
    if (announcementClose) {
      announcementClose.focus();
    }
  }

  function closeAnnouncement() {
    if (!announcementOverlay) return;
    announcementOverlay.classList.remove('is-open');
    unlockScroll();
    // 记住已关闭，下次不再显示
    try {
      localStorage.setItem('geology-atlas-announcement-dismissed', '1');
    } catch (e) { /* localStorage 不可用则忽略 */ }
  }

  if (announcementOverlay) {
    // 检查是否已关闭过，仅首次访问显示
    var dismissed = false;
    try {
      dismissed = localStorage.getItem('geology-atlas-announcement-dismissed') === '1';
    } catch (e) { /* localStorage 不可用则每次显示 */ }

    if (!dismissed) {
      // 直接延迟弹出，脚本在 body 底部，DOM 已就绪
      setTimeout(openAnnouncement, 500);
    }

    // 关闭按钮
    if (announcementClose) {
      announcementClose.addEventListener('click', closeAnnouncement);
    }

    // 点击遮罩关闭
    announcementOverlay.addEventListener('click', function (e) {
      if (e.target === announcementOverlay) {
        closeAnnouncement();
      }
    });
  }
})();

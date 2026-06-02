// ============================================
// 图片画廊 — 支持箭头、键盘、触摸滑动
// ============================================
(function () {
  var galleries = document.querySelectorAll('[data-gallery]');

  galleries.forEach(function (gallery) {
    var mainImg = gallery.querySelector('[data-gallery-main]');
    var counter = gallery.querySelector('[data-gallery-counter]');
    var caption = gallery.querySelector('[data-gallery-caption]');
    var thumbContainer = gallery.querySelector('[data-gallery-thumbs]');
    var prevBtn = gallery.querySelector('[data-gallery-prev]');
    var nextBtn = gallery.querySelector('[data-gallery-next]');

    if (!mainImg) return;

    var thumbs = thumbContainer
      ? Array.from(thumbContainer.querySelectorAll('[data-gallery-index]'))
      : [];
    var currentIndex = 0;
    var total = thumbs.length;

    // 存储每张图片的 URL 和标题
    var images = [];
    thumbs.forEach(function (btn, i) {
      var img = btn.querySelector('img');
      images.push({
        url: img ? img.src : '',
        caption: img ? img.alt : ''
      });
    });

    // 单图不需要导航
    if (total === 0) return;

    function goTo(index) {
      if (index < 0) index = total - 1;
      if (index >= total) index = 0;
      currentIndex = index;

      var item = images[index];
      mainImg.src = item.url;
      if (caption) caption.textContent = item.caption;
      if (counter) counter.textContent = (index + 1) + ' / ' + total;

      // 更新缩略图高亮
      thumbs.forEach(function (t, i) {
        t.classList.toggle('active', i === index);
      });
    }

    // 箭头按钮
    if (prevBtn) {
      prevBtn.addEventListener('click', function () { goTo(currentIndex - 1); });
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', function () { goTo(currentIndex + 1); });
    }

    // 缩略图点击
    thumbs.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var idx = parseInt(btn.getAttribute('data-gallery-index'), 10);
        goTo(idx);
      });
    });

    // 键盘左右箭头
    gallery.setAttribute('tabindex', '0');
    gallery.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goTo(currentIndex - 1);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        goTo(currentIndex + 1);
      }
    });

    // 触摸滑动
    var touchStartX = 0;
    var touchEndX = 0;

    gallery.addEventListener('touchstart', function (e) {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    gallery.addEventListener('touchend', function (e) {
      touchEndX = e.changedTouches[0].screenX;
      var diff = touchStartX - touchEndX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          goTo(currentIndex + 1); // 左滑 → 下一张
        } else {
          goTo(currentIndex - 1); // 右滑 → 上一张
        }
      }
    }, { passive: true });
  });
})();

// ============================================
// 图片画廊切换
// ============================================
function switchGalleryImage(url, caption, btn) {
  var mainImg = document.getElementById('gallery-main');
  var captionEl = document.getElementById('gallery-caption');
  if (mainImg) mainImg.src = url;
  if (captionEl) captionEl.textContent = caption;

  var thumbs = document.querySelectorAll('.image-gallery__thumb');
  thumbs.forEach(function (t) { t.classList.remove('active'); });
  if (btn) btn.classList.add('active');
}

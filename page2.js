// Hiệu ứng chuyển trang
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const href = link.getAttribute('href');
        const transitionOverlay = document.querySelector('.page-transition');
        
        transitionOverlay.classList.add('active');
        setTimeout(() => {
            window.location.href = href;
        }, 500); // Phù hợp với thời gian chuyển tiếp CSS
    });
});

// Hiệu ứng cuộn với Intersection Observer
const animateElements = document.querySelectorAll('.animate-on-scroll');
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target); // Ngừng quan sát sau khi đã kích hoạt
        }
    });
}, {
    threshold: 0.1
});

animateElements.forEach(element => {
    observer.observe(element);
});

// Xử lý "Tìm Hiểu Thêm" toggle
document.querySelectorAll('.learn-more').forEach(button => {
    button.addEventListener('click', (e) => {
        e.preventDefault();
        const card = button.closest('.animal-card, .news-card');
        const details = card.querySelector('.animal-details');
        if (details) {
            details.classList.toggle('show');
            button.textContent = details.classList.contains('show') ? 'Ẩn Thông Tin' : 'Tìm Hiểu Thêm';
        }
    });
});
function animateCounter(element, start = 0, end, duration = 4000, suffix = '') {
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const currentValue = Math.floor(start + (end - start) * progress);
    element.textContent = currentValue.toLocaleString() + suffix;

    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      element.textContent = end.toLocaleString() + suffix;
    }
  }

  requestAnimationFrame(update);
}

document.addEventListener('DOMContentLoaded', () => {
  const numberElements = document.querySelectorAll('.stat-number');

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const element = entry.target;
        const rawText = element.getAttribute('data-final').trim();
        const hasPlus = rawText.endsWith('+');
        const hasPercent = rawText.endsWith('%');

        let numeric = parseInt(rawText.replace(/[^\d]/g, ''), 10);
        let suffix = hasPlus ? '+' : (hasPercent ? '%' : '');

        if (!isNaN(numeric)) {
          element.textContent = '0' + suffix;
          animateCounter(element, 0, numeric, 2000, suffix);
          observer.unobserve(element); // Ngăn chạy lại nhiều lần
        }
      }
    });
  }, {
    threshold: 0.5 // Chạy khi phần tử hiển thị ít nhất 50%
  });

  numberElements.forEach(el => observer.observe(el));
});
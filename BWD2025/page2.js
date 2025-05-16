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
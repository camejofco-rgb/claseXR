document.documentElement.classList.add('js');
(() => {
  const items = document.querySelectorAll('.premise, .object-section, .viewer-section, .system-intro, .principles article, .future-grid, .timeline, .gallery, .ar-section');
  items.forEach(el => el.classList.add('reveal'));
  if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) {
    items.forEach(el => el.classList.add('is-visible'));
    return;
  }
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: .08, rootMargin: '0px 0px -5% 0px' });
  items.forEach(el => io.observe(el));
})();

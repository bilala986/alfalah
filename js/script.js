document.addEventListener('DOMContentLoaded', () => {
  const rows = document.querySelectorAll('.mission-row');
  const bar = document.getElementById('mission-bar');

  // Animate text rows on scroll
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate');
      }
    });
  }, { threshold: 0.2 });
  rows.forEach(row => observer.observe(row));

  // Create tick elements for each icon
  rows.forEach((row, idx) => {
    const icon = row.querySelector('.rounded-circle');
    const tick = document.createElement('div');
    tick.classList.add('mission-tick');
    tick.style.top = `${icon.offsetTop + icon.offsetHeight / 2 - 10}px`; // center tick vertically
    tick.innerHTML = '✔';
    row.querySelector('div:first-child').appendChild(tick);
  });

  const ticks = document.querySelectorAll('.mission-tick');

  // Scroll bar progress & tick activation
  window.addEventListener('scroll', () => {
    const sectionTop = document.getElementById('mission').offsetTop;
    const sectionHeight = document.getElementById('mission').offsetHeight;
    const scrollPos = window.scrollY + window.innerHeight / 2;
    const progress = Math.min(Math.max((scrollPos - sectionTop) / sectionHeight, 0), 1);
    bar.style.height = `${progress * 100}%`;

    ticks.forEach((tick, idx) => {
      const row = rows[idx];
      const iconTop = row.querySelector('.rounded-circle').offsetTop + row.offsetTop;
      if (scrollPos >= iconTop) {
        tick.classList.add('active');
      } else {
        tick.classList.remove('active');
      }
    });
  });
});

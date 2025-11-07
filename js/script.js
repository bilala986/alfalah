document.addEventListener('DOMContentLoaded', () => {
  const rows = document.querySelectorAll('.mission-row');
  const bar = document.getElementById('mission-bar');
  const barContainer = document.querySelector('#mission-bar-bg');

  // Animate mission rows on scroll
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('animate');
    });
  }, { threshold: 0.2 });
  rows.forEach(row => observer.observe(row));

  // Create tick markers inside the progress bar
  const ticks = [];
  rows.forEach((row, idx) => {
    const icon = row.querySelector('.rounded-circle');
    const tick = document.createElement('div');
    tick.classList.add('mission-tick');
    const topPos = icon.offsetTop + row.offsetTop + icon.offsetHeight / 2 - 7;
    tick.style.top = `${topPos}px`;
    barContainer.appendChild(tick);
    ticks.push({ el: tick, top: topPos });
  });

  // Update progress bar & tick activation on scroll
  window.addEventListener('scroll', () => {
    const section = document.getElementById('mission');
    const sectionTop = section.offsetTop;
    const sectionHeight = section.offsetHeight;
    const scrollPos = window.scrollY + window.innerHeight / 2;
    const progress = Math.min(Math.max((scrollPos - sectionTop) / sectionHeight, 0), 1);
    bar.style.height = `${progress * 100}%`;

    ticks.forEach(({ el, top }) => {
      if (scrollPos >= top + sectionTop) {
        el.classList.add('active');
        el.innerHTML = '✔';
      } else {
        el.classList.remove('active');
        el.innerHTML = '';
      }
    });
  });
});

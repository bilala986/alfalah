document.addEventListener('DOMContentLoaded', () => {
  const rows = document.querySelectorAll('.mission-row');
  const bar = document.getElementById('mission-bar');
  const barContainer = document.querySelector('#mission-bar-bg');
  const section = document.getElementById('mission');

  // Animate mission rows on scroll
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('animate');
    });
  }, { threshold: 0.2 });
  rows.forEach(row => observer.observe(row));

  // Create tick markers inside the progress bar
  const ticks = [];
  rows.forEach(row => {
    const icon = row.querySelector('.rounded-circle');
    const tick = document.createElement('div');
    tick.classList.add('mission-tick');
    // Calculate tick position relative to the section
    const topPos = icon.offsetTop + row.offsetTop + icon.offsetHeight / 2 - 7;
    tick.style.top = `${topPos}px`;
    barContainer.appendChild(tick);
    ticks.push({ el: tick, top: topPos });
  });

    // Update progress bar & tick activation on scroll
  window.addEventListener('scroll', () => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.offsetHeight;
    const scrollMid = window.scrollY + window.innerHeight / 2; // midpoint of viewport

    // Smooth bar animation based on midpoint position
    const progress = Math.min(Math.max((scrollMid - sectionTop) / sectionHeight, 0), 1);
    const barHeight = progress * sectionHeight;

    // Update bar fill height smoothly
    bar.style.height = `${barHeight}px`;

    // Compute the *actual* fill distance relative to the section
    const filledHeight = Math.min(barHeight, sectionHeight);

    // Tick + circle activation tied to the real fill height
    ticks.forEach(({ el, top }, i) => {
      const icon = rows[i].querySelector('.rounded-circle');

      if (filledHeight >= top) {
        // Bar has visually reached this tick
        el.classList.add('active');
        el.innerHTML = '✔';
        icon.classList.add('filled');
      } else {
        el.classList.remove('active');
        el.innerHTML = '';
        icon.classList.remove('filled');
      }
    });
  });

});

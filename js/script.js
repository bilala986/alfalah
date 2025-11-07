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

    window.addEventListener('scroll', () => {
        const sectionRect = section.getBoundingClientRect();
        const sectionHeight = section.offsetHeight;
        const viewportHeight = window.innerHeight;

        // How much the section has entered the viewport
        const scrollProgress = Math.min(
            Math.max((viewportHeight - sectionRect.top) / (sectionHeight + viewportHeight / 2), 0),
            1
        );

        // Limit bar fill to its own height
        const maxBarHeight = barContainer.offsetHeight;
        const barHeight = scrollProgress * maxBarHeight;
        bar.style.height = `${barHeight}px`;

        // Activate ticks and circles
        ticks.forEach(({ el, top }, i) => {
            const icon = rows[i].querySelector('.rounded-circle');
            if (barHeight >= top) {
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

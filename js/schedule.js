fetch("data/schedule-2026.json")
  .then(res => res.json())
  .then(races => {
    const container = document.getElementById("schedule-container");

    container.innerHTML = races.map((race, idx) => `
      <a
        href="pages/tracks.html?track=${race.slug}"
        class="card glass-panel p-6 border-t-4 ${race.highlight ? "border-t-red-600" : "border-t-zinc-800"}"
        data-index="${idx}">

        <div class="flex justify-between items-start mb-4 card-inner">
          <span class="text-4xl font-black text-white/20">
            ${String(race.round).padStart(2, "0")}
          </span>

          <div class="text-right">
            <div class="text-[10px] font-bold text-zinc-500 uppercase">
              ${race.date}
            </div>
            ${race.tag ? `
              <div class="text-xs font-black text-red-500 uppercase">
                ${race.tag}
              </div>` : ""}
          </div>
        </div>

        <h3 class="text-xl font-bold uppercase italic-heading">
          ${race.country}
        </h3>
        <p class="text-xs text-zinc-400 mt-1">
          ${race.circuit}
        </p>
      </a>
    `).join("");

    const cards = Array.from(container.querySelectorAll('.card'));
    if (!cards.length) return;

    let active = 0;
    const total = cards.length;

    function updatePositions() {
      cards.forEach((el, i) => {
        el.classList.remove('active', 'near');
        const dist = i - active;
        const abs = Math.abs(dist);

        if (i === active) {
          el.classList.add('active');
        } else if (abs === 1) {
          el.classList.add('near');
        }

        // visual depth and opacity based on distance
        el.style.zIndex = String(60 - abs);
        const opacity = Math.max(0.28, 1 - abs * 0.12);
        el.style.opacity = String(opacity);

        // overlapping translate and scale so cards tuck behind the active
        const overlap = (window.innerWidth < 768) ? 56 : 76;
        const translateX = -dist * overlap;
        const scale = Math.max(0.66, 1 - abs * 0.08);
        el.style.transform = `translateX(${translateX}px) scale(${scale})`;
      });

      // center active card in the scroll viewport
      const activeEl = cards[active];
      if (activeEl && typeof activeEl.scrollIntoView === 'function') {
        activeEl.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }

    // initialize
    updatePositions();

    cards.forEach(card => {
      card.addEventListener('click', (e) => {
        const idx = Number(card.dataset.index);
        if (idx === active) {
          // active card: allow default navigation (follow link)
          return;
        }
        // move clicked card to front instead of navigating
        e.preventDefault();
        active = idx;
        updatePositions();
      });
    });

    // keyboard arrow navigation (no wrapping)
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') {
        if (active < total - 1) {
          active = active + 1;
          updatePositions();
        }
      } else if (e.key === 'ArrowLeft') {
        if (active > 0) {
          active = active - 1;
          updatePositions();
        }
      }
    });

  })
  .catch(err => {
    console.error("Failed to load schedule:", err);
  });

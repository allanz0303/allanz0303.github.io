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

    const mod = (n) => ((n % total) + total) % total;
    const nextIndex = (i) => mod(i + 1);
    const prevIndex = (i) => mod(i - 1);

    function updatePositions() {
      cards.forEach((el, i) => {
        el.classList.remove('active', 'next', 'prev', 'hidden');
        if (i === active) el.classList.add('active');
        else if (i === nextIndex(active)) el.classList.add('next');
        else if (i === prevIndex(active)) el.classList.add('prev');
        else el.classList.add('hidden');
      });
    }

    // initialize
    updatePositions();

    cards.forEach(card => {
      card.addEventListener('click', (e) => {
        const idx = Number(card.dataset.index);
        if (card.classList.contains('active')) {
          // active card: allow navigation
          return; 
        }
        // not active: move clicked card to front instead of navigating
        e.preventDefault();
        active = idx;
        updatePositions();
      });
    });

    // optional: allow keyboard arrow navigation while focused
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') {
        active = nextIndex(active);
        updatePositions();
      } else if (e.key === 'ArrowLeft') {
        active = prevIndex(active);
        updatePositions();
      }
    });

  })
  .catch(err => {
    console.error("Failed to load schedule:", err);
  });

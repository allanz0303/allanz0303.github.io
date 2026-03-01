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

    // determine initial active card from hash (e.g. #schedule?track=monaco)
    // by default auto-select next upcoming race based on today's date
    let active = 0;
    // helper to parse the human-readable date string from JSON into a Date
    const parseRaceDate = (str) => {
      // strip trailing timezone abbreviation (e.g. "AEST")
      let s = str.replace(/\s+[A-Z]{2,4}$/g, '').trim();
      // append year so JS doesn't default to current year if it's different
      s = s + ' 2026';
      return new Date(s);
    };

    try {
      // find upcoming race (first whose date >= now)
      const now = new Date();
      const upcoming = races.findIndex(r => parseRaceDate(r.date) >= now);
      if (upcoming >= 0) active = upcoming;

      const hash = window.location.hash || '';
      if (hash.startsWith('#schedule')) {
        const hp = new URLSearchParams((hash.split('?')[1]) || '');
        const trackSlug = hp.get('track');
        if (trackSlug) {
          const found = races.findIndex(r => r.slug === trackSlug);
          if (found >= 0) active = found;
        }
        // ensure we scroll to schedule section on page load
        setTimeout(() => {
          const el = document.getElementById('schedule');
          if (el) el.scrollIntoView({ behavior: 'auto', block: 'start' });
        }, 20);
      }
    } catch (e) {
      // ignore
    }
    const total = cards.length;

    function updatePositions() {
      cards.forEach((el, i) => {
        el.classList.remove('active', 'near');
        const dist = i - active;
        const abs = Math.abs(dist);

        // mark classes for CSS-driven scale/visuals
        if (i === active) el.classList.add('active');
        else if (abs === 1) el.classList.add('near');
        
        // visual depth and opacity based on distance
        el.style.zIndex = String(60 - abs);
        const opacity = Math.max(0.35, 1 - abs * 0.12);
        el.style.opacity = String(opacity);
      });

      // highlight corresponding dot and date label
      dots.forEach((d, i) => d.classList.toggle('active', i === active));
      if (dateLabels && dateLabels.length) {
        dateLabels.forEach((lbl, i) => lbl.classList.toggle('active', i === active));
      }

      // center active card in the scroll viewport
      const activeEl = cards[active];
      if (activeEl && typeof activeEl.scrollIntoView === 'function') {
        activeEl.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }

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
        moveCarTo(active);
      });
    });

    // build custom track (dots + car handle + date display)
    const trackRoot = document.getElementById('schedule-track');
    trackRoot.innerHTML = '';
    const trackLine = document.createElement('div');
    trackLine.className = 'track-line';
    const dotsWrap = document.createElement('div');
    dotsWrap.className = 'dots';
    const dots = [];
    // also container for an individual date label under each dot
    const datesWrap = document.createElement('div');
    datesWrap.className = 'dates';
    const dateLabels = [];

    // because labels will be absolutely positioned within the dates container,
    // ensure it itself is positioned relative
    datesWrap.style.position = 'relative';

    for (let i = 0; i < total; i++) {
      // dot element
      const d = document.createElement('div');
      d.className = 'dot';
      d.dataset.index = String(i);
      d.addEventListener('click', (ev) => {
        ev.stopPropagation();
        active = i;
        updatePositions();
        moveCarTo(i);
      });
      dotsWrap.appendChild(d);
      dots.push(d);

      // label element (text beneath the bar) - show only month/day, drop time
      const lbl = document.createElement('div');
      lbl.className = 'date-label';
      // take portion before first comma (e.g. "Mar 8")
      lbl.innerText = races[i].date.split(',')[0];
      datesWrap.appendChild(lbl);
      dateLabels.push(lbl);
    }

    const car = document.createElement('div');
    car.className = 'car-handle';
    car.innerText = '🏎';

    trackRoot.appendChild(trackLine);
    trackRoot.appendChild(dotsWrap);
    trackRoot.appendChild(car);
    trackRoot.appendChild(datesWrap);

    // once dots and labels exist we can update visual positions (active classes)
    updatePositions();

    // compute dot center positions for reliable hit-testing
    let dotCenters = [];
    function computeDotCenters() {
      const rootRect = trackRoot.getBoundingClientRect();
      dotCenters = dots.map(d => {
        const r = d.getBoundingClientRect();
        return r.left + r.width / 2;
      });
      // reposition labels precisely beneath each dot
      dotCenters.forEach((center, i) => {
        const lbl = dateLabels[i];
        if (lbl) {
          lbl.style.left = `${center - rootRect.left}px`;
        }
      });
    }

    function moveCarTo(index) {
      const target = dots[index];
      if (!target) return;
      const rootRect = trackRoot.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();
      const left = targetRect.left - rootRect.left + (targetRect.width / 2);
      car.style.left = `${left}px`;

      // visually mark active dot
      dots.forEach((dd, ii) => dd.classList.toggle('active', ii === index));
    }

    // initial measurements (use rAF to wait for layout)
    requestAnimationFrame(() => {
      computeDotCenters();
      moveCarTo(active);
      updatePositions(); // double-check styling after car moves
    });

    // recompute centers on resize / layout changes
    window.addEventListener('resize', () => {
      computeDotCenters();
      moveCarTo(active);
    });

    // drag behaviour for car (attach move/up to window for reliability)
    let dragging = false;
    let activePointerId = null;

    function nearestIndexFromClientX(clientX) {
      if (!dotCenters.length) computeDotCenters();
      let best = 0;
      let bestDist = Infinity;
      for (let i = 0; i < dotCenters.length; i++) {
        const cx = dotCenters[i];
        const dist = Math.abs(cx - clientX);
        if (dist < bestDist) { bestDist = dist; best = i; }
      }
      return best;
    }

    function onPointerMove(e) {
      if (!dragging) return;
      const clientX = e.clientX;
      const idx = nearestIndexFromClientX(clientX);
      if (idx !== active) {
        active = idx;
        updatePositions();
      }
      moveCarTo(active);
    }

    function onPointerUp(e) {
      if (!dragging) return;
      dragging = false;
      activePointerId = null;
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    }

    car.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      dragging = true;
      activePointerId = e.pointerId;
      window.addEventListener('pointermove', onPointerMove);
      window.addEventListener('pointerup', onPointerUp);
    });

    // allow clicking on dotsWrap area to jump
    dotsWrap.addEventListener('click', (e) => {
      const rect = dotsWrap.getBoundingClientRect();
      const idx = nearestIndexFromClientX(e.clientX);
      active = idx;
      updatePositions();
      moveCarTo(active);
    });

    // keyboard arrow navigation (no wrapping)
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') {
        if (active < total - 1) {
          active = active + 1;
          updatePositions();
          moveCarTo(active);
        }
      } else if (e.key === 'ArrowLeft') {
        if (active > 0) {
          active = active - 1;
          updatePositions();
          moveCarTo(active);
        }
      }
    });

  })
  .catch(err => {
    console.error("Failed to load schedule:", err);
  });

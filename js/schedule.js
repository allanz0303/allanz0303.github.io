fetch("data/schedule-2026.json")
  .then(res => res.json())
  .then(races => {
    const container = document.getElementById("schedule-container");

    container.innerHTML = races.map(race => `
      <div class="flex-none w-64 glass-panel p-6 border-t-4
        ${race.highlight ? "border-t-red-600" : "border-t-zinc-800"}
        hover:-translate-y-1 transition-transform">

        <div class="flex justify-between items-start mb-4">
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
      </div>
    `).join("");
  })
  .catch(err => {
    console.error("Failed to load schedule:", err);
  });

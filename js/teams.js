document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("teams-container");
  if (!container) return;

  fetch("data/teams-2026.json")
    .then(res => res.json())
    .then(teams => {
      teams.forEach(team => {
        container.appendChild(createTeamCard(team));
      });
    })
    .catch(err => {
      console.error("Failed to load teams data:", err);
      container.innerHTML =
        `<p class="text-zinc-500 text-sm">Failed to load teams.</p>`;
    });
});

function createTeamCard(team) {
  const card = document.createElement("div");

  card.className = `
    glass-panel
    p-5
    team-border-${team.accent}
    hover:bg-zinc-900
    transition
    cursor-pointer
  `;

  card.innerHTML = `
    ${team.tag ? `
      <div class="text-[10px] font-bold uppercase text-zinc-500 mb-2">
        ${team.tag}
      </div>` : ""}

    <h3 class="text-lg font-black italic-heading mb-4">
      ${team.name}
    </h3>

    <div class="space-y-2 text-sm font-bold">
      ${team.drivers.map(driver => `
        <div class="flex justify-between border-b border-white/5 pb-1">
          <span>${driver.name}</span>
          <span class="text-zinc-500">${driver.number}</span>
        </div>
      `).join("")}
    </div>
  `;

  // 以后直接解锁 team page
  card.addEventListener("click", () => {
    window.location.href = `/pages/team.html?id=${team.id}`;
  });

  return card;
}

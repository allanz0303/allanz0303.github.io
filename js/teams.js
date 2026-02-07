document.addEventListener("DOMContentLoaded", () => {
  const listContainer = document.getElementById("teams-container"); // index.html 用
  const detailContainer = document.getElementById("team-detail");   // teams.html 用

  // 读取 URL 参数 ?id=mclaren
  const params = new URLSearchParams(window.location.search);
  const teamId = params.get("id");

  fetch(getDataPath())
    .then(res => res.json())
    .then(teams => {

      // ===== 车队详情页模式 =====
      if (detailContainer && teamId) {
        const team = teams.find(t => t.id === teamId);
        if (!team) {
          detailContainer.innerHTML =
            `<p class="text-zinc-500 text-sm">Team not found.</p>`;
          return;
        }
        renderTeamDetail(team, detailContainer);
      }

      // ===== 首页列表模式 =====
      if (listContainer) {
        teams.forEach(team => {
          listContainer.appendChild(createTeamCard(team));
        });
      }
    })
    .catch(err => {
      console.error("Failed to load teams data:", err);
      if (listContainer) {
        listContainer.innerHTML =
          `<p class="text-zinc-500 text-sm">Failed to load teams.</p>`;
      }
    });
});

/**
 * 根据当前页面路径，自动决定 JSON 路径
 * index.html -> data/teams-2026.json
 * pages/teams.html -> ../data/teams-2026.json
 */
function getDataPath() {
  return window.location.pathname.includes("/pages/")
    ? "../data/teams-2026.json"
    : "data/teams-2026.json";
}

/* =========================
   首页：车队卡片
========================= */
function createTeamCard(team) {
  const card = document.createElement("div");

  card.className = `
    group
    glass-panel
    p-6
    team-border-${team.accent}
    cursor-pointer
    team-card
    transition-all
    hover:bg-zinc-900
    hover:-translate-y-1
  `;

  card.innerHTML = `
    <div class="flex justify-between items-start mb-2">
      ${team.tag ? `
        <div class="text-[10px] font-bold uppercase text-zinc-500">
          ${team.tag}
        </div>` : `<div></div>`}

      <div class="text-zinc-500 text-xl opacity-0 group-hover:opacity-100 transition-opacity">
        →
      </div>
    </div>

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

  card.addEventListener("click", () => {
    window.location.href = `pages/teams.html?id=${team.id}`;
  });

  return card;
}

/* =========================
   详情页：单个车队
========================= */
function renderTeamDetail(team, container) {
  container.innerHTML = `
    <div class="glass-panel p-8 team-border-${team.accent}">
      <div class="text-[10px] uppercase tracking-widest text-zinc-500 mb-2">
        ${team.tag || "Formula 1 Team"}
      </div>

      <h1 class="text-4xl md:text-5xl font-black italic-heading mb-8">
        ${team.name}
      </h1>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        ${team.drivers.map(driver => `
          <div class="border border-white/10 p-5 hover:bg-white/5 transition">
            <div class="text-lg font-bold">${driver.name}</div>
            <div class="text-zinc-500 text-sm">Car #${driver.number}</div>
          </div>
        `).join("")}
      </div>
    </div>
  `;
}

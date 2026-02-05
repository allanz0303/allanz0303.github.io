// 1. 读取 URL 参数
const params = new URLSearchParams(window.location.search);
const round = params.get("round");

// 2. 加载赛历数据
fetch("../data/schedule-2026.json")
  .then(res => res.json())
  .then(races => {
    const race = races.find(r => String(r.round) === round);

    if (!race) {
      document.getElementById("track-title").innerText = "Race not found";
      return;
    }

    // 3. 填充页面内容
    document.getElementById("track-title").innerText =
      `Round ${race.round} — ${race.country}`;

    document.getElementById("track-circuit").innerText =
      race.circuit;

    document.getElementById("track-meta").innerText =
      `Race Time: ${race.date}`;
  })
  .catch(err => console.error(err));

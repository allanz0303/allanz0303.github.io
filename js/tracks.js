const params = new URLSearchParams(window.location.search);
const slug = params.get("track");

// set back link to return to the schedule section and highlight this track
const backLink = document.getElementById('back-link');
if (backLink && slug) {
  backLink.href = `/#schedule?track=${encodeURIComponent(slug)}`;
}

Promise.all([
  fetch("../data/schedule-2026.json").then(r => r.json()),
  fetch("../data/tracks.json").then(r => r.json())
])
.then(([schedule, tracks]) => {
  const race = schedule.find(r => r.slug === slug);
  const track = tracks.find(t => t.slug === slug);

  if (!race || !track) {
    document.body.innerHTML = `
      <div class="text-center mt-20 text-zinc-500">
        Track data not found
      </div>`;
    return;
  }

  // Header
  document.getElementById("round").innerText =
    `Round ${race.round}`;

  document.getElementById("country").innerText =
    track.country;

  document.getElementById("circuit").innerText =
    track.name;

  document.getElementById("date").innerText =
    race.date;

  document.getElementById("circuit-name").innerText =
    track.name;

  document.getElementById("length").innerText =
  `${track.length_km} km`;

  document.getElementById("laps").innerText =
    track.laps;

  document.getElementById("corners").innerText =
    track.corners;

  document.getElementById("first_gp").innerText =
    track.first_gp;

  // Track Image
  document.getElementById("track-image").src =
    `../assets/img/tracks/${slug}.avif`;

  // （下一步可以继续塞更多字段）
});

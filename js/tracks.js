const params = new URLSearchParams(window.location.search);
const slug = params.get("track");

fetch("../data/schedule-2026.json")
  .then(res => res.json())
  .then(races => {
    const race = races.find(r => r.slug === slug);

    if (!race) {
      document.body.innerHTML = `
        <div class="text-center mt-20 text-zinc-500">
          Track not found
        </div>`;
      return;
    }

    document.getElementById("round").innerText =
      `Round ${race.round}`;

    document.getElementById("country").innerText =
      race.country;

    document.getElementById("circuit").innerText =
      race.circuit;

    document.getElementById("date").innerText =
      race.date;

    document.getElementById("circuit-name").innerText =
      race.circuit;
  });

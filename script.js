async function loadSites() {
  const track = document.getElementById("orbitTrack");

  const response = await fetch("data/sites.json");
  const sites = await response.json();

  // Single source of truth for the shared geometry: read straight from
  // the CSS custom properties instead of duplicating the numbers here.
  const rootStyles = getComputedStyle(document.documentElement);
  const periodSeconds = parseFloat(rootStyles.getPropertyValue("--period"));
  const orbitRxVmin = parseFloat(rootStyles.getPropertyValue("--orbit-rx"));
  const orbitRyVmin = parseFloat(rootStyles.getPropertyValue("--orbit-ry"));

  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  const electrons = sites.map((site, index) => {
    // An ellipse tilted by 180° traces the very same curve, so distinct
    // tilts only need to span half a turn for every orbit to look unique.
    const tiltDeg = (180 / sites.length) * index;

    const path = document.createElement("div");
    path.className = "orbit-path";
    path.style.setProperty("--tilt", `${tiltDeg}deg`);

    const slot = document.createElement("div");
    slot.className = "orbit-slot";

    const btn = document.createElement("a");
    btn.className = "orbit-btn";
    btn.href = site.url;
    btn.target = "_blank";
    btn.rel = "noopener noreferrer";
    btn.setAttribute("aria-label", `${site.name} — ${site.description}`);

    const img = document.createElement("img");
    img.src = site.image;
    img.alt = "";
    img.loading = "lazy";

    const tooltip = document.createElement("span");
    tooltip.className = "orbit-tooltip";
    const tooltipName = document.createElement("strong");
    tooltipName.textContent = site.name;
    const tooltipDesc = document.createElement("span");
    tooltipDesc.textContent = site.description;
    tooltip.append(tooltipName, tooltipDesc);

    btn.append(img, tooltip);

    slot.appendChild(btn);
    track.append(path, slot);

    return {
      slot,
      tilt: (tiltDeg * Math.PI) / 180,
      // Random starting point on the ellipse, to break the symmetry.
      phase: Math.random() * Math.PI * 2,
    };
  });

  function positionElectrons(nowMs) {
    const vmin = Math.min(window.innerWidth, window.innerHeight) / 100;
    const rx = orbitRxVmin * vmin;
    const ry = orbitRyVmin * vmin;
    const angularSpeed = (2 * Math.PI) / periodSeconds;
    const t = nowMs / 1000;

    for (const electron of electrons) {
      const theta = electron.phase + t * angularSpeed;
      const x0 = rx * Math.cos(theta);
      const y0 = ry * Math.sin(theta);
      const cosT = Math.cos(electron.tilt);
      const sinT = Math.sin(electron.tilt);
      const x = x0 * cosT - y0 * sinT;
      const y = x0 * sinT + y0 * cosT;
      electron.slot.style.transform = `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px)`;
    }
  }

  if (reduceMotion) {
    positionElectrons(0);
  } else {
    requestAnimationFrame(function frame(nowMs) {
      positionElectrons(nowMs);
      requestAnimationFrame(frame);
    });
  }
}

loadSites();

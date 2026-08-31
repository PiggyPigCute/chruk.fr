async function loadSites() {
  const track = document.getElementById("orbitTrack");
  const modal = document.getElementById("siteModal");
  const modalImage = document.getElementById("modalImage");
  const modalTitle = document.getElementById("modalTitle");
  const modalDesc = document.getElementById("modalDesc");
  const modalLink = document.getElementById("modalLink");
  const modalClose = document.getElementById("modalClose");

  const response = await fetch("data/sites.json");
  const sites = await response.json();

  sites.forEach((site, index) => {
    // An ellipse tilted by 180° traces the very same curve, so distinct
    // tilts only need to span half a turn for every orbit to look unique.
    const tilt = (180 / sites.length) * index;

    const item = document.createElement("div");
    item.className = "orbit-item";
    item.style.setProperty("--tilt", `${tilt}deg`);

    const path = document.createElement("div");
    path.className = "orbit-path";

    const btn = document.createElement("button");
    btn.className = "orbit-btn";
    btn.type = "button";
    btn.setAttribute("aria-label", site.name);

    const img = document.createElement("img");
    img.src = site.image;
    img.alt = "";
    img.loading = "lazy";

    btn.appendChild(img);
    btn.addEventListener("click", () => openModal(site));

    item.append(path, btn);
    track.appendChild(item);
  });

  function openModal(site) {
    modalImage.src = site.image;
    modalImage.alt = site.name;
    modalTitle.textContent = site.name;
    modalDesc.textContent = site.description;
    modalLink.href = site.url;
    modal.showModal();
  }

  modalClose.addEventListener("click", () => modal.close());
  modal.addEventListener("click", (event) => {
    if (event.target === modal) modal.close();
  });
}

loadSites();

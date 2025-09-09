const membersPaths = [
  "shikhar_singh.json",
  "chinmoy_senapoti.json",
  "pranav_rastogi.json",
  "shreeyansh_singh.json",
  "anjali_agarwal.json",
  "nilenjay_singh_sengar.json",
  "krishna_tiwari.json",
  "saurabh_kumar.json",
  "amresh_chaurasiya.json",
  "somil_jain.json",
  "aditya_gupta.json",
  "vijay_dhingra.json",
  "pushkar_singhal.json",
  "surbhi_dharvan.json",
  "monu_chaudhary.json",
  "kartikey_mishra.json",
  "naman_srivastava.json",
  "sanjeev_yadav.json",
  "nikhil_parasar.json",
  "vikas_gupta.json",
  "rudresh_srivastava.json",
  "aditya_gaur.json",
  "raj_chaudhary.json",
  "rajat_tiwari.json",
  "anirudh_agarwal.json",
  "anurag_mishra.json",
  "janhavi_gupta.json",
  "utkarsh_singh.json",
  "vinay_papnoi.json",
  "happy.json",
  "vaibhav_kumar_shukla.json",
  "shivansh_kumar.json",
  "shashwat_ranjan.json",
  "pranjal_tiwari.json",
  "priyanshu_uttam.json",
  "palakdeep_kaur.json",
  "aryan_juyal.json",
  "dhruv_raj_singh.json",
  "abhinav_rai.json",
  "rachit_mishra.json",
  "anurag_gupta.json",
  "kanishka_jain.json"
];


const VALIDATION_MODE = "strict";

async function fetchJSON(path) {
  try {
    const url = new URL(`members/${path}`, document.baseURI).toString();
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText} @ ${url}`);
    return await res.json();
  } catch (e) {
    console.warn("Fetch failed for", path, e.message);
    return null;
  }
}


function ghAvatar(handle) {
  return `https://github.com/${handle}.png`;
}

function chip(text) {
  return `<span class="chip">${text}</span>`;
}

function validateMember(m) {
  if (!m) return false;
  if (VALIDATION_MODE === "strict") {
    return m.name && m.branch && m.githubID && m.url;
  }
  if (VALIDATION_MODE === "name+github") {
    return m.name && m.githubID;
  }
  return !!m.name;
}

const drawer = document.getElementById("drawer");
const overlay = document.getElementById("overlay");
const drawerTitle = document.getElementById("drawerTitle");
const drawerContent = document.getElementById("drawerContent");
const closeDrawerBtn = document.getElementById("closeDrawer");

function openDrawer(title, html) {
  drawerTitle.textContent = title;
  drawerContent.innerHTML = html;
  drawer.classList.remove("hidden");
  overlay.classList.remove("hidden");
  requestAnimationFrame(() => {
    drawer.classList.add("open");
    overlay.classList.add("open");
  });
}

function closeDrawer() {
  drawer.classList.remove("open");
  overlay.classList.remove("open");
  setTimeout(() => {
    drawer.classList.add("hidden");
    overlay.classList.add("hidden");
  }, 180);
}

overlay.addEventListener("click", closeDrawer);
closeDrawerBtn.addEventListener("click", closeDrawer);
document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeDrawer(); });

const listEl = document.getElementById("list");

function renderRow(m) {
  const li = document.createElement("li");
  li.className = "list-item";
  li.tabIndex = 0;

  const name   = m.name || "Unnamed";
  const branch = m.branch || "";
  const github = m.githubID 
  ? `<a href="https://github.com/${m.githubID}" target="_blank" class="github-link">@${m.githubID} </a>` 
  : "";

  li.innerHTML = `
    <div class="row">
      <div class="member">
        <img class="avatar" src="${m.avatar || ghAvatar(m.githubID || "github")}" alt="${name}" />
        <div>
          <div class="name">${name}</div>
        </div>
      </div>
      <div>${branch}</div>
      <div>${github}</div>
    </div>
  `;

  li.addEventListener("click", () => openDetail(m, name, branch));
  li.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") { 
      e.preventDefault(); 
      openDetail(m, name, branch); 
    }
  });

  return li;
}
function openDetail(m, name, branch) {
  const links = m.links || {};
  const html = `
    <div class="detail-top">
      <img class="detail-avatar" src="${m.avatar || ghAvatar(m.githubID || "github")}" alt="${name}" />
      <div>
        <h3 class="detail-title">${name}</h3>
        ${branch ? `<div class="detail-meta">${branch}</div>` : ""}
        ${m.githubID ? `<div class="detail-meta">@${m.githubID}</div>` : ""}
      </div>
    </div>
    ${m.about ? `<p>${m.about}</p>` : ""}
    <div id="funfact" class="subline">
      Preparing a courteous quip…
    </div>
    <div class="actions">
      ${m.githubID ? `<a class="link-btn primary" href="https://github.com/${m.githubID}" target="_blank">GitHub ↗</a>` : ""}
      ${links.linkedin ? `<a class="link-btn blue" href="${links.linkedin}" target="_blank">LinkedIn</a>` : ""}
      ${links.site ? `<a class="link-btn" href="${links.site}" target="_blank">Website</a>` : ""}
    </div>
  `;
  openDrawer(name, html);

  scheduleFunFact({ about: m.about || "", name });
}
let funFactTimer = null;

async function fetchFunFact({ about, name, endpoint = "/api/funfact", stylePrompt = "" }) { 
  const el = document.getElementById("funfact");
  if (!el) return;
  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ about, name, stylePrompt })
    });
    const data = await res.json();
    el.textContent = data.funFact || "The universe refused to jest at this moment.";
  } catch {
    el.textContent = "Could not assemble a polite punchline.";
  }
}

function scheduleFunFact({ about, name, endpoint, stylePrompt }) {
  if (funFactTimer) clearTimeout(funFactTimer);
  funFactTimer = setTimeout(() => {
    fetchFunFact({ about, name, endpoint, stylePrompt });
  }, 2000);
}

function renderList(members) {
  listEl.innerHTML = "";
  if (!members.length) {
    listEl.innerHTML = `<li class="list-item" style="text-align:center;">No valid member profiles found</li>`;
    return;
  }
  members.forEach(m => listEl.appendChild(renderRow(m)));
}

async function loadMembersProgressively() {
  const loaded = [];
  listEl.innerHTML = "";
  for (const path of membersPaths) {
    const m = await fetchJSON(path);
    if (validateMember(m)) {
      loaded.push(m);
      listEl.appendChild(renderRow(m));
      await new Promise(r => setTimeout(r, 60));
    }
  }
  if (!loaded.length) {
    listEl.innerHTML = `<li class="list-item" style="text-align:center;">No valid member profiles found</li>`;
  }
  return loaded;
}

window.addEventListener("DOMContentLoaded", async () => {
  listEl.innerHTML = `<li class="list-item" style="text-align:center;">Loading…</li>`;
  const members = await loadMembersProgressively();
  document.getElementById("randomBtn")?.addEventListener("click", () => {
    if (!members.length) return;
    const m = members[Math.floor(Math.random() * members.length)];
    const idx = members.indexOf(m);
    document.querySelectorAll("#list li")[idx]?.click();
  });
});

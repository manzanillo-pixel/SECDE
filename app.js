const app = document.getElementById("app");

let festivos = [];
let promesas = [];
let pensamientos = [];
let imagenesHome = [];
let intervalo;
let festivoActual = null;
let currentTab = "estudios";

// Detectar si estamos en GitHub Pages o desarrollo local
const isGitHubPages = window.location.hostname.includes("github.io");
const GITHUB_RAW_URL = "https://raw.githubusercontent.com/manzanillo-pixel/SECDE/main";
const LOCAL_DATA_URL = "./data";

/* ================= CARGA DE DATOS ================= */
async function cargarFestivos() {
  try {
    const url = isGitHubPages ? `${GITHUB_RAW_URL}/data/festivos.json` : `${LOCAL_DATA_URL}/festivos.json`;
    
    const res = await fetch(url);

    if (!res.ok) throw new Error(`Error cargando JSON desde ${url}`);

    const data = await res.json();

    festivos = data.festivos || [];

    console.log("✅ Festivos cargados desde", isGitHubPages ? "GitHub" : "local:", festivos);

  } catch (error) {
    console.error("❌ ERROR:", error);

    festivos = []; // evita que rompa la app
  }
}

/* ================= NAV ================= */
function navigate(view, id = null) {
  if (intervalo) {
    clearInterval(intervalo);
    intervalo = null;
  }

  app.innerHTML = "";

  switch (view) {
    case "home": renderHome(); break;
    case "festivos": renderFestivos(); break;
    case "detalle": renderDetalle(id); break;
    case "promesas": renderPromesas(); break;
    case "pensamientos": renderPensamientos(); break;
    case "about": renderAbout(); break;
  }
}

/* ================= HOME ================= */
function renderHome() {
  app.innerHTML = `
    <div class="secde">
      <h1>SECDE</h1>
      <p>Software Educativo Cristiano para Dias Especiales</p>
    </div>
    <div class="carousel">
      <img id="slide">
    </div>
    ${renderNav("home")}
  `;

  const slide = document.getElementById("slide");

  if (!imagenesHome || imagenesHome.length === 0) return;

  let index = 0;

  function cambiarImagen() {
    slide.src = imagenesHome[index];
    index = (index + 1) % imagenesHome.length;
  }

  cambiarImagen();
  intervalo = setInterval(cambiarImagen, 4000);
}

/* ================= FESTIVOS ================= */
function renderFestivos() {
  app.innerHTML = `
    <header class="header-flotante">
      <div class="search-wrapper">
        <input type="text" id="search" placeholder="Buscar festivo...">
        <span class="search-icon">🔍</span>
      </div>
    </header>

    <div class="page">
      <div id="festivos" class="grid"></div>
    </div>

    ${renderNav("festivos")}
  `;

  if (!festivos || festivos.length === 0) {
    document.getElementById("festivos").innerHTML = "<p>No hay datos</p>";
    return;
  }

  renderCards(festivos);

  const search = document.getElementById("search");

  search.addEventListener("input", e => {
    const texto = e.target.value.toLowerCase();

    const filtrados = festivos.filter(f =>
      f.nombre.toLowerCase().includes(texto)
    );

    renderCards(filtrados);
  });
}
function renderCards(lista) {
  const cont = document.getElementById("festivos");
  if (!cont) return;

  if (!lista || lista.length === 0) {
    cont.innerHTML = "<p style='text-align:center'>No hay festivos disponibles</p>";
    return;
  }

  cont.innerHTML = lista.map(f => `
    <div class="card" onclick="navigate('detalle','${f.id}')">
      <img src="${f.imagen || 'img/default.jpg'}">
      <div class="card-content">
        <h3>${f.nombre}</h3>
        <p>${f.descripcion || ""}</p>
      </div>
    </div>
  `).join("");
}

/* ================= DETALLE ================= */
function renderDetalle(id) {
  festivoActual = id;

  const f = festivos.find(x => x.id === id);

  if (!f) {
    app.innerHTML = "<p style='text-align:center'>Error: festivo no encontrado</p>";
    return;
  }

  app.innerHTML = `
    <header class="header-flotante">
      <div class="search-wrapper">
        <input type="text" id="search" placeholder="Buscar en ${f.nombre}...">
        <span class="search-icon">🔍</span>
      </div>
    </header>

    <div class="page">
      <div class="tabs">
        ${crearTab("estudios","📖 Estudios")}
        ${crearTab("predicacion","🎤 Predicación")}
        ${crearTab("canciones","🎵 Canciones")}
        ${crearTab("cantos","🙏 Cánticos")}
        ${crearTab("dramas","🎭 Dramas")}
        ${crearTab("himnos","🎶 Himnos")}
        ${crearTab("lecturas","📜 Lecturas")}
        ${crearTab("poesias","✍️ Poesías")}
        ${crearTab("programas","📋 Programas")}
      </div>

      <div id="contenido"></div>
      <br>
      <button class="tab" onclick="navigate('festivos')">⬅ Volver</button>
    </div>

    ${renderNav("festivos")}
  `;

  renderContenido();
}

/* ================= TABS ================= */
function crearTab(id, texto) {
  return `
    <div class="tab ${currentTab === id ? "active" : ""}" 
      onclick="cambiarTab('${id}')">
      ${texto}
    </div>
  `;
}

function cambiarTab(tab) {
  currentTab = tab;
  renderDetalle(festivoActual);
}

/* ================= CONTENIDO ================= */
function renderContenido() {
  const cont = document.getElementById("contenido");

  const festivo = festivos.find(f => f.id === festivoActual);

  if (!festivo || !festivo.contenido || !festivo.contenido[currentTab]) {
    cont.innerHTML = "<p>No hay contenido disponible.</p>";
    return;
  }

  const data = festivo.contenido[currentTab];

  if (!data || data.length === 0) {
    cont.innerHTML = "<p>No hay contenido en esta sección.</p>";
    return;
  }

  cont.innerHTML = data.map((item, index) => `
    <div class="accordion-item">

      <div class="accordion-header" onclick="toggleItem(${index})">
        <span>${item.titulo}</span>
        <span class="icon">+</span>
      </div>

      <div class="accordion-body" id="item-${index}">
        <p>${item.texto || "Contenido disponible."}</p>
      </div>

    </div>
  `).join("");
}

/* ================= ACORDEON ================= */
function toggleItem(index) {
  const el = document.getElementById(`item-${index}`);
  if (!el) return;

  const icon = el.previousElementSibling.querySelector(".icon");
  const isOpen = el.classList.contains("open");

  document.querySelectorAll(".accordion-body").forEach(e => {
    e.classList.remove("open");
    e.style.maxHeight = null;
  });

  document.querySelectorAll(".icon").forEach(i => i.textContent = "+");

  if (!isOpen) {
    el.classList.add("open");
    el.style.maxHeight = el.scrollHeight + "px";
    icon.textContent = "-";
  }
}

/* ================= NAV ================= */
function renderNav(active = "") {
  return `
    <div class="bottom-nav">
      <i class="bi bi-house ${active === 'home' ? 'active' : ''}" onclick="navigate('home')"></i>
      <i class="bi bi-calendar-event ${active === 'festivos' ? 'active' : ''}" onclick="navigate('festivos')"></i>
      <i class="bi bi-book ${active === 'promesas' ? 'active' : ''}" onclick="navigate('promesas')"></i>
      <i class="bi bi-chat-quote ${active === 'pensamientos' ? 'active' : ''}" onclick="navigate('pensamientos')"></i>
      <i class="bi bi-info-circle ${active === 'about' ? 'active' : ''}" onclick="navigate('about')"></i>
    </div>
  `;
}

/* ================= OTRAS SECCIONES ================= */
async function renderAbout() {
  app.innerHTML = `<div class="page"><p>Cargando...</p></div>`;
  try {
    const url = isGitHubPages ? `${GITHUB_RAW_URL}/data/about.json` : `${LOCAL_DATA_URL}/about.json`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("No se pudo cargar el contenido About");
    const data = await res.json();
    app.innerHTML = `
      <section class="about-section">
        <h2>${data.title || "Sobre SECDE"}</h2>
        <div class="about-content">
          <p>${data.description || ""}</p>
          <div class="about-images">
            ${(data.images || []).map(img => `<img src="${img}" alt="about" class="about-img">`).join("")}
          </div>
        </div>
      </section>
      ${renderNav("about")}
    `;
  } catch (e) {
    app.innerHTML = `<div class="page"><h2>Sobre SECDE</h2><p>No se pudo cargar la información.</p>${renderNav("about")}</div>`;
  }
}

function renderPromesas() {
  app.innerHTML = `
  <header class="header-flotante">
      <div class="search-wrapper">
        <input type="text" id="search" placeholder="Buscar promesas...">
        <span class="search-icon">🔍</span>
      </div>
    </header>

    <div class="page">
      <div class="grid" id="promesas"></div>
    </div>

    ${renderNav("promesas")}
  `;

  const cont = document.getElementById("promesas");
  const search = document.getElementById("search");

  function renderPromesasList(filtradas = promesas) {
    if (typeof filtradas !== "undefined" && filtradas.length > 0) {
      cont.innerHTML = filtradas.map((p, i) => `
        <div class="card">
          <div class="card-content">
            <div style="color: #667eea; font-weight: bold; margin-bottom: 8px; font-size: 12px;">
              ${p.categoria || "Promesa"}
            </div>
            <p style="margin: 10px 0; line-height: 1.6; font-style: italic;">"${p.texto}"</p>
            <div style="color: #999; font-size: 12px; margin-top: 10px; font-weight: bold;">
              ${p.referencia || "Biblia"}
            </div>
          </div>
        </div>
      `).join("");
    } else {
      cont.innerHTML = "<p style='text-align:center'>No hay promesas cargadas aún.</p>";
    }
  }

  renderPromesasList();

  search.addEventListener("input", e => {
    const texto = e.target.value.toLowerCase();
    const filtradas = promesas.filter(p =>
      (p.texto && p.texto.toLowerCase().includes(texto)) ||
      (p.referencia && p.referencia.toLowerCase().includes(texto)) ||
      (p.categoria && p.categoria.toLowerCase().includes(texto))
    );
    renderPromesasList(filtradas);
  });
}

function renderPensamientos() {
  app.innerHTML = `
  <header class="header-flotante">
      <div class="search-wrapper">
        <input type="text" id="search" placeholder="Buscar pensamientos...">
        <span class="search-icon">🔍</span>
      </div>
    </header>

    <div class="page">
      <div class="grid" id="pensamientos"></div>
    </div>
    ${renderNav("pensamientos")}
  `;

  const cont = document.getElementById("pensamientos");
  const search = document.getElementById("search");

  function renderPensamientosList(filtrados = pensamientos) {
    if (typeof filtrados !== "undefined" && filtrados.length > 0) {
      cont.innerHTML = filtrados.map(p => `
        <div class="card">
          ${p.imagen ? `<img src="${p.imagen}" style="width: 100%; height: 180px; object-fit: cover;">` : ""}
          <div class="card-content">
            <p style="margin: 10px 0; line-height: 1.6; font-style: italic; font-size: 14px;">"${p.texto}"</p>
            ${p.autor ? `<div style="color: #667eea; font-weight: bold; margin-top: 10px; font-size: 12px; text-align: right;">— ${p.autor}</div>` : ""}
          </div>
        </div>
      `).join("");
    } else {
      cont.innerHTML = "<p style='text-align:center'>No hay pensamientos cargados aún.</p>";
    }
  }

  renderPensamientosList();

  search.addEventListener("input", e => {
    const texto = e.target.value.toLowerCase();
    const filtrados = pensamientos.filter(p =>
      (p.texto && p.texto.toLowerCase().includes(texto)) ||
      (p.autor && p.autor.toLowerCase().includes(texto))
    );
    renderPensamientosList(filtrados);
  });
}
async function guardar() {
  const nuevo = document.getElementById("editor").value;

  try {
    const res = await fetch("https://api.github.com/repos/manzanillo-pixel/SECDE/contents/data/festivos.json", {
      method: "PUT",
      headers: {
        "Authorization": "Bearer TU_GITHUB_TOKEN",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: "update festivos",
        content: btoa(unescape(encodeURIComponent(nuevo))),
        sha: await obtenerSHA()
      })
    });

    alert("Guardado con éxito");
  } catch (e) {
    console.error(e);
    alert("Error al guardar");
  }
}

async function obtenerSHA() {
  const res = await fetch("../data/festivos.json");
  const data = await res.json();
  return data.sha || "";
}

/* ================= INIT ================= */
async function init() {
  await cargarFestivos();

  // Cargar promesas
  try {
    const url = isGitHubPages ? `${GITHUB_RAW_URL}/data/promesas.json` : `${LOCAL_DATA_URL}/promesas.json`;
    const promRes = await fetch(url);
    if (promRes.ok) {
      const promData = await promRes.json();
      promesas = promData.promesas || [];
      console.log("✅ Promesas cargadas:", promesas);
    }
  } catch (error) {
    console.error("No se pudo cargar promesas.json:", error);
    promesas = [];
  }

  // Cargar pensamientos
  try {
    const url = isGitHubPages ? `${GITHUB_RAW_URL}/data/pensamientos.json` : `${LOCAL_DATA_URL}/pensamientos.json`;
    const pensRes = await fetch(url);
    if (pensRes.ok) {
      const pensData = await pensRes.json();
      pensamientos = pensData.pensamientos || [];
      console.log("✅ Pensamientos cargados:", pensamientos);
    }
  } catch (error) {
    console.error("No se pudo cargar pensamientos.json:", error);
    pensamientos = [];
  }

  // 🔥 CARGA DEL CARRUSEL
  try {
    const url = isGitHubPages ? `${GITHUB_RAW_URL}/data/home.json` : `${LOCAL_DATA_URL}/home.json`;
    const homeRes = await fetch(url);
    if (homeRes.ok) {
      const homeData = await homeRes.json();
      imagenesHome = homeData.imagenes || [];
      console.log("✅ Imágenes home cargadas:", imagenesHome);
    }
  } catch (error) {
    console.error("No se pudo cargar home.json:", error);
    imagenesHome = [];
  }

  navigate("home");
}

init();
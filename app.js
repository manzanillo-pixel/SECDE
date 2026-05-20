const app = document.getElementById("app");

let festivos = [];
let promesas = [];
let pensamientos = [];
let imagenesHome = [];
let intervalo;
let festivoActual = null;
let currentTab = "estudios";
let currentSearch = "";

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
      <img id="slide" crossorigin="anonymous">
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
      <img src="${f.imagen || 'img/default.jpg'}" crossorigin="anonymous">
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

    const searchInput = document.getElementById("search");
    if (searchInput) {
      searchInput.value = currentSearch;
      searchInput.addEventListener("input", e => {
        currentSearch = e.target.value.toLowerCase();
        renderContenido();
      });
    }

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
      <i class="bi bi-house ${active === 'home' ? 'active' : ''}" 
         onclick="navigate('home')" data-tooltip="Inicio"></i>
      <i class="bi bi-calendar-event ${active === 'festivos' ? 'active' : ''}" 
         onclick="navigate('festivos')" data-tooltip="Festivos"></i>
      <i class="bi bi-book ${active === 'promesas' ? 'active' : ''}" 
         onclick="navigate('promesas')" data-tooltip="Promesas"></i>
      <i class="bi bi-chat-quote ${active === 'pensamientos' ? 'active' : ''}" 
         onclick="navigate('pensamientos')" data-tooltip="Pensamientos"></i>
      <i class="bi bi-info-circle ${active === 'about' ? 'active' : ''}" 
         onclick="navigate('about')" data-tooltip="Sobre SECDE"></i>
    </div>
  `;
}

/*function renderNav(active = "") {
  return `
    <div class="bottom-nav">
      <i class="bi bi-house ${active === 'home' ? 'active' : ''}" onclick="navigate('home')"data-tooltip="Inicio"></i>
      <i class="bi bi-calendar-event ${active === 'festivos' ? 'active' : ''}" onclick="navigate('festivos')"></i>
      <i class="bi bi-book ${active === 'promesas' ? 'active' : ''}" onclick="navigate('promesas')"></i>
      <i class="bi bi-chat-quote ${active === 'pensamientos' ? 'active' : ''}" onclick="navigate('pensamientos')"></i>
      <i class="bi bi-info-circle ${active === 'about' ? 'active' : ''}" onclick="navigate('about')"></i>
    </div>
  `;
}*/

/* ================= OTRAS SECCIONES ================= */
async function renderAbout() {
  app.innerHTML = `<div class="page"><p>Cargando...</p></div>`;
  try {
    const url = isGitHubPages ? `${GITHUB_RAW_URL}/data/about.json` : `${LOCAL_DATA_URL}/about.json`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("No se pudo cargar el contenido About");
    const data = await res.json();
    // Dentro de tu renderAbout()
app.innerHTML = `
  <section class="about-section">
    ${data.images && data.images.length > 0 
      ? `<img src="${data.images[0]}" alt="header" class="about-header-img" crossorigin="anonymous">` 
      : ''}
    <div class="about-container">
      <h2>${data.title || "Sobre SECDE"}</h2>
      <div class="about-content">
        <p>${data.description || ""}</p>
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

  // Obtener categorías únicas
  const categorias = [...new Set(
    promesas
      .map(p => p.categoria)
      .filter(c => c && c.trim() !== "")
  )];

  app.innerHTML = `
    
    <header class="header-flotante">

      <div class="search-wrapper">
        <input type="text" id="search" placeholder="Buscar promesas...">
        <span class="search-icon">🔍</span>
      </div>

      <div class="category-menu">

        <button id="categoryBtn" class="category-btn">
  ☰
</button>

        <div id="categoryDropdown" class="category-dropdown">

          <div class="category-item" data-cat="">
            Todas las categorías
          </div>

          ${categorias.map(cat => `
            <div class="category-item" data-cat="${cat}">
              ${cat}
            </div>
          `).join("")}

        </div>

      </div>

    </header>

    <div class="page">
      <div class="grid" id="promesas"></div>
    </div>

    ${renderNav("promesas")}
  `;

  // ===== CSS dinámico =====
  const style = document.createElement("style");

  style.innerHTML = `

    .category-menu{
      position:relative;
      margin-top:24px;
      display:flex;
      justify-content:center;
    }

    .category-btn{
     position:absolute;
  top:10px;
  right:1px;
  transform:translateY(-50%);
  margin-top:50%; 
  z-index:10;
      width:50px;
      height:50px;
      border:1px solid #c7c5c5;
      border-radius:50%;
      background:black;
      color:white;
      font-size:24px;
      cursor:pointer;
      box-shadow:0 4px 12px rgba(0,0,0,.2);
      transition:.2s;
    }

    .category-btn:hover{
      transform:scale(1.05);
    }

    .category-dropdown{
      position:absolute;
      top:65px;
      background:#fff;
      border-radius:16px;
      min-width:240px;
      box-shadow:0 10px 30px rgba(0,0,0,.15);
      overflow:hidden;
      display:none;
      z-index:1000;
    }

    .category-dropdown.show{
      display:block;
      animation:fadeIn .2s ease;
    }

    .category-item{
      padding:7px 9px;
      cursor:pointer;
      transition:.2s;
      font-size:14px;
      color:#222;
    }

    .category-item:hover{
      background:#f1f4ff;
    }

    @keyframes fadeIn{
      from{
        opacity:0;
        transform:translateY(-10px);
      }
      to{
        opacity:1;
        transform:translateY(0);
      }
    }

  `;

  document.head.appendChild(style);

  const cont = document.getElementById("promesas");
  const search = document.getElementById("search");

  const categoryBtn = document.getElementById("categoryBtn");
  const categoryDropdown = document.getElementById("categoryDropdown");

  let categoriaSeleccionada = "";

  // ===== Abrir/Cerrar categorías =====
  categoryBtn.addEventListener("click", () => {
    categoryDropdown.classList.toggle("show");
  });

  // ===== Seleccionar categoría =====
  document.querySelectorAll(".category-item").forEach(item => {

    item.addEventListener("click", () => {

      categoriaSeleccionada = item.dataset.cat;

      categoryDropdown.classList.remove("show");

      filterPromesas();
    });

  });

  // ===== Render cards =====
  function renderPromesasList(lista = promesas) {

    if (lista.length > 0) {

      cont.innerHTML = lista.map((p) => `

        <div class="card">

          ${p.imagen ? `
            <img src="${p.imagen}" alt="Promesa" crossorigin="anonymous">
          ` : ""}

          <div class="card-content">

            <div style="
              color:#fbfbfc;
              text-decoration:underline;
              font-size:12px;
              margin-rigth:75%;
              margin-top:10px;
              font-weight:bold;
            ">
              ${p.categoria || "Promesa"}
            </div>

            <p style="
              margin-left:0;
              line-height:1.5;
              font-style:italic;
            ">
              "${p.texto}"
            </p>

            <div style="
              color:#fbfbfc;
              font-size:12px;
              margin-left:75%;
              margin-top:10px;
              font-weight:bold;
            ">
              ${p.referencia || "Biblia"}
            </div>

          </div>

        </div>

      `).join("");

    } else {

      cont.innerHTML = `
        <p style="text-align:center">
          No se encontraron promesas.
        </p>
      `;
    }
  }

  // ===== Filtros =====
  function filterPromesas() {

    const texto = search.value.toLowerCase();

    const filtradas = promesas.filter(p => {

      const coincideTexto =

        (p.texto &&
          p.texto.toLowerCase().includes(texto)) ||

        (p.referencia &&
          p.referencia.toLowerCase().includes(texto)) ||

        (p.categoria &&
          p.categoria.toLowerCase().includes(texto));

      const coincideCategoria =

        categoriaSeleccionada === "" ||
        p.categoria === categoriaSeleccionada;

      return coincideTexto && coincideCategoria;
    });

    renderPromesasList(filtradas);
  }

  // ===== Buscar =====
  search.addEventListener("input", filterPromesas);

  // ===== Cerrar dropdown al tocar fuera =====
  document.addEventListener("click", (e) => {

    if (
      !categoryBtn.contains(e.target) &&
      !categoryDropdown.contains(e.target)
    ) {
      categoryDropdown.classList.remove("show");
    }

  });

  // ===== Render inicial =====
  renderPromesasList();
}
function renderPensamientos() {

  // ===== AUTORES ÚNICOS =====
  const categorias = [...new Set(
    pensamientos
      .map(p => p.autor)
      .filter(a => a && a.trim() !== "")
  )];

  app.innerHTML = `

    <header class="header-flotante">

      <div class="search-wrapper">
        <input type="text" id="search" placeholder="Buscar pensamientos...">
        <span class="search-icon">🔍</span>
      </div>

      <div class="category-menu">

        <button id="categoryBtn" class="category-btn">
          ☰
        </button>

        <div id="categoryDropdown" class="category-dropdown">

          <div class="category-item" data-cat="">
            Todos los autores
          </div>

          ${categorias.map(cat => `
            <div class="category-item" data-cat="${cat}">
              ${cat}
            </div>
          `).join("")}

        </div>

      </div>

    </header>

    <div class="page">
      <div class="grid" id="pensamientos"></div>
    </div>

    ${renderNav("pensamientos")}
  `;

  // ===== CSS =====
  const style = document.createElement("style");

  style.innerHTML = `

    .category-menu{
      position:absolute;
      top:50%;
      right:16px;
      transform:translateY(-50%);
      z-index:100;
    }

    .category-btn{
     position:absolute;
  top:10px;
  right:1px;
  transform:translateY(-50%);
  margin-top:50%; 
  z-index:10;
      width:50px;
      height:50px;
      border:1px solid #c7c5c5;
      border-radius:50%;
      background:black;
      color:white;
      font-size:24px;
      cursor:pointer;
      box-shadow:0 4px 12px rgba(0,0,0,.2);
      transition:.2s;
    }
    .category-dropdown{
      position:absolute;
      top:55px;
      right:0;
      background:#fff;
      border-radius:14px;
      min-width:220px;
      overflow:hidden;
      box-shadow:0 10px 30px rgba(0,0,0,.15);
      display:none;
    }

    .category-dropdown.show{
      display:block;
    }

    .category-item{
      padding:14px 18px;
      cursor:pointer;
      transition:.2s;
      color:#222;
      font-size:14px;
    }

    .category-item:hover{
      background:#f1f4ff;
    }

  `;

  document.head.appendChild(style);

  const cont = document.getElementById("pensamientos");
  const search = document.getElementById("search");

  const categoryBtn = document.getElementById("categoryBtn");
  const categoryDropdown = document.getElementById("categoryDropdown");

  let categoriaSeleccionada = "";

  // ===== ABRIR/CERRAR MENÚ =====
  categoryBtn.addEventListener("click", () => {
    categoryDropdown.classList.toggle("show");
  });

  // ===== SELECCIONAR AUTOR =====
  document.querySelectorAll(".category-item").forEach(item => {

    item.addEventListener("click", () => {

      categoriaSeleccionada = item.dataset.cat;

      categoryDropdown.classList.remove("show");

      filtrarPensamientos();

    });

  });

  // ===== RENDER =====
  function renderPensamientosList(filtrados = pensamientos) {

    if (filtrados.length > 0) {

      cont.innerHTML = filtrados.map(p => `

        <div class="card">

          ${p.imagen ? `
            <img 
              src="${p.imagen}" 
              style="width:100%; height:100%; object-fit:cover;"
              crossorigin="anonymous"
            >
          ` : ""}

          <div class="card-content">
         
            <p style="
              margin-left:0;
              line-height:1.6;
              font-style:italic;
              font-size:14px;
            ">
              "${p.texto}"
            </p>
          ${p.autor ? `
              <div style="
              alining-text:left;
                color:white;
                font-weight:bold;
                margin-bottom:8px;
                font-size:12px;
                
              ">
                ${p.autor}
              </div>
            ` : ""}
          </div>

        </div>

      `).join("");

    } else {

      cont.innerHTML = `
        <p style="text-align:center">
          No hay pensamientos cargados aún.
        </p>
      `;
    }
  }

  // ===== FILTRAR =====
  function filtrarPensamientos() {

    const texto = search.value.toLowerCase();

    const filtrados = pensamientos.filter(p => {

      const coincideTexto =

        (p.texto &&
          p.texto.toLowerCase().includes(texto)) ||

        (p.autor &&
          p.autor.toLowerCase().includes(texto));

      const coincideCategoria =

        categoriaSeleccionada === "" ||
        p.autor === categoriaSeleccionada;

      return coincideTexto && coincideCategoria;

    });

    renderPensamientosList(filtrados);

  }

  // ===== BUSCAR =====
  search.addEventListener("input", filtrarPensamientos);

  // ===== CERRAR MENÚ AL TOCAR FUERA =====
  document.addEventListener("click", (e) => {

    if (
      !categoryBtn.contains(e.target) &&
      !categoryDropdown.contains(e.target)
    ) {
      categoryDropdown.classList.remove("show");
    }

  });

  // ===== INICIAL =====
  renderPensamientosList();
}async function guardar() {
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
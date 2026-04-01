const app = document.getElementById("app");

let intervalo;
let festivoActual = null;
let currentTab = "estudios";

/* ================= NAV ================= */
function navigate(view, id = null) {
  clearInterval(intervalo);

  switch(view) {
    case "home":
      renderHome();
      break;

    case "festivos":
      renderFestivos(); // 👈 directo
      break;

    case "detalle":
      renderDetalle(id);
      break;

    case "about":
      renderAbout();
      break;
  }
}

/* ================= HOME ================= */
function renderHome() {
  app.innerHTML = `
    <div class="carousel">
      <img id="slide" src="">
    </div>
  `;

  const slide = document.getElementById("slide");

  function cambiarImagen() {
    const random = imagenes[Math.floor(Math.random() * imagenes.length)];
    slide.src = random;
  }

  cambiarImagen();
  intervalo = setInterval(cambiarImagen, 4000);
}

/* ================= FESTIVOS ================= */
function renderFestivos(lista) {
  if (!lista) lista = festivos;

  app.innerHTML = `
   <header class="header-flotante">
  <div class="search-wrapper">
    <input type="text" id="search" placeholder="Buscar festivo...">
    <span class="search-icon">🔍</span>
  </div>
</header>

<div class="page">
  <div id="festivos" class="grid">
    <!-- Aquí irán tus cards -->
  </div>
</div>


  `;

  const cont = document.getElementById("festivos");

  if (!cont) {
    console.error("No existe #festivos");
    return;
  }

  cont.innerHTML = lista.map(f => `
    <div class="card" onclick="navigate('detalle','${f.id}')">

      <img src="${imagenes[Math.floor(Math.random()*imagenes.length)]}">

      <div class="card-content">
        <h3>${f.nombre}</h3>
        <p>${f.descripcion}</p>
      </div>

      <!--<button onclick="event.stopPropagation(); toggleFav('${f.id}')"
        style="position:absolute;top:10px;right:10px;z-index:3;">
        ${favoritos.includes(f.id) ? "⭐" : "☆"}
      </button>-->

    </div>
  `).join("");

  // 🔍 BUSCADOR (AQUÍ ES DONDE DEBE ESTAR)
  const search = document.getElementById("search");

  if (search) {
    search.addEventListener("input", e => {
      const texto = e.target.value.toLowerCase();

      const filtrados = festivos.filter(f =>
        f.nombre.toLowerCase().includes(texto)
      );

      renderFestivos(filtrados);
    });
  }
}
/* ================= DETALLE ================= */
function renderDetalle(id) {
  festivoActual = id;

  const f = festivos.find(x => x.id === id);

  app.innerHTML = `
    <div class="page">

     <!-- <h2>${f.nombre}</h2>
      <p>${f.descripcion || ""}</p> -->

      <!-- TABS -->
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

      <!-- CONTENIDO -->
      <div id="contenido"></div>

      <br>
      <button class="tab" onclick="navigate('festivos')">⬅ Volver</button>

    </div>
  `;

  renderContenido();
}

/* ================= CREAR TAB ================= */
function crearTab(id, texto) {
  return `
    <div class="tab ${currentTab === id ? "active" : ""}" 
         onclick="cambiarTab('${id}')">
      ${texto}
    </div>
  `;
}

/* ================= CAMBIAR TAB ================= */
function cambiarTab(tab) {
  currentTab = tab;
  renderDetalle(festivoActual);
}

/* ================= CONTENIDO ================= */
function renderContenido() {
  const cont = document.getElementById("contenido");

  const festivo = festivos.find(f => f.id === festivoActual);

  if (!festivo || !festivo.contenido[currentTab]) {
    cont.innerHTML = "<p>No hay contenido disponible.</p>";
    return;
  }

  const data = festivo.contenido[currentTab];

  cont.innerHTML = data.map((item, index) => `
    <div class="accordion-item">
      
      <div class="accordion-header" onclick="toggleItem(${index})">
        <span>${item.titulo}</span>
        <span class="icon">+</span>
      </div>

      <div class="accordion-body" id="item-${index}">
        ${item.texto ? `<p>${item.texto}</p>` : "<p>Contenido disponible.</p>"}
      </div>

    </div>
  `).join("");
}
/* ================= ABOUT ================= */
function renderAbout() {
  app.innerHTML = `
    <div class="page">
      <h2>Acerca de SECDE</h2>
      <p>Portal cristiano para edificación espiritual.</p>
    </div>
  `;
}

function toggleItem(index) {
  const el = document.getElementById(`item-${index}`);
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
    icon.textContent = "−";
  }
}
/*
const btnTheme = document.getElementById("themeToggle");

btnTheme.onclick = () => {
  document.body.classList.toggle("light");
  localStorage.setItem("theme", document.body.classList.contains("light") ? "light" : "dark");
};

(function () {
  const saved = localStorage.getItem("theme");
  if (saved === "light") document.body.classList.add("light");
})();*/

/*===========Sistema de favoritos=========================*/
let favoritos = JSON.parse(localStorage.getItem("fav")) || [];

function toggleFav(id) {
  if (favoritos.includes(id)) {
    favoritos = favoritos.filter(f => f !== id);
  } else {
    favoritos.push(id);
  }
  localStorage.setItem("fav", JSON.stringify(favoritos));
  renderFestivos(festivos);
}
/*==================Buscador===========================
const search = document.getElementById("search");

if (search) {
  search.addEventListener("input", e => {
    const texto = e.target.value.toLowerCase();

    const filtrados = festivos.filter(f =>
      f.nombre.toLowerCase().includes(texto)
    );

    renderFestivos(filtrados);
  });
}*/
/*=====================tabs que cohinciden con los de inicio=======================================
const tabs = [
  { id:"estudios", nombre:"Estudios" },
  { id:"predicacion", nombre:"Predicación" },
  { id:"canciones", nombre:"Canciones" },
  { id:"cantos", nombre:"Cantos" },
  { id:"himnos", nombre:"Himnos" },
  { id:"dramas", nombre:"Dramas" },
  { id:"lecturas", nombre:"Lecturas" },
  { id:"poesias", nombre:"Poesías" },
  { id:"programas", nombre:"Programas" }
];
*/
/* ================= INIT ================= */
navigate("home");
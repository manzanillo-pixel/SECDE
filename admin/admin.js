// ===== CONFIG =====
const REPO_USER = "manzanillo-pixel";
const REPO_NAME = "SECDE";
const REPO = `${REPO_USER}/${REPO_NAME}`;

// Solicitar token al usuario
let GITHUB_TOKEN = localStorage.getItem("github_token") || "";

// ===== DATOS =====
let festivos = [];
let promesas = [];
let pensamientos = [];
let homeImages = [];
let aboutData = { title: '', description: '', images: [] };
let currentSection = "festivos";
let festivoEditandose = null; // Festivo siendo editado
let seccionEditandose = null; // Sección siendo editada

// Secciones disponibles
const SECCIONES = {
  estudios: "📖 Estudios",
  predicacion: "🎤 Predicación",
  canciones: "🎵 Canciones",
  cantos: "🙏 Cánticos",
  dramas: "🎭 Dramas",
  himnos: "🎶 Himnos",
  lecturas: "📜 Lecturas",
  poesias: "✍️ Poesías",
  programas: "📋 Programas"
};

// ===== LOGIN =====
function login() {
  const passInput = document.getElementById("pass");
  const pass = passInput.value.trim(); // Trim para eliminar espacios
  
  console.log("🔍 Contraseña ingresada:", `"${pass}"`);
  console.log("🔍 Longitud:", pass.length);
  console.log("🔍 Contraseña esperada:", "SECDE2024");
  
  const correctPassword = "SECDE2024";
  
  if (pass === correctPassword) {
    console.log("✅ Contraseña correcta");
    document.getElementById("loginBox").style.display = "none";
    document.getElementById("panel").style.display = "block";
    
    // Pedir token si no existe
    if (!GITHUB_TOKEN) {
      GITHUB_TOKEN = prompt("Ingresa tu token de GitHub:\n(Crea uno en https://github.com/settings/tokens)");
      if (GITHUB_TOKEN) {
        localStorage.setItem("github_token", GITHUB_TOKEN);
      }
    }
    
    cargarDatos();
  } else {
    console.error("❌ Contraseña incorrecta");
    const debugMsg = document.getElementById("debug-msg");
    debugMsg.textContent = `❌ Contraseña incorrecta. Esperada: "${correctPassword}", Ingresada: "${pass}"`;
    debugMsg.style.display = "block";
    alert("❌ Contraseña incorrecta");
    passInput.value = "";
  }
}

// ===== CARGAR DATOS =====
async function cargarDatos() {
  try {
    const festRes = await fetch(`https://api.github.com/repos/${REPO}/contents/data/festivos.json`, {
      headers: { "Authorization": `Bearer ${GITHUB_TOKEN}` }
    });
    
    const promRes = await fetch(`https://api.github.com/repos/${REPO}/contents/data/promesas.json`, {
      headers: { "Authorization": `Bearer ${GITHUB_TOKEN}` }
    });
    
    const pensRes = await fetch(`https://api.github.com/repos/${REPO}/contents/data/pensamientos.json`, {
      headers: { "Authorization": `Bearer ${GITHUB_TOKEN}` }
    });
    
    const homeRes = await fetch(`https://api.github.com/repos/${REPO}/contents/data/home.json`, {
      headers: { "Authorization": `Bearer ${GITHUB_TOKEN}` }
    });
    const aboutRes = await fetch(`https://api.github.com/repos/${REPO}/contents/data/about.json`, {
      headers: { "Authorization": `Bearer ${GITHUB_TOKEN}` }
    });

    if (festRes.ok) festivos = JSON.parse(atob(await festRes.json().then(r => r.content))).festivos || [];
    if (promRes.ok) promesas = JSON.parse(atob(await promRes.json().then(r => r.content))).promesas || [];
    if (pensRes.ok) pensamientos = JSON.parse(atob(await pensRes.json().then(r => r.content))).pensamientos || [];
    if (homeRes.ok) homeImages = JSON.parse(atob(await homeRes.json().then(r => r.content))).imagenes || [];
    if (aboutRes.ok) aboutData = JSON.parse(atob(await aboutRes.json().then(r => r.content)));

    mostrarSeccion("festivos");
  } catch (error) {
    console.error("Error cargando datos:", error);
    alert("❌ Error cargando datos. Verifica tu token.");
  }
}

// ===== MOSTRAR SECCIONES =====
function mostrarSeccion(seccion) {
  currentSection = seccion;
  const contenedor = document.getElementById("contenedor");
  
  let html = `<h2>${seccion.toUpperCase()}</h2>`;
  
  if (seccion === "festivos") {
    html += generarFormularioFestivo();
    html += "<hr>";
    html += generarListaFestivos();
  } else if (seccion === "promesas") {
    html += generarFormularioPromesa();
    html += "<hr>";
    html += generarListaPromesas();
  } else if (seccion === "pensamientos") {
    html += generarFormularioPensamiento();
    html += "<hr>";
    html += generarListaPensamientos();
  } else if (seccion === "imagenes") {
    html += generarFormularioImagen();
    html += "<hr>";
    html += generarListaImagenes();
  } else if (seccion === "about") {
    html += generarFormularioAbout();
    html += "<hr>";
    html += generarListaImagenesAbout();
  }
  // ===== ABOUT FORMULARIO Y LISTA =====
  function generarFormularioAbout() {
    return `
      <div class="form-section">
        <h3>Editar sección About</h3>
        <input type="text" id="about-title" placeholder="Título" value="${aboutData.title || ''}">
        <textarea id="about-desc" placeholder="Descripción" rows="3">${aboutData.description || ''}</textarea>
        <button onclick="guardarAbout()" class="btn-success">💾 Guardar About</button>
      </div>
      <div class="form-section">
        <h3>Agregar Imagen a About</h3>
        <input type="text" id="about-img-url" placeholder="URL de la imagen">
        <button onclick="agregarImagenAbout()" class="btn-success">➕ Agregar Imagen</button>
      </div>
    `;
  }

  function generarListaImagenesAbout() {
    if (!aboutData.images || aboutData.images.length === 0) return "<p>No hay imágenes en About aún.</p>";
    return aboutData.images.map((img, i) => `
      <div class="item">
        <img src="${img}" style="max-width: 150px; max-height: 150px; border-radius: 5px;">
        <br>
        <small>${img}</small>
        <button onclick="eliminarImagenAbout(${i})" class="btn-danger">🗑 Eliminar</button>
      </div>
    `).join("");
  }

  function guardarAbout() {
    const title = document.getElementById("about-title").value.trim();
    const description = document.getElementById("about-desc").value.trim();
    aboutData.title = title;
    aboutData.description = description;
    guardarDatos("about.json", aboutData);
  }

  function agregarImagenAbout() {
    const url = document.getElementById("about-img-url").value.trim();
    if (!url) {
      alert("⚠️ Ingresa una URL de imagen");
      return;
    }
    aboutData.images = aboutData.images || [];
    aboutData.images.push(url);
    document.getElementById("about-img-url").value = "";
    guardarDatos("about.json", aboutData);
    mostrarSeccion("about");
  }

  function eliminarImagenAbout(i) {
    if (confirm("¿Eliminar esta imagen de About?")) {
      aboutData.images.splice(i, 1);
      guardarDatos("about.json", aboutData);
      mostrarSeccion("about");
    }
  }
  
  contenedor.innerHTML = html;
}

// ===== FORMULARIOS =====
function generarFormularioFestivo() {
  return `
    <div class="form-section">
      <h3>Agregar Festivo</h3>
      <input type="text" id="fest-id" placeholder="ID (ej: navidad)" maxlength="20">
      <input type="text" id="fest-nombre" placeholder="Nombre">
      <input type="text" id="fest-desc" placeholder="Descripción">
      <input type="text" id="fest-imagen" placeholder="URL de imagen">
      <button onclick="agregarFestivo()" class="btn-success">➕ Agregar Festivo</button>
    </div>
  `;
}

function generarFormularioPromesa() {
  return `
    <div class="form-section">
      <h3>Agregar Promesa Bíblica</h3>
      <input type="text" id="prom-categoria" placeholder="Categoría (ej: Salvación, Paz, etc.)" style="width: 100%; padding: 8px; margin-bottom: 8px; background: #1a1a1a; border: 1px solid #444; color: white; border-radius: 5px;">
      <textarea id="prom-texto" placeholder="Texto de la promesa" rows="3" style="width: 100%; padding: 8px; margin-bottom: 8px; background: #1a1a1a; border: 1px solid #444; color: white; border-radius: 5px; font-family: Arial;"></textarea>
      <input type="text" id="prom-referencia" placeholder="Referencia (ej: Juan 3:16)" style="width: 100%; padding: 8px; margin-bottom: 8px; background: #1a1a1a; border: 1px solid #444; color: white; border-radius: 5px;">
      <button onclick="agregarPromesa()" class="btn-success">➕ Agregar Promesa</button>
    </div>
  `;
}

function generarFormularioPensamiento() {
  return `
    <div class="form-section">
      <h3>Agregar Pensamiento</h3>
      <textarea id="pens-texto" placeholder="Pensamiento cristiano" rows="3" style="width: 100%; padding: 8px; margin-bottom: 8px; background: #1a1a1a; border: 1px solid #444; color: white; border-radius: 5px; font-family: Arial;"></textarea>
      <input type="text" id="pens-autor" placeholder="Autor (opcional)" style="width: 100%; padding: 8px; margin-bottom: 8px; background: #1a1a1a; border: 1px solid #444; color: white; border-radius: 5px;">
      <input type="text" id="pens-imagen" placeholder="URL de imagen (opcional)" style="width: 100%; padding: 8px; margin-bottom: 8px; background: #1a1a1a; border: 1px solid #444; color: white; border-radius: 5px;">
      <button onclick="agregarPensamiento()" class="btn-success">➕ Agregar Pensamiento</button>
    </div>
  `;
}

function generarFormularioImagen() {
  return `
    <div class="form-section">
      <h3>Agregar Imagen Home</h3>
      <input type="text" id="img-url" placeholder="URL de la imagen">
      <button onclick="agregarImagen()" class="btn-success">➕ Agregar Imagen</button>
    </div>
  `;
}

// ===== LISTAR ITEMS =====
function generarListaFestivos() {
  if (festivos.length === 0) return "<p>No hay festivos aún.</p>";
  
  return festivos.map((f, i) => `
    <div class="item">
      <div style="flex: 1;">
        <strong>${f.nombre}</strong> (${f.id})
        <p>${f.descripcion}</p>
        <img src="${f.imagen}" style="max-width: 100px; border-radius: 5px;">
      </div>
      <div style="display: flex; gap: 5px; flex-direction: column;">
        <button onclick="editarFestivo(${i})" class="btn-warning">✏️ Editar Festivo</button>
        <button onclick="abrirEditorContenido(${i})" class="btn-info">📝 Editar Contenido</button>
        <button onclick="eliminarFestivo(${i})" class="btn-danger">🗑 Eliminar</button>
      </div>
    </div>
  `).join("");
}

function abrirEditorContenido(festivoIndex) {
  const festivo = festivos[festivoIndex];
  const contenedor = document.getElementById("contenedor");
  
  const secciones = [
    { id: "estudios", emoji: "📖", nombre: "Estudios" },
    { id: "predicacion", emoji: "🎤", nombre: "Predicación" },
    { id: "canciones", emoji: "🎵", nombre: "Canciones" },
    { id: "cantos", emoji: "🙏", nombre: "Cánticos" },
    { id: "dramas", emoji: "🎭", nombre: "Dramas" },
    { id: "himnos", emoji: "🎶", nombre: "Himnos" },
    { id: "lecturas", emoji: "📜", nombre: "Lecturas" },
    { id: "poesias", emoji: "✍️", nombre: "Poesías" },
    { id: "programas", emoji: "📋", nombre: "Programas" }
  ];
  
  let html = `
    <div style="margin-bottom: 20px;">
      <button onclick="mostrarSeccion('festivos')" class="tab">⬅ Volver a Festivos</button>
      <h2>✏️ Editar: ${festivo.nombre}</h2>
    </div>
  `;
  
  // Mostrar todas las secciones
  secciones.forEach(seccion => {
    const items = festivo.contenido[seccion.id] || [];
    
    html += `
      <div class="form-section">
        <h3>${seccion.emoji} ${seccion.nombre} (${items.length} items)</h3>
        
        <!-- Lista de items existentes -->
        <div style="margin-bottom: 20px; max-height: 300px; overflow-y: auto;">
    `;
    
    if (items.length === 0) {
      html += `<p style="color: #999; font-size: 12px;">No hay items aún</p>`;
    } else {
      items.forEach((item, i) => {
        html += `
          <div style="background: #1a1a1a; padding: 10px; margin-bottom: 8px; border-radius: 5px; border-left: 3px solid #667eea;">
            <strong style="color: #667eea;">${item.titulo}</strong>
            <p style="margin: 5px 0; font-size: 12px; color: #aaa; line-height: 1.4;">${item.texto.substring(0, 80)}${item.texto.length > 80 ? '...' : ''}</p>
            <div style="display: flex; gap: 5px;">
              <button onclick="editarItem(${festivoIndex}, '${seccion.id}', ${i})" class="btn-warning" style="padding: 3px 8px; font-size: 11px; flex: 1;">✏️ Editar</button>
              <button onclick="eliminarItem(${festivoIndex}, '${seccion.id}', ${i})" class="btn-danger" style="padding: 3px 8px; font-size: 11px; flex: 1;">🗑 Eliminar</button>
            </div>
          </div>
        `;
      });
    }
    
    html += `
        </div>
        
        <!-- Formulario para agregar nuevo item -->
        <div style="background: #0a0a0a; padding: 15px; border-radius: 5px;">
          <h4 style="margin-bottom: 10px; color: #667eea;">➕ Agregar nuevo item</h4>
          <input type="text" id="titulo-${seccion.id}" placeholder="Título" style="width: 100%; padding: 8px; background: #1a1a1a; border: 1px solid #444; color: white; border-radius: 5px; margin-bottom: 8px; font-size: 13px;">
          <textarea id="texto-${seccion.id}" placeholder="Contenido/Descripción" rows="3" style="width: 100%; padding: 8px; background: #1a1a1a; border: 1px solid #444; color: white; border-radius: 5px; margin-bottom: 8px; font-family: Arial; font-size: 13px; resize: vertical;"></textarea>
          <button onclick="agregarItem(${festivoIndex}, '${seccion.id}')" class="btn-success" style="width: 100%; padding: 10px; font-weight: bold;">➕ Agregar ${seccion.nombre}</button>
        </div>
      </div>
    `;
  });
  
  html += `<button onclick="mostrarSeccion('festivos')" class="tab" style="width: 100%; margin-top: 20px; padding: 15px; font-size: 16px;">⬅ Volver a Festivos</button>`;
  
  contenedor.innerHTML = html;
}

function generarListaPromesas() {
  if (promesas.length === 0) return "<p>No hay promesas aún.</p>";
  
  return promesas.map((p, i) => `
    <div class="item">
      <div style="flex: 1;">
        <div style="color: #667eea; font-weight: bold; margin-bottom: 5px; font-size: 12px;">${p.categoria || "Promesa"}</div>
        <p style="margin: 5px 0; font-style: italic;">"${p.texto}"</p>
        <div style="color: #999; font-size: 12px; margin-top: 5px;">${p.referencia || ""}</div>
      </div>
      <div style="display: flex; gap: 5px; flex-direction: column;">
        <button onclick="editarPromesa(${i})" class="btn-warning">✏️ Editar</button>
        <button onclick="eliminarPromesa(${i})" class="btn-danger">🗑 Eliminar</button>
      </div>
    </div>
  `).join("");
}

function generarListaPensamientos() {
  if (pensamientos.length === 0) return "<p>No hay pensamientos aún.</p>";
  
  return pensamientos.map((p, i) => `
    <div class="item">
      <div style="flex: 1;">
        ${p.imagen ? `<img src="${p.imagen}" style="max-width: 80px; height: 80px; object-fit: cover; border-radius: 5px; margin-bottom: 10px;">` : ""}
        <p style="margin: 5px 0; font-style: italic; font-size: 14px;">"${p.texto}"</p>
        ${p.autor ? `<div style="color: #667eea; font-weight: bold; margin-top: 5px; font-size: 12px;">— ${p.autor}</div>` : ""}
      </div>
      <div style="display: flex; gap: 5px; flex-direction: column;">
        <button onclick="editarPensamiento(${i})" class="btn-warning">✏️ Editar</button>
        <button onclick="eliminarPensamiento(${i})" class="btn-danger">🗑 Eliminar</button>
      </div>
    </div>
  `).join("");
}

function generarListaImagenes() {
  if (homeImages.length === 0) return "<p>No hay imágenes aún.</p>";
  
  return homeImages.map((img, i) => `
    <div class="item">
      <img src="${img}" style="max-width: 150px; max-height: 150px; border-radius: 5px;">
      <br>
      <small>${img}</small>
      <button onclick="eliminarImagen(${i})" class="btn-danger">🗑 Eliminar</button>
    </div>
  `).join("");
}

// ===== AGREGAR ITEMS =====
function agregarFestivo() {
  const id = document.getElementById("fest-id").value;
  const nombre = document.getElementById("fest-nombre").value;
  const desc = document.getElementById("fest-desc").value;
  const imagen = document.getElementById("fest-imagen").value;
  
  if (!id || !nombre) {
    alert("⚠️ Completa ID y Nombre");
    return;
  }
  
  festivos.push({
    id,
    nombre,
    descripcion: desc,
    imagen: imagen || "img/default.jpg",
    contenido: {
      estudios: [],
      predicacion: [],
      canciones: [],
      cantos: [],
      dramas: [],
      himnos: [],
      lecturas: [],
      poesias: [],
      programas: []
    }
  });
  
  document.getElementById("fest-id").value = "";
  document.getElementById("fest-nombre").value = "";
  document.getElementById("fest-desc").value = "";
  document.getElementById("fest-imagen").value = "";
  
  guardarFestivos();
  mostrarSeccion("festivos");
}

function agregarPromesa() {
  const categoria = document.getElementById("prom-categoria").value.trim();
  const texto = document.getElementById("prom-texto").value.trim();
  const referencia = document.getElementById("prom-referencia").value.trim();
  
  if (!texto) {
    alert("⚠️ Completa el texto de la promesa");
    return;
  }
  
  promesas.push({ categoria, texto, referencia });
  
  document.getElementById("prom-categoria").value = "";
  document.getElementById("prom-texto").value = "";
  document.getElementById("prom-referencia").value = "";
  
  guardarPromesas();
  mostrarSeccion("promesas");
}
  document.getElementById("prom-texto").value = "";
  
  guardarPromesas();
  mostrarSeccion("promesas");


function agregarPensamiento() {
  const texto = document.getElementById("pens-texto").value.trim();
  const autor = document.getElementById("pens-autor").value.trim();
  const imagen = document.getElementById("pens-imagen").value.trim();
  
  if (!texto) {
    alert("⚠️ Completa el pensamiento");
    return;
  }
  
  pensamientos.push({ texto, autor, imagen });
  
  document.getElementById("pens-texto").value = "";
  document.getElementById("pens-autor").value = "";
  document.getElementById("pens-imagen").value = "";
  
  guardarPensamientos();
  mostrarSeccion("pensamientos");
}

function agregarImagen() {
  const url = document.getElementById("img-url").value;
  
  if (!url) {
    alert("⚠️ Ingresa una URL de imagen");
    return;
  }
  
  homeImages.push(url);
  
  document.getElementById("img-url").value = "";
  
  guardarImagenes();
  mostrarSeccion("imagenes");
}

// ===== ELIMINAR ITEMS =====
function eliminarFestivo(i) {
  if (confirm("¿Eliminar este festivo?")) {
    festivos.splice(i, 1);
    guardarFestivos();
    mostrarSeccion("festivos");
  }
}

function eliminarPromesa(i) {
  if (confirm("¿Eliminar esta promesa?")) {
    promesas.splice(i, 1);
    guardarPromesas();
    mostrarSeccion("promesas");
  }
}

function eliminarPensamiento(i) {
  if (confirm("¿Eliminar este pensamiento?")) {
    pensamientos.splice(i, 1);
    guardarPensamientos();
    mostrarSeccion("pensamientos");
  }
}

function eliminarImagen(i) {
  if (confirm("¿Eliminar esta imagen?")) {
    homeImages.splice(i, 1);
    guardarImagenes();
    mostrarSeccion("imagenes");
  }
}

// ===== GUARDAR EN GITHUB =====
async function guardarDatos(archivo, datos) {
  try {
    const path = `data/${archivo}`;
    
    // Obtener SHA actual
    const getRes = await fetch(`https://api.github.com/repos/${REPO}/contents/${path}?ref=main`, {
      headers: { "Authorization": `Bearer ${GITHUB_TOKEN}` }
    });
    
    let sha = "";
    if (getRes.ok) {
      sha = await getRes.json().then(r => r.sha);
    }
    
    // Convertir a base64
    const content = btoa(unescape(encodeURIComponent(JSON.stringify(datos, null, 2))));
    
    // Actualizar archivo
    const updateRes = await fetch(`https://api.github.com/repos/${REPO}/contents/${path}`, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${GITHUB_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: `Update ${archivo}`,
        content: content,
        sha: sha,
        branch: "main"
      })
    });
    
    if (!updateRes.ok) {
      const error = await updateRes.json();
      console.error("Error de GitHub:", error);
      throw new Error(error.message || "Error desconocido de GitHub");
    }
    
    alert(`✅ ${archivo} guardado correctamente en GitHub`);
    console.log("✅ Datos guardados:", datos);
  } catch (error) {
    console.error("Error:", error);
    alert(`❌ Error guardando ${archivo}:\n${error.message}\n\nVerifica:\n1. Tu token de GitHub es válido\n2. Tiene permisos de 'repo'`);
  }
}

function guardarFestivos() {
  guardarDatos("festivos.json", { festivos });
}

function guardarPromesas() {
  guardarDatos("promesas.json", { promesas });
}

function guardarPensamientos() {
  guardarDatos("pensamientos.json", { pensamientos });
}

function guardarImagenes() {
  guardarDatos("home.json", { imagenes: homeImages });
}

// ===== LOGOUT =====
function logout() {
  if (confirm("¿Cerrar sesión?")) {
    document.getElementById("panel").style.display = "none";
    document.getElementById("loginBox").style.display = "block";
    document.getElementById("pass").value = "";
  }
}

// ===== RECARGAR DATOS =====
function recargarDatos() {
  alert("🔄 Recargando datos desde GitHub...");
  cargarDatos();
  alert("✅ Datos recargados");
}

// ===== EDITAR CONTENIDO DE FESTIVO =====
function editarContenidoFestivo(i) {
  festivoEditandose = i;
  seccionEditandose = null;
  mostrarEditorContenido();
}

function mostrarEditorContenido() {
  const contenedor = document.getElementById("contenedor");
  const festivo = festivos[festivoEditandose];
  
  let html = `
    <div style="margin-bottom: 20px;">
      <button onclick="mostrarSeccion('festivos')" class="tab">⬅ Volver a Festivos</button>
      <h2>📝 Editar contenido: ${festivo.nombre}</h2>
    </div>
  `;
  
  // Mostrar secciones
  html += `<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; margin-bottom: 30px;">`;
  
  Object.keys(SECCIONES).forEach(key => {
    const cantidad = festivo.contenido[key].length;
    html += `
      <button onclick="mostrarSeccionContenido('${key}')" class="tab" style="padding: 15px; ${seccionEditandose === key ? 'background: #667eea !important;' : ''}">
        ${SECCIONES[key]}
        <br><small>${cantidad} items</small>
      </button>
    `;
  });
  
  html += `</div>`;
  
  // Mostrar editor de la sección seleccionada
  if (seccionEditandose) {
    html += mostrarEditorSeccion();
  }
  
  contenedor.innerHTML = html;
}

function mostrarSeccionContenido(seccion) {
  seccionEditandose = seccion;
  mostrarEditorContenido();
}

function mostrarEditorSeccion() {
  const festivo = festivos[festivoEditandose];
  const items = festivo.contenido[seccionEditandose];
  
  let html = `
    <div class="form-section">
      <h3>${SECCIONES[seccionEditandose]}</h3>
      
      <div style="margin-bottom: 20px;">
        <h4>Agregar nuevo item</h4>
        <input type="text" id="item-titulo" placeholder="Título" style="margin-bottom: 10px; width: 100%; padding: 10px; background: #1a1a1a; border: 1px solid #444; color: #fff; border-radius: 5px;">
        <textarea id="item-texto" placeholder="Contenido/Texto" rows="4" style="margin-bottom: 10px; width: 100%; padding: 10px; background: #1a1a1a; border: 1px solid #444; color: #fff; border-radius: 5px;"></textarea>
        <button onclick="agregarItemContenido()" class="btn-success">➕ Agregar Item</button>
      </div>
      
      <hr>
      
      <h4>Items existentes (${items.length}):</h4>
  `;
  
  if (items.length === 0) {
    html += `<p>No hay items en esta sección.</p>`;
  } else {
    html += items.map((item, idx) => `
      <div style="background: #1a1a1a; padding: 15px; margin-bottom: 10px; border-radius: 5px; border-left: 3px solid #667eea;">
        <strong>${item.titulo}</strong>
        <p>${item.texto}</p>
        <button onclick="eliminarItemContenido(${idx})" class="btn-danger">🗑 Eliminar</button>
      </div>
    `).join("");
  }
  
  html += `</div>`;
  
  return html;
}

function agregarItemContenido() {
  const titulo = document.getElementById("item-titulo").value.trim();
  const texto = document.getElementById("item-texto").value.trim();
  
  if (!titulo || !texto) {
    alert("⚠️ Completa título y contenido");
    return;
  }
  
  const festivo = festivos[festivoEditandose];
  festivo.contenido[seccionEditandose].push({ titulo, texto });
  
  document.getElementById("item-titulo").value = "";
  document.getElementById("item-texto").value = "";
  
  console.log(`✅ Item agregado a ${seccionEditandose}`);
  mostrarEditorContenido();
}

function eliminarItemContenido(idx) {
  if (confirm("¿Eliminar este item?")) {
    const festivo = festivos[festivoEditandose];
    festivo.contenido[seccionEditandose].splice(idx, 1);
    guardarFestivos();
    mostrarEditorContenido();
  }
}

// ===== AGREGAR ITEM DESDE EDITOR CONTENIDO =====
function agregarItem(festivoIndex, seccion) {
  const tituloId = `titulo-${seccion}`;
  const textoId = `texto-${seccion}`;
  
  const titulo = document.getElementById(tituloId).value.trim();
  const texto = document.getElementById(textoId).value.trim();
  
  if (!titulo || !texto) {
    alert("⚠️ Completa título y contenido");
    return;
  }
  
  // Agregar item al festivo
  festivos[festivoIndex].contenido[seccion].push({ titulo, texto });
  
  console.log(`✅ Item agregado a ${seccion}: ${titulo}`);
  
  // Limpiar campos
  document.getElementById(tituloId).value = "";
  document.getElementById(textoId).value = "";
  
  // Guardar en GitHub
  guardarFestivos();
  
  // Actualizar vista
  abrirEditorContenido(festivoIndex);
}

// ===== ELIMINAR ITEM DESDE EDITOR CONTENIDO =====
function eliminarItem(festivoIndex, seccion, itemIndex) {
  if (confirm("¿Eliminar este item?")) {
    festivos[festivoIndex].contenido[seccion].splice(itemIndex, 1);
    
    console.log(`✅ Item eliminado de ${seccion}`);
    
    // Guardar en GitHub
    guardarFestivos();
    
    // Actualizar vista
    abrirEditorContenido(festivoIndex);
  }
}

// ===== EDITAR FESTIVO =====
function editarFestivo(festivoIndex) {
  const festivo = festivos[festivoIndex];
  const contenedor = document.getElementById("contenedor");
  
  let html = `
    <div style="margin-bottom: 20px;">
      <button onclick="mostrarSeccion('festivos')" class="tab">⬅ Volver</button>
      <h2>✏️ Editar Festivo</h2>
    </div>
    
    <div class="form-section">
      <h3>Datos del Festivo</h3>
      <label>ID (identificador único):</label>
      <input type="text" id="edit-fest-id" value="${festivo.id}" style="width: 100%; padding: 8px; margin-bottom: 10px; background: #1a1a1a; border: 1px solid #444; color: white; border-radius: 5px;">
      
      <label>Nombre:</label>
      <input type="text" id="edit-fest-nombre" value="${festivo.nombre}" style="width: 100%; padding: 8px; margin-bottom: 10px; background: #1a1a1a; border: 1px solid #444; color: white; border-radius: 5px;">
      
      <label>Descripción:</label>
      <textarea id="edit-fest-desc" rows="3" style="width: 100%; padding: 8px; margin-bottom: 10px; background: #1a1a1a; border: 1px solid #444; color: white; border-radius: 5px;">${festivo.descripcion}</textarea>
      
      <label>URL de Imagen:</label>
      <input type="text" id="edit-fest-imagen" value="${festivo.imagen}" style="width: 100%; padding: 8px; margin-bottom: 10px; background: #1a1a1a; border: 1px solid #444; color: white; border-radius: 5px;">
      
      <div style="margin: 20px 0;">
        <img src="${festivo.imagen}" style="max-width: 150px; border-radius: 5px; display: block; margin-bottom: 10px;">
      </div>
      
      <div style="display: flex; gap: 10px;">
        <button onclick="guardarEditFestivo(${festivoIndex})" class="btn-success" style="flex: 1;">✅ Guardar Cambios</button>
        <button onclick="mostrarSeccion('festivos')" class="btn-secondary" style="flex: 1;">❌ Cancelar</button>
      </div>
    </div>
  `;
  
  contenedor.innerHTML = html;
}

function guardarEditFestivo(festivoIndex) {
  const newId = document.getElementById("edit-fest-id").value.trim();
  const newNombre = document.getElementById("edit-fest-nombre").value.trim();
  const newDesc = document.getElementById("edit-fest-desc").value.trim();
  const newImagen = document.getElementById("edit-fest-imagen").value.trim();
  
  if (!newId || !newNombre) {
    alert("⚠️ Completa ID y Nombre");
    return;
  }
  
  festivos[festivoIndex].id = newId;
  festivos[festivoIndex].nombre = newNombre;
  festivos[festivoIndex].descripcion = newDesc;
  festivos[festivoIndex].imagen = newImagen;
  
  console.log(`✅ Festivo actualizado: ${newNombre}`);
  guardarFestivos();
  mostrarSeccion("festivos");
}

// ===== EDITAR ITEM =====
function editarItem(festivoIndex, seccion, itemIndex) {
  const festivo = festivos[festivoIndex];
  const item = festivo.contenido[seccion][itemIndex];
  const contenedor = document.getElementById("contenedor");
  
  let html = `
    <div style="margin-bottom: 20px;">
      <button onclick="abrirEditorContenido(${festivoIndex})" class="tab">⬅ Volver</button>
      <h2>✏️ Editar Item</h2>
    </div>
    
    <div class="form-section">
      <h3>${SECCIONES[seccion]}</h3>
      
      <label>Título:</label>
      <input type="text" id="edit-item-titulo" value="${item.titulo}" style="width: 100%; padding: 8px; margin-bottom: 10px; background: #1a1a1a; border: 1px solid #444; color: white; border-radius: 5px;">
      
      <label>Contenido:</label>
      <textarea id="edit-item-texto" rows="5" style="width: 100%; padding: 8px; margin-bottom: 10px; background: #1a1a1a; border: 1px solid #444; color: white; border-radius: 5px; font-family: Arial;">${item.texto}</textarea>
      
      <div style="display: flex; gap: 10px;">
        <button onclick="guardarEditItem(${festivoIndex}, '${seccion}', ${itemIndex})" class="btn-success" style="flex: 1;">✅ Guardar Cambios</button>
        <button onclick="abrirEditorContenido(${festivoIndex})" class="btn-secondary" style="flex: 1;">❌ Cancelar</button>
      </div>
    </div>
  `;
  
  contenedor.innerHTML = html;
}

function guardarEditItem(festivoIndex, seccion, itemIndex) {
  const newTitulo = document.getElementById("edit-item-titulo").value.trim();
  const newTexto = document.getElementById("edit-item-texto").value.trim();
  
  if (!newTitulo || !newTexto) {
    alert("⚠️ Completa título y contenido");
    return;
  }
  
  festivos[festivoIndex].contenido[seccion][itemIndex].titulo = newTitulo;
  festivos[festivoIndex].contenido[seccion][itemIndex].texto = newTexto;
  
  console.log(`✅ Item actualizado: ${newTitulo}`);
  guardarFestivos();
  abrirEditorContenido(festivoIndex);
}

// Guardar todos los cambios
function guardarContenido() {
  guardarFestivos();
}

// ===== EDITAR PROMESA =====
function editarPromesa(index) {
  const promesa = promesas[index];
  const contenedor = document.getElementById("contenedor");
  
  let html = `
    <div style="margin-bottom: 20px;">
      <button onclick="mostrarSeccion('promesas')" class="tab">⬅ Volver</button>
      <h2>✏️ Editar Promesa</h2>
    </div>
    
    <div class="form-section">
      <label>Categoría:</label>
      <input type="text" id="edit-prom-categoria" value="${promesa.categoria || ""}" style="width: 100%; padding: 8px; margin-bottom: 10px; background: #1a1a1a; border: 1px solid #444; color: white; border-radius: 5px;">
      
      <label>Texto:</label>
      <textarea id="edit-prom-texto" rows="4" style="width: 100%; padding: 8px; margin-bottom: 10px; background: #1a1a1a; border: 1px solid #444; color: white; border-radius: 5px; font-family: Arial;">${promesa.texto}</textarea>
      
      <label>Referencia:</label>
      <input type="text" id="edit-prom-referencia" value="${promesa.referencia || ""}" style="width: 100%; padding: 8px; margin-bottom: 10px; background: #1a1a1a; border: 1px solid #444; color: white; border-radius: 5px;">
      
      <div style="display: flex; gap: 10px;">
        <button onclick="guardarEditPromesa(${index})" class="btn-success" style="flex: 1;">✅ Guardar Cambios</button>
        <button onclick="mostrarSeccion('promesas')" class="btn-secondary" style="flex: 1;">❌ Cancelar</button>
      </div>
    </div>
  `;
  
  contenedor.innerHTML = html;
}

function guardarEditPromesa(index) {
  const newCategoria = document.getElementById("edit-prom-categoria").value.trim();
  const newTexto = document.getElementById("edit-prom-texto").value.trim();
  const newReferencia = document.getElementById("edit-prom-referencia").value.trim();
  
  if (!newTexto) {
    alert("⚠️ Completa el texto");
    return;
  }
  
  promesas[index].categoria = newCategoria;
  promesas[index].texto = newTexto;
  promesas[index].referencia = newReferencia;
  
  console.log(`✅ Promesa actualizada`);
  guardarPromesas();
  mostrarSeccion("promesas");
}

// ===== EDITAR PENSAMIENTO =====
function editarPensamiento(index) {
  const pensamiento = pensamientos[index];
  const contenedor = document.getElementById("contenedor");
  
  let html = `
    <div style="margin-bottom: 20px;">
      <button onclick="mostrarSeccion('pensamientos')" class="tab">⬅ Volver</button>
      <h2>✏️ Editar Pensamiento</h2>
    </div>
    
    <div class="form-section">
      <label>Texto:</label>
      <textarea id="edit-pens-texto" rows="4" style="width: 100%; padding: 8px; margin-bottom: 10px; background: #1a1a1a; border: 1px solid #444; color: white; border-radius: 5px; font-family: Arial;">${pensamiento.texto}</textarea>
      
      <label>Autor (opcional):</label>
      <input type="text" id="edit-pens-autor" value="${pensamiento.autor || ""}" style="width: 100%; padding: 8px; margin-bottom: 10px; background: #1a1a1a; border: 1px solid #444; color: white; border-radius: 5px;">
      
      <label>URL de Imagen (opcional):</label>
      <input type="text" id="edit-pens-imagen" value="${pensamiento.imagen || ""}" style="width: 100%; padding: 8px; margin-bottom: 10px; background: #1a1a1a; border: 1px solid #444; color: white; border-radius: 5px;">
      
      ${pensamiento.imagen ? `<div style="margin-bottom: 10px;"><img src="${pensamiento.imagen}" style="max-width: 150px; border-radius: 5px;"></div>` : ""}
      
      <div style="display: flex; gap: 10px;">
        <button onclick="guardarEditPensamiento(${index})" class="btn-success" style="flex: 1;">✅ Guardar Cambios</button>
        <button onclick="mostrarSeccion('pensamientos')" class="btn-secondary" style="flex: 1;">❌ Cancelar</button>
      </div>
    </div>
  `;
  
  contenedor.innerHTML = html;
}

function guardarEditPensamiento(index) {
  const newTexto = document.getElementById("edit-pens-texto").value.trim();
  const newAutor = document.getElementById("edit-pens-autor").value.trim();
  const newImagen = document.getElementById("edit-pens-imagen").value.trim();
  
  if (!newTexto) {
    alert("⚠️ Completa el texto");
    return;
  }
  
  pensamientos[index].texto = newTexto;
  pensamientos[index].autor = newAutor;
  pensamientos[index].imagen = newImagen;
  
  console.log(`✅ Pensamiento actualizado`);
  guardarPensamientos();
  mostrarSeccion("pensamientos");
}

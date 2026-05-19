// ========== SHOWS - VERSIÓN CORREGIDA ==========

const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTihFmKW5veyJTma82zgM1mNN0zQqH3CyK0IBW-qHPMkNsqWJ9tJGv1PFAgUw58lTDKDzQk6zoaKxf_/pub?gid=0&single=true&output=csv";

const showsGrid = document.getElementById('showsGrid');
const playerOverlay = document.getElementById('playerOverlay');
const videoFrame = document.getElementById('videoFrame');
const closePlayerBtn = document.getElementById('closePlayerBtn');
const menuToggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');
const navBtns = document.querySelectorAll('.nav-btn');

let todosLosShows = [];
let categoriaActual = 'todos';

// Reproductor
if (closePlayerBtn) {
  closePlayerBtn.addEventListener('click', () => {
    playerOverlay.style.display = 'none';
    videoFrame.src = '';
  });
}

function abrirVideo(url) {
  videoFrame.src = url;
  playerOverlay.style.display = 'flex';
}

// Renderizar tarjetas (con orden invertido: más nuevos primero)
function renderizarShows(shows, contenedor) {
  if (!shows.length) {
    contenedor.innerHTML = '<p style="text-align:center; color:#6b7280;">No hay contenido disponible</p>';
    return;
  }

  // Invertir orden SOLO si se están mostrando todos los shows
  let showsAMostrar = shows;
  if (categoriaActual === 'todos') {
    showsAMostrar = [...shows].reverse();
  }

  contenedor.innerHTML = showsAMostrar.map(show => {
    const badgeReciente = show.reciente === true || show.reciente === 'si' ? '<span class="card-badge">🔥 Reciente</span>' : '';
    return `
      <div class="show-card">
        <img class="card-img" src="${show.imagen}" alt="${show.nombre}" onerror="this.src='https://placehold.co/600x400/1f2937/9ca3af?text=Show'">
        <div class="card-content">
          ${badgeReciente}
          <div class="card-title">${show.nombre}</div>
          <button class="card-btn" onclick="abrirVideo('${show.url}')">Ver ahora ▶</button>
        </div>
      </div>
    `;
  }).join('');
}

// Filtrar por categoría
function filtrarShows(categoria) {
  categoriaActual = categoria;
  
  if (categoria === 'todos') {
    renderizarShows(todosLosShows, showsGrid);
  } else {
    // Usar los valores exactos que se leen del CSV (minúsculas)
    let categoriaSheet = '';
    if (categoria === 'caso cerrado') categoriaSheet = 'caso cerrado';
    else if (categoria === 'rosa') categoriaSheet = 'rosa de guadalupe';
    else if (categoria === 'dichos') categoriaSheet = 'como dice el dicho';
    else if (categoria === 'decisiones') categoriaSheet = 'decisiones';
    
    const filtrados = todosLosShows.filter(show => 
      show.categoria === categoriaSheet
    );
    renderizarShows(filtrados, showsGrid);
  }
}

// Eventos del menú
navBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    navBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const categoria = btn.dataset.cat;
    filtrarShows(categoria);
  });
});

// Menú hamburguesa
if (menuToggle) {
  menuToggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });
}

// Cerrar menú al hacer clic en categoría (móvil)
document.querySelectorAll('.nav-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    if (window.innerWidth <= 768) {
      navLinks.classList.remove('open');
    }
  });
});

// Botón Inicio
const btnHome = document.getElementById('btnHome');
if (btnHome) {
  btnHome.addEventListener('click', () => {
    window.location.href = 'https://merencioreyna-sudo.github.io/zona-total-peliculas/';
  });
}

// Cargar datos desde Google Sheets
fetch(SHEET_URL)
  .then(res => res.text())
  .then(csv => {
    const lineas = csv.trim().split('\n').slice(1);
    todosLosShows = [];

    for (let i = 0; i < lineas.length; i++) {
      const linea = lineas[i].trim();
      if (linea === "") continue;

      const partes = linea.split(',');
      if (partes.length < 5) continue;

      const nombre = partes[0]?.trim() || "Sin título";
      const url = partes[1]?.trim() || "";
      const imagen = partes[2]?.trim() || "https://placehold.co/600x400/1f2937/9ca3af?text=Show";
      const categoria = partes[3]?.trim().toLowerCase() || "";
      const reciente = partes[4]?.trim().toLowerCase() === "si";

      if (!url) continue;

      todosLosShows.push({ nombre, url, imagen, categoria, reciente });
    }

    if (todosLosShows.length === 0) {
      console.error("No se encontraron datos en el CSV");
      return;
    }

    // Guardar copia original del orden de Sheets
    todosLosShows = todosLosShows;

    // Mostrar con orden invertido (más nuevos primero)
    filtrarShows('todos');
  })
  .catch(err => console.error('Error cargando datos:', err));

// ========== BUSCADOR ==========
const searchInput = document.getElementById('searchInput');
if (searchInput) {
  function buscarShows() {
    const termino = searchInput.value.trim().toLowerCase();
    if (termino === '') {
      filtrarShows(categoriaActual);
      return;
    }
    const filtrados = todosLosShows.filter(show => 
      show.nombre.toLowerCase().includes(termino) || 
      show.categoria.toLowerCase().includes(termino)
    );
    renderizarShows(filtrados, showsGrid);
  }
  searchInput.addEventListener('input', buscarShows);
}

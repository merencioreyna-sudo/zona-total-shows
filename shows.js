// ========== SHOWS - CON GOOGLE SHEETS ==========

const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTihFmKW5veyJTma82zgM1mNN0zQqH3CyK0IBW-qHPMkNsqWJ9tJGv1PFAgUw58lTDKDzQk6zoaKxf_/pub?gid=0&single=true&output=csv";
const API_URL = "https://script.google.com/macros/s/AKfycbzQ7q4IapanEOduJW5zD9O7JZsfKcnTwi9HT8S3kBQuamcXQRDR8umkiGFDj19LJU05DQ/exec";

const showsGrid = document.getElementById('showsGrid');
const playerOverlay = document.getElementById('playerOverlay');
const videoFrame = document.getElementById('videoFrame');
const closePlayerBtn = document.getElementById('closePlayerBtn');
const menuToggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');
const navBtns = document.querySelectorAll('.nav-btn');

let todosLosShows = [];

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

// Renderizar tarjetas
function renderizarShows(shows, contenedor) {
  if (!shows.length) {
    contenedor.innerHTML = '<p style="text-align:center; color:#6b7280;">No hay contenido disponible</p>';
    return;
  }

  contenedor.innerHTML = shows.map(show => {
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
  if (categoria === 'todos') {
    renderizarShows(todosLosShows, showsGrid);
  } else {
    const filtrados = todosLosShows.filter(show => show.categoria.toLowerCase() === categoria.toLowerCase());
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

// Ordenar shows (más nuevos primero)
const showsOrdenados = [...todosLosShows].reverse();
renderizarShows(showsOrdenados, showsGrid);
  })
  .catch(err => console.error('Error cargando datos:', err));

// ========== BUSCADOR ==========
const searchInput = document.getElementById('searchInput');
if (searchInput) {
  function buscarShows() {
    const termino = searchInput.value.trim().toLowerCase();
    if (termino === '') {
    renderizarShows([...todosLosShows].reverse(), showsGrid);
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

// ========== ADMIN COMPLETO ==========
document.addEventListener('DOMContentLoaded', function() {
  const adminBtn = document.getElementById('adminBtn');
  const adminModal = document.getElementById('adminModal');
  const adminClose = document.querySelector('.admin-close');
  const tabBtns = document.querySelectorAll('.tab-btn');
  const addTab = document.getElementById('addTab');
  const editTab = document.getElementById('editTab');
  const submitAddBtn = document.getElementById('submitAddBtn');
  const showsListDiv = document.getElementById('showsList');

  if (!adminBtn) return;

  // Abrir modal (con contraseña)
adminBtn.addEventListener('click', () => {
  const password = prompt("🔒 Ingrese la contraseña de administrador:");
  if (!password) return;
  
  // Guardar contraseña temporalmente
  sessionStorage.setItem("adminPassword", password);
  
  if (adminModal) adminModal.style.display = 'flex';
  cargarListaShows();
});

  // Cerrar modal
  if (adminClose) {
    adminClose.addEventListener('click', () => {
      if (adminModal) adminModal.style.display = 'none';
    });
  }
  if (adminModal) {
    window.addEventListener('click', (e) => {
      if (e.target === adminModal) adminModal.style.display = 'none';
    });
  }

  // Pestañas
  if (tabBtns.length) {
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const tab = btn.dataset.tab;
        if (tab === 'add') {
          if (addTab) addTab.classList.add('active');
          if (editTab) editTab.classList.remove('active');
        } else {
          if (addTab) addTab.classList.remove('active');
          if (editTab) editTab.classList.add('active');
          cargarListaShows();
        }
      });
    });
  }

  // Agregar show
  if (submitAddBtn) {
    submitAddBtn.addEventListener('click', async () => {
      const nombre = document.getElementById('addNombre')?.value.trim();
      const url = document.getElementById('addUrl')?.value.trim();
      const imagen = document.getElementById('addImagen')?.value.trim();
      const categoria = document.getElementById('addCategoria')?.value;
      const reciente = document.getElementById('addReciente')?.checked;
      const msgDiv = document.getElementById('addMessage');
      
      if (!nombre || !url) {
        if (msgDiv) msgDiv.textContent = '❌ Nombre y URL son obligatorios';
        return;
      }
      
      try {
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'add', nombre, url, imagen, categoria, reciente })
        });
        const result = await response.json();
        if (result.success) {
          if (msgDiv) msgDiv.textContent = '✅ Show agregado. Recarga la página.';
          if (document.getElementById('addNombre')) document.getElementById('addNombre').value = '';
          if (document.getElementById('addUrl')) document.getElementById('addUrl').value = '';
          if (document.getElementById('addImagen')) document.getElementById('addImagen').value = '';
          if (document.getElementById('addReciente')) document.getElementById('addReciente').checked = false;
          cargarListaShows();
        } else {
          if (msgDiv) msgDiv.textContent = '❌ ' + result.message;
        }
      } catch (error) {
        if (msgDiv) msgDiv.textContent = '❌ Error al conectar';
      }
    });
  }

  async function cargarListaShows() {
    try {
      const response = await fetch(SHEET_URL);
      const csv = await response.text();
      const lineas = csv.trim().split('\n').slice(1);
      const shows = [];
      for (let i = 0; i < lineas.length; i++) {
        const partes = lineas[i].split(',');
        if (partes.length >= 5) {
          shows.push({
            nombre: partes[0],
            url: partes[1],
            imagen: partes[2],
            categoria: partes[3],
            reciente: partes[4] === 'si'
          });
        }
      }
      mostrarListaShows(shows);
    } catch (error) {
      if (showsListDiv) showsListDiv.innerHTML = '<p>Error al cargar shows</p>';
    }
  }

  function mostrarListaShows(shows) {
    if (!showsListDiv) return;
    showsListDiv.innerHTML = shows.map((show, index) => `
      <div class="show-list-item" data-nombre="${show.nombre}">
        <span><strong>${show.nombre}</strong><br><small>${show.categoria}</small></span>
        <div>
          <button class="edit-btn" data-nombre="${show.nombre}" data-url="${show.url}" data-imagen="${show.imagen}" data-categoria="${show.categoria}" data-reciente="${show.reciente}">✏️ Editar</button>
          <button class="delete-btn" data-nombre="${show.nombre}">🗑️ Eliminar</button>
        </div>
      </div>
    `).join('');
    
    document.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', () => editarShow(btn.dataset));
    });
    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', () => eliminarShow(btn.dataset.nombre));
    });
  }

  window.editarShow = async function(datos) {
    const nuevoNombre = prompt("Editar nombre:", datos.nombre);
    if (!nuevoNombre) return;
    const nuevaUrl = prompt("Editar URL:", datos.url);
    if (!nuevaUrl) return;
    const nuevaImagen = prompt("Editar imagen:", datos.imagen);
    const nuevaCategoria = prompt("Editar categoría (caso cerrado, rosa, dichos, decisiones):", datos.categoria);
    const nuevoReciente = confirm("¿Marcar como reciente?") ? true : false;
    
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'edit', nombreOriginal: datos.nombre, nombre: nuevoNombre, url: nuevaUrl, imagen: nuevaImagen, categoria: nuevaCategoria, reciente: nuevoReciente })
      });
      const result = await response.json();
      if (result.success) {
        alert("✅ Show actualizado. Recarga la página.");
        cargarListaShows();
      } else {
        alert("❌ Error: " + result.message);
      }
    } catch (error) {
      alert("❌ Error al conectar");
    }
  };

  window.eliminarShow = async function(nombre) {
    if (!confirm(`¿Eliminar "${nombre}" permanentemente?`)) return;
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', nombre: nombre })
      });
      const result = await response.json();
      if (result.success) {
        alert("✅ Show eliminado. Recarga la página.");
        cargarListaShows();
      } else {
        alert("❌ Error: " + result.message);
      }
    } catch (error) {
      alert("❌ Error al conectar");
    }
  };
});

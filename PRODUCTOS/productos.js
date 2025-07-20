// productos.js

const API = "https://marcus-barber.azurewebsites.net/producto";
const SIZE = 12;

let page = 0;
const grid = document.querySelector(".products-grid");
const btnPrev = document.getElementById("btn-anterior");
const btnNext = document.getElementById("btn-siguiente");
const marcaContainer = document.getElementById("marca-container");
const categoriaContainer = document.getElementById("categoria-container");
const searchBox = document.querySelector(".search-bar input");


const cardHTML = p => `
  <div class="product">
    <a href="../DETALLESPRODUCTO/producto.html?id=${p.id}" class="product-link">
      <div class="bordeado">
        <img src="${p.imagenPrincipal}" alt="${p.nombre}">
      </div>
      <h3>${p.nombre}</h3>
      <h4>S/. ${p.precio.toFixed(2)}</h4>
    </a>
  </div>
`;


function getCheckedValues(selector) {
  return Array.from(document.querySelectorAll(selector))
    .filter(chk => chk.checked)
    .map(chk => chk.value);
}


function buildURL() {
  const params = new URLSearchParams({
    page,
    size: SIZE
  });

  // solo un valor de marca y categoría a la vez:
  const marcas = getCheckedValues(".marca-filter");
  const categorias = getCheckedValues(".categoria-filter");
  const nombre = searchBox.value.trim();

  if (marcas.length) params.append("marca", marcas[0]);
  if (categorias.length) params.append("categoria", categorias[0]);
  if (nombre) params.append("nombre", nombre);

  return `${API}?${params.toString()}`;
}


function toggleButtons({ first, last }) {
  btnPrev.style.display = first ? "none" : "inline-block";
  btnNext.style.display = last ? "none" : "inline-block";
}


// --- Carga y renderiza la lista de productos ---
async function cargarProductos() {
  grid.innerHTML = "<p>Cargando…</p>";

  try {
    const res = await fetch(buildURL());
    if (!res.ok) throw new Error("Error al cargar productos");
    const data = await res.json();

    if (!data.content.length) {
      grid.innerHTML = "<p>No se encontraron productos.</p>";
    } else {
      grid.innerHTML = data.content.map(cardHTML).join("");
    }

    toggleButtons(data);
  } catch (err) {
    console.error(err);
    grid.innerHTML = `<p style="color:#ff4d4f">No se pudieron cargar los productos.</p>`;
    btnPrev.style.display = btnNext.style.display = "none";
  }
}


async function loadBrandCheckboxes() {
  try {
    const res = await fetch(`${API}/marcas`);
    const data = await res.json();

    marcaContainer.innerHTML = "";
    data.forEach(m => {
      const lbl = document.createElement("label");
      lbl.innerHTML = `
        <input type="checkbox" class="marca-filter" value="${m.marca}"> ${m.marca}
      `;
      marcaContainer.appendChild(lbl);
    });

    // listener para recargar al cambiar marca
    marcaContainer.querySelectorAll("input.marca-filter").forEach(chk =>
      chk.addEventListener("change", () => {
        page = 0;
        cargarProductos();
      })
    );
  } catch (err) {
    console.error("Error cargando marcas:", err);
  }
}


async function loadCategoryCheckboxes() {
  try {
    const res = await fetch(`${API}/categorias`);
    const data = await res.json();

    categoriaContainer.innerHTML = "";
    data.forEach(c => {
      const lbl = document.createElement("label");
      lbl.innerHTML = `
        <input type="checkbox" class="categoria-filter" value="${c.categoria}"> ${c.categoria}
      `;
      categoriaContainer.appendChild(lbl);
    });

    // listener para recargar al cambiar categoría
    categoriaContainer.querySelectorAll("input.categoria-filter").forEach(chk =>
      chk.addEventListener("change", () => {
        page = 0;
        cargarProductos();
      })
    );
  } catch (err) {
    console.error("Error cargando categorías:", err);
  }
}


// --- Inicialización cuando el DOM está listo ---
document.addEventListener("DOMContentLoaded", () => {
  // primeros cargados de filtros
  loadBrandCheckboxes();
  loadCategoryCheckboxes();

  // carga inicial de productos
  cargarProductos();

  // paginación
  btnNext.addEventListener("click", () => {
    page++;
    cargarProductos();
  });
  btnPrev.addEventListener("click", () => {
    if (page > 0) {
      page--;
      cargarProductos();
    }
  });

  // búsqueda en tiempo real
  searchBox.addEventListener("input", () => {
    page = 0;
    cargarProductos();
  });
});

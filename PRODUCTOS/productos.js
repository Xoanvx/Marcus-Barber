const API = "http://localhost:8080/producto";
const SIZE = 12;

const grid = document.querySelector(".products-grid");
const btnPrev = document.getElementById("btn-anterior");
const btnNext = document.getElementById("btn-siguiente");
const chkMarca = document.querySelectorAll(".marca-filter");
const chkCat = document.querySelectorAll(".categoria-filter");
const searchBox = document.querySelector(".search-bar input");
const searchBtn = document.querySelector(".search-bar button");

let page = 0;

const cardHTML = p => `
  <div class="product">
    <a href="../DETALLESPRODUCTO/producto.html?id=${p.id}" class="product-link">
      <div class="bordeado">
        <img src="${p.imagenPrincipal}" alt="${p.nombre}">
      </div>
      <h3>${p.nombre}</h3>
      <h4>S/. ${p.precio.toFixed(2)}</h4>
    </a>
  </div>`;


function checkedValue(nodeList) {
  for (const n of nodeList) if (n.checked) return n.value;
  return "";
}

function buildURL() {
  const params = new URLSearchParams({ page, size: SIZE });

  const marca = checkedValue(chkMarca);
  const categoria = checkedValue(chkCat);
  const nombre = searchBox.value.trim();

  if (marca) params.append("marca", marca);
  if (categoria) params.append("categoria", categoria);
  if (nombre) params.append("nombre", nombre);

  return `${API}?${params.toString()}`;
}

function toggleButtons({ first, last }) {
  btnPrev.style.display = first ? "none" : "inline-block";
  btnNext.style.display = last ? "none" : "inline-block";
}

async function cargarProductos() {
  grid.innerHTML = "<p>Cargando…</p>";
  try {
    const res = await fetch(buildURL());
    const data = await res.json();

    grid.innerHTML = data.content.map(cardHTML).join("");
    toggleButtons(data);
  } catch (err) {
    console.error("Error cargando productos:", err);
    grid.innerHTML = `<p style="color:#ff4d4f">No se pudieron cargar los productos.</p>`;
    btnPrev.style.display = btnNext.style.display = "none";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  cargarProductos();

  /* paginación */
  btnNext.addEventListener("click", () => { page++; cargarProductos(); });
  btnPrev.addEventListener("click", () => { if (page > 0) { page--; cargarProductos(); } });

  /* filtros de checkboxes */
  [...chkMarca, ...chkCat].forEach(chk =>
    chk.addEventListener("change", () => { page = 0; cargarProductos(); })
  );

  /* búsqueda */
  searchBtn.addEventListener("click", e => { e.preventDefault(); page = 0; cargarProductos(); });
  searchBox.addEventListener("keyup", e => { if (e.key === "Enter") { page = 0; cargarProductos(); } });
});

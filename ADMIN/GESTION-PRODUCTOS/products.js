let products = [];
let currentProduct = null;

let currentPage = 0;
let totalPages = 1;

function apiCall(url, options = {}) {
  return fetch(url, options).then((r) => {
    if (!r.ok) throw new Error("Network error");
    return r.json();
  });
}

function showToast(msg, type = "info") {
  document.querySelectorAll(".toast").forEach((t) => t.remove());
  const toast = Object.assign(document.createElement("div"), {
    className: `toast ${type} show`,
    textContent: msg,
  });
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function handleError(err, ctx) {
  console.error(`Error in ${ctx}:`, err);
  showToast("❌ Ha ocurrido un error", "error");
}

const debounce = (fn, w) => {
  let t;
  return (...a) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...a), w);
  };
};

const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

/* ---------- Inicialización ---------- */

document.addEventListener("DOMContentLoaded", () => {
  Promise.all([loadCategories(), loadProducts()]);
  initializeProductsPage();
});

async function loadCategories() {
  try {
    const token = localStorage.getItem("token");
    const categoriesRes = await apiCall(
      "http://localhost:8080/producto/categorias",
      { headers: token ? { Authorization: `Bearer ${token}` } : {} }
    );
    const categories = categoriesRes.map((c) => c.categoria).filter(Boolean);
    populateCategorySelects(categories);
  } catch (e) {
    handleError(e, "load categories");
  }
}

function populateCategorySelects(cats) {
  const filterSel = document.getElementById("categoryFilter");
  const formSel = document.getElementById("productCategory");

  [filterSel, formSel].forEach((sel, i) => {
    if (!sel) return;
    sel.querySelectorAll("option[data-dyn]").forEach((o) => o.remove());
    cats.forEach((cat) => {
      const opt = document.createElement("option");
      opt.value = cat;
      opt.textContent = capitalize(cat);
      opt.dataset.dyn = "1";
      sel.appendChild(opt);
    });
    if (i === 0) sel.value = ""; // «Todas las categorías»
  });
}

function initializeProductsPage() {
  document.getElementById("addProductBtn")?.addEventListener("click", () => openProductModal());
  document.getElementById("productForm")?.addEventListener("submit", handleProductSubmit);
  document.getElementById("searchInput")?.addEventListener("input", debounce(filterProducts, 300));
  document.getElementById("categoryFilter")?.addEventListener("change", filterProducts);
  document.getElementById("stockFilter")?.addEventListener("change", filterProducts);
  document.getElementById("prevPageBtn")?.addEventListener("click", () => currentPage > 0 && loadProducts(currentPage - 1));
  document.getElementById("nextPageBtn")?.addEventListener("click", () => currentPage < totalPages - 1 && loadProducts(currentPage + 1));

  // Previsualización de imágenes (principal, secundaria, terciaria)
  ["1", "2", "3"].forEach((n) => {
    const fileInput = document.getElementById(`productImage${n}`);
    const preview = document.getElementById(`imagePreview${n}`);
    if (!fileInput || !preview) return;

    fileInput.addEventListener("change", () => {
      const file = fileInput.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (ev) => {
        preview.innerHTML = `<img src="${ev.target.result}" style="width:100%;height:100%;object-fit:cover;border-radius:6px;">`;
      };
      reader.readAsDataURL(file);
    });
  });

  document.querySelector("#productModal .modal-close")?.addEventListener("click", () => closeModal("productModal"));
  document.getElementById("cancelBtn")?.addEventListener("click", () => closeModal("productModal"));
}

async function loadProducts(page = 0) {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      showToast("Token no encontrado", "error");
      window.location.href = "../../LOGIN/login.html";
      return;
    }

    const qs = new URLSearchParams({ page });
    const nombre = document.getElementById("searchInput")?.value.trim();
    const categoria = document.getElementById("categoryFilter")?.value;
    const stock = document.getElementById("stockFilter")?.value;

    if (nombre) qs.append("nombre", nombre);
    if (categoria) qs.append("categoria", categoria);
    if (stock === "bajo" || stock === "sin") qs.append("stock", stock);

    const data = await apiCall(`http://localhost:8080/admin/producto?${qs.toString()}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    currentPage = data.number;
    totalPages = data.totalPages;

    products = (data.content || []).map((p) => ({
      ...p,
      imagen: p.imagenPrincipal || "/placeholder.svg",
    }));

    renderProducts();
    updatePaginationControls();
    window.scrollTo({ top: 0, behavior: "smooth" });
  } catch (e) {
    handleError(e, "load products");
  }
}

function renderProducts() {
  const tbody = document.getElementById("productsTableBody");
  const empty = document.getElementById("emptyState");
  if (!tbody) return;

  if (!products.length) {
    tbody.innerHTML = "";
    empty.style.display = "block";
    return;
  }
  empty.style.display = "none";

  tbody.innerHTML = products
    .map(
      (p) => `
      <tr>
        <td><img src="${p.imagen}" alt="${p.nombre}" style="width:40px;height:40px;border-radius:6px;object-fit:cover;"></td>
        <td>${p.nombre}</td>
        <td>${p.marca}</td>
        <td>${p.categoria}</td>
        <td>${new Intl.NumberFormat("es-ES", { style: "currency", currency: "USD" }).format(p.precio)}</td>
        <td>${p.stock}</td>
        <td>
          <div class="action-buttons">
            <button class="action-btn-sm edit" onclick="editProduct(${p.id})">Editar</button>
            <button class="action-btn-sm delete" onclick="deleteProduct(${p.id})">Eliminar</button>
          </div>
        </td>
      </tr>`
    )
    .join("");
}

function updatePaginationControls() {
  const prevBtn = document.getElementById("prevPageBtn");
  const nextBtn = document.getElementById("nextPageBtn");
  const paginationContainer = document.querySelector(".pagination-controls");

  if (!prevBtn || !nextBtn || !paginationContainer) return;

  prevBtn.style.display = currentPage <= 0 ? "none" : "inline-block";
  nextBtn.style.display = currentPage >= totalPages - 1 ? "none" : "inline-block";
  paginationContainer.style.display = totalPages <= 1 ? "none" : "flex";
}

function filterProducts() {
  loadProducts(0);
}

function openProductModal(prod = null) {
  currentProduct = prod;
  const form = document.getElementById("productForm");

  document.getElementById("modalTitle").textContent = prod
    ? "Editar Producto"
    : "Nuevo Producto";

  form.reset();
  clearErrors(form);

  ["1", "2", "3"].forEach((n) => {
    const preview = document.getElementById(`imagePreview${n}`);
    if (preview) preview.innerHTML = '<span class="upload-text">Seleccionar imagen</span>';
  });

  if (prod) {
    form.productName.value = prod.nombre;
    form.productMarca.value = prod.marca;
    form.productCategory.value = prod.categoria;
    form.productPrice.value = prod.precio;
    form.productStock.value = prod.stock;
    form.productDescription.value = prod.descripcion || "";
    document.getElementById("imagePreview1").innerHTML =
      `<img src="${prod.imagen}" style="width:100%;height:100%;object-fit:cover;border-radius:6px;">`;
  }

  openModal("productModal");
}

function clearErrors(f) {
  f.querySelectorAll(".error-message").forEach((e) => (e.textContent = ""));
}

async function handleProductSubmit(e) {
  e.preventDefault();
  const sBtn = document.getElementById("saveBtn");
  const fd = new FormData(e.target);
  const prod = {
    nombre: fd.get("nombre"),
    marca: fd.get("marca"),
    categoria: fd.get("categoria"),
    precio: +fd.get("precio"),
    stock: +fd.get("stock"),
    descripcion: fd.get("descripcion") || "",
    imagen: "/placeholder.svg", // Aquí deberías cambiarlo si usas Cloudinary
  };
  const errs = validate(prod);
  if (Object.keys(errs).length) return showFormErrors(errs);

  toggleLoading(sBtn, true);
  try {
    if (currentProduct) {
      const i = products.findIndex((p) => p.id === currentProduct.id);
      if (i !== -1) products[i] = { ...products[i], ...prod };
      showToast("Producto actualizado", "success");
    } else {
      products.push({ id: Date.now(), ...prod });
      showToast("Producto creado", "success");
    }
    renderProducts();
    closeModal("productModal");
  } catch (err) {
    handleError(err, "save product");
  } finally {
    toggleLoading(sBtn, false);
  }
}

function validate(p) {
  const e = {};
  if (!p.nombre.trim()) e.nombre = "El nombre es obligatorio";
  if (!p.categoria) e.categoria = "La categoría es obligatoria";
  if (!p.precio || p.precio <= 0) e.precio = "Precio > 0";
  if (p.stock < 0) e.stock = "Stock ≥ 0";
  return e;
}

function showFormErrors(errors) {
  for (const k in errors) {
    const el = document.getElementById(`${k}Error`);
    if (el) el.textContent = errors[k];
  }
}

function toggleLoading(el, load) {
  el.disabled = load;
  el.innerHTML = load
    ? '<span class="spinner"></span> Guardando...'
    : "Guardar";
}

function editProduct(id) {
  const p = products.find((x) => x.id === id);
  if (p) openProductModal(p);
}

function deleteProduct(id) {
  if (!confirm("¿Eliminar este producto?")) return;
  products = products.filter((p) => p.id !== id);
  renderProducts();
  showToast("Producto eliminado", "success");
}

function openModal(id) {
  document.getElementById(id).classList.add("show");
  document.body.style.overflow = "hidden";
}

function closeModal(id) {
  document.getElementById(id).classList.remove("show");
  document.body.style.overflow = "";
}

window.editProduct = editProduct;
window.deleteProduct = deleteProduct;
window.openProductModal = openProductModal;

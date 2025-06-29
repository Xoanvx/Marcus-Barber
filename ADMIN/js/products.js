// Products Management Module

let products = []
let currentProduct = null

// Utility functions
function apiCall(endpoint, options = {}) {
  return fetch(endpoint, options)
    .then((response) => response.json())
    .catch((error) => {
      throw new Error("Network error")
    })
}

function handleError(error, context) {
  console.error(`Error in ${context}:`, error)
  showToast("Ha ocurrido un error", "error")
}

function showToast(message, type) {
  // Remove existing toasts
  const existingToasts = document.querySelectorAll(".toast")
  existingToasts.forEach((toast) => toast.remove())

  const toast = document.createElement("div")
  toast.className = `toast ${type} show`
  toast.textContent = message
  document.body.appendChild(toast)

  setTimeout(() => {
    toast.classList.remove("show")
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast)
      }
    }, 300)
  }, 3000)
}

const CATEGORY_MAPPINGS = {
  CORTES: "Cortes",
  PRODUCTOS: "Productos",
  SERVICIOS: "Servicios",
}

function handleImageUpload(input, previewElement) {
  const file = input.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      previewElement.innerHTML = `<img src="${e.target.result}" alt="Preview" style="width: 100%; height: 100%; object-fit: cover; border-radius: 6px;">`
    }
    reader.readAsDataURL(file)
  }
}

function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

function openModal(modalId) {
  const modal = document.getElementById(modalId)
  if (modal) {
    modal.classList.add("show")
    document.body.style.overflow = "hidden"
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId)
  if (modal) {
    modal.classList.remove("show")
    document.body.style.overflow = ""
  }
}

function clearFormErrors(form) {
  form.querySelectorAll(".error-message").forEach((el) => (el.textContent = ""))
  form.querySelectorAll(".error").forEach((el) => el.classList.remove("error"))
}

function displayFormErrors(errors) {
  for (const field in errors) {
    const errorElement = document.getElementById(`${field}Error`)
    if (errorElement) {
      errorElement.textContent = errors[field]
    }
  }
}

function setLoading(element, loading) {
  element.disabled = loading
  if (loading) {
    element.innerHTML = '<span class="spinner"></span> Cargando...'
  } else {
    element.innerHTML = '<span class="btn-text">Guardar</span>'
  }
}

// Initialize products page
document.addEventListener("DOMContentLoaded", () => {
  loadProducts()
  initializeProductsPage()
})

function initializeProductsPage() {
  // Add product button
  const addProductBtn = document.getElementById("addProductBtn")
  if (addProductBtn) {
    addProductBtn.addEventListener("click", () => {
      openProductModal()
    })
  }

  // Product form
  const productForm = document.getElementById("productForm")
  if (productForm) {
    productForm.addEventListener("submit", handleProductSubmit)
  }

  // Search functionality
  const searchInput = document.getElementById("searchInput")
  if (searchInput) {
    searchInput.addEventListener("input", debounce(filterProducts, 300))
  }

  // Filter functionality
  const categoryFilter = document.getElementById("categoryFilter")
  const stockFilter = document.getElementById("stockFilter")

  if (categoryFilter) {
    categoryFilter.addEventListener("change", filterProducts)
  }

  if (stockFilter) {
    stockFilter.addEventListener("change", filterProducts)
  }

  // Image upload preview
  const productImage = document.getElementById("productImage")
  const imagePreview = document.getElementById("imagePreview")

  if (productImage && imagePreview) {
    productImage.addEventListener("change", (e) => {
      const file = e.target.files[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          imagePreview.innerHTML = `<img src="${e.target.result}" alt="Preview" style="width: 100%; height: 100%; object-fit: cover; border-radius: 6px;">`
        }
        reader.readAsDataURL(file)
      }
    })
  }

  // Modal close handlers
  const closeModalBtn = document.querySelector("#productModal .modal-close")
  const cancelBtn = document.getElementById("cancelBtn")

  if (closeModalBtn) {
    closeModalBtn.addEventListener("click", () => closeModal("productModal"))
  }

  if (cancelBtn) {
    cancelBtn.addEventListener("click", () => closeModal("productModal"))
  }
}

// Load products from API
async function loadProducts() {
  try {
    // Simulate API call - replace with actual API
    products = [
      {
        id: 1,
        nombre: "Corte Clásico",
        categoria: "CORTES",
        precio: 1500,
        stock: 0,
        descripcion: "Corte tradicional de cabello",
        imagen: "/placeholder.svg?height=50&width=50",
      },
      {
        id: 2,
        nombre: "Shampoo Premium",
        categoria: "PRODUCTOS",
        precio: 2500,
        stock: 15,
        descripcion: "Shampoo de alta calidad",
        imagen: "/placeholder.svg?height=50&width=50",
      },
    ]

    renderProducts()
  } catch (error) {
    console.error("Error loading products:", error)
    showToast("Error al cargar productos", "error")
  }
}

function renderProducts() {
  const tbody = document.getElementById("productsTableBody")
  const emptyState = document.getElementById("emptyState")

  if (!tbody) return

  if (products.length === 0) {
    tbody.innerHTML = ""
    if (emptyState) emptyState.style.display = "block"
    return
  }

  if (emptyState) emptyState.style.display = "none"

  tbody.innerHTML = products
    .map(
      (product) => `
    <tr>
      <td>
        <img src="${product.imagen}" alt="${product.nombre}" 
             style="width: 40px; height: 40px; border-radius: 6px; object-fit: cover;">
      </td>
      <td>${product.nombre}</td>
      <td>${product.categoria}</td>
      <td>${formatCurrency(product.precio)}</td>
      <td>${product.stock}</td>
      <td>
        <span class="status-badge ${product.stock > 0 ? "completed" : "cancelled"}">
          ${product.stock > 0 ? "Disponible" : "Sin Stock"}
        </span>
      </td>
      <td>
        <div class="action-buttons">
          <button class="action-btn-sm edit" onclick="editProduct(${product.id})">
            Editar
          </button>
          <button class="action-btn-sm delete" onclick="deleteProduct(${product.id})">
            Eliminar
          </button>
        </div>
      </td>
    </tr>
  `,
    )
    .join("")
}

function filterProducts() {
  const searchTerm = document.getElementById("searchInput")?.value.toLowerCase() || ""
  const categoryFilter = document.getElementById("categoryFilter")?.value || ""
  const stockFilter = document.getElementById("stockFilter")?.value || ""

  const filtered = products.filter((product) => {
    const matchesSearch =
      product.nombre.toLowerCase().includes(searchTerm) || product.descripcion.toLowerCase().includes(searchTerm)
    const matchesCategory = !categoryFilter || product.categoria === categoryFilter
    const matchesStock =
      !stockFilter ||
      (stockFilter === "low" && product.stock > 0 && product.stock <= 5) ||
      (stockFilter === "out" && product.stock === 0)

    return matchesSearch && matchesCategory && matchesStock
  })

  const tbody = document.getElementById("productsTableBody")
  if (tbody) {
    tbody.innerHTML = filtered
      .map(
        (product) => `
      <tr>
        <td>
          <img src="${product.imagen}" alt="${product.nombre}" 
               style="width: 40px; height: 40px; border-radius: 6px; object-fit: cover;">
        </td>
        <td>${product.nombre}</td>
        <td>${product.categoria}</td>
        <td>${formatCurrency(product.precio)}</td>
        <td>${product.stock}</td>
        <td>
          <span class="status-badge ${product.stock > 0 ? "completed" : "cancelled"}">
            ${product.stock > 0 ? "Disponible" : "Sin Stock"}
          </span>
        </td>
        <td>
          <div class="action-buttons">
            <button class="action-btn-sm edit" onclick="editProduct(${product.id})">
              Editar
            </button>
            <button class="action-btn-sm delete" onclick="deleteProduct(${product.id})">
              Eliminar
            </button>
          </div>
        </td>
      </tr>
    `,
      )
      .join("")
  }
}

function openProductModal(product = null) {
  currentProduct = product
  const modal = document.getElementById("productModal")
  const modalTitle = document.getElementById("modalTitle")
  const form = document.getElementById("productForm")

  if (modalTitle) {
    modalTitle.textContent = product ? "Editar Producto" : "Nuevo Producto"
  }

  if (form) {
    form.reset()
    clearFormErrors(form)

    if (product) {
      document.getElementById("productName").value = product.nombre
      document.getElementById("productCategory").value = product.categoria
      document.getElementById("productPrice").value = product.precio
      document.getElementById("productStock").value = product.stock
      document.getElementById("productDescription").value = product.descripcion || ""

      // Show existing image if available
      const imagePreview = document.getElementById("imagePreview")
      if (product.imagen && imagePreview) {
        imagePreview.innerHTML = `<img src="${product.imagen}" alt="Preview" style="width: 100%; height: 100%; object-fit: cover; border-radius: 6px;">`
      }
    } else {
      // Reset image preview for new product
      const imagePreview = document.getElementById("imagePreview")
      if (imagePreview) {
        imagePreview.innerHTML = '<span class="upload-text">Seleccionar imagen</span>'
      }
    }
  }

  openModal("productModal")
}

async function handleProductSubmit(event) {
  event.preventDefault()

  const form = event.target
  const submitBtn = document.getElementById("saveBtn")

  // Get form data
  const formData = new FormData(form)
  const productData = {
    nombre: formData.get("nombre"),
    categoria: formData.get("categoria"),
    precio: Number.parseFloat(formData.get("precio")),
    stock: Number.parseInt(formData.get("stock")),
    descripcion: formData.get("descripcion"),
    imagen: "/placeholder.svg?height=50&width=50", // In real app, upload image
  }

  // Validate form
  const errors = validateProductForm(productData)
  if (Object.keys(errors).length > 0) {
    displayFormErrors(errors)
    return
  }

  setLoading(submitBtn, true)

  try {
    if (currentProduct) {
      // Update existing product
      const index = products.findIndex((p) => p.id === currentProduct.id)
      if (index !== -1) {
        products[index] = { ...products[index], ...productData }
      }
      showToast("Producto actualizado exitosamente", "success")
    } else {
      // Create new product
      const newProduct = {
        id: generateId(),
        ...productData,
      }
      products.push(newProduct)
      showToast("Producto creado exitosamente", "success")
    }

    // Refresh table and close modal
    renderProducts()
    closeModal("productModal")
  } catch (error) {
    handleError(error, "save product")
  } finally {
    setLoading(submitBtn, false)
  }
}

function editProduct(productId) {
  const product = products.find((p) => p.id === productId)
  if (product) {
    openProductModal(product)
  }
}

function deleteProduct(productId) {
  if (confirm("¿Estás seguro de que quieres eliminar este producto?")) {
    products = products.filter((p) => p.id !== productId)
    renderProducts()
    showToast("Producto eliminado exitosamente", "success")
  }
}

// Utility functions specific to products
function getStockIndicator(stock) {
  if (stock === 0) {
    return '<span class="stock-indicator out">Sin stock</span>'
  } else if (stock <= 10) {
    return '<span class="stock-indicator low">Stock bajo</span>'
  }
  return '<span class="stock-indicator normal">En stock</span>'
}

function formatCurrency(amount) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount)
}

function generateId() {
  return Date.now()
}

function validateProductForm(productData) {
  const errors = {}

  if (!productData.nombre || productData.nombre.trim() === "") {
    errors.nombre = "El nombre es obligatorio"
  }

  if (!productData.categoria) {
    errors.categoria = "La categoría es obligatoria"
  }

  if (!productData.precio || productData.precio <= 0) {
    errors.precio = "El precio debe ser mayor a 0"
  }

  if (productData.stock < 0) {
    errors.stock = "El stock no puede ser negativo"
  }

  return errors
}

// Export functions for global access
window.editProduct = editProduct
window.deleteProduct = deleteProduct
window.openProductModal = openProductModal

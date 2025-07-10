// Orders Management Module

let orders = []
const currentOrder = null

// Demo data
const DEMO_ORDERS = [
  {
    id: 1,
    cliente: "Juan Pérez",
    email: "juan@email.com",
    telefono: "+1234567890",
    total: 3500,
    estado: "PENDIENTE",
    fecha: new Date().toISOString(),
    items: [
      { producto: "Corte Clásico", cantidad: 1, precio: 1500 },
      { producto: "Shampoo Premium", cantidad: 1, precio: 2000 },
    ],
  },
  {
    id: 2,
    cliente: "María García",
    email: "maria@email.com",
    telefono: "+0987654321",
    total: 1500,
    estado: "COMPLETADO",
    fecha: new Date(Date.now() - 86400000).toISOString(),
    items: [{ producto: "Corte Clásico", cantidad: 1, precio: 1500 }],
  },
]

// Initialize orders page
document.addEventListener("DOMContentLoaded", () => {
  loadOrders()
  initializeOrdersPage()
})

function initializeOrdersPage() {
  // Search functionality
  const searchInput = document.getElementById("searchInput")
  if (searchInput) {
    searchInput.addEventListener("input", debounce(filterOrders, 300))
  }

  // Filter functionality
  const statusFilter = document.getElementById("statusFilter")
  const dateFilter = document.getElementById("dateFilter")

  if (statusFilter) {
    statusFilter.addEventListener("change", filterOrders)
  }

  if (dateFilter) {
    dateFilter.addEventListener("change", filterOrders)
  }
}

async function loadOrders() {
  try {
    // Use demo data
    orders = DEMO_ORDERS
    renderOrders()
  } catch (error) {
    console.error("Error loading orders:", error)
    showToast("Error al cargar pedidos", "error")
  }
}

function renderOrders() {
  const tbody = document.getElementById("ordersTableBody")
  const emptyState = document.getElementById("emptyState")

  if (!tbody) return

  if (orders.length === 0) {
    tbody.innerHTML = ""
    if (emptyState) emptyState.style.display = "block"
    return
  }

  if (emptyState) emptyState.style.display = "none"

  tbody.innerHTML = orders
    .map(
      (order) => `
    <tr>
      <td>#${order.id}</td>
      <td>${order.cliente}</td>
      <td>${order.email}</td>
      <td>${order.telefono}</td>
      <td>${formatCurrency(order.total)}</td>
      <td>
        <span class="status-badge ${getStatusClass(order.estado)}">
          ${order.estado}
        </span>
      </td>
      <td>${formatDate(order.fecha)}</td>
      <td>
        <div class="action-buttons">
          <button class="action-btn-sm view" onclick="viewOrder(${order.id})">
            Ver
          </button>
        </div>
      </td>
    </tr>
  `,
    )
    .join("")
}

function filterOrders() {
  const searchTerm = document.getElementById("searchInput")?.value.toLowerCase() || ""
  const statusFilter = document.getElementById("statusFilter")?.value || ""
  const dateFilter = document.getElementById("dateFilter")?.value || ""

  const filtered = orders.filter((order) => {
    const matchesSearch =
      order.cliente.toLowerCase().includes(searchTerm) ||
      order.email.toLowerCase().includes(searchTerm) ||
      order.telefono.includes(searchTerm)

    const matchesStatus = !statusFilter || order.estado === statusFilter

    const matchesDate = !dateFilter || order.fecha.startsWith(dateFilter)

    return matchesSearch && matchesStatus && matchesDate
  })

  const tbody = document.getElementById("ordersTableBody")
  if (tbody) {
    tbody.innerHTML = filtered
      .map(
        (order) => `
      <tr>
        <td>#${order.id}</td>
        <td>${order.cliente}</td>
        <td>${order.email}</td>
        <td>${order.telefono}</td>
        <td>${formatCurrency(order.total)}</td>
        <td>
          <span class="status-badge ${getStatusClass(order.estado)}">
            ${order.estado}
          </span>
        </td>
        <td>${formatDate(order.fecha)}</td>
        <td>
          <div class="action-buttons">
            <button class="action-btn-sm view" onclick="viewOrder(${order.id})">
              Ver
            </button>
          </div>
        </td>
      </tr>
    `,
      )
      .join("")
  }
}

function viewOrder(orderId) {
  const order = orders.find((o) => o.id === orderId)
  if (!order) return

  const modal = document.getElementById("orderDetailsModal")
  const content = document.getElementById("orderDetailsContent")

  if (content) {
    content.innerHTML = `
      <div class="order-details-content">
        <div class="order-header">
          <h3>Pedido #${order.id}</h3>
          <span class="status-badge ${getStatusClass(order.estado)}">${order.estado}</span>
        </div>
        
        <div class="order-info">
          <div class="info-section">
            <h4>Información del Cliente</h4>
            <p><strong>Nombre:</strong> ${order.cliente}</p>
            <p><strong>Email:</strong> ${order.email}</p>
            <p><strong>Teléfono:</strong> ${order.telefono}</p>
            <p><strong>Fecha:</strong> ${formatDate(order.fecha)}</p>
          </div>
          
          <div class="info-section">
            <h4>Items del Pedido</h4>
            <div class="order-items">
              ${order.items
                .map(
                  (item) => `
                <div class="order-item">
                  <span>${item.producto}</span>
                  <span>Cantidad: ${item.cantidad}</span>
                  <span>${formatCurrency(item.precio)}</span>
                </div>
              `,
                )
                .join("")}
            </div>
            <div class="order-total">
              <strong>Total: ${formatCurrency(order.total)}</strong>
            </div>
          </div>
        </div>
      </div>
    `
  }

  openModal("orderDetailsModal")
}

function getStatusClass(status) {
  switch (status) {
    case "PENDIENTE":
      return "pending"
    case "PROCESANDO":
      return "processing"
    case "COMPLETADO":
      return "completed"
    case "CANCELADO":
      return "cancelled"
    default:
      return "pending"
  }
}

function formatCurrency(amount) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount)
}

function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString("es-ES")
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

function showToast(message, type) {
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

// Export functions for global access
window.viewOrder = viewOrder

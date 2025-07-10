// Claims Management Module

let claims = []
const currentClaim = null

// Demo data
const DEMO_CLAIMS = [
  {
    id: 1,
    cliente: "Ana López",
    email: "ana@email.com",
    asunto: "Problema con el servicio",
    prioridad: "ALTA",
    estado: "PENDIENTE",
    descripcion: "El corte no quedó como esperaba",
    fecha: new Date().toISOString(),
  },
  {
    id: 2,
    cliente: "Carlos Ruiz",
    email: "carlos@email.com",
    asunto: "Producto defectuoso",
    prioridad: "MEDIA",
    estado: "EN_PROCESO",
    descripcion: "El shampoo llegó dañado",
    fecha: new Date(Date.now() - 86400000).toISOString(),
  },
]

// Initialize claims page
document.addEventListener("DOMContentLoaded", () => {
  loadClaims()
  initializeClaimsPage()
})

function initializeClaimsPage() {
  // Search functionality
  const searchInput = document.getElementById("searchInput")
  if (searchInput) {
    searchInput.addEventListener("input", debounce(filterClaims, 300))
  }

  // Filter functionality
  const statusFilter = document.getElementById("statusFilter")
  const priorityFilter = document.getElementById("priorityFilter")
  const dateFilter = document.getElementById("dateFilter")

  if (statusFilter) {
    statusFilter.addEventListener("change", filterClaims)
  }

  if (priorityFilter) {
    priorityFilter.addEventListener("change", filterClaims)
  }

  if (dateFilter) {
    dateFilter.addEventListener("change", filterClaims)
  }
}

async function loadClaims() {
  try {
    // Use demo data
    claims = DEMO_CLAIMS
    renderClaims()
  } catch (error) {
    console.error("Error loading claims:", error)
    showToast("Error al cargar reclamos", "error")
  }
}

function renderClaims() {
  const tbody = document.getElementById("claimsTableBody")
  const emptyState = document.getElementById("emptyState")

  if (!tbody) return

  if (claims.length === 0) {
    tbody.innerHTML = ""
    if (emptyState) emptyState.style.display = "block"
    return
  }

  if (emptyState) emptyState.style.display = "none"

  tbody.innerHTML = claims
    .map(
      (claim) => `
    <tr>
      <td>#${claim.id}</td>
      <td>${claim.cliente}</td>
      <td>${claim.email}</td>
      <td>${claim.asunto}</td>
      <td>
        <span class="priority-badge ${getPriorityClass(claim.prioridad)}">
          ${getPriorityIcon(claim.prioridad)} ${claim.prioridad}
        </span>
      </td>
      <td>
        <span class="status-badge ${getStatusClass(claim.estado)}">
          ${claim.estado.replace("_", " ")}
        </span>
      </td>
      <td>${formatDate(claim.fecha)}</td>
      <td>
        <div class="action-buttons">
          <button class="action-btn-sm view" onclick="viewClaim(${claim.id})">
            Ver
          </button>
        </div>
      </td>
    </tr>
  `,
    )
    .join("")
}

function filterClaims() {
  const searchTerm = document.getElementById("searchInput")?.value.toLowerCase() || ""
  const statusFilter = document.getElementById("statusFilter")?.value || ""
  const priorityFilter = document.getElementById("priorityFilter")?.value || ""
  const dateFilter = document.getElementById("dateFilter")?.value || ""

  const filtered = claims.filter((claim) => {
    const matchesSearch =
      claim.cliente.toLowerCase().includes(searchTerm) ||
      claim.email.toLowerCase().includes(searchTerm) ||
      claim.asunto.toLowerCase().includes(searchTerm)

    const matchesStatus = !statusFilter || claim.estado === statusFilter
    const matchesPriority = !priorityFilter || claim.prioridad === priorityFilter
    const matchesDate = !dateFilter || claim.fecha.startsWith(dateFilter)

    return matchesSearch && matchesStatus && matchesPriority && matchesDate
  })

  const tbody = document.getElementById("claimsTableBody")
  if (tbody) {
    tbody.innerHTML = filtered
      .map(
        (claim) => `
      <tr>
        <td>#${claim.id}</td>
        <td>${claim.cliente}</td>
        <td>${claim.email}</td>
        <td>${claim.asunto}</td>
        <td>
          <span class="priority-badge ${getPriorityClass(claim.prioridad)}">
            ${getPriorityIcon(claim.prioridad)} ${claim.prioridad}
          </span>
        </td>
        <td>
          <span class="status-badge ${getStatusClass(claim.estado)}">
            ${claim.estado.replace("_", " ")}
          </span>
        </td>
        <td>${formatDate(claim.fecha)}</td>
        <td>
          <div class="action-buttons">
            <button class="action-btn-sm view" onclick="viewClaim(${claim.id})">
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

function viewClaim(claimId) {
  const claim = claims.find((c) => c.id === claimId)
  if (!claim) return

  const modal = document.getElementById("claimModal")
  const modalTitle = document.getElementById("modalTitle")
  const content = document.querySelector("#claimModal .modal-form")

  if (modalTitle) {
    modalTitle.textContent = `Reclamo #${claim.id}`
  }

  if (content) {
    content.innerHTML = `
      <div class="claim-details-content">
        <div class="form-section">
          <h3>Información del Cliente</h3>
          <div class="form-row">
            <div class="form-group">
              <label>Nombre del Cliente</label>
              <input type="text" value="${claim.cliente}" readonly>
            </div>
            <div class="form-group">
              <label>Email</label>
              <input type="email" value="${claim.email}" readonly>
            </div>
          </div>
        </div>
        
        <div class="form-section">
          <h3>Detalles del Reclamo</h3>
          <div class="form-row">
            <div class="form-group">
              <label>Asunto</label>
              <input type="text" value="${claim.asunto}" readonly>
            </div>
            <div class="form-group">
              <label>Prioridad</label>
              <input type="text" value="${claim.prioridad}" readonly>
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label>Estado</label>
              <input type="text" value="${claim.estado.replace("_", " ")}" readonly>
            </div>
            <div class="form-group">
              <label>Fecha</label>
              <input type="text" value="${formatDate(claim.fecha)}" readonly>
            </div>
          </div>
          
          <div class="form-group">
            <label>Descripción</label>
            <textarea rows="4" readonly>${claim.descripcion}</textarea>
          </div>
        </div>
      </div>
      
      <div class="modal-actions">
        <button type="button" class="btn btn-secondary" onclick="closeModal('claimModal')">Cerrar</button>
      </div>
    `
  }

  openModal("claimModal")
}

function getStatusClass(status) {
  switch (status) {
    case "PENDIENTE":
      return "pending"
    case "EN_PROCESO":
      return "processing"
    case "RESUELTO":
      return "completed"
    case "CERRADO":
      return "cancelled"
    default:
      return "pending"
  }
}

function getPriorityClass(priority) {
  switch (priority) {
    case "ALTA":
      return "high"
    case "MEDIA":
      return "medium"
    case "BAJA":
      return "low"
    default:
      return "medium"
  }
}

function getPriorityIcon(priority) {
  switch (priority) {
    case "ALTA":
      return "🔴"
    case "MEDIA":
      return "🟡"
    case "BAJA":
      return "🟢"
    default:
      return "🟡"
  }
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

function closeModal(modalId) {
  const modal = document.getElementById(modalId)
  if (modal) {
    modal.classList.remove("show")
    document.body.style.overflow = ""
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
window.viewClaim = viewClaim
window.closeModal = closeModal

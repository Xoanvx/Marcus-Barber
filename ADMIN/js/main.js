// Main Application Module

// Global state
let currentData = {
  productos: [],
  pedidos: [],
  reclamos: [],
}

// Utility functions
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
  }, 3000) // Assuming CONFIG.TOAST_DURATION is 3000 for demonstration
}

function handleError(error, context) {
  console.error(`Error in ${context}:`, error)
  showToast("Ha ocurrido un error", "error")
}

function apiCall(endpoint, options = {}) {
  return fetch(endpoint, options)
    .then((response) => response.json())
    .catch((error) => {
      throw new Error("Network error")
    })
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId)
  if (modal) {
    modal.classList.remove("show")
    document.body.style.overflow = ""
  }
}

function filterData(data, searchTerm, filters = {}) {
  return data.filter((item) => {
    if (searchTerm) {
      const searchFields = Object.values(item).join(" ").toLowerCase()
      if (!searchFields.includes(searchTerm.toLowerCase())) {
        return false
      }
    }

    for (const [key, value] of Object.entries(filters)) {
      if (value && item[key] !== value) {
        return false
      }
    }

    return true
  })
}

function updateTable(tableBodyId, data, renderFunction) {
  const tbody = document.getElementById(tableBodyId)
  if (tbody) {
    tbody.innerHTML = data.map(renderFunction).join("")
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

function setLoading(element, loading) {
  element.disabled = loading
  element.textContent = loading ? "Cargando..." : element.dataset.originalText || "Guardar"
}

function handleImageUpload(input, previewElement) {
  const file = input.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      previewElement.innerHTML = `<img src="${e.target.result}" alt="Preview">`
    }
    reader.readAsDataURL(file)
  }
}

function getFromStorage(key, defaultValue = null) {
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch {
    return defaultValue
  }
}

function removeFromStorage(key) {
  localStorage.removeItem(key)
}

function setToStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

// Initialize main application
function initializeApp() {
  setupSidebar()
  setupRefreshButton()
  setupMobileMenu()
  setupGlobalKeyboardShortcuts()
  loadInitialData()
}

// Sidebar functionality
function setupSidebar() {
  const sidebar = document.getElementById("sidebar")
  const sidebarToggle = document.getElementById("sidebarToggle")

  if (sidebarToggle) {
    sidebarToggle.addEventListener("click", () => {
      sidebar.classList.toggle("collapsed")
    })
  }

  // Highlight current page
  const currentPage = window.location.pathname.split("/").pop()
  const menuItems = document.querySelectorAll(".menu-item")

  menuItems.forEach((item) => {
    const link = item.querySelector("a")
    if (link && link.getAttribute("href") === currentPage) {
      item.classList.add("active")
    } else {
      item.classList.remove("active")
    }
  })
}

// Refresh button functionality
function setupRefreshButton() {
  const refreshBtn = document.getElementById("refreshBtn")

  if (refreshBtn) {
    refreshBtn.addEventListener("click", async function () {
      this.classList.add("loading")

      try {
        await loadInitialData()
        showToast("Datos actualizados correctamente", "success")
      } catch (error) {
        handleError(error, "refresh data")
      } finally {
        this.classList.remove("loading")
      }
    })
  }
}

// Mobile menu functionality
function setupMobileMenu() {
  const mobileMenuBtn = document.getElementById("mobileMenuBtn")
  const sidebar = document.getElementById("sidebar")

  if (mobileMenuBtn && sidebar) {
    mobileMenuBtn.addEventListener("click", () => {
      sidebar.classList.toggle("open")
    })

    // Close sidebar when clicking outside on mobile
    document.addEventListener("click", (event) => {
      if (window.innerWidth <= 768) {
        if (!sidebar.contains(event.target) && !mobileMenuBtn.contains(event.target)) {
          sidebar.classList.remove("open")
        }
      }
    })

    // Close sidebar on window resize
    window.addEventListener("resize", () => {
      if (window.innerWidth > 768) {
        sidebar.classList.remove("open")
      }
    })
  }
}

// Global keyboard shortcuts
function setupGlobalKeyboardShortcuts() {
  document.addEventListener("keydown", (event) => {
    // Ctrl/Cmd + K for search
    if ((event.ctrlKey || event.metaKey) && event.key === "k") {
      event.preventDefault()
      const searchInput = document.getElementById("searchInput")
      if (searchInput) {
        searchInput.focus()
      }
    }

    // Ctrl/Cmd + N for new item
    if ((event.ctrlKey || event.metaKey) && event.key === "n") {
      event.preventDefault()
      const addBtn = document.querySelector('[id*="add"], [id*="Add"]')
      if (addBtn) {
        addBtn.click()
      }
    }

    // Escape to close modals
    if (event.key === "Escape") {
      const openModal = document.querySelector(".modal.show")
      if (openModal) {
        const closeBtn = openModal.querySelector(".modal-close")
        if (closeBtn) {
          closeBtn.click()
        }
      }
    }

    // Ctrl/Cmd + R for refresh
    if ((event.ctrlKey || event.metaKey) && event.key === "r") {
      const refreshBtn = document.getElementById("refreshBtn")
      if (refreshBtn) {
        event.preventDefault()
        refreshBtn.click()
      }
    }
  })
}

// Load initial data
async function loadInitialData() {
  try {
    const [productos, pedidos, reclamos] = await Promise.all([
      apiCall("/productos"),
      apiCall("/pedidos"),
      apiCall("/reclamos"),
    ])

    currentData = { productos, pedidos, reclamos }

    // Trigger data loaded event
    document.dispatchEvent(
      new CustomEvent("dataLoaded", {
        detail: currentData,
      }),
    )
  } catch (error) {
    handleError(error, "load initial data")
  }
}

// Modal management
function setupModalHandlers() {
  // Close modal when clicking outside
  document.addEventListener("click", (event) => {
    if (event.target.classList.contains("modal")) {
      const modalId = event.target.id
      closeModal(modalId)
    }
  })

  // Close modal with close button
  document.querySelectorAll(".modal-close").forEach((btn) => {
    btn.addEventListener("click", function () {
      const modal = this.closest(".modal")
      if (modal) {
        closeModal(modal.id)
      }
    })
  })

  // Cancel button handlers
  document.querySelectorAll("#cancelBtn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const modal = this.closest(".modal")
      if (modal) {
        closeModal(modal.id)
      }
    })
  })
}

// Initialize everything when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  // Check authentication
  window.auth.checkAuthOnLoad()

  // Initialize common components
  initializeCommonComponents()

  // Set user name if authenticated
  if (window.auth.isAuthenticated()) {
    const user = window.auth.getUser()
    const userNameElements = document.querySelectorAll("#userName")
    userNameElements.forEach((el) => {
      el.textContent = user?.name || "Administrador"
    })

    const sidebarUserNameElements = document.querySelectorAll("#sidebarUserName")
    sidebarUserNameElements.forEach((el) => {
      el.textContent = user?.name || "Administrador"
    })
  }

  initializeApp()
  setupModalHandlers()
})

// Common components initialization
function initializeCommonComponents() {
  // Mobile menu toggle
  const mobileMenuBtn = document.getElementById("mobileMenuBtn")
  const sidebar = document.getElementById("sidebar")

  if (mobileMenuBtn && sidebar) {
    mobileMenuBtn.addEventListener("click", () => {
      sidebar.classList.toggle("open")
    })
  }

  // Sidebar toggle
  const sidebarToggle = document.getElementById("sidebarToggle")
  if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener("click", () => {
      sidebar.classList.toggle("open")
    })
  }

  // Logout button
  const logoutBtn = document.getElementById("logoutBtn")
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      if (confirm("¿Estás seguro de que quieres cerrar sesión?")) {
        window.auth.logout()
      }
    })
  }

  // Refresh button
  const refreshBtn = document.getElementById("refreshBtn")
  if (refreshBtn) {
    refreshBtn.addEventListener("click", () => {
      window.location.reload()
    })
  }

  // Close modals when clicking outside
  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("modal")) {
      closeModal(e.target.id)
    }
  })

  // Close modals with Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      const openModal = document.querySelector(".modal.show")
      if (openModal) {
        closeModal(openModal.id)
      }
    }
  })

  // Close modal buttons
  document.querySelectorAll(".modal-close").forEach((btn) => {
    btn.addEventListener("click", () => {
      const modal = btn.closest(".modal")
      if (modal) {
        closeModal(modal.id)
      }
    })
  })

  // Cancel buttons
  document.querySelectorAll("#cancelBtn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const modal = btn.closest(".modal")
      if (modal) {
        closeModal(modal.id)
      }
    })
  })
}

// Export functions for use in other modules
window.mainApp = {
  currentData,
  showToast,
  handleError,
  closeModal,
}

// Declare CONFIG variable for demonstration purposes
const CONFIG = {
  TOAST_DURATION: 3000,
}

// Declare auth variable for demonstration purposes
window.auth = {
  checkAuthOnLoad: () => {},
  isAuthenticated: () => true,
  getUser: () => ({ name: "John Doe" }),
  logout: () => {},
}

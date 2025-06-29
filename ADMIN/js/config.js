// Configuration settings for Marcus Barber Admin Panel

const CONFIG = {
  // API Configuration
  API_BASE_URL: "http://localhost:8080/api",
  API_TIMEOUT: 10000,

  // Authentication
  AUTH_TOKEN_KEY: "marcus_barber_token",
  AUTH_USER_KEY: "marcus_barber_user",

  // Application Settings
  APP_NAME: "Marcus Barber Admin",
  APP_VERSION: "1.0.0",

  // Pagination
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,

  // File Upload
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ["image/jpeg", "image/png", "image/gif", "image/webp"],

  // Theme
  DEFAULT_THEME: "light",
  THEME_STORAGE_KEY: "marcus_barber_theme",

  // Notifications
  TOAST_DURATION: 3000,

  // Demo Data
  DEMO_MODE: true,

  // Categories
  PRODUCT_CATEGORIES: {
    CORTES: "Cortes",
    PRODUCTOS: "Productos",
    SERVICIOS: "Servicios",
  },

  // Order Status
  ORDER_STATUS: {
    PENDIENTE: "Pendiente",
    PROCESANDO: "Procesando",
    COMPLETADO: "Completado",
    CANCELADO: "Cancelado",
  },

  // Claim Status
  CLAIM_STATUS: {
    PENDIENTE: "Pendiente",
    EN_PROCESO: "En Proceso",
    RESUELTO: "Resuelto",
    CERRADO: "Cerrado",
  },

  // Priority Levels
  PRIORITY_LEVELS: {
    ALTA: "Alta",
    MEDIA: "Media",
    BAJA: "Baja",
  },
}

// Export configuration
if (typeof module !== "undefined" && module.exports) {
  module.exports = CONFIG
} else {
  window.CONFIG = CONFIG
}

// Utility Functions for Marcus Barber Admin Panel

// Configuration Constants
const CONFIG = {
  ALLOWED_IMAGE_TYPES: ["image/jpeg", "image/png", "image/gif"],
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5 MB
}

// Date and Time Utilities
const DateUtils = {
  formatDate(date, format = "dd/mm/yyyy") {
    if (!date) return ""

    const d = new Date(date)
    const day = String(d.getDate()).padStart(2, "0")
    const month = String(d.getMonth() + 1).padStart(2, "0")
    const year = d.getFullYear()

    switch (format) {
      case "dd/mm/yyyy":
        return `${day}/${month}/${year}`
      case "yyyy-mm-dd":
        return `${year}-${month}-${day}`
      case "dd-mm-yyyy":
        return `${day}-${month}-${year}`
      default:
        return d.toLocaleDateString("es-ES")
    }
  },

  formatDateTime(date) {
    if (!date) return ""

    const d = new Date(date)
    return d.toLocaleString("es-ES", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
  },

  getRelativeTime(date) {
    if (!date) return ""

    const now = new Date()
    const diff = now - new Date(date)
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return "Ahora mismo"
    if (minutes < 60) return `hace ${minutes} min`
    if (hours < 24) return `hace ${hours} hora${hours > 1 ? "s" : ""}`
    if (days < 7) return `hace ${days} día${days > 1 ? "s" : ""}`

    return this.formatDate(date)
  },
}

// Currency Utilities
const CurrencyUtils = {
  format(amount, currency = "USD") {
    if (amount === null || amount === undefined) return "$0.00"

    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  },

  parse(value) {
    if (!value) return 0

    // Remove currency symbols and spaces
    const cleaned = value.toString().replace(/[^\d.-]/g, "")
    const parsed = Number.parseFloat(cleaned)

    return isNaN(parsed) ? 0 : parsed
  },
}

// String Utilities
const StringUtils = {
  capitalize(str) {
    if (!str) return ""
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
  },

  truncate(str, length = 50) {
    if (!str) return ""
    if (str.length <= length) return str
    return str.substring(0, length) + "..."
  },

  slugify(str) {
    if (!str) return ""

    return str
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "")
  },

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  },
}

// Validation Utilities
const ValidationUtils = {
  isEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  },

  isPhone(phone) {
    const phoneRegex = /^[+]?[1-9][\d]{0,15}$/
    return phoneRegex.test(phone.replace(/[\s\-$$$$]/g, ""))
  },

  isRequired(value) {
    return value !== null && value !== undefined && value.toString().trim() !== ""
  },

  minLength(value, min) {
    return value && value.toString().length >= min
  },

  maxLength(value, max) {
    return !value || value.toString().length <= max
  },

  isNumber(value) {
    return !isNaN(value) && !isNaN(Number.parseFloat(value))
  },

  isPositive(value) {
    return this.isNumber(value) && Number.parseFloat(value) > 0
  },
}

// File Utilities
const FileUtils = {
  formatSize(bytes) {
    if (bytes === 0) return "0 Bytes"

    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  },

  isValidImageType(file) {
    return CONFIG.ALLOWED_IMAGE_TYPES.includes(file.type)
  },

  isValidSize(file) {
    return file.size <= CONFIG.MAX_FILE_SIZE
  },

  validateImage(file) {
    const errors = []

    if (!this.isValidImageType(file)) {
      errors.push("Tipo de archivo no válido. Solo se permiten imágenes.")
    }

    if (!this.isValidSize(file)) {
      errors.push(`El archivo es muy grande. Máximo ${this.formatSize(CONFIG.MAX_FILE_SIZE)}.`)
    }

    return errors
  },
}

// Array Utilities
const ArrayUtils = {
  sortBy(array, key, direction = "asc") {
    return [...array].sort((a, b) => {
      const aVal = a[key]
      const bVal = b[key]

      if (aVal < bVal) return direction === "asc" ? -1 : 1
      if (aVal > bVal) return direction === "asc" ? 1 : -1
      return 0
    })
  },

  filterBy(array, filters) {
    return array.filter((item) => {
      return Object.entries(filters).every(([key, value]) => {
        if (!value) return true

        const itemValue = item[key]
        if (typeof itemValue === "string") {
          return itemValue.toLowerCase().includes(value.toLowerCase())
        }

        return itemValue === value
      })
    })
  },

  groupBy(array, key) {
    return array.reduce((groups, item) => {
      const group = item[key]
      groups[group] = groups[group] || []
      groups[group].push(item)
      return groups
    }, {})
  },

  unique(array, key) {
    if (!key) return [...new Set(array)]

    const seen = new Set()
    return array.filter((item) => {
      const value = item[key]
      if (seen.has(value)) return false
      seen.add(value)
      return true
    })
  },
}

// DOM Utilities
const DOMUtils = {
  createElement(tag, attributes = {}, children = []) {
    const element = document.createElement(tag)

    Object.entries(attributes).forEach(([key, value]) => {
      if (key === "className") {
        element.className = value
      } else if (key === "innerHTML") {
        element.innerHTML = value
      } else {
        element.setAttribute(key, value)
      }
    })

    children.forEach((child) => {
      if (typeof child === "string") {
        element.appendChild(document.createTextNode(child))
      } else {
        element.appendChild(child)
      }
    })

    return element
  },

  show(element) {
    if (element) element.style.display = ""
  },

  hide(element) {
    if (element) element.style.display = "none"
  },

  toggle(element) {
    if (!element) return

    if (element.style.display === "none") {
      this.show(element)
    } else {
      this.hide(element)
    }
  },

  addClass(element, className) {
    if (element) element.classList.add(className)
  },

  removeClass(element, className) {
    if (element) element.classList.remove(className)
  },

  toggleClass(element, className) {
    if (element) element.classList.toggle(className)
  },
}

// Storage Utilities
const StorageUtils = {
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value))
      return true
    } catch (error) {
      console.error("Error saving to localStorage:", error)
      return false
    }
  },

  get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue
    } catch (error) {
      console.error("Error reading from localStorage:", error)
      return defaultValue
    }
  },

  remove(key) {
    try {
      localStorage.removeItem(key)
      return true
    } catch (error) {
      console.error("Error removing from localStorage:", error)
      return false
    }
  },

  clear() {
    try {
      localStorage.clear()
      return true
    } catch (error) {
      console.error("Error clearing localStorage:", error)
      return false
    }
  },
}

// Export utilities
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    DateUtils,
    CurrencyUtils,
    StringUtils,
    ValidationUtils,
    FileUtils,
    ArrayUtils,
    DOMUtils,
    StorageUtils,
  }
} else {
  window.DateUtils = DateUtils
  window.CurrencyUtils = CurrencyUtils
  window.StringUtils = StringUtils
  window.ValidationUtils = ValidationUtils
  window.FileUtils = FileUtils
  window.ArrayUtils = ArrayUtils
  window.DOMUtils = DOMUtils
  window.StorageUtils = StorageUtils
}

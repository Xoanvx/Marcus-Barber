// Authentication Module for Marcus Barber Admin Panel

const CONFIG = {
  AUTH_TOKEN_KEY: "auth_token",
  AUTH_USER_KEY: "auth_user",
  DEMO_MODE: true,
  API_BASE_URL: "https://api.example.com",
}

const StorageUtils = {
  get: (key) => localStorage.getItem(key),
  set: (key, value) => localStorage.setItem(key, JSON.stringify(value)),
  remove: (key) => localStorage.removeItem(key),
}

class AuthManager {
  constructor() {
    this.tokenKey = CONFIG.AUTH_TOKEN_KEY
    this.userKey = CONFIG.AUTH_USER_KEY
    this.currentUser = null
    this.token = null

    this.init()
  }

  init() {
    // Load stored authentication data
    this.token = StorageUtils.get(this.tokenKey)
    this.currentUser = JSON.parse(StorageUtils.get(this.userKey))

    // Set up automatic token refresh
    this.setupTokenRefresh()
  }

  async login(credentials) {
    try {
      // In demo mode, use mock authentication
      if (CONFIG.DEMO_MODE) {
        return this.mockLogin(credentials)
      }

      // Real API call
      const response = await fetch(`${CONFIG.API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      })

      if (!response.ok) {
        throw new Error("Credenciales inválidas")
      }

      const data = await response.json()

      // Store authentication data
      this.token = data.token
      this.currentUser = data.user

      StorageUtils.set(this.tokenKey, this.token)
      StorageUtils.set(this.userKey, JSON.stringify(this.currentUser))

      return {
        success: true,
        user: this.currentUser,
        token: this.token,
      }
    } catch (error) {
      console.error("Login error:", error)
      return {
        success: false,
        error: error.message || "Error al iniciar sesión",
      }
    }
  }

  mockLogin(credentials) {
    // Mock authentication for demo
    const validCredentials = {
      email: "admin@marcusbarber.com",
      password: "admin123",
    }

    if (credentials.email === validCredentials.email && credentials.password === validCredentials.password) {
      this.currentUser = {
        id: 1,
        name: "Administrador",
        email: "admin@marcusbarber.com",
        role: "admin",
      }

      this.token = "mock-jwt-token-" + Date.now()

      StorageUtils.set(this.tokenKey, this.token)
      StorageUtils.set(this.userKey, JSON.stringify(this.currentUser))

      return {
        success: true,
        user: this.currentUser,
        token: this.token,
      }
    }

    return {
      success: false,
      error: "Credenciales inválidas",
    }
  }

  logout() {
    // Clear stored data
    StorageUtils.remove(this.tokenKey)
    StorageUtils.remove(this.userKey)

    this.token = null
    this.currentUser = null

    // Redirect to login
    window.location.href = "index.html"
  }

  isAuthenticated() {
    return !!(this.token && this.currentUser)
  }

  getUser() {
    return this.currentUser
  }

  getToken() {
    return this.token
  }

  checkAuthOnLoad() {
    const currentPage = window.location.pathname.split("/").pop()
    const isLoginPage = currentPage === "index.html" || currentPage === ""

    if (!this.isAuthenticated() && !isLoginPage) {
      // Redirect to login if not authenticated
      window.location.href = "index.html"
      return false
    }

    if (this.isAuthenticated() && isLoginPage) {
      // Redirect to dashboard if already authenticated
      window.location.href = "dashboard.html"
      return false
    }

    return true
  }

  setupTokenRefresh() {
    // In a real app, you would implement token refresh logic here
    // For demo purposes, we'll just check if token exists
    setInterval(() => {
      if (this.token && !this.isTokenValid()) {
        this.logout()
      }
    }, 60000) // Check every minute
  }

  isTokenValid() {
    // In demo mode, always return true if token exists
    if (CONFIG.DEMO_MODE) {
      return !!this.token
    }

    // In real implementation, you would validate the JWT token
    // Check expiration, signature, etc.
    return !!this.token
  }

  async refreshToken() {
    try {
      if (CONFIG.DEMO_MODE) {
        // In demo mode, just generate a new mock token
        this.token = "mock-jwt-token-" + Date.now()
        StorageUtils.set(this.tokenKey, this.token)
        return true
      }

      const response = await fetch(`${CONFIG.API_BASE_URL}/auth/refresh`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Token refresh failed")
      }

      const data = await response.json()
      this.token = data.token
      StorageUtils.set(this.tokenKey, this.token)

      return true
    } catch (error) {
      console.error("Token refresh error:", error)
      this.logout()
      return false
    }
  }

  getAuthHeaders() {
    return {
      Authorization: `Bearer ${this.token}`,
      "Content-Type": "application/json",
    }
  }

  async makeAuthenticatedRequest(url, options = {}) {
    if (!this.isAuthenticated()) {
      throw new Error("Not authenticated")
    }

    const authOptions = {
      ...options,
      headers: {
        ...this.getAuthHeaders(),
        ...options.headers,
      },
    }

    try {
      const response = await fetch(url, authOptions)

      if (response.status === 401) {
        // Token expired, try to refresh
        const refreshed = await this.refreshToken()
        if (refreshed) {
          // Retry the request with new token
          authOptions.headers = {
            ...this.getAuthHeaders(),
            ...options.headers,
          }
          return fetch(url, authOptions)
        } else {
          throw new Error("Authentication failed")
        }
      }

      return response
    } catch (error) {
      console.error("Authenticated request error:", error)
      throw error
    }
  }
}

// Create global auth instance
const auth = new AuthManager()

// Export for use in other modules
if (typeof module !== "undefined" && module.exports) {
  module.exports = AuthManager
} else {
  window.auth = auth
  window.AuthManager = AuthManager
}

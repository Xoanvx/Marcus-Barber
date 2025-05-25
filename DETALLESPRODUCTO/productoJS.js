// Funcionalidad para cambiar imagen principal
const thumbnails = document.querySelectorAll(".thumbnail");
const mainImage = document.getElementById("mainImage");

thumbnails.forEach((thumbnail) => {
  thumbnail.addEventListener("click", function () {
    // Remover clase active de todos los thumbnails
    thumbnails.forEach((t) => t.classList.remove("active"));
    // Agregar clase active al thumbnail clickeado
    this.classList.add("active");
    // Cambiar imagen principal
    const newSrc = this.querySelector("img").src;
    mainImage.src = newSrc;
  });
});

// Funcionalidad para cantidad
const quantityInput = document.querySelector(".quantity-input");
const minusBtn = document.querySelector(".quantity-btn:first-child");
const plusBtn = document.querySelector(".quantity-btn:last-child");

minusBtn.addEventListener("click", function () {
  let currentValue = parseInt(quantityInput.value);
  if (currentValue > 1) {
    quantityInput.value = currentValue - 1;
  }
});

plusBtn.addEventListener("click", function () {
  let currentValue = parseInt(quantityInput.value);
  quantityInput.value = currentValue + 1;
});

// Funcionalidad para tabs
const tabButtons = document.querySelectorAll(".tab-button");

tabButtons.forEach((button) => {
  button.addEventListener("click", function () {
    tabButtons.forEach((btn) => btn.classList.remove("active"));
    this.classList.add("active");
  });
});

//PARTE 2

//PARTE 2 - Sistema de carrito mejorado

// Sistema de carrito flotante
class FloatingCart {
  constructor() {
    this.cart = JSON.parse(localStorage.getItem("barbershop_cart") || "{}");
    this.floatingCart = document.getElementById("floating-cart");
    this.cartCount = document.getElementById("cart-count");
    this.updateCartDisplay();
    this.bindEvents();
  }

  bindEvents() {
    // Botón agregar al carrito
    const addToCartBtn = document.querySelector(".btn-primary");
    if (addToCartBtn) {
      addToCartBtn.addEventListener("click", () => this.addToCart());
    }

    // Click en carrito flotante
    this.floatingCart.addEventListener("click", () => {
      window.location.href = "../PAGOS/pagos.html";
    });
  }

  // Función genérica para extraer datos del producto actual
  extractProductData() {
    // Generar ID único basado en el título del producto
    const productTitle = document.querySelector(".product-title").textContent.trim();
    const productId = this.generateProductId(productTitle);
    
    // Extraer precio (remover "S/ " y convertir a número)
    const priceText = document.querySelector(".product-price").textContent.trim();
    const price = parseFloat(priceText.replace("S/", "").replace(",", "").trim());
    
    // Extraer imagen principal
    const image = document.querySelector("#mainImage").src;
    
    return {
      id: productId,
      name: productTitle,
      price: price,
      image: image
    };
  }

  // Generar ID único para el producto
  generateProductId(title) {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '') // Remover caracteres especiales
      .replace(/\s+/g, '-') // Reemplazar espacios con guiones
      .substring(0, 50); // Limitar longitud
  }

  addToCart() {
    const quantity = parseInt(document.querySelector(".quantity-input").value);
    const product = this.extractProductData();

    // Validar que se extrajo correctamente
    if (!product.name || !product.price || !product.image) {
      alert("Error al agregar el producto. Inténtalo de nuevo.");
      return;
    }

    if (this.cart[product.id]) {
      this.cart[product.id].quantity += quantity;
    } else {
      this.cart[product.id] = { ...product, quantity };
    }

    localStorage.setItem("barbershop_cart", JSON.stringify(this.cart));
    this.updateCartDisplay();
    this.showAddedNotification(product.name);
  }

  updateCartDisplay() {
    const totalItems = Object.values(this.cart).reduce(
      (sum, item) => sum + item.quantity,
      0
    );

    if (totalItems > 0) {
      this.floatingCart.classList.remove("hidden");
      this.cartCount.textContent = totalItems;
    } else {
      this.floatingCart.classList.add("hidden");
    }
  }

  showAddedNotification(productName) {
    // Animación del carrito
    this.floatingCart.style.animation = "bounce 0.6s ease";
    
    // Mostrar notificación
    alert(`✅ "${productName}" agregado al carrito`);
    
    setTimeout(() => {
      this.floatingCart.style.animation = "";
    }, 600);
  }
}

// Inicializar cuando la página cargue
document.addEventListener("DOMContentLoaded", () => {
  new FloatingCart();
});
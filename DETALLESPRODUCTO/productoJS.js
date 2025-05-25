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

  addToCart() {
    const quantity = parseInt(document.querySelector(".quantity-input").value);
    const product = {
      id: "gel-afeitar-dorsh",
      name: "GEL DE AFEITAR 1000ml S12 VERDANT SHIELD DORSH",
      price: 23.0,
      image:
        "https://sanbarberperu.com/wp-content/uploads/2025/02/WhatsApp-Image-2025-01-29-at-5.13.09-PM-1.jpeg",
    };

    if (this.cart[product.id]) {
      this.cart[product.id].quantity += quantity;
    } else {
      this.cart[product.id] = { ...product, quantity };
    }

    localStorage.setItem("barbershop_cart", JSON.stringify(this.cart));
    this.updateCartDisplay();
    this.showAddedNotification();
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

  showAddedNotification() {
    this.floatingCart.style.animation = "bounce 0.6s ease";
    setTimeout(() => {
      this.floatingCart.style.animation = "";
    }, 600);
  }
}

// Inicializar cuando la página cargue
document.addEventListener("DOMContentLoaded", () => {
  new FloatingCart();
});

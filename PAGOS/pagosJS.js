// Variables globales
let isFormValid = false;
let cartManager;

class CartManager {
  constructor() {
    this.cart = JSON.parse(localStorage.getItem("barbershop_cart") || "{}");
    this.floatingCart = document.getElementById("floating-cart");
    this.cartCount = document.getElementById("cart-count");
    this.cartItemsContainer = document.getElementById("cart-items-container");
    this.subtotalElement = document.getElementById("subtotal");
    this.totalElement = document.getElementById("total");
    this.checkoutBtn = document.getElementById("checkout-btn");

    this.init();
  }

  init() {
    this.renderCart();
    this.updateFloatingCart();
    this.bindEvents();
  }

  bindEvents() {
    this.floatingCart.addEventListener("click", () => {
      window.location.reload();
    });
  }

  renderCart() {
    const cartItems = Object.values(this.cart);

    if (cartItems.length === 0) {
      this.showEmptyCart();
      return;
    }

    this.cartItemsContainer.innerHTML = cartItems
      .map(
        (item) => `
                    <div class="cart-item" data-id="${item.id}">
                        <img src="${item.image}" alt="${
          item.name
        }" class="item-image">
                        <div class="item-info">
                            <div class="item-name">${item.name}</div>
                            <div class="item-price">S/ ${item.price.toFixed(
                              2
                            )}</div>
                            <div class="quantity-controls">
                                <button class="quantity-btn decrease-btn" onclick="cartManager.updateQuantity('${
                                  item.id
                                }', -1)">
                                    <i class="fas fa-minus"></i>
                                </button>
                                <span class="quantity-display">${
                                  item.quantity
                                }</span>
                                <button class="quantity-btn increase-btn" onclick="cartManager.updateQuantity('${
                                  item.id
                                }', 1)">
                                    <i class="fas fa-plus"></i>
                                </button>
                            </div>
                            <button class="remove-btn" onclick="cartManager.removeItem('${
                              item.id
                            }')">
                                <i class="fas fa-trash"></i> Eliminar
                            </button>
                        </div>
                    </div>
                `
      )
      .join("");

    this.updateSummary();
  }

  showEmptyCart() {
    this.cartItemsContainer.innerHTML = `
                    <div class="empty-cart">
                        <i class="fas fa-shopping-cart"></i>
                        <h3>Tu carrito está vacío</h3>
                        <p>Agrega algunos productos increíbles para comenzar</p>
                        <a href="../PRODUCTOS/productos.html" class="continue-shopping-btn">
                            Continuar Comprando
                        </a>
                    </div>
                `;

    this.subtotalElement.textContent = "S/ 0.00";
    this.totalElement.textContent = "S/ 0.00";
    this.checkoutBtn.disabled = true;
  }

  updateQuantity(itemId, change) {
    if (this.cart[itemId]) {
      this.cart[itemId].quantity += change;

      if (this.cart[itemId].quantity <= 0) {
        delete this.cart[itemId];
      }

      this.saveCart();
      this.renderCart();
      this.updateFloatingCart();
    }
  }

  removeItem(itemId) {
    if (confirm("¿Estás seguro de que quieres eliminar este producto?")) {
      delete this.cart[itemId];
      this.saveCart();
      this.renderCart();
      this.updateFloatingCart();
    }
  }

  updateSummary() {
    const subtotal = Object.values(this.cart).reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    this.subtotalElement.textContent = `S/ ${subtotal.toFixed(2)}`;
    this.totalElement.textContent = `S/ ${subtotal.toFixed(2)}`;

    // Actualizar estado del botón
    updateCheckoutButton();
  }

  updateFloatingCart() {
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

  saveCart() {
    localStorage.setItem("barbershop_cart", JSON.stringify(this.cart));
  }
}

// Funciones de validación y pago
function selectPaymentMethod(element, type) {
  document
    .querySelectorAll(".payment-method")
    .forEach((method) => method.classList.remove("selected"));
  element.classList.add("selected");
  element.querySelector('input[type="radio"]').checked = true;

  const cardForm = document.getElementById("card-form");
  const qrSection = document.getElementById("qr-section");
  const selectedValue = element.querySelector('input[type="radio"]').value;

  if (type === "card") {
    cardForm.classList.remove("hidden");
    qrSection.classList.add("hidden");
    hideAllQRCodes();
    validateForm();
  } else if (type === "digital") {
    cardForm.classList.add("hidden");
    qrSection.classList.remove("hidden");
    showQRCode(selectedValue);
    isFormValid = true;
    updateCheckoutButton();
  }
}

function showQRCode(method) {
  hideAllQRCodes();
  const qrCode = document.getElementById(`${method}-qr`);
  if (qrCode) {
    qrCode.classList.remove("hidden");
  }
}

function hideAllQRCodes() {
  document.querySelectorAll(".qr-code").forEach((qr) => {
    qr.classList.add("hidden");
  });
}

function validateForm() {
  const cardNumber = document.getElementById("card-number").value;
  const cardExpiry = document.getElementById("card-expiry").value;
  const cardCVV = document.getElementById("card-cvv").value;
  const cardName = document.getElementById("card-name").value;

  const isNumberValid = validateCardNumber(cardNumber);
  const isExpiryValid = validateExpiry(cardExpiry);
  const isCVVValid = validateCVV(cardCVV);
  const isNameValid = cardName.trim().length >= 2;

  updateFieldValidation("card-number", isNumberValid);
  updateFieldValidation("card-expiry", isExpiryValid);
  updateFieldValidation("card-cvv", isCVVValid);
  updateFieldValidation("card-name", isNameValid);

  isFormValid = isNumberValid && isExpiryValid && isCVVValid && isNameValid;
  updateCheckoutButton();
}

function validateCardNumber(number) {
  const cleaned = number.replace(/\s/g, "");
  return cleaned.length >= 13 && cleaned.length <= 19 && /^\d+$/.test(cleaned);
}

function validateExpiry(expiry) {
  const regex = /^(0[1-9]|1[0-2])\/\d{2}$/;
  if (!regex.test(expiry)) return false;

  const [month, year] = expiry.split("/");
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear() % 100;
  const currentMonth = currentDate.getMonth() + 1;

  const cardYear = parseInt(year);
  const cardMonth = parseInt(month);

  if (cardYear < currentYear) return false;
  if (cardYear === currentYear && cardMonth < currentMonth) return false;

  return true;
}

function validateCVV(cvv) {
  return cvv.length >= 3 && cvv.length <= 4 && /^\d+$/.test(cvv);
}

function updateFieldValidation(fieldId, isValid) {
  const field = document.getElementById(fieldId);
  field.classList.remove("error", "valid");

  if (field.value.trim() !== "") {
    field.classList.add(isValid ? "valid" : "error");
  }
}

function updateCheckoutButton() {
  const checkoutBtn = document.getElementById("checkout-btn");
  const cartHasItems = cartManager && Object.keys(cartManager.cart).length > 0;

  if (cartHasItems && isFormValid) {
    checkoutBtn.disabled = false;
    checkoutBtn.style.opacity = "1";
  } else {
    checkoutBtn.disabled = true;
    checkoutBtn.style.opacity = "0.6";
  }
}

function processPayment() {
  const selectedMethod = document.querySelector(
    'input[name="payment"]:checked'
  );
  const total = document.getElementById("total").textContent;

  if (
    selectedMethod &&
    isFormValid &&
    !document.getElementById("checkout-btn").disabled
  ) {
    const loadingBtn = document.getElementById("checkout-btn");
    loadingBtn.innerHTML =
      '<i class="fas fa-spinner fa-spin"></i> Procesando...';
    loadingBtn.disabled = true;

    setTimeout(() => {
      let paymentMethodName = "";
      if (selectedMethod.value === "card") {
        paymentMethodName = "Tarjeta de Crédito/Débito";
      } else {
        paymentMethodName = selectedMethod.value.toUpperCase();
      }

      alert(
        `Pago realizado con éxito con ${paymentMethodName} por un total de ${total}`
      );

      localStorage.removeItem("barbershop_cart");
      cartManager.cart = {};
      cartManager.renderCart();
      cartManager.updateFloatingCart();

      loadingBtn.innerHTML = '<i class="fas fa-lock"></i> Proceder al Pago';

      // Limpiar formulario
      document.getElementById("card-number").value = "";
      document.getElementById("card-expiry").value = "";
      document.getElementById("card-cvv").value = "";
      document.getElementById("card-name").value = "";

      // Remover clases de validación
      document.querySelectorAll(".form-group input").forEach((input) => {
        input.classList.remove("valid", "error");
      });

      isFormValid = false;
      updateCheckoutButton();
    }, 2000);
  } else {
    alert(
      "Por favor, completa todos los campos del formulario o selecciona un método de pago válido."
    );
  }
}

// Inicialización cuando la página carga
document.addEventListener("DOMContentLoaded", function () {
  // Inicializar CartManager
  cartManager = new CartManager();

  // Inicializar validación
  isFormValid = false;
  updateCheckoutButton();

  // Event listeners para el formulario
  const cardNumberInput = document.getElementById("card-number");
  const cardExpiryInput = document.getElementById("card-expiry");
  const cardCVVInput = document.getElementById("card-cvv");
  const cardNameInput = document.getElementById("card-name");

  // Formateo automático del número de tarjeta
  cardNumberInput.addEventListener("input", function (e) {
    let value = e.target.value.replace(/\s/g, "");
    let formattedValue = value.replace(/(.{4})/g, "$1 ").trim();
    e.target.value = formattedValue;

    // Detectar tipo de tarjeta
    const visaIcon = document.querySelector(".fa-cc-visa");
    const mastercardIcon = document.querySelector(".fa-cc-mastercard");
    const amexIcon = document.querySelector(".fa-cc-amex");

    visaIcon.classList.remove("active");
    mastercardIcon.classList.remove("active");
    amexIcon.classList.remove("active");

    if (value.startsWith("4")) {
      visaIcon.classList.add("active");
    } else if (value.startsWith("5") || value.startsWith("2")) {
      mastercardIcon.classList.add("active");
    } else if (value.startsWith("3")) {
      amexIcon.classList.add("active");
    }

    validateForm();
  });

  // Formateo de fecha de vencimiento
  cardExpiryInput.addEventListener("input", function (e) {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length >= 2) {
      value = value.substring(0, 2) + "/" + value.substring(2, 4);
    }
    e.target.value = value;
    validateForm();
  });

  // Validación de CVV
  cardCVVInput.addEventListener("input", function (e) {
    e.target.value = e.target.value.replace(/\D/g, "");
    validateForm();
  });

  // Validación de nombre
  cardNameInput.addEventListener("input", function (e) {
    e.target.value = e.target.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, "");
    validateForm();
  });
});

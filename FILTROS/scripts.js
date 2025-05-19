document.getElementById('search').addEventListener('input', filterProducts);

const categoryCheckboxes = document.querySelectorAll('.category-filter');
categoryCheckboxes.forEach(checkbox => {
  checkbox.addEventListener('change', filterProducts);
});

function filterProducts() {
  const searchQuery = document.getElementById('search').value.toLowerCase();
  const selectedCategories = [];
  
  // Obtener categorías seleccionadas
  categoryCheckboxes.forEach(checkbox => {
    if (checkbox.checked) {
      selectedCategories.push(checkbox.value);
    }
  });

  const products = document.querySelectorAll('.product');
  products.forEach(product => {
    const title = product.querySelector('h3').textContent.toLowerCase();
    const productCategory = product.getAttribute('data-category');

    const matchesSearch = title.includes(searchQuery);
    const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(productCategory);

    if (matchesSearch && matchesCategory) {
      product.style.display = 'block';
    } else {
      product.style.display = 'none';
    }
  });
}

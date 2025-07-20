document.addEventListener("DOMContentLoaded", () => {

    const grid = document.querySelector(".products-grid");

    grid.innerHTML = "<p>Cargando productos...</p>";

    fetch("https://marcus-barber.azurewebsites.net/producto/top")
        .then(res => res.ok ? res.json() : res.json().then(err => Promise.reject(err)))
        .then(productos => {

            grid.innerHTML = "";
            if (!Array.isArray(productos) || !productos.length) {
                grid.innerHTML = "<p>No hay productos para mostrar.</p>";
                return;
            }

            productos.forEach(p => {
                const card = document.createElement("div");
                card.className = "product";
                card.dataset.marca = (p.marca || "").toLowerCase();
                card.dataset.category = (p.categoria || "").toLowerCase();

                card.innerHTML = `
                <a href="../DETALLESPRODUCTO/producto.html?id=${p.id}" class="product-link">
                <div class="bordeado">
                    <img src="${p.imagenPrincipal}" alt="${p.nombre}">
                </div>
                <h3>${p.nombre}</h3>
                <h4>S/. ${Number(p.precio).toFixed(2)}</h4>
                </a>
                `;

                grid.appendChild(card);
            });

        })
        .catch(err => {
            console.error(err);
            grid.innerHTML = `<p style="color:#ff4d4f">No se pudieron cargar los productos.</p>`;
        });
}); document.addEventListener("DOMContentLoaded", () => {

    const grid = document.querySelector(".products-grid");

    grid.innerHTML = "<p>Cargando productos...</p>";

    fetch("https://marcus-barber.azurewebsites.net/producto/top")
        .then(res => res.ok ? res.json() : res.json().then(err => Promise.reject(err)))
        .then(productos => {

            grid.innerHTML = "";
            if (!Array.isArray(productos) || !productos.length) {
                grid.innerHTML = "<p>No hay productos para mostrar.</p>";
                return;
            }

            productos.forEach(p => {
                const card = document.createElement("div");
                card.className = "product";
                card.dataset.marca = (p.marca || "").toLowerCase();
                card.dataset.category = (p.categoria || "").toLowerCase();

                card.innerHTML = `
                <a href="../DETALLESPRODUCTO/producto.html?id=${p.id}" class="product-link">
                <div class="bordeado">
                    <img src="${p.imagenPrincipal}" alt="${p.nombre}">
                </div>
                <h3>${p.nombre}</h3>
                <h4>S/. ${Number(p.precio).toFixed(2)}</h4>
                </a>
                `;

                grid.appendChild(card);
            });

        })
        .catch(err => {
            console.error(err);
            grid.innerHTML = `<p style="color:#ff4d4f">No se pudieron cargar los productos.</p>`;
        });
});
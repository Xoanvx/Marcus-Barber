document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get("id");
    if (!productId) {
        console.error("ID del producto no especificado en la URL");
        return;
    }

    fetch(`http://localhost:8080/producto/${productId}`)
        .then(res => {
            if (!res.ok) throw new Error("Error de red");
            return res.json();
        })
        .then(data => {
            document.getElementById("nombreProducto").textContent = data.nombre;
            document.getElementById("precioProducto").textContent = `S/ ${data.precio.toFixed(2)}`;
            document.getElementById("marcaProducto").textContent = data.marca;
            document.getElementById("categoriaProducto").textContent = data.categoria;
            document.getElementById("stockProducto").textContent = `${data.stock} unidades`;
            document.getElementById("breadcrumbNombre").textContent = data.nombre;

            document.getElementById("mainImage").src = data.imagenPrincipal;
            document.getElementById("img1").src = data.imagenPrincipal;
            document.getElementById("img2").src = data.imagenSecundaria || "../imag/placeholder.png";
            document.getElementById("img3").src = data.imagenTerciaria || "../imag/placeholder.png";

            const descripcionDiv = document.getElementById("descripcionProducto");
            if (data.descripcion && data.descripcion.trim()) {
                descripcionDiv.textContent = data.descripcion.trim();
            } else {
                descripcionDiv.textContent = "Sin descripción disponible.";
            }
        })
        .catch(err => console.error("Fallo al cargar el producto:", err));
});
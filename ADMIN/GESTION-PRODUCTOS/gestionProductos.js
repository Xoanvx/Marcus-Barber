document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");
    if (!token) {
        window.location.href = "../LOGIN/login.html";
        return;
    }

    listarProductos();
});

function listarProductos(page = 0) {
    const tableBody = document.getElementById("productsTableBody");
    const emptyState = document.getElementById("emptyState");

    fetch(`http://localhost:8080/admin/producto`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
    })
        .then(response => {
            if (!response.ok) throw new Error("Error al obtener productos");
            return response.json();
        })
        .then(data => {
            const productos = data.content;

            tableBody.innerHTML = "";

            if (!productos || productos.length === 0) {
                emptyState.style.display = "block";
                return;
            }

            emptyState.style.display = "none";

            productos.forEach(producto => {
                const tr = document.createElement("tr");

                tr.innerHTML = `
                <td><img src="${producto.imagenPrincipal || '../imag/default.png'}" alt="Imagen" class="product-thumb"></td>
                <td>${producto.nombre}</td>
                <td>${producto.categoria}</td>
                <td>S/. ${producto.precio.toFixed(2)}</td>
                <td>${producto.stock}</td>
                <td>
                        <span class="status-badge ${producto.stock > 0 ? "completed" : "cancelled"}">
                            ${producto.stock > 0 ? "Disponible" : "Sin Stock"}
                        </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-edit" onclick="editarProducto(${producto.id})">✏️</button>
                    <button class="btn btn-sm btn-delete" onclick="eliminarProducto(${producto.id})">🗑️</button>
                </td>
            `;

                tableBody.appendChild(tr);
            });

            // Si deseas manejar paginación:
            renderPaginacion(data.totalPages, data.number);
        })
        .catch(error => {
            console.error("Error:", error);
            showToast(`❌ ${error.message}`, "error");
        });
}


function showToast(message, type = "success") {
    const toast = document.getElementById("toast");
    toast.textContent = message;
    toast.className = `toast show ${type}`;
    setTimeout(() => {
        toast.className = "toast hidden";
    }, 3000);
}




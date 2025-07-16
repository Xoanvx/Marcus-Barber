const CLOUD_NAME = "dqatilazg";
const UPLOAD_PRESET = "ml_default";
const BACKEND_URL = "http://localhost:8080/admin/producto";


const form = document.getElementById("productForm");
const toast = document.getElementById("toast");
const cancelBtn = document.getElementById("cancelBtn");
const modal = document.getElementById("productModal");

function showToast(msg, ok = true) {
    toast.textContent = msg;
    toast.className = `toast ${ok ? "success" : "error"}`;
    toast.style.display = "block";
    setTimeout(() => toast.style.display = "none", 3500);
}

function closeModal() {
    modal.classList.remove("open");
    form.reset();
}

async function uploadToCloudinary(source) {
    const fd = new FormData();
    fd.append("upload_preset", UPLOAD_PRESET);
    fd.append("file", source);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`, {
        method: "POST",
        body: fd
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || "Falló la subida");
    return data.secure_url;
}

form.addEventListener("submit", async ev => {
    ev.preventDefault();

    const nombre = form.productName.value.trim();
    const marca = form.productMarca.value.trim();
    const categoria = form.productCategory.value.trim();
    const precio = parseFloat(form.productPrice.value);
    const stock = parseInt(form.productStock.value || 0, 10);
    const descripcion = form.productDescription.value.trim();

    if (!nombre || !categoria || !precio) {
        showToast("Rellena los campos obligatorios", false);
        return;
    }

    const imgFiles = [
        document.getElementById("productImage1").files[0],
        document.getElementById("productImage").files[0],
        document.getElementById("productImage3").files[0]
    ];

    if (!imgFiles[0]) {
        showToast("Selecciona una imagen principal", false);
        return;
    }

    try {
        showToast("Subiendo imágenes...", true);

        const imgUrls = await Promise.all(imgFiles.map(f => f ? uploadToCloudinary(f) : ""));

        const producto = {
            nombre,
            marca,
            categoria,
            precio,
            stock,
            descripcion,
            imagenPrincipal: imgUrls[0],
            imagenSecundaria: imgUrls[1],
            imagenTerciaria: imgUrls[2]
        };

        showToast("Enviando producto al servidor...");

        const resp = await fetch(BACKEND_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(producto)
        });

        if (!resp.ok) {
            const txt = await resp.text();
            throw new Error(txt || resp.statusText);
        }
        closeModal();

    } catch (err) {
        console.error(err);
        showToast(`Error: ${err.message}`, false);
    }
});

cancelBtn.addEventListener("click", closeModal);
modal.querySelector(".modal-close").addEventListener("click", closeModal);

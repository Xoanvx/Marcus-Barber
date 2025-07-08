function showToast(message, type = "success") {
    const toast = document.getElementById("toast");
    const messageSpan = document.getElementById("toast-message");

    toast.className = `toast show ${type}`;
    messageSpan.textContent = message;

    setTimeout(() => {
        toast.className = "toast hidden";
    }, 3000);
}

document.getElementById("btnEnviarReclamo").addEventListener("click", function () {
    const token = localStorage.getItem("token");

    if (!token) {
        showToast("⚠️ Debes iniciar sesión para enviar un reclamo.", "warning");
        return;
    }

    const tipo = document.getElementById("nombre").value.trim();
    const categoria = document.getElementById("categoria").value;
    const canal = document.getElementById("canal").value;
    const fecha = document.querySelector('input[type="date"]').value;
    const descripcion = document.getElementById("descripcion").value.trim();
    const solicitud = document.getElementById("solicitud").value.trim();

    if (!tipo || !categoria || !canal || !fecha || !descripcion || !solicitud) {
        showToast("❗ Por favor completa todos los campos obligatorios.", "error");
        return;
    }

    const data = {
        tipo,
        categoriaServicio: categoria,
        canalAtencion: canal,
        fechaServicio: fecha,
        descripcion,
        solicitud
    };

    const btn = document.getElementById("btnEnviarReclamo");
    btn.textContent = "Enviando...";
    btn.disabled = true;

    fetch("http://localhost:8080/reclamo", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    })
        .then((res) => {
            if (!res.ok) {
                return res.json().then((err) => {
                    throw new Error(err.message || "Error al enviar el reclamo");
                });
            }
            return res.json();
        })
        .then(() => {
            showToast("✅ Reclamo enviado correctamente", "success");

            document.querySelectorAll("input, textarea, select").forEach(el => el.value = "");
        })
        .catch((error) => {
            console.error("Error:", error.message);
            showToast(`❌ ${error.message}`, "error");
        })
        .finally(() => {
            btn.textContent = "ENVIAR RECLAMO";
            btn.disabled = false;
        });
});

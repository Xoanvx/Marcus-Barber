function showToast(message, type = "success") {
    const toast = document.getElementById("toast");
    const messageSpan = document.getElementById("toast-message");

    toast.className = `toast show ${type}`;
    messageSpan.textContent = message;

    setTimeout(() => {
        toast.className = "toast hidden";
    }, 3000);
}

document.querySelector(".boton-reserva").addEventListener("click", function (e) {
    e.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) {
        showToast("⚠️ Debes iniciar sesión para reservar una cita.", "warning");
        return;
    }

    const estilista = document.querySelector('input[placeholder="Estilista"]').value.trim();
    const turno = document.querySelector('input[placeholder="Turno"]').value.trim();
    const sede = document.querySelectorAll("select")[0].value;
    const fecha = document.querySelector('input[type="date"]').value;
    const servicio = document.querySelectorAll("select")[1].value;
    const detalles = document.querySelector("textarea").value.trim();

    if (!estilista || !turno || !sede || !fecha || !servicio) {
        showToast("❗ Por favor completa todos los campos obligatorios.", "error");
        return;
    }

    const data = {
        estilista,
        turno,
        sede,
        fecha: `${fecha}T00:00:00Z`,
        servicio,
        detalles,
    };

    fetch("https://marcus-barber.azurewebsites.net/reserva", {
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
                    throw new Error(err.message || "Error en la reserva");
                });
            }
            return res.json();
        })
        .then((response) => {
            showToast("✅ ¡Reserva realizada con éxito!", "success");
            document.querySelector("form").reset();
        })
        .catch((error) => {
            console.error("Error:", error.message);
            showToast(`❌ ${error.message}`, "error");
        });
});
  
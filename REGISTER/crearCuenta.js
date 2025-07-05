document.addEventListener("DOMContentLoaded", () => {
    const btn = document.getElementById("btn-registrar");

    const ids = ["nombre", "correo", "celular", "contrasena", "confirmar"];

    function limpiarErrores() {
        ids.forEach(id => {
            const p = document.getElementById(`error-${id}`);
            if (p) p.textContent = "";
            const input = document.getElementById(id);
            if (input) input.classList.remove("error");
        });
    }

    btn.addEventListener("click", async e => {
        e.preventDefault();
        limpiarErrores();

        if (document.getElementById("contrasena").value !==
            document.getElementById("confirmar").value) {
            document.getElementById("error-confirmar").textContent =
                "Las contraseñas no coinciden";
            document.getElementById("confirmar").classList.add("error");
            return;
        }

        const body = JSON.stringify({
            nombre: document.getElementById("nombre").value.trim(),
            correo: document.getElementById("correo").value.trim(),
            celular: document.getElementById("celular").value.trim(),
            contrasena: document.getElementById("contrasena").value
        });

        try {
            const res = await fetch("http://localhost:8080/auth/crear", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body
            });

            if (res.ok) {
                return window.location.href = "../LOGIN/login.html";
            }

            if (res.status === 400) {
                const errores = await res.json();
                Object.entries(errores).forEach(([campo, mensaje]) => {
                    const p = document.getElementById(`error-${campo}`);
                    if (p) p.textContent = mensaje;
                    const input = document.getElementById(campo);
                    if (input) input.classList.add("error");
                });
            }
        } catch (err) {
            console.log(err);
        }
    });
});
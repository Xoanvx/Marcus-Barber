document.addEventListener("DOMContentLoaded", () => {

    const btnLogin = document.getElementById("btn-login");
    const nombreInput = document.getElementById("nombre");
    const passInput = document.getElementById("contrasena");
    const errorNombre = document.getElementById("error-nombre");
    const errorPassword = document.getElementById("error-password");

    btnLogin.addEventListener("click", async (e) => {
        e.preventDefault();

        errorNombre.textContent = "";
        errorPassword.textContent = "";

        const nombre = nombreInput.value.trim();
        const contrasena = passInput.value.trim();

        if (!nombre || !contrasena) {
            if (!nombre) errorNombre.textContent = "Debes ingresar tu usuario o email";
            if (!contrasena) errorPassword.textContent = "La contraseña no puede estar vacía";
            return;
        }

        try {
            const res = await fetch("http://localhost:8080/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nombre, contrasena })
            });

            if (res.ok) {
                const { token } = await res.json();
                localStorage.setItem("token", token);
                window.location.href = "../INICIO/index.html";
                return;
            }

            const data = await res.json();

            if (data.mensaje) {
                errorPassword.textContent = data.mensaje;
            } else {
                errorPassword.textContent = "Ocurrió un error desconocido.";
            }

        } catch (error) {
            console.error("Error al conectar:", error);
        }
    });
});
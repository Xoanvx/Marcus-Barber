document.addEventListener("DOMContentLoaded", () => {

    const btnLogin = document.getElementById("btn-login");
    const nombreInput = document.getElementById("nombre");
    const passInput = document.getElementById("contrasena");
    const errorCorreo = document.getElementById("error-nombre");
    const errorPassword = document.getElementById("error-password");

    btnLogin.addEventListener("click", async (e) => {
        e.preventDefault();

        errorCorreo.textContent = "";
        errorPassword.textContent = "";

        const correo = nombreInput.value.trim();
        const contrasena = passInput.value.trim();

        if (!nombre || !contrasena) {
            if (!nombre) errorNombre.textContent = "Debes ingresar tu email registrado";
            if (!contrasena) errorPassword.textContent = "La contraseña no puede estar vacía";
            return;
        }

        try {
            const res = await fetch("https://marcus-barber.azurewebsites.net/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ correo, contrasena })
            });

            if (res.ok) {
                const { token } = await res.json();
                localStorage.setItem("token", token);
                window.location.href = "/";
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
(function () {
    const nav = document.querySelector(".menu");
    const loginLi = nav.querySelector(".login-button");
    const token = localStorage.getItem("token");

    function decodeJwt(tk) {
        if (!tk) return null;
        try {
            const base64 = tk.split(".")[1]
                .replace(/-/g, "+")
                .replace(/_/g, "/");
            return JSON.parse(atob(base64));
        } catch (e) {
            console.warn("Token inválido", e);
            return null;
        }
    }

    const isExpired = exp => exp && exp < Date.now() / 1000;

    function showLogoutButton() {
        const li = document.createElement("li");
        li.className = "logout-button";
        li.innerHTML = '<button id="logout-link" href="#"><a>Salir</a></button>';
        nav.replaceChild(li, loginLi);
        document.getElementById("logout-link").addEventListener("click", () => {
            localStorage.removeItem("token");
            location.reload();
        });
    }

    function addAdminLink() {
        if (document.querySelector(".admin-button")) return;

        const liAdmin = document.createElement("li");
        liAdmin.className = "admin-button";
        liAdmin.innerHTML = '<a href="../ADMIN/DASHBOARD/dashboard.html">ADMINISTRACIÓN</a>';

        const logoutLi = document.querySelector(".logout-button");
        if (logoutLi) nav.insertBefore(liAdmin, logoutLi);
        else nav.appendChild(liAdmin);
    }

    if (token) {
        const payload = decodeJwt(token);

        if (!payload || isExpired(payload.exp)) {
            localStorage.removeItem("token");
            return;
        }

        showLogoutButton();

        if (payload.rol === "ADMIN") {
            addAdminLink();
        }
    }
})();

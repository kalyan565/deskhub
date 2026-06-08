import {
    login,
    getCurrentUser,
    isAuthenticated,
    logout
} from "../api/auth.js";

export function initAuth() {

    const form =
        document.getElementById(
            "login-form"
        );

    const errorMessage =
        document.getElementById(
            "error-message"
        );

    if (isAuthenticated()) {

        const user =
            getCurrentUser();

        const label =
            user?.email ||
            user?.name ||
            "your account";

        form.hidden = true;

        errorMessage.innerHTML =
            `You are already signed in (${label}). ` +
            `<a href="dashboard.html">Open dashboard</a> · ` +
            `<button type="button" id="login-sign-out">Sign out</button>`;

        document
            .getElementById(
                "login-sign-out"
            )
            .addEventListener(
                "click",
                () => {

                    logout();

                    window.location.reload();

                }
            );

        return;
    }

    form.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();

            const email =
                document.getElementById(
                    "email"
                ).value;

            const password =
                document.getElementById(
                    "password"
                ).value;

            errorMessage.textContent = "";

            try {

                await login(
                    email,
                    password
                );

                window.location.href =
                    "dashboard.html";

            } catch (error) {

                errorMessage.textContent =
                    error.message;

            }
        }
    );
}
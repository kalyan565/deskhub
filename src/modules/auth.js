import { login } from "../api/auth.js";

export function initAuth() {

    const form =
        document.getElementById(
            "login-form"
        );

    const errorMessage =
        document.getElementById(
            "error-message"
        );

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
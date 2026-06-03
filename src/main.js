import { login } from "./api/auth.js";
import { initAuth }
from "./modules/auth.js";
import { logout } from "./api/auth.js";

const page =
    document.body.dataset.page;

if(page === "login"){
    initAuth();
}

if (page === "dashboard") {

    const logoutBtn =
        document.getElementById(
            "logout-btn"
        );

    logoutBtn.addEventListener(
        "click",
        () => {

            logout();

            window.location.href =
                "index.html";

        }
    );
}

async function test() {
    try {
        const user = await login(
            "priya@deskhub.in",
            "demo123"
        );

        console.log(user);
    } catch (error) {
        console.error(error.message);
    }
}

test();
import { login } from "./api/auth.js";
import { initAuth }
from "./modules/auth.js";

const page =
    document.body.dataset.page;

if(page === "login"){
    initAuth();
}

async function test() {
    try {
        const user = await login(
            "kalyan@gmail.com",
            "kalyan"
        );

        console.log(user);
    } catch (error) {
        console.error(error.message);
    }
}

test();
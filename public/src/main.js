//import { login } from "./api/auth.js";
import { initAuth }
from "./modules/auth.js";
import { logout, isAuthenticated } from "./api/auth.js";
import { initTicketsList } from "./modules/tickets.js";
import {
    initTicketDetail
}
from "./modules/ticketDetails.js";

const page =
    document.body.dataset.page;

if (page === "login") {

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

if (page === "tickets-list") {

    if (!isAuthenticated()) {

        window.location.href =
            "index.html";

    } else {

        initTicketsList();

    }

}

if (
    page === "ticket-detail"
) {

    initTicketDetail();

}


// async function test() {
//     try {
//         const user = await login(
//             "priya@deskhub.in",
//             "demo123"
//         );

//         console.log(user);
//     } catch (error) {
//         console.error(error.message);
//     }
// }

// test();
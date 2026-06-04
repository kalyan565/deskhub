import {
    listTickets
} from "../api/tickets.js";

import {
    get
} from "../api/client.js";

import { formatDate }
from "../utils/formatDate.js";

let users = [];

function renderTable(
    tickets
) {

    const tbody =
        document.getElementById(
            "tickets-body"
        );

    const rows =
        tickets.map(ticket => {
            const assignee = users.find(
        user => user.id === ticket.assignedTo
    );

            return `
                <tr>
                    <td>${ticket.id}</td>
                    <td class="ticket-title">
                        ${ticket.title}
                    </td>
                    <td>${ticket.customerName}</td>
                    <td>${ticket.priority}</td>
                    <td>${ticket.status}</td>
                    <td>
                        ${
                            assignee
                            ?
                            assignee.name
                            :
                            "Unassigned"
                        }
                    </td>         
                   <td>
                        ${
                            formatDate(
                                ticket.createdAt
                            )
                        }
                    </td>
                </tr>
            `;

        }).join("");

    tbody.innerHTML =
        rows;
}

export async function initTicketsList() {

    const loading =
        document.getElementById(
            "loading"
        );

    const error =
        document.getElementById(
            "error"
        );

    const emptyState =
        document.getElementById(
            "empty-state"
        );

    try {

        loading.style.display =
            "block";

        error.textContent = "";
        emptyState.textContent = "";

        users =
            await get("/users");

        const tickets =
            await listTickets();

        console.log(tickets);

        if (
            tickets.length === 0
        ) {

            emptyState.textContent =
                "No tickets found";

            return;
        }

        renderTable(tickets);

    } catch(err) {

        error.textContent =
            "Failed to load tickets";

        console.error(err);

    } finally {

        loading.style.display =
            "none";

    }
}
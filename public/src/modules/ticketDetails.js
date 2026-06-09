import {
    getTicket,
    listComments,
    updateTicket,
    deleteTicket
}
from "../api/tickets.js";

import {
    get
} from "../api/client.js";

export async function initTicketDetail() {

    const params =
        new URLSearchParams(
            location.search
        );

    const ticketId =
        params.get("id");

    try {

        const [
            ticket,
            comments,
            users
        ] = await Promise.all([
            getTicket(ticketId),
            listComments(ticketId),
            get("/users")
        ]);

        const assignee =
            users.find(
                user =>
                    user.id ===
                    ticket.assignedTo
            );

        const container =
            document.getElementById(
                "ticket-container"
            );

        container.innerHTML = `
            <h2>${ticket.title}</h2>

            <p>
                <strong>ID:</strong>
                ${ticket.id}
            </p>

            <p>
                <strong>Customer:</strong>
                ${ticket.customerName}
            </p>

            <p>
                <strong>Email:</strong>
                ${ticket.customerEmail}
            </p>

            <p>
    <strong>Status:</strong>

    <select id="status-select">

        <option
            value="open"
            ${
                ticket.status === "open"
                ? "selected"
                : ""
            }
        >
            Open
        </option>

        <option
            value="in-progress"
            ${
                ticket.status === "in-progress"
                ? "selected"
                : ""
            }
        >
            In Progress
        </option>

        <option
            value="resolved"
            ${
                ticket.status === "resolved"
                ? "selected"
                : ""
            }
        >
            Resolved
        </option>

        <option
            value="closed"
            ${
                ticket.status === "closed"
                ? "selected"
                : ""
            }
        >
            Closed
        </option>

    </select>

</p>

            <p>
                <strong>Priority:</strong>
                ${ticket.priority}
            </p>

            <p>
                <strong>Category:</strong>
                ${ticket.category}
            </p>

            <p>
                <strong>Assignee:</strong>
                ${
                    assignee
                        ? assignee.name
                        : "Unassigned"
                }
            </p>

            <p>
                <strong>Description:</strong>
            </p>

            <p>
                ${ticket.description}
            </p>

            <button id="delete-ticket-btn">
    Delete Ticket
</button>
        `;

        const statusSelect =
    document.getElementById(
        "status-select"
    );

statusSelect.addEventListener(
    "change",
    async (event) => {

        const newStatus =
            event.target.value;

        await updateTicket(
            ticketId,
            {
                status:
                    newStatus
            }
        );

        alert(
            "Status updated"
        );

    }
);

const deleteBtn =
    document.getElementById(
        "delete-ticket-btn"
    );

deleteBtn.addEventListener(
    "click",
    async () => {

        const confirmed =
            confirm(
                "Are you sure you want to delete this ticket?"
            );

        if (!confirmed) {
            return;
        }

        await deleteTicket(
            ticketId
        );

        alert(
            "Ticket deleted successfully"
        );

        window.location.href =
            "tickets.html";

    }
);

        const commentsContainer =
            document.getElementById(
                "comments-container"
            );

        if (
            comments.length === 0
        ) {

            commentsContainer.textContent =
                "No comments yet";

        } else {

            commentsContainer.innerHTML =
                comments.map(
                    comment => `
                        <div class="comment">
                            ${
                                comment.body ||
                                comment.text ||
                                comment.comment ||
                                "No comment text"
                            }
                        </div>
                    `
                ).join("");

        }

    } catch (error) {

        console.error(error);

        document.getElementById(
            "ticket-container"
        ).textContent =
            "Failed to load ticket";

    }

}
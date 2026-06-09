import {listTickets,
    searchTickets,
    filterTicketsByStatus,
    filterTicketsByPriority,
    getTicketsPage,
    sortBy,createTicket} from "../api/tickets.js";
import {get} from "../api/client.js";
import { formatDate }from "../utils/formatDate.js";
import { debounce } from "../utils/debounce.js";




let users = [];
let currentPage = 1;
const PAGE_SIZE = 10;
let sortField = "";
let sortOrder = "asc";

function renderTable(tickets) {
    const tbody =
        document.getElementById(
            "tickets-body"
        );
    const rows =
        tickets.map(ticket => {
            const assignee = users.find(
        user => user.id === ticket.assignedTo
    );
        return `<tr>
            <td>${ticket.id}</td>
            <td>
    <a href="ticket-detail.html?id=${ticket.id}">
        ${ticket.title}
    </a>
</td>
            <td>${ticket.customerName}</td>
            <td>${ticket.priority}</td>
            <td>${ticket.status}</td>
            <td>
            ${assignee ? assignee.name : "Unassigned"}
            </td>         
            <td>
            ${formatDate(ticket.createdAt)}
            </td>
            </tr> `;
        }).join("");

    tbody.innerHTML =
        rows;
}

async function loadPage(page) {

    const tickets =
        await getTicketsPage(
            page,
            PAGE_SIZE
        );

    renderTable(tickets);

    const pageInfo =
        document.getElementById(
            "page-info"
        );

    if (pageInfo) {

        pageInfo.textContent =
            `Page ${page}`;
    }
}

async function applySort(
    field
) {

    if (
        sortField === field
    ) {

        sortOrder =
            sortOrder === "asc"
            ? "desc"
            : "asc";

    } else {

        sortField = field;
        sortOrder = "asc";

    }
    currentPage = 1;
const tickets =
    await sortBy(
        field,
        sortOrder,
        currentPage,
        PAGE_SIZE
    );

renderTable(tickets);

const pageInfoSort =
    document.getElementById(
        "page-info"
    );

if (pageInfoSort) {

    pageInfoSort.textContent =
        `Page ${currentPage}`;
}
}

function validateForm(
    title,
    customerName,
    customerEmail,
    description
) {

    let valid = true;

    document.getElementById(
        "title-error"
    ).textContent = "";

    document.getElementById(
        "customer-name-error"
    ).textContent = "";

    document.getElementById(
        "customer-email-error"
    ).textContent = "";

    document.getElementById(
        "description-error"
    ).textContent = "";

    if (
        title.trim().length < 5
    ) {

        document.getElementById(
            "title-error"
        ).textContent =
            "Title must be at least 5 characters";

        valid = false;
    }

    if (
        customerName.trim() === ""
    ) {

        document.getElementById(
            "customer-name-error"
        ).textContent =
            "Customer name is required";

        valid = false;
    }

    if (
        !customerEmail.includes("@")
    ) {

        document.getElementById(
            "customer-email-error"
        ).textContent =
            "Enter a valid email";

        valid = false;
    }

    if (
        description.trim().length < 10
    ) {

        document.getElementById(
            "description-error"
        ).textContent =
            "Description must be at least 10 characters";

        valid = false;
    }

    return valid;

}

export async function initTicketsList() {
    const loading = document.getElementById("loading");
    const error =
        document.getElementById("error");

    const emptyState =
        document.getElementById("empty-state");

    try {
        loading.style.display ="block";
        error.textContent = "";
        emptyState.textContent = "";
       users = await get("/users");

const tickets = await listTickets();

if (tickets.length === 0) {
    emptyState.textContent = "No tickets found";
    return;
}

await loadPage(currentPage);
    const searchInput =
        document.getElementById(
            "search-input"
        );

    const prevBtn =
        document.getElementById(
            "prev-btn"
        );

    const nextBtn =
        document.getElementById(
            "next-btn"
        );

    if (prevBtn) {

        prevBtn.addEventListener(
            "click",
            async () => {

                if (currentPage > 1) {

                    currentPage--;

                    if (sortField) {

                        const tickets =
                            await sortBy(
                                sortField,
                                sortOrder,
                                currentPage,
                                PAGE_SIZE
                            );

                        renderTable(tickets);

                    } else {

                        await loadPage(
                            currentPage
                        );

                    }

                }

            }
        );
    }

    const newTicketBtn =
        document.getElementById(
            "new-ticket-btn"
        );

    const ticketForm =
    document.getElementById(
        "ticket-form"
    );

    const modal =
        document.getElementById(
            "ticket-modal"
        );

    if (
        newTicketBtn &&
        modal
    ) {

        newTicketBtn.addEventListener(
            "click",
            () => {

                modal.style.display =
                    "block";

            }
        );
    }

    function bindSortHeader(
        id,
        field
    ) {

        const el =
            document.getElementById(
                id
            );

        if (!el) {
            return;
        }

        el.style.cursor =
            "pointer";

        el.addEventListener(
            "click",
            () =>
                applySort(field)
        );
    }

    bindSortHeader(
        "sort-id",
        "id"
    );

    bindSortHeader(
        "sort-priority",
        "priority"
    );

    bindSortHeader(
        "sort-status",
        "status"
    );

    bindSortHeader(
        "sort-created",
        "createdAt"
    );

    if (nextBtn) {

        nextBtn.addEventListener(
            "click",
            async () => {

                currentPage++;

                if (sortField) {

                    const tickets =
                        await sortBy(
                            sortField,
                            sortOrder,
                            currentPage,
                            PAGE_SIZE
                        );

                    renderTable(tickets);

                } else {

                    await loadPage(
                        currentPage
                    );

                }

            }
        );
    }

    const statusFilter =
        document.getElementById(
            "status-filter"
        );

    if (statusFilter) {

        statusFilter.addEventListener(
            "change",
            async (event) => {

                const status =
                    event.target.value;

                let results;

                currentPage = 1;

                if (status === "") {

                    await loadPage(
                        currentPage
                    );

                    return;

                }

                results =
                    await filterTicketsByStatus(
                        status
                    );

                renderTable(results);

                const pageInfoEl =
                    document.getElementById(
                        "page-info"
                    );

                if (pageInfoEl) {

                    pageInfoEl.textContent =
                        "Page 1";
                }

            }
        );
    }

    const priorityFilter =
        document.getElementById(
            "priority-filter"
        );

    if (priorityFilter) {

        priorityFilter.addEventListener(
            "change",
            async (event) => {
                const priority =
                    event.target.value;
                let results;
                if (priority === "") {
                    await loadPage(currentPage);
                    return;
                } else {
                    results =
                        await filterTicketsByPriority(
                            priority
                        );
                }
                renderTable(results);
            }
        );
    }

    const handleSearch =
        debounce(
            async (value) => {
                let results;
                if (value === "") {
                    currentPage = 1;

                    await loadPage(
                        currentPage
                    );

                    return;
                } else {
                    results = await searchTickets(value);
                }
                renderTable(results);
            },
            300
        );

ticketForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();

        const title =
            document.getElementById(
                "title"
            ).value;

        const customerName =
            document.getElementById(
                "customer-name"
            ).value;

        const customerEmail =
            document.getElementById(
                "customer-email"
            ).value;

        const description =
            document.getElementById(
                "description"
            ).value;

        if (
    !validateForm(
        title,
        customerName,
        customerEmail,
        description
    )
) {

    return;

}

        const newTicket = {

            title,
            customerName,
            customerEmail,
            description,

            status: "open",
            priority: "medium",

            createdAt:
                new Date()
                .toISOString(),

            updatedAt:
                new Date()
                .toISOString()

        };

        await createTicket(
            newTicket
        );

        modal.style.display =
            "none";

        alert(
            "Ticket created successfully"
        );

        await loadPage(1);

    }
);

    if (searchInput) {

        searchInput.addEventListener(
            "input",
            (event) => {
                handleSearch(event.target.value.trim());
            }
        );
    }
    } catch(err) {
        error.textContent =
            "Failed to load tickets: " +
            (err?.message || String(err)) +
            ". If this is a network error, run `npm run api` (or `npm run dev`) so the API is on port 3001.";
        console.error(err);
    } finally {
        loading.style.display =
            "none";
    }
}
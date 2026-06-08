import {listTickets,
    searchTickets,
    filterTicketsByStatus,
    filterTicketsByPriority,
    getTicketsPage,
    sortBy} from "../api/tickets.js";
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
            <td class="ticket-title">
            ${ticket.title}
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

    document.getElementById(
        "page-info"
    ).textContent =
        `Page ${page}`;
}

async function applySort(field) {

    if (sortField === field) {

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
            sortOrder
        );

    renderTable(tickets);
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
    const searchInput =document.getElementById("search-input");
    const prevBtn =
    document.getElementById(
        "prev-btn"
    );

const nextBtn =
    document.getElementById(
        "next-btn"
    );

    prevBtn.addEventListener(
    "click",
    async () => {

        if (currentPage > 1) {

            currentPage--;

            await loadPage(
                currentPage
            );
        }
    }
);

//sort
const sortId =
    document.getElementById(
        "sort-id"
    );

const sortPriority =
    document.getElementById(
        "sort-priority"
    );

const sortStatus =
    document.getElementById(
        "sort-status"
    );

const sortCreated =
    document.getElementById(
        "sort-created"
    );

sortId.addEventListener(
    "click",
    () => applySort("id")
);

sortPriority.addEventListener(
    "click",
    () => applySort("priority")
);

sortStatus.addEventListener(
    "click",
    () => applySort("status")
);

sortCreated.addEventListener(
    "click",
    () => applySort("createdAt")
);

nextBtn.addEventListener(
    "click",
    async () => {

        currentPage++;

        await loadPage(
            currentPage
        );

    }
);

const statusFilter =
    document.getElementById(
        "status-filter"
    );

statusFilter.addEventListener(
    "change",
    async (event) => {
        const status =
            event.target.value;
        let results;
        if (status === "") {
            results =
                await listTickets();
        } else {
            results =
                await filterTicketsByStatus(
                    status
                );
        }
        renderTable(results);
    }
);

const priorityFilter =
    document.getElementById(
        "priority-filter"
    );

priorityFilter.addEventListener(
    "change",
    async (event) => {
        const priority =
            event.target.value;
        let results;
        if (priority === "") {
            results =
                await listTickets();
        } else {
            results =
                await filterTicketsByPriority(
                    priority
                );
        }
        renderTable(results);
    }
);

const handleSearch =    
    debounce(
        async (value) => {
            let results;
            if (value === "") {
                results =await listTickets();
            } else {
                results =await searchTickets(value);
            }
            renderTable(results);
        },
        300
    );

    searchInput.addEventListener(
    "input",
    (event) => {
        handleSearch(event.target.value.trim());
    }
);
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
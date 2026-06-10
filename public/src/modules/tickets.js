import {
  listTickets,
  searchTickets,
  filterTicketsByStatus,
  filterTicketsByPriority,
  getTicketsPage,
  sortBy,
  createTicket,
} from "../api/tickets.js";
import { get } from "../api/client.js";
import { formatDate } from "../utils/formatDate.js";
import { debounce } from "../utils/debounce.js";
import {
  validateField,
  validateForm,
  writeFieldErrors,
  clearTicketFormErrors,
  readTicketFormValues,
  syncSubmitWithCurrentForm,
} from "./form.js";

import {
  showToast,
  openModal,
  closeModal,
  showLoader,
  hideLoader,
} from "./ui.js";

let users = [];
let currentPage = 1;
const PAGE_SIZE = 10;
let sortField = "";
let sortOrder = "asc";

function renderTable(tickets) {
  const tbody = document.getElementById("tickets-body");
  const rows = tickets
    .map((ticket) => {
      const assignee = users.find((user) => user.id === ticket.assignedTo);
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
    })
    .join("");

  tbody.innerHTML = rows;
}

async function loadPage(page) {
  const tickets = await getTicketsPage(page, PAGE_SIZE);

  renderTable(tickets);

  const pageInfo = document.getElementById("page-info");

  if (pageInfo) {
    pageInfo.textContent = `Page ${page}`;
  }
}

async function applySort(field) {
  if (sortField === field) {
    sortOrder = sortOrder === "asc" ? "desc" : "asc";
  } else {
    sortField = field;
    sortOrder = "asc";
  }
  currentPage = 1;
  const tickets = await sortBy(field, sortOrder, currentPage, PAGE_SIZE);

  renderTable(tickets);

  const pageInfoSort = document.getElementById("page-info");

  if (pageInfoSort) {
    pageInfoSort.textContent = `Page ${currentPage}`;
  }
}

export async function initTicketsList() {
  const loading = document.getElementById("loading");
  const error = document.getElementById("error");

  const emptyState = document.getElementById("empty-state");

  try {
    showLoader();

    loading.style.display = "none";

    error.textContent = "";
    emptyState.textContent = "";
    users = await get("/users");

    const tickets = await listTickets();

    if (tickets.length === 0) {
      emptyState.textContent = "No tickets found";
      return;
    }

    await loadPage(currentPage);
    const searchInput = document.getElementById("search-input");

    const prevBtn = document.getElementById("prev-btn");

    const nextBtn = document.getElementById("next-btn");

    if (prevBtn) {
      prevBtn.addEventListener("click", async () => {
        if (currentPage > 1) {
          currentPage--;

          if (sortField) {
            const tickets = await sortBy(
              sortField,
              sortOrder,
              currentPage,
              PAGE_SIZE,
            );

            renderTable(tickets);
          } else {
            await loadPage(currentPage);
          }
        }
      });
    }

    const newTicketBtn = document.getElementById("new-ticket-btn");

    const ticketForm = document.getElementById("ticket-form");

    const modal = document.getElementById("ticket-modal");

    const submitBtn = document.getElementById("ticket-submit");

    const cancelBtn = document.getElementById("ticket-cancel-btn");

    function openNewTicketModal() {
      if (!modal || !ticketForm) {
        return;
      }

      if (modal.classList.contains("is-open")) {
        return;
      }

      clearTicketFormErrors();

      ticketForm.reset();

      openModal(modal);

      syncSubmitWithCurrentForm(submitBtn);
    }

    function onNewTicketShortcut(event) {
      const target = event.target;

      const typing =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement ||
        (target && target.isContentEditable);

      if (typing) {
        return;
      }

      const isN =
        event.code === "KeyN" || event.key === "n" || event.key === "N";

      if (!isN) {
        return;
      }

      if (event.altKey) {
        event.preventDefault();
        openNewTicketModal();
        return;
      }
    }

    if (newTicketBtn && modal && ticketForm) {
      newTicketBtn.addEventListener("click", openNewTicketModal);

      document.addEventListener("keydown", onNewTicketShortcut);
    }
    // for search shortcut
    document.addEventListener("keydown", (event) => {
      if (
        event.key === "/" &&
        document.activeElement.tagName !== "INPUT" &&
        document.activeElement.tagName !== "TEXTAREA"
      ) {
        event.preventDefault();

        document.getElementById("search-input").focus();
      }
    });

    function bindSortHeader(id, field) {
      const el = document.getElementById(id);

      if (!el) {
        return;
      }

      el.style.cursor = "pointer";

      el.addEventListener("click", () => applySort(field));
    }

    bindSortHeader("sort-id", "id");

    bindSortHeader("sort-priority", "priority");

    bindSortHeader("sort-status", "status");

    bindSortHeader("sort-created", "createdAt");

    if (nextBtn) {
      nextBtn.addEventListener("click", async () => {
        currentPage++;

        if (sortField) {
          const tickets = await sortBy(
            sortField,
            sortOrder,
            currentPage,
            PAGE_SIZE,
          );

          renderTable(tickets);
        } else {
          await loadPage(currentPage);
        }
      });
    }

    const statusFilter = document.getElementById("status-filter");

    if (statusFilter) {
      statusFilter.addEventListener("change", async (event) => {
        const status = event.target.value;

        let results;

        currentPage = 1;

        if (status === "") {
          await loadPage(currentPage);

          return;
        }

        results = await filterTicketsByStatus(status);

        renderTable(results);

        const pageInfoEl = document.getElementById("page-info");

        if (pageInfoEl) {
          pageInfoEl.textContent = "Page 1";
        }
      });
    }

    const priorityFilter = document.getElementById("priority-filter");

    if (priorityFilter) {
      priorityFilter.addEventListener("change", async (event) => {
        const priority = event.target.value;
        let results;
        if (priority === "") {
          await loadPage(currentPage);
          return;
        } else {
          results = await filterTicketsByPriority(priority);
        }
        renderTable(results);
      });
    }

    const handleSearch = debounce(async (value) => {
      let results;
      if (value === "") {
        currentPage = 1;

        await loadPage(currentPage);

        return;
      } else {
        results = await searchTickets(value);
      }
      renderTable(results);
    }, 300);

    if (ticketForm && modal) {
      function bindField(elementId, fieldKey) {
        const el = document.getElementById(elementId);

        if (!el) {
          return;
        }

        const refreshFieldError = () => {
          const msg = validateField(fieldKey, el.value);

          writeFieldErrors({
            [fieldKey]: msg,
          });

          syncSubmitWithCurrentForm(submitBtn);
        };

        el.addEventListener("blur", refreshFieldError);

        el.addEventListener("input", () =>
          syncSubmitWithCurrentForm(submitBtn),
        );

        el.addEventListener("change", () =>
          syncSubmitWithCurrentForm(submitBtn),
        );
      }

      bindField("title", "title");

      bindField("description", "description");

      bindField("customer-name", "customerName");

      bindField("customer-email", "customerEmail");

      bindField("ticket-priority", "priority");

      bindField("ticket-category", "category");

      if (cancelBtn) {
        cancelBtn.addEventListener("click", () => {
          closeModal(modal);
        });
      }

      ticketForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const values = readTicketFormValues();

        const result = validateForm(values);

        writeFieldErrors(result.errors);

        syncSubmitWithCurrentForm(submitBtn);

        if (!result.ok) {
          return;
        }

        const now = new Date().toISOString();

        const newTicket = {
          title: values.title.trim(),

          customerName: values.customerName.trim(),

          customerEmail: values.customerEmail.trim(),

          description: values.description.trim(),

          status: "open",

          priority: values.priority,

          category: values.category,

          createdAt: now,

          updatedAt: now,
        };

        showLoader();

        try {
          await createTicket(newTicket);

          closeModal(modal);

          showToast("Ticket created successfully");

          clearTicketFormErrors();

          ticketForm.reset();

          syncSubmitWithCurrentForm(submitBtn);

          currentPage = 1;

          await loadPage(1);
        } finally {
          hideLoader();
        }
      });
    }

    if (searchInput) {
      searchInput.addEventListener("input", (event) => {
        handleSearch(event.target.value.trim());
      });
    }

    document.addEventListener("keydown", (event) => {
      if (event.ctrlKey && event.key.toLowerCase() === "n") {
        event.preventDefault();

        console.log("CTRL + N detected");

        if (modal && !modal.classList.contains("is-open")) {
          clearTicketFormErrors();

          ticketForm.reset();

          openModal(modal);

          syncSubmitWithCurrentForm(submitBtn);
        }
      }
    });
  } catch (err) {
    error.textContent =
      "Failed to load tickets: " +
      (err?.message || String(err)) +
      ". If this is a network error, run `npm run api` (or `npm run dev`) so the API is on port 3001.";
    console.error(err);
  } finally {
    hideLoader();

    loading.style.display = "none";
  }
}

import {
  getTicket,
  listComments,
  addComment,
  updateTicket,
  deleteTicket,
} from "../api/tickets.js";

import { get } from "../api/client.js";

import { showToast, confirmDialog } from "./ui.js";

import { getCurrentUser } from "../api/auth.js";

function commentText(comment) {
  return (
    comment.content ?? comment.body ?? comment.text ?? comment.comment ?? ""
  );
}

function renderCommentsList(comments, users, container) {
  const sorted = [...comments].sort(
    (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
  );

  if (sorted.length === 0) {
    container.innerHTML = '<p class="empty-hint">No comments yet.</p>';

    return;
  }

  container.innerHTML = sorted
    .map((comment) => {
      const author = users.find((u) => u.id === comment.authorId);

      const name = author?.name ?? `User #${comment.authorId ?? "?"}`;

      const text = commentText(comment);

      const when = comment.createdAt
        ? new Date(comment.createdAt).toLocaleString()
        : "";

      return `
                    <article class="comment-card">
                        <header class="comment-meta">
                            <strong>${escapeHtml(name)}</strong>
                            <span>${escapeHtml(when)}</span>
                        </header>
                        <p class="comment-body">${escapeHtml(
                          text || "(empty)",
                        )}</p>
                    </article>
                `;
    })
    .join("");
}

function escapeHtml(raw) {
  return String(raw)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function statusLabel(status) {
  const map = {
    open: "Open",
    "in-progress": "In progress",
    resolved: "Resolved",
    closed: "Closed",
  };

  return map[status] ?? status;
}

function priorityLabel(p) {
  return p.charAt(0).toUpperCase() + p.slice(1);
}

function assigneeName(ticket, users) {
  if (ticket.assignedTo == null) {
    return "Unassigned";
  }

  const u = users.find((x) => x.id === ticket.assignedTo);

  return u?.name ?? `User #${ticket.assignedTo}`;
}

function buildAssigneeOptions(ticket, users) {
  return (
    `<option value="">Unassigned</option>` +
    users
      .map(
        (user) => `
                <option value="${user.id}" ${
                  user.id === ticket.assignedTo ? "selected" : ""
                }>${escapeHtml(user.name)}</option>
            `,
      )
      .join("")
  );
}

function renderTicketView(container, ticket, users) {
  container.innerHTML = `
        <p class="detail-back-row">
            <a href="tickets.html" class="detail-back-btn">Back</a>
        </p>
        <h2>${escapeHtml(ticket.title)}</h2>

        <div class="detail-actions">
            <button type="button" id="edit-ticket-btn" class="detail-btn">
                Edit
            </button>
        </div>

        <div class="detail-grid">
            <p><strong>ID:</strong> ${ticket.id}</p>
            <p><strong>Customer:</strong> ${escapeHtml(ticket.customerName)}</p>
            <p><strong>Email:</strong> ${escapeHtml(ticket.customerEmail)}</p>
            <p><strong>Status:</strong> ${escapeHtml(
              statusLabel(ticket.status),
            )}</p>
            <p><strong>Priority:</strong> ${escapeHtml(
              priorityLabel(ticket.priority),
            )}</p>
            <p><strong>Category:</strong> ${escapeHtml(ticket.category)}</p>
            <p><strong>Assignee:</strong> ${escapeHtml(
              assigneeName(ticket, users),
            )}</p>
        </div>

        <section class="detail-description">
            <h3>Description</h3>
            <p>${escapeHtml(ticket.description)}</p>
        </section>

        <button type="button" id="delete-ticket-btn" class="btn-danger">
            Delete ticket
        </button>
    `;
}

function renderTicketEdit(container, ticket, users) {
  const assigneeOpts = buildAssigneeOptions(ticket, users);

  container.innerHTML = `
        <p class="detail-back-row">
            <a href="tickets.html" class="detail-back-btn">Back</a>
        </p>

        <div class="detail-edit-form">
            <label for="detail-title"><strong>Title</strong></label>
            <input type="text" id="detail-title" maxlength="100">

            <label for="detail-customer-name"><strong>Customer name</strong></label>
            <input type="text" id="detail-customer-name">

            <label for="detail-customer-email"><strong>Customer email</strong></label>
            <input type="email" id="detail-customer-email">

            <label for="detail-status"><strong>Status</strong></label>
            <select id="detail-status">
                <option value="open" ${ticket.status === "open" ? "selected" : ""}>Open</option>
                <option value="in-progress" ${ticket.status === "in-progress" ? "selected" : ""}>In progress</option>
                <option value="resolved" ${ticket.status === "resolved" ? "selected" : ""}>Resolved</option>
                <option value="closed" ${ticket.status === "closed" ? "selected" : ""}>Closed</option>
            </select>

            <label for="detail-priority"><strong>Priority</strong></label>
            <select id="detail-priority">
                <option value="low" ${ticket.priority === "low" ? "selected" : ""}>Low</option>
                <option value="medium" ${ticket.priority === "medium" ? "selected" : ""}>Medium</option>
                <option value="high" ${ticket.priority === "high" ? "selected" : ""}>High</option>
                <option value="urgent" ${ticket.priority === "urgent" ? "selected" : ""}>Urgent</option>
            </select>

            <label for="detail-category"><strong>Category</strong></label>
            <select id="detail-category">
                <option value="auth" ${ticket.category === "auth" ? "selected" : ""}>Auth</option>
                <option value="billing" ${ticket.category === "billing" ? "selected" : ""}>Billing</option>
                <option value="bug" ${ticket.category === "bug" ? "selected" : ""}>Bug</option>
                <option value="feature" ${ticket.category === "feature" ? "selected" : ""}>Feature</option>
            </select>

            <label for="detail-assignee"><strong>Assignee</strong></label>
            <select id="detail-assignee">${assigneeOpts}</select>

            <label for="detail-description"><strong>Description</strong></label>
            <textarea id="detail-description" rows="6"></textarea>
        </div>

        <div class="detail-actions">
            <button type="button" id="save-ticket-btn" class="detail-btn detail-btn-primary">
                Save
            </button>
            <button type="button" id="cancel-edit-btn" class="detail-btn">
                Cancel
            </button>
        </div>

        <button type="button" id="delete-ticket-btn" class="btn-danger">
            Delete ticket
        </button>
    `;

  document.getElementById("detail-title").value = ticket.title;

  document.getElementById("detail-customer-name").value = ticket.customerName;

  document.getElementById("detail-customer-email").value = ticket.customerEmail;

  document.getElementById("detail-description").value = ticket.description;
}

export async function initTicketDetail() {
  const params = new URLSearchParams(location.search);

  const ticketIdRaw = params.get("id");

  if (!ticketIdRaw || Number.isNaN(Number(ticketIdRaw))) {
    const container = document.getElementById("ticket-container");

    if (container) {
      container.innerHTML =
        '<p class="empty-hint">Missing or invalid ticket id. <a href="tickets.html">Back to tickets</a></p>';
    }

    return;
  }

  const ticketId = ticketIdRaw;

  try {
    let ticket;
    let comments;
    let users;

    async function refreshTicketData() {
      const t = await getTicket(ticketId);

      ticket = t;

      return t;
    }

    [ticket, comments, users] = await Promise.all([
      getTicket(ticketId),
      listComments(ticketId),
      get("/users"),
    ]);

    const container = document.getElementById("ticket-container");

    const commentsContainer = document.getElementById("comments-container");

    function showView() {
      renderTicketView(container, ticket, users);

      wireViewMode();
    }

    function showEdit() {
      renderTicketEdit(container, ticket, users);

      wireEditMode();
    }

    function wireViewMode() {
      document
        .getElementById("edit-ticket-btn")
        .addEventListener("click", () => {
          showEdit();
        });

      wireDelete();
    }

    function wireEditMode() {
      document
        .getElementById("save-ticket-btn")
        .addEventListener("click", async () => {
          const title = document.getElementById("detail-title").value.trim();

          const customerName = document
            .getElementById("detail-customer-name")
            .value.trim();

          const customerEmail = document
            .getElementById("detail-customer-email")
            .value.trim();

          const description = document
            .getElementById("detail-description")
            .value.trim();

          const status = document.getElementById("detail-status").value;

          const priority = document.getElementById("detail-priority").value;

          const category = document.getElementById("detail-category").value;

          const assignRaw = document.getElementById("detail-assignee").value;

          const assignedTo = assignRaw === "" ? null : Number(assignRaw);

          if (!title) {
            showToast("Title is required");

            return;
          }

          await updateTicket(ticketId, {
            title,
            customerName,
            customerEmail,
            description,
            status,
            priority,
            category,
            assignedTo,
            updatedAt: new Date().toISOString(),
          });

          await refreshTicketData();

          showView();

          showToast("Ticket saved");
        });

      document
        .getElementById("cancel-edit-btn")
        .addEventListener("click", async () => {
          await refreshTicketData();

          showView();
        });

      wireDelete();
    }

    function wireDelete() {
      document
        .getElementById("delete-ticket-btn")
        .addEventListener("click", onDelete, {
          once: true,
        });
    }

    async function onDelete() {
      const confirmed = await confirmDialog("Delete this ticket permanently?");

      if (!confirmed) {
        wireDelete();

        return;
      }

      await deleteTicket(ticketId);

      showToast("Ticket deleted");

      setTimeout(() => {
        window.location.href = "tickets.html";
      }, 800);
    }

    showView();

    renderCommentsList(comments, users, commentsContainer);

    document
      .getElementById("add-comment-btn")
      .addEventListener("click", async () => {
        const input = document.getElementById("comment-text");

        const commentTextVal = input.value.trim();

        if (commentTextVal === "") {
          showToast("Comment cannot be empty");

          return;
        }

        const user = getCurrentUser();

        const authorId = user?.id ?? 1;

        await addComment({
          ticketId: Number(ticketId),
          authorId,
          content: commentTextVal,
          createdAt: new Date().toISOString(),
        });

        showToast("Comment added");

        input.value = "";

        const freshComments = await listComments(ticketId);

        renderCommentsList(freshComments, users, commentsContainer);
      });
  } catch (error) {
    console.error(error);

    const container = document.getElementById("ticket-container");

    if (container) {
      container.innerHTML =
        '<p class="empty-hint">Failed to load this ticket. <a href="tickets.html">Back to tickets</a></p>';
    }
  }
}

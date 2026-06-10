import { get } from "../api/client.js";

export async function initDashboard() {
  const recentContainer = document.getElementById("recent-tickets");

  try {
    const [totalTickets, openTickets, progressTickets, resolvedTickets] =
      await Promise.all([
        get("/tickets"),
        get("/tickets?status=open"),
        get("/tickets?status=in-progress"),
        get("/tickets?status=resolved"),
      ]);

    document.getElementById("total-count").textContent = String(
      totalTickets.length,
    );

    document.getElementById("open-count").textContent = String(
      openTickets.length,
    );

    document.getElementById("progress-count").textContent = String(
      progressTickets.length,
    );

    document.getElementById("resolved-count").textContent = String(
      resolvedTickets.length,
    );

    const recentTickets = await get(
      "/tickets?_sort=createdAt&_order=desc&_limit=5",
    );

    if (!recentTickets || recentTickets.length === 0) {
      recentContainer.innerHTML =
        '<p class="empty-hint">No tickets yet. Create one from the tickets page.</p>';

      return;
    }

    recentContainer.innerHTML = recentTickets
      .map(
        (ticket) => `
            <div>
                <a href="ticket-detail.html?id=${ticket.id}">${escapeHtml(
                  ticket.title,
                )}</a>
            </div>
        `,
      )
      .join("");
  } catch (e) {
    console.error(e);

    if (recentContainer) {
      recentContainer.innerHTML =
        '<p class="empty-hint">Could not load dashboard data. Is the API running on port 3001?</p>';
    }
  }
}

function escapeHtml(raw) {
  return String(raw)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

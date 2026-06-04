import {
    get,
    post,
    patch,
    del
} from "./client.js";

export function listTickets() {
    return get("/tickets");
}

export function getTicket(id) {
    return get(`/tickets/${id}`);
}

export function createTicket(ticket) {
    return post("/tickets", ticket);
}

export function updateTicket(
    id,
    updates
) {
    return patch(
        `/tickets/${id}`,
        updates
    );
}

export function deleteTicket(id) {
    return del(`/tickets/${id}`);
}

export function listComments(
    ticketId
) {
    return get(
        `/comments?ticketId=${ticketId}`
    );
}

export function addComment(
    comment
) {
    return post(
        "/comments",
        comment
    );
}
import { get, post, patch, del } from "./client.js";

export function filterTicketsByStatus(status) {
  return get(`/tickets?status=${status}`);
}

export function listTickets() {
  return get("/tickets");
}

export function getTicket(id) {
  return get(`/tickets/${id}`);
}

export function createTicket(ticket) {
  return post("/tickets", ticket);
}

export function updateTicket(id, updates) {
  return patch(`/tickets/${id}`, updates);
}

export function deleteTicket(id) {
  return del(`/tickets/${id}`);
}

export function listComments(ticketId) {
  return get(`/comments?ticketId=${ticketId}`);
}

export function addComment(comment) {
  return post("/comments", comment);
}

export function searchTickets(searchTerm) {
  return get(`/tickets?q=${searchTerm}`);
}

export function filterTicketsByPriority(priority) {
  return get(`/tickets?priority=${priority}`);
}

//pagination
export function getTicketsPage(page, limit = 10) {
  return get(`/tickets?_page=${page}&_limit=${limit}`);
}

//sort
export function sortBy(field, order, page, limit) {
  return get(
    `/tickets?_sort=${field}&_order=${order}&_page=${page}&_limit=${limit}`,
  );
}

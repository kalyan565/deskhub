const BASE_URL = "http://localhost:3001";

export async function request(endpoint, options = {}) {
  const response = await fetch(BASE_URL + endpoint, options);

  if (!response.ok) {
    throw new Error(`HTTP Error: ${response.status}`);
  }

  return await response.json();
}

export function get(endpoint) {
  return request(endpoint);
}

export function post(endpoint, body) {
  return request(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
}

export function patch(endpoint, body) {
  return request(endpoint, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
}

export function del(endpoint) {
  return request(endpoint, {
    method: "DELETE",
  });
}

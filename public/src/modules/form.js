export const VALID_PRIORITIES = ["urgent", "high", "medium", "low"];

export const VALID_CATEGORIES = ["auth", "billing", "bug", "feature"];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ERROR_ELEMENT_IDS = {
  title: "title-error",
  description: "description-error",
  customerName: "customer-name-error",
  customerEmail: "customer-email-error",
  priority: "priority-error",
  category: "category-error",
};

export function validateField(name, value) {
  const str = value === undefined || value === null ? "" : String(value).trim();

  switch (name) {
    case "title":
      if (str === "") {
        return "Title is required";
      }

      if (str.length < 5) {
        return "Title must be at least 5 characters";
      }

      if (str.length > 100) {
        return "Title must be at most 100 characters";
      }

      return "";

    case "description":
      if (str === "") {
        return "Description is required";
      }

      if (str.length < 10) {
        return "Description must be at least 10 characters";
      }

      return "";

    case "customerName":
      if (str === "") {
        return "Customer name is required";
      }

      return "";

    case "customerEmail":
      if (str === "") {
        return "Customer email is required";
      }

      if (!EMAIL_PATTERN.test(str)) {
        return "Enter a valid email address";
      }

      return "";

    case "priority":
      if (str === "") {
        return "Priority is required";
      }

      if (!VALID_PRIORITIES.includes(str)) {
        return "Select a valid priority";
      }

      return "";

    case "category":
      if (str === "") {
        return "Category is required";
      }

      if (!VALID_CATEGORIES.includes(str)) {
        return "Select a valid category";
      }

      return "";

    default:
      return "";
  }
}

export function validateForm(values) {
  const keys = [
    "title",
    "description",
    "customerName",
    "customerEmail",
    "priority",
    "category",
  ];

  const errors = {};

  let ok = true;

  for (const key of keys) {
    const msg = validateField(key, values[key]);

    errors[key] = msg;

    if (msg) {
      ok = false;
    }
  }

  return {
    ok,
    errors,
  };
}

export function writeFieldErrors(errors) {
  for (const [key, message] of Object.entries(errors)) {
    const id = ERROR_ELEMENT_IDS[key];

    if (!id) {
      continue;
    }

    const el = document.getElementById(id);

    if (el) {
      el.textContent = message || "";
    }
  }
}

export function clearTicketFormErrors() {
  writeFieldErrors({
    title: "",
    description: "",
    customerName: "",
    customerEmail: "",
    priority: "",
    category: "",
  });
}

export function readTicketFormValues() {
  const get = (id) => document.getElementById(id)?.value ?? "";

  return {
    title: get("title"),
    description: document.getElementById("description")?.value ?? "",
    customerName: get("customer-name"),
    customerEmail: get("customer-email"),
    priority: get("ticket-priority"),
    category: get("ticket-category"),
  };
}

export function updateSubmitDisabled(submitButton, ok) {
  if (!submitButton) {
    return;
  }

  submitButton.disabled = !ok;
}

export function syncSubmitWithCurrentForm(submitButton) {
  const result = validateForm(readTicketFormValues());

  updateSubmitDisabled(submitButton, result.ok);

  return result;
}

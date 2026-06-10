let sharedBackdrop = null;
let activeModal = null;
let escapeHandler = null;

function ensureBackdrop() {
  if (sharedBackdrop) {
    return sharedBackdrop;
  }

  sharedBackdrop = document.createElement("div");

  sharedBackdrop.className = "modal-backdrop";

  sharedBackdrop.setAttribute("aria-hidden", "true");

  document.body.appendChild(sharedBackdrop);

  sharedBackdrop.addEventListener("click", () => {
    if (activeModal) {
      closeModal(activeModal);
    }
  });

  return sharedBackdrop;
}

export function openModal(modalEl) {
  if (!modalEl) {
    return;
  }

  const backdrop = ensureBackdrop();

  activeModal = modalEl;

  backdrop.classList.add("is-visible");

  document.body.classList.add("has-modal");

  modalEl.classList.add("is-open");

  modalEl.style.display = "block";

  escapeHandler = (event) => {
    if (event.key === "Escape") {
      closeModal(modalEl);
    }
  };

  document.addEventListener("keydown", escapeHandler);
}

export function closeModal(modalEl) {
  const el = modalEl || activeModal;

  if (!el) {
    return;
  }

  el.classList.remove("is-open");

  el.style.display = "none";

  if (sharedBackdrop) {
    sharedBackdrop.classList.remove("is-visible");
  }

  document.body.classList.remove("has-modal");

  if (escapeHandler) {
    document.removeEventListener("keydown", escapeHandler);

    escapeHandler = null;
  }

  if (activeModal === el) {
    activeModal = null;
  }
}

let toastContainer = null;

function getToastContainer() {
  if (!toastContainer) {
    toastContainer = document.createElement("div");

    toastContainer.id = "toast-container";

    document.body.appendChild(toastContainer);
  }

  return toastContainer;
}

export function showToast(message) {
  const toast = document.createElement("div");

  toast.textContent = message;

  toast.className = "toast";

  getToastContainer().appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}

export function confirmDialog(message) {
  return Promise.resolve(window.confirm(message));
}

export function showLoader() {
  document.getElementById("global-loader")?.classList.remove("loader-hidden");
}

export function hideLoader() {
  document.getElementById("global-loader")?.classList.add("loader-hidden");
}

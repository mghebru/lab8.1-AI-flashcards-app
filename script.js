
const openBtn = document.getElementById("openModal");
const closeBtn = document.getElementById("closeModal");
const overlay = document.querySelector(".modal-overlay");
const modal = document.querySelector(".modal");

let lastFocusedElement = null;

const focusableSelectors = `
  a[href],
  button:not([disabled]),
  textarea,
  input,
  select,
  [tabindex]:not([tabindex="-1"])
`;

function openModal() {
    if (!overlay.hidden) return; // already open
    lastFocusedElement = document.activeElement;

    overlay.hidden = false;

    const focusableElements = modal.querySelectorAll(focusableSelectors);
    focusableElements[0].focus();

    document.addEventListener("keydown", trapFocus);
}

function closeModal() {
    overlay.hidden = true;
    document.removeEventListener("keydown", trapFocus);

    if (lastFocusedElement) {
        lastFocusedElement.focus();
    }
}

function trapFocus(e) {
    if (!overlay.hidden) { // only trap when modal is open
        if (e.key === "Escape") {
            e.preventDefault();
            closeModal();
            return;
        }

        if (e.key !== "Tab") return;

        const focusableElements = modal.querySelectorAll(focusableSelectors);
        const first = focusableElements[0];
        const last = focusableElements[focusableElements.length - 1];

        if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
        }
    }
}

openBtn?.addEventListener("click", openModal);
closeBtn?.addEventListener("click", closeModal);

// Click outside modal to close
overlay?.addEventListener("click", (e) => {
    if (e.target === overlay) {
        closeModal();
    }
});
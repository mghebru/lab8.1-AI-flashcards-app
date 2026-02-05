
const openBtn = document.getElementById("openModal");
const closeBtn = document.getElementById("closeModal");
const overlay = document.querySelector(".modal-overlay");
const modal = document.querySelector(".modal");
const cardArea = document.querySelector(".card-area");


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

function renderCurrentCard() {
  const deck = decks[activeDeckIndex];
  if (!deck.cards.length) {
    cardArea.innerHTML = "<p>No cards yet. Add some!</p>";
    return;
  }
  const card = deck.cards[currentCardIndex];
  cardArea.innerHTML = `
    <article class="card">
      <div class="card-inner">
        <div class="card-front"><p>${card.front}</p></div>
        <div class="card-back"><p>${card.back}</p></div>
      </div>
    </article>
  `;
}

openBtn?.addEventListener("click", openModal);
closeBtn?.addEventListener("click", closeModal);

// Click outside modal to close
overlay?.addEventListener("click", (e) => {
    if (e.target === overlay) {
        closeModal();
    }
});

cardArea.addEventListener("click", (e) => {
  const cardEl = e.target.closest(".card");
  if (cardEl) cardEl.classList.toggle("flipped");
});

let decks = [
  { name: "JavaScript", cards: [] },
  { name: "CSS", cards: [] },
  { name: "HTML", cards: [] },
];

let activeDeckIndex = 0;
let currentCardIndex = 0;
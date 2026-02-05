
const openBtn = document.getElementById("openModal");
const closeBtn = document.getElementById("closeModal");
const overlay = document.querySelector(".modal-overlay");
const modal = document.querySelector(".modal");
const cardArea = document.querySelector(".card-area");
const prevBtn = document.querySelector(".card-controls button:nth-child(1)");
const flipBtn = document.querySelector(".card-controls button:nth-child(2)");
const nextBtn = document.querySelector(".card-controls button:nth-child(3)");
const newCardBtn = document.querySelector(".toolbar .primary"); // New Card button
const cardModal = document.getElementById("cardModal");
const closeCardModalBtn = document.getElementById("closeCardModal");
const cardForm = document.getElementById("cardForm");
let lastFocusedCardButton = null;

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
       <div class="card-toolbar" style="margin-top:0.5rem; display:flex; justify-content:center; gap:0.5rem;">
        <button class="edit-card">Edit</button>
        <button class="delete-card">Delete</button>
      </div>
    </article>
  `;
}

function openCardModal() {
    lastFocusedCardButton = document.activeElement;
    cardModal.hidden = false;
    cardModal.querySelector("input[name='front']").focus();
    document.addEventListener("keydown", trapFocusCardModal);
}

function closeCardModal() {
    cardModal.hidden = true;
    document.removeEventListener("keydown", trapFocusCardModal);
    lastFocusedCardButton?.focus();
}

function trapFocusCardModal(e) {
    if (e.key === "Escape") return closeCardModal();

    if (e.key !== "Tab") return;

    const focusable = cardModal.querySelectorAll(focusableSelectors);
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
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

cardArea.addEventListener("click", (e) => {
    const deck = decks[activeDeckIndex];
    // Edit
    if (e.target.classList.contains("edit-card")) {
        const card = deck.cards[currentCardIndex];
        openCardModal();
        const frontInput = cardModal.querySelector("input[name='front']");
        const backInput = cardModal.querySelector("input[name='back']");
        frontInput.value = card.front;
        backInput.value = card.back;

        // Replace submit behavior temporarily
        const submitHandler = (evt) => {
            evt.preventDefault();
            card.front = frontInput.value;
            card.back = backInput.value;
            renderCurrentCard();
            closeCardModal();
            cardForm.removeEventListener("submit", submitHandler);
        };

        cardForm.addEventListener("submit", submitHandler);
    }

    // Delete
    if (e.target.classList.contains("delete-card")) {
        const confirmDelete = confirm("Are you sure you want to delete this card?");
        if (confirmDelete) {
            deck.cards.splice(currentCardIndex, 1);
            // Adjust current index
            if (currentCardIndex >= deck.cards.length) currentCardIndex = deck.cards.length - 1;
            renderCurrentCard();
        }
    }
});

prevBtn.addEventListener("click", () => {
    const deck = decks[activeDeckIndex];
    if (!deck.cards.length) return;
    currentCardIndex = (currentCardIndex - 1 + deck.cards.length) % deck.cards.length;
    renderCurrentCard();
});

nextBtn.addEventListener("click", () => {
    const deck = decks[activeDeckIndex];
    if (!deck.cards.length) return;
    currentCardIndex = (currentCardIndex + 1) % deck.cards.length;
    renderCurrentCard();
});

flipBtn.addEventListener("click", () => {
    const cardEl = cardArea.querySelector(".card");
    if (cardEl) cardEl.classList.toggle("flipped");
});

newCardBtn.addEventListener("click", openCardModal);
closeCardModalBtn.addEventListener("click", closeCardModal);
cardModal.addEventListener("click", (e) => {
    if (e.target === cardModal) closeCardModal();
});

// Add card to deck
cardForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const formData = new FormData(cardForm);
    const front = formData.get("front");
    const back = formData.get("back");
    decks[activeDeckIndex].cards.push({ front, back });
    cardForm.reset();
    closeCardModal();
    currentCardIndex = decks[activeDeckIndex].cards.length - 1;
    renderCurrentCard();
});

let decks = [
    { name: "JavaScript", cards: [] },
    { name: "CSS", cards: [] },
    { name: "HTML", cards: [] },
];

let activeDeckIndex = 0;
let currentCardIndex = 0;
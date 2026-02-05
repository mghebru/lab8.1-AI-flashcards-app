// ==========================
// DOM Elements
// ==========================
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

const deckListEl = document.querySelector(".deck-list");
const deckHeaderEl = document.querySelector(".deck-header h2");
const searchInput = document.querySelector(".toolbar input[type='search']");

const themeBtn = document.createElement("button");
themeBtn.textContent = "Dark mode";
themeBtn.id = "themeToggleBtn";
document.querySelector(".app-header").appendChild(themeBtn);

let lastFocusedCardButton = null;
let lastFocusedElement = null;

let currentTheme = localStorage.getItem("theme") ||  "system";
// ==========================
// App State
// ==========================
let decks = [];
let activeDeckIndex = 0;
let currentCardIndex = 0;

const focusableSelectors = `
  a[href],
  button:not([disabled]),
  textarea,
  input,
  select,
  [tabindex]:not([tabindex="-1"])
`;

// ==========================
// LocalStorage
// ==========================
function saveState() {
    localStorage.setItem("flashcardsAppState", JSON.stringify({ decks, activeDeckIndex, currentCardIndex }));
}

function loadState() {
    const saved = localStorage.getItem("flashcardsAppState");
    if (!saved) return;
    try {
        const state = JSON.parse(saved);
        if (state.decks) decks = state.decks;
        if (state.activeDeckIndex !== undefined) activeDeckIndex = state.activeDeckIndex;
        if (state.currentCardIndex !== undefined) currentCardIndex = state.currentCardIndex;
    } catch (err) {
        console.warn("Failed to load saved state:", err);
    }
}

// ==========================
// Modal Helpers
// ==========================
function trapFocus(e, container, closeFn) {
    if (e.key === "Escape") return closeFn();
    if (e.key !== "Tab") return;

    const focusable = container.querySelectorAll(focusableSelectors);
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus();
    }
}

function openModal() {
    if (!overlay.hidden) return;
    lastFocusedElement = document.activeElement;
    overlay.hidden = false;
    modal.querySelector(focusableSelectors)?.focus();
    modayKeyListener = (e) => trapFocus(e, modal, closeModal);
    document.addEventListener("keydown", (e) => modayKeyListener);
}

function closeModal() {
    overlay.hidden = true;
    document.removeEventListener("keydown", modayKeyListener);
    lastFocusedElement?.focus();
}

function openCardModal() {
    lastFocusedCardButton = document.activeElement;
    cardModal.hidden = false;
    cardModal.querySelector("input[name='front']").focus();
    document.addEventListener("keydown", (e) => trapFocus(e, cardModal, closeCardModal));
}

function closeCardModal() {
    cardModal.hidden = true;
    document.removeEventListener("keydown", (e) => trapFocus(e, cardModal, closeCardModal));
    lastFocusedCardButton?.focus();
}


// ==========================
// Deck / Card Rendering
// ==========================
function renderSidebar() {
  deckListEl.innerHTML = "";
  decks.forEach((deck, idx) => {
    const li = document.createElement("li");
    const btn = document.createElement("button");
    btn.textContent = deck.name;
    btn.className = `deck${idx === activeDeckIndex ? " active" : ""}`;
    btn.addEventListener("click", () => {
      activeDeckIndex = idx;
      currentCardIndex = 0;
      renderSidebar();
      renderDeckHeader();
      renderCurrentCard();
      saveState();
    });
    li.appendChild(btn);
    deckListEl.appendChild(li);
  });
}

function renderDeckHeader() {
  deckHeaderEl.textContent = decks[activeDeckIndex]?.name || "No Deck";
}

function renderCurrentCard(filteredIndex = null) {
  const deck = decks[activeDeckIndex];
  if (!deck || !deck.cards.length) {
    cardArea.innerHTML = "<p>No cards yet. Add some!</p>";
    return;
  }

  const idx = filteredIndex !== null ? filteredIndex : currentCardIndex;
  const card = deck.cards[idx];

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

function applyTheme(theme) {
    document.body.classList.remove("dark");
    if(theme === "dark") {
document.body.classList.add("dark");
        themeBtn.textContent = "Dark";
    } else {
        themeBtn.textContent = "Light"
    }
    localStorage.setItem("theme", theme);
}

const themes = ["system", "light", "dark"];
themeBtn.addEventListener("click", () => {
    let idx = themes.indexOf(currentTheme);
    idx = (idx +1) % themes.length;
    currentTheme = themes[idx];
    applyTheme(currentTheme);
})
applyTheme(currentTheme);

// ==========================
// Event Listeners
// ==========================
openBtn?.addEventListener("click", openModal);
closeBtn?.addEventListener("click", closeModal);
overlay?.addEventListener("click", (e) => { if (e.target === overlay) closeModal(); });

newCardBtn.addEventListener("click", openCardModal);
closeCardModalBtn.addEventListener("click", closeCardModal);
cardModal.addEventListener("click", (e) => { if (e.target === cardModal) closeCardModal(); });

// Card form submission
cardForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const formData = new FormData(cardForm);
  const front = formData.get("front");
  const back = formData.get("back");
  const deck = decks[activeDeckIndex];

  const existingCard = deck.cards[currentCardIndex];
  if (cardModal.dataset.editing === "true") {
    existingCard.front = front;
    existingCard.back = back;
    cardModal.dataset.editing = "false";
  } else {
    deck.cards.push({ front, back });
    currentCardIndex = deck.cards.length - 1;
  }

  cardForm.reset();
  closeCardModal();
  renderCurrentCard();
  saveState();
});

// Card toolbar clicks (edit/delete)
cardArea.addEventListener("click", (e) => {
  const deck = decks[activeDeckIndex];
  if (!deck || !deck.cards.length) return;

  if (e.target.classList.contains("edit-card")) {
    openCardModal();
    const card = deck.cards[currentCardIndex];
    cardModal.querySelector("input[name='front']").value = card.front;
    cardModal.querySelector("input[name='back']").value = card.back;
    cardModal.dataset.editing = "true";
  }

  if (e.target.classList.contains("delete-card")) {
    if (confirm("Delete this card?")) {
      deck.cards.splice(currentCardIndex, 1);
      currentCardIndex = Math.min(currentCardIndex, deck.cards.length - 1);
      renderCurrentCard();
      saveState();
    }
  }
});

// Navigation & flip
prevBtn.addEventListener("click", () => {
  const deck = decks[activeDeckIndex];
  if (!deck.cards.length) return;
  currentCardIndex = (currentCardIndex - 1 + deck.cards.length) % deck.cards.length;
  renderCurrentCard();
  saveState();
});

nextBtn.addEventListener("click", () => {
  const deck = decks[activeDeckIndex];
  if (!deck.cards.length) return;
  currentCardIndex = (currentCardIndex + 1) % deck.cards.length;
  renderCurrentCard();
  saveState();
});

flipBtn.addEventListener("click", () => {
  const cardEl = cardArea.querySelector(".card");
  cardEl?.classList.toggle("flipped");
});

// Search
searchInput?.addEventListener("input", () => {
  const query = searchInput.value.trim().toLowerCase();
  const deck = decks[activeDeckIndex];
  if (!deck || !deck.cards.length) return renderCurrentCard();

  if (!query) return renderCurrentCard();

  const filteredIndex = deck.cards.findIndex(
    c => c.front.toLowerCase().includes(query) || c.back.toLowerCase().includes(query)
  );

  if (filteredIndex === -1) {
    cardArea.innerHTML = "<p>No matching cards found.</p>";
  } else {
    renderCurrentCard(filteredIndex);
  }
});

// Keyboard support
document.addEventListener("keydown", (e) => {
  if (document.activeElement.tagName === "INPUT") return; // skip if typing
  if (e.code === "Space") flipBtn.click();
  if (e.code === "ArrowLeft") prevBtn.click();
  if (e.code === "ArrowRight") nextBtn.click();
});

// ==========================
// Initialize app
// ==========================
function init() {
  loadState();

  if (!decks.length) {
    decks = [
      { name: "JavaScript", cards: [] },
      { name: "CSS", cards: [] },
      { name: "HTML", cards: [] },
    ];
  }

  renderSidebar();
  renderDeckHeader();
  renderCurrentCard();
}

init();

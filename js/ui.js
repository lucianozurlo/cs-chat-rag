// Referencias al DOM
const app = document.getElementById("app");
const introSlot = document.getElementById("introSlot");
const welcomeTitle = document.getElementById("welcomeTitle");
const dockSlot = document.getElementById("dockSlot");
const messages = document.getElementById("messages");
const template = document.getElementById("composerTemplate");
const starterDropdown = document.getElementById("starterDropdown");
const starterDropdownClose = document.getElementById("starterDropdownClose");
const starterList = document.getElementById("starterList");
const starterButtons = Array.from(document.querySelectorAll(".starter-chip"));

// Instanciar composer desde template
const composerShell = template.content.firstElementChild.cloneNode(true);
introSlot.appendChild(composerShell);

const composerForm = composerShell.querySelector("#composerForm");
const composerInput = composerShell.querySelector("#composerInput");
const sendBtn = composerShell.querySelector("#sendBtn");
const clearBtn = composerShell.querySelector("#clearBtn");
const attachBtn = composerShell.querySelector("#attachBtn");
const attachMenu = composerShell.querySelector("#attachMenu");
const attachItems = Array.from(composerShell.querySelectorAll("[data-attach]"));

// ─── Helpers de estado de UI ───────────────────────────────────────────────
function isChatting() {
  return app.classList.contains("is-chatting");
}

function getTimeBasedGreeting() {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) return "¡Buen día, Benja!";
  if (hour >= 12 && hour < 20) return "¡Buenas tardes, Benja!";

  return "¡Buenas noches, Benja!";
}

function setRandomGreeting() {
  const greeting = RANDOM_GREETINGS[Math.floor(Math.random() * RANDOM_GREETINGS.length)];
  welcomeTitle.textContent = greeting === "__TIME_BASED__" ? getTimeBasedGreeting() : greeting;
}

function toggleSendState() {
  sendBtn.disabled =
    isLockedUntilReplyFinishes ||
    isAwaitingResponse ||
    isTransitioning ||
    !composerInput.value.trim();
}

// ─── Resize y métricas del dock ───────────────────────────────────────────
function updateDockMetrics() {
  requestAnimationFrame(() => {
    const dockHeight = Math.ceil(document.getElementById("dock").getBoundingClientRect().height) || 180;
    app.style.setProperty("--dock-h", `${dockHeight}px`);
  });
}

function autoResize() {
  composerInput.style.height = "auto";
  composerInput.style.height = Math.min(composerInput.scrollHeight, 220) + "px";
  updateDockMetrics();
}

// ─── Mensajes ─────────────────────────────────────────────────────────────
function scrollToBottom() {
  requestAnimationFrame(() => {
    const conv = document.querySelector(".conversation");
    if (conv) conv.scrollTop = conv.scrollHeight;
  });
}

function createTypingDots() {
  const fragment = document.createDocumentFragment();

  for (let i = 0; i < 3; i += 1) {
    const dot = document.createElement("span");
    dot.className = "typing-dot";
    fragment.appendChild(dot);
  }

  return fragment;
}

function createMessageRow(role, text, isTyping = false) {
  const row = document.createElement("div");
  row.className = `message-row ${role}${isTyping ? " typing" : ""}`;

  const bubble = document.createElement("div");
  bubble.className = "message-bubble";

  if (isTyping) {
    bubble.appendChild(createTypingDots());
  } else if (role === "assistant" && typeof renderAssistantContent === "function") {
    const rawText = String(text || "");
    row.dataset.rawText = rawText;
    bubble.appendChild(renderAssistantContent(rawText));
  } else if (role === "assistant" && typeof renderMarkdown === "function") {
    const rawText = String(text || "");
    row.dataset.rawText = rawText;
    bubble.appendChild(renderMarkdown(rawText));
  } else {
    const rawText = String(text || "");
    row.dataset.rawText = rawText;
    bubble.textContent = rawText;
  }

  row.appendChild(bubble);
  return row;
}

function appendMessage(role, text, options = {}) {
  const row = createMessageRow(role, text, options.typing);
  messages.appendChild(row);
  scrollToBottom();
  return row;
}

// ─── Persistencia ─────────────────────────────────────────────────────────
function getStoredMessages() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveMessages() {
  const data = Array.from(messages.querySelectorAll(".message-row"))
    .filter((row) => !row.classList.contains("typing"))
    .map((row) => ({
      role: row.classList.contains("assistant") ? "assistant" : "user",
      text: row.dataset.rawText || row.querySelector(".message-bubble")?.innerText || ""
    }));

  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function loadMessages() {
  const stored = getStoredMessages();

  if (!stored.length) {
    autoResize();
    toggleSendState();
    return;
  }

  stored.forEach((item) => {
    messages.appendChild(createMessageRow(item.role, item.text));
  });

  enterChatModeWithoutAnimation();
  scrollToBottom();
  autoResize();
  toggleSendState();
}

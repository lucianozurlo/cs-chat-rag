// ─── Submit del prompt ────────────────────────────────────────────────────

async function submitPrompt() {
  const text = composerInput.value.trim();
  if (!text || isAwaitingResponse || isTransitioning || isLockedUntilReplyFinishes) return;

  isLockedUntilReplyFinishes = true;
  toggleSendState();
  closeStarterDropdown();
  closeAttachMenu();

  if (!isChatting()) {
    await transitionToChatMode();
  }

  appendMessage("user", text);
  saveMessages();
  composerInput.value = "";
  autoResize();
  composerInput.focus();

  await showTypingAndReply(text);
  toggleSendState();
}

// ─── Event listeners ──────────────────────────────────────────────────────

composerForm.addEventListener("submit", (event) => {
  event.preventDefault();
  submitPrompt();
});

composerInput.addEventListener("input", () => {
  autoResize();
  toggleSendState();
});

composerInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    submitPrompt();
  }
});

starterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (isChatting() || isTransitioning) return;
    toggleStarterDropdown(button.dataset.group);
  });
});

starterDropdownClose.addEventListener("click", closeStarterDropdown);

attachBtn.addEventListener("click", () => {
  if (isTransitioning) return;
  toggleAttachMenu();
});

attachItems.forEach((item) => {
  item.addEventListener("click", () => {
    const type = item.dataset.attach;
    const prefix = type === "imagen" ? "[Imagen] " : "[Documento] ";
    const current = composerInput.value.trim();
    composerInput.value = current ? `${current} ${prefix}` : prefix;
    autoResize();
    toggleSendState();
    closeAttachMenu();
    composerInput.focus();
    composerInput.setSelectionRange(composerInput.value.length, composerInput.value.length);
  });
});

clearBtn.addEventListener("click", clearChat);

document.addEventListener("click", (event) => {
  if (!composerShell.contains(event.target)) {
    closeAttachMenu();
  }

  const insideStarter =
    starterDropdown.contains(event.target) ||
    starterButtons.some((button) => button.contains(event.target));
  if (!insideStarter) {
    closeStarterDropdown();
  }
});

window.addEventListener("resize", () => {
  updateDockMetrics();
  if (!isChatting() && !isTransitioning) return;
  scrollToBottom();
});

// ─── Init ─────────────────────────────────────────────────────────────────

setRandomGreeting();
loadMessages();
updateDockMetrics();
window.addEventListener("load", updateDockMetrics);

// ─── Attach menu ──────────────────────────────────────────────────────────

function openAttachMenu() {
  clearTimeout(attachMenuTimeout);
  attachMenu.hidden = false;
  requestAnimationFrame(() => attachMenu.classList.add("is-open"));
  attachBtn.classList.add("is-active");
}

function closeAttachMenu() {
  clearTimeout(attachMenuTimeout);
  attachMenu.classList.remove("is-open");
  attachBtn.classList.remove("is-active");
  attachMenuTimeout = setTimeout(() => {
    attachMenu.hidden = true;
  }, 220);
}

function toggleAttachMenu() {
  if (attachMenu.hidden || !attachMenu.classList.contains("is-open")) {
    openAttachMenu();
  } else {
    closeAttachMenu();
  }
}

// ─── Starter dropdown ─────────────────────────────────────────────────────

function closeStarterDropdown() {
  clearTimeout(starterDropdownTimeout);
  starterDropdown.classList.remove("is-open");
  activeStarterGroup = null;
  starterButtons.forEach((button) => button.classList.remove("is-active"));
  starterDropdownTimeout = setTimeout(() => {
    starterDropdown.hidden = true;
  }, 220);
}

function openStarterDropdown(group) {
  const preset = STARTER_PRESETS[group];
  if (!preset) return;

  activeStarterGroup = group;
  starterButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.group === group);
  });

  starterList.innerHTML = "";

  preset.items.forEach((item) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "starter-item";
    button.textContent = item;
    button.addEventListener("click", () => {
      composerInput.value = item;
      autoResize();
      toggleSendState();
      closeStarterDropdown();
      composerInput.focus();
      composerInput.setSelectionRange(composerInput.value.length, composerInput.value.length);
    });
    starterList.appendChild(button);
  });

  clearTimeout(starterDropdownTimeout);
  starterDropdown.hidden = false;
  requestAnimationFrame(() => starterDropdown.classList.add("is-open"));
}

function toggleStarterDropdown(group) {
  if (activeStarterGroup === group && !starterDropdown.hidden) {
    closeStarterDropdown();
    return;
  }
  openStarterDropdown(group);
}

// ─── Animaciones de transición del composer ───────────────────────────────

function computeDockRect() {
  const appRect = app.getBoundingClientRect();
  const shellRect = composerShell.getBoundingClientRect();
  const finalWidth = Math.min(860, appRect.width);
  return {
    left: appRect.left + (appRect.width - finalWidth) / 2,
    top:
      appRect.bottom -
      shellRect.height -
      parseFloat(getComputedStyle(app).getPropertyValue("--composer-bottom-offset") || "0"),
    width: finalWidth,
  };
}

function computeIntroRect() {
  const slotRect = introSlot.getBoundingClientRect();
  const shellRect = composerShell.getBoundingClientRect();
  const finalWidth = slotRect.width || shellRect.width;
  return {
    left: slotRect.left + (slotRect.width - finalWidth) / 2,
    top: slotRect.top,
    width: finalWidth,
  };
}

function enterChatModeWithoutAnimation() {
  dockSlot.appendChild(composerShell);
  app.classList.remove("is-transitioning");
  app.classList.add("is-chatting");
  updateDockMetrics();
  toggleSendState();
  closeStarterDropdown();
}

function transitionToChatMode() {
  if (isChatting() || isTransitioning) return Promise.resolve();

  isTransitioning = true;
  toggleSendState();
  closeStarterDropdown();
  closeAttachMenu();

  const startRect = composerShell.getBoundingClientRect();
  introSlot.style.minHeight = `${Math.ceil(startRect.height)}px`;
  const endRect = computeDockRect();

  composerShell.classList.add("composer-floating");
  composerShell.style.left = `${startRect.left}px`;
  composerShell.style.top = `${startRect.top}px`;
  composerShell.style.width = `${startRect.width}px`;
  composerShell.style.position = "fixed";

  document.body.appendChild(composerShell);
  app.classList.add("is-transitioning");

  return new Promise((resolve) => {
    const animation = composerShell.animate(
      [
        { left: `${startRect.left}px`, top: `${startRect.top}px`, width: `${startRect.width}px` },
        { left: `${endRect.left}px`,   top: `${endRect.top}px`,   width: `${endRect.width}px`   },
      ],
      { duration: 680, easing: "cubic-bezier(.22,1,.36,1)", fill: "forwards" }
    );

    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      animation.cancel();
      composerShell.classList.remove("composer-floating");
      composerShell.style.position = "";
      composerShell.style.left = "";
      composerShell.style.top = "";
      composerShell.style.width = "";
      dockSlot.appendChild(composerShell);
      introSlot.style.minHeight = "";
      app.classList.remove("is-transitioning");
      app.classList.add("is-chatting");
      isTransitioning = false;
      updateDockMetrics();
      toggleSendState();
      resolve();
    };

    animation.addEventListener("finish", finish, { once: true });
    setTimeout(finish, 760);
  });
}

function resetComposerToIntro() {
  introSlot.appendChild(composerShell);
  composerShell.classList.remove("composer-floating");
  composerShell.style.position = "";
  composerShell.style.left = "";
  composerShell.style.top = "";
  composerShell.style.width = "";
  introSlot.style.minHeight = "";
  app.classList.remove("is-transitioning", "is-chatting", "is-returning");
  closeStarterDropdown();
  closeAttachMenu();
  autoResize();
  toggleSendState();
  composerInput.focus();
}

function clearChat() {
  clearTimeout(typingTimeout);
  setRandomGreeting();
  isAwaitingResponse = false;
  isLockedUntilReplyFinishes = false;
  localStorage.removeItem(STORAGE_KEY);
  messages.innerHTML = "";
  composerInput.value = "";
  autoResize();
  closeStarterDropdown();
  closeAttachMenu();

  if (!isChatting() || isTransitioning) {
    isTransitioning = false;
    resetComposerToIntro();
    return;
  }

  isTransitioning = true;
  toggleSendState();

  const startRect = composerShell.getBoundingClientRect();
  introSlot.style.minHeight = `${Math.ceil(startRect.height)}px`;

  composerShell.classList.add("composer-floating");
  composerShell.style.left = `${startRect.left}px`;
  composerShell.style.top = `${startRect.top}px`;
  composerShell.style.width = `${startRect.width}px`;
  composerShell.style.position = "fixed";
  document.body.appendChild(composerShell);

  app.classList.remove("is-chatting");
  app.classList.add("is-returning");

  requestAnimationFrame(() => {
    const endRect = computeIntroRect();
    const animation = composerShell.animate(
      [
        { left: `${startRect.left}px`, top: `${startRect.top}px`, width: `${startRect.width}px` },
        { left: `${endRect.left}px`,   top: `${endRect.top}px`,   width: `${endRect.width}px`   },
      ],
      { duration: 680, easing: "cubic-bezier(.22,1,.36,1)", fill: "forwards" }
    );

    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      animation.cancel();
      isTransitioning = false;
      resetComposerToIntro();
    };

    animation.addEventListener("finish", finish, { once: true });
    setTimeout(finish, 760);
  });
}

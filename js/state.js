// Estado global de la aplicación
let typingTimeout = null;
let attachMenuTimeout = null;
let starterDropdownTimeout = null;
let isAwaitingResponse = false;
let isTransitioning = false;
let isLockedUntilReplyFinishes = false;
let activeStarterGroup = null;

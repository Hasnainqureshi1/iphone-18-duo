/* ============================================================
   state.js — central OS state store with pub/sub + persistence
   ============================================================ */
(function () {
  "use strict";

  const STORAGE_KEY = "duoOS.v1";

  const defaults = {
    booted: false,
    deviceLocked: true,
    faceIdBusy: false,

    batteryPercentage: 87,
    charging: false,
    lowPowerMode: false,

    wifiEnabled: true,
    bluetoothEnabled: true,
    airplaneMode: false,
    cellularEnabled: true,
    focusMode: false,
    flashlight: false,
    orientationLocked: false,

    brightness: 0.9,
    volume: 0.6,

    darkMode: false,
    textSizeStep: 2, // 0..4
    showBatteryPercent: true,
    wallpaper: "dunes",
    dualWallpaper: true,

    // Duo Display settings
    duoDisplayMode: "extended", // automatic | independent | extended
    hingeAwareness: true,
    crossScreenDrag: true,
    preferredScreen: "left", // left | right | last
    spanAppsAutomatically: false,
    mirrorScreens: false,

    // window manager
    leftScreen: { mode: "home", app: null, page: 0 },
    rightScreen: { mode: "home", app: null, page: 0 },
    spannedApp: null,
    lastUsedScreen: "left",
    runningApps: [], // [{id, screen:'left'|'right'|'span', openedAt}]

    controlCenterOpen: false,
    notificationCenterOpen: false,
    appSwitcherOpen: false,
    contextMenuOpen: false,
    activeModal: null,

    notifications: [],
    currentlyPlayingAudio: null,
    musicPlaying: false,
    musicTrack: 0,
    musicProgress: 0,
    timerRunning: false,
    timerRemaining: 0,
    timerDuration: 0,
    stopwatchRunning: false,
    stopwatchMs: 0,

    notes: [],
    messages: {},
    photos: [],
    cameraFacing: "back",
    cameraMode: "photo",

    orientation: "portrait"
  };

  function loadPersisted() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch (e) {
      return {};
    }
  }

  const PERSIST_KEYS = [
    "darkMode", "wallpaper", "dualWallpaper", "textSizeStep", "showBatteryPercent",
    "wifiEnabled", "bluetoothEnabled", "airplaneMode", "cellularEnabled",
    "duoDisplayMode", "hingeAwareness", "crossScreenDrag", "preferredScreen",
    "spanAppsAutomatically", "mirrorScreens", "notes", "messages", "brightness", "volume", "photos"
  ];

  const persisted = loadPersisted();
  const state = Object.assign({}, defaults, persisted);

  const listeners = new Map(); // key -> Set(fn)
  const wildcardListeners = new Set();

  function subscribe(key, fn) {
    if (typeof key === "function") {
      wildcardListeners.add(key);
      return () => wildcardListeners.delete(key);
    }
    if (!listeners.has(key)) listeners.set(key, new Set());
    listeners.get(key).add(fn);
    return () => listeners.get(key).delete(fn);
  }

  function emit(key) {
    if (listeners.has(key)) listeners.get(key).forEach((fn) => fn(state[key], state));
    wildcardListeners.forEach((fn) => fn(key, state));
  }

  function set(key, value) {
    if (typeof key === "object") {
      Object.keys(key).forEach((k) => {
        state[k] = key[k];
      });
      Object.keys(key).forEach((k) => emit(k));
      persistIfNeeded(Object.keys(key));
      return;
    }
    state[key] = value;
    emit(key);
    persistIfNeeded([key]);
  }

  function patch(key, partial) {
    state[key] = Object.assign({}, state[key], partial);
    emit(key);
    persistIfNeeded([key]);
  }

  function get(key) {
    return key ? state[key] : state;
  }

  let persistTimer = null;
  function persistIfNeeded(keys) {
    if (!keys.some((k) => PERSIST_KEYS.includes(k))) return;
    clearTimeout(persistTimer);
    persistTimer = setTimeout(() => {
      try {
        const toSave = {};
        PERSIST_KEYS.forEach((k) => (toSave[k] = state[k]));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
      } catch (e) {
        /* storage unavailable */
      }
    }, 150);
  }

  function reset() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {}
    location.reload();
  }

  window.OS = window.OS || {};
  window.OS.state = state;
  window.OS.get = get;
  window.OS.set = set;
  window.OS.patch = patch;
  window.OS.subscribe = subscribe;
  window.OS.resetSimulator = reset;
  window.OS.defaults = defaults;
})();

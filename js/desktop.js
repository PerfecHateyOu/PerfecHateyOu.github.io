(function () {
  const desktop = document.getElementById("desktop");
  if (!desktop) return;

  const icons = document.getElementById("desktop-icons");
  const tasks = document.getElementById("taskbar-tasks");
  const startButton = document.getElementById("start-button");
  const startMenu = document.getElementById("start-menu");
  const clockButton = document.getElementById("clock");
  const clockTime = document.getElementById("clock-time");
  const clockPop = document.getElementById("clock-pop");
  const clockDate = document.getElementById("clock-date");
  const live = document.getElementById("live");
  const narrowQuery = window.matchMedia("(max-width: 760px)");
  const reduceQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

  const PRESETS = {
    top: { x: 108, y: 12, w: 460, h: 0.9 },
    projects: { x: 156, y: 44, w: 740, h: 0.86 },
    stack: { x: 188, y: 32, w: 620, h: 0.74 },
    about: { x: 210, y: 24, w: 680, h: 0.78 },
    contact: { x: 250, y: 72, w: 480, h: 340 },
  };

  let z = 5;
  let wasNarrow = narrowQuery.matches;
  let desktopMemory = null;
  let lastFocus = null;

  function isNarrow() {
    return narrowQuery.matches;
  }

  function windows() {
    return Array.prototype.slice.call(document.querySelectorAll(".windows > .window"));
  }

  function announce(text) {
    if (!live) return;
    live.textContent = "";
    window.setTimeout(function () { live.textContent = text; }, 20);
  }

  function rememberFocus() {
    lastFocus = document.activeElement;
  }

  function restoreFocus() {
    if (lastFocus && typeof lastFocus.focus === "function") lastFocus.focus();
  }

  function setBox(win, x, y, w, h) {
    win.style.left = Math.round(x) + "px";
    win.style.top = Math.round(y) + "px";
    win.style.width = Math.round(w) + "px";
    win.style.height = Math.round(h) + "px";
  }

  function clamp(win) {
    if (!win || isNarrow() || win.classList.contains("is-max")) return;
    const bounds = desktop.getBoundingClientRect();
    const rect = win.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    let x = rect.left - bounds.left;
    let y = rect.top - bounds.top;
    const keep = 72;
    x = Math.min(Math.max(x, -rect.width + keep), Math.max(0, bounds.width - keep));
    y = Math.min(Math.max(0, y), Math.max(0, bounds.height - 36));
    win.style.left = Math.round(x) + "px";
    win.style.top = Math.round(y) + "px";
  }

  function applyPreset(win) {
    const box = PRESETS[win.id] || PRESETS.about;
    const bounds = desktop.getBoundingClientRect();
    const w = Math.min(box.w, Math.max(280, bounds.width - 116));
    const h = box.h <= 1 ? Math.round(bounds.height * box.h) : Math.min(box.h, bounds.height - 20);
    let x = box.x;
    let y = box.y;
    if (x + w > bounds.width - 8) x = Math.max(8, bounds.width - w - 8);
    if (y + h > bounds.height - 8) y = Math.max(8, bounds.height - h - 8);
    setBox(win, x, y, w, h);
  }

  function layoutPair() {
    const top = document.getElementById("top");
    const projects = document.getElementById("projects");
    if (!top || !projects) return;
    const bounds = desktop.getBoundingClientRect();
    const iconsW = 104;
    const gap = 10;
    const availW = bounds.width - iconsW - gap * 2;
    const availH = Math.max(180, bounds.height - gap * 2);
    if (availW >= 820) {
      const leftW = Math.min(520, Math.max(380, Math.round(availW * 0.42)));
      setBox(top, iconsW + gap, gap, leftW, availH);
      setBox(projects, iconsW + gap + leftW + gap, gap, availW - leftW - gap, availH);
    } else {
      applyPreset(top);
      applyPreset(projects);
    }
    top.dataset.placed = "1";
    projects.dataset.placed = "1";
  }

  function ensurePlaced(win) {
    if (!win || isNarrow() || win.classList.contains("is-max")) return;
    if (win.dataset.placed === "1") {
      clamp(win);
      return;
    }
    applyPreset(win);
    win.dataset.placed = "1";
    clamp(win);
  }

  function setMaxLabel(win, maximized) {
    const btn = win.querySelector(".win-max");
    if (!btn) return;
    const name = win.getAttribute("data-name") || "window";
    btn.setAttribute("aria-label", (maximized ? "Restore " : "Maximize ") + name);
    btn.classList.toggle("is-restore", maximized);
  }

  function activate(win) {
    windows().forEach(function (other) { other.classList.remove("is-active"); });
    win.classList.add("is-active");
    z += 1;
    win.style.zIndex = String(z);
    syncTaskbar();
  }

  function hideForMinimize(win) {
    win.classList.remove("is-open", "is-active");
    win.classList.add("is-min");
  }

  function syncTaskbar() {
    if (!tasks) return;
    const iconsById = {
      top: "monitor",
      projects: "folder",
      stack: "sliders",
      about: "note",
      contact: "mail",
    };
    const shown = windows().filter(function (win) {
      return win.classList.contains("is-open") || win.classList.contains("is-min");
    });
    tasks.classList.toggle("is-crowded", shown.length > 1);
    tasks.innerHTML = shown
      .map(function (win) {
        const name = win.getAttribute("data-name") || win.id;
        const pressed = win.classList.contains("is-open") && win.classList.contains("is-active");
        const icon = iconsById[win.id] || "file";
        return (
          '<button type="button" class="task-btn" data-task="' + win.id + '" aria-pressed="' + (pressed ? "true" : "false") + '" aria-label="' + name + '">' +
          '<svg class="ico ico-sm" aria-hidden="true"><use href="#ico-' + icon + '"></use></svg>' +
          "<span>" + name + "</span></button>"
        );
      })
      .join("");
  }

  function focusHeading(win) {
    const heading = win.querySelector("h1, h2");
    if (!heading) return;
    if (!heading.hasAttribute("tabindex")) heading.setAttribute("tabindex", "-1");
    heading.focus({ preventScroll: true });
  }

  function scrollTarget(win, el) {
    const scroller = win.querySelector(".window-body");
    if (!scroller || !el) return;
    const top = el.getBoundingClientRect().top - scroller.getBoundingClientRect().top + scroller.scrollTop - 8;
    scroller.scrollTo({
      top: Math.max(0, top),
      behavior: reduceQuery.matches ? "auto" : "smooth",
    });
  }

  function revealTarget(win, el) {
    scrollTarget(win, el);
    if (!el) return;
    el.classList.add("is-target");
    window.setTimeout(function () { el.classList.remove("is-target"); }, 1800);
    if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex", "-1");
    el.focus({ preventScroll: true });
  }

  function openWindow(win, opts) {
    if (!win) return;
    opts = opts || {};
    if (isNarrow()) {
      windows().forEach(function (other) {
        if (other !== win && other.classList.contains("is-open")) hideForMinimize(other);
      });
    }
    win.classList.remove("is-min");
    win.classList.add("is-open");
    ensurePlaced(win);
    activate(win);
    if (opts.target) {
      const target = opts.target;
      window.requestAnimationFrame(function () {
        if (opts.skipFocus) scrollTarget(win, target);
        else revealTarget(win, target);
      });
    } else if (!opts.skipFocus) {
      focusHeading(win);
    }
    if (!opts.quiet) announce((win.getAttribute("data-name") || "Window") + " open");
  }

  function minimize(win) {
    if (!win) return;
    hideForMinimize(win);
    syncTaskbar();
    const btn = tasks && tasks.querySelector('[data-task="' + win.id + '"]');
    if (btn) btn.focus();
    announce((win.getAttribute("data-name") || "Window") + " minimized");
  }

  function closeWindow(win) {
    if (!win) return;
    win.classList.remove("is-open", "is-min", "is-max", "is-active");
    setMaxLabel(win, false);
    syncTaskbar();
    const icon = document.querySelector('.desk-icon[href="#' + win.id + '"]');
    if (icon) icon.focus();
    else if (startButton) startButton.focus();
    announce((win.getAttribute("data-name") || "Window") + " closed");
  }

  function toggleMax(win) {
    if (!win || isNarrow()) return;
    if (win.classList.contains("is-max")) {
      win.classList.remove("is-max");
      setMaxLabel(win, false);
      clamp(win);
    } else {
      win.classList.add("is-max");
      setMaxLabel(win, true);
    }
    activate(win);
  }

  function windowOf(el) {
    if (!el) return null;
    if (el.classList.contains("window") && el.parentElement && el.parentElement.classList.contains("windows")) return el;
    const win = el.closest(".window");
    if (win && win.parentElement && win.parentElement.classList.contains("windows")) return win;
    return null;
  }

  function applyHash(hash, opts) {
    if (!hash) return false;
    const el = document.getElementById(hash);
    const win = windowOf(el);
    if (!win) return false;
    opts = Object.assign({}, opts);
    if (opts.exclusive) {
      windows().forEach(function (other) {
        if (other !== win) other.classList.remove("is-open", "is-min", "is-active");
      });
    }
    if (el !== win) opts.target = el;
    openWindow(win, opts);
    return true;
  }

  function openDefaults(opts) {
    opts = opts || {};
    windows().forEach(function (win) {
      win.classList.remove("is-open", "is-min", "is-active");
    });
    const top = document.getElementById("top");
    const projects = document.getElementById("projects");
    if (!isNarrow() && top && top.dataset.placed !== "1") layoutPair();
    if (isNarrow()) openWindow(top, opts);
    else {
      openWindow(projects, opts);
      openWindow(top, opts);
    }
  }

  function selectIcon(icon) {
    if (!icons) return;
    icons.querySelectorAll(".desk-icon.is-selected").forEach(function (node) {
      node.classList.remove("is-selected");
    });
    if (icon) icon.classList.add("is-selected");
  }

  function closeStart(opts) {
    if (!startMenu || startMenu.hidden) return;
    startMenu.hidden = true;
    if (startButton) startButton.setAttribute("aria-expanded", "false");
    if (!opts || !opts.skipFocus) {
      if (startButton) startButton.focus();
    }
  }

  function openStart() {
    closeClock();
    if (!startMenu || !startButton) return;
    startMenu.hidden = false;
    startButton.setAttribute("aria-expanded", "true");
    const first = startMenu.querySelector("a, button");
    if (first) first.focus();
  }

  function toggleStart() {
    if (startMenu && !startMenu.hidden) closeStart();
    else openStart();
  }

  function closeClock() {
    if (!clockPop || clockPop.hidden) return;
    clockPop.hidden = true;
    if (clockButton) clockButton.setAttribute("aria-expanded", "false");
  }

  function toggleClock() {
    if (!clockPop || !clockButton) return;
    if (clockPop.hidden) {
      closeStart({ skipFocus: true });
      clockPop.hidden = false;
      clockButton.setAttribute("aria-expanded", "true");
    } else {
      closeClock();
    }
  }

  function closeModals() {
    const logoff = document.getElementById("logoff-scrim");
    const shutdown = document.getElementById("shutdown-scrim");
    if (logoff) logoff.hidden = true;
    if (shutdown) shutdown.hidden = true;
  }

  function openModal(id, focusId) {
    closeStart({ skipFocus: true });
    closeClock();
    closeModals();
    rememberFocus();
    const scrim = document.getElementById(id);
    if (!scrim) return;
    scrim.hidden = false;
    const target = document.getElementById(focusId);
    if (target) target.focus();
  }

  function anyModal() {
    return document.querySelector(".scrim:not([hidden]), #off-screen:not([hidden])");
  }

  function showDesktop() {
    const open = windows().filter(function (win) { return win.classList.contains("is-open"); });
    if (open.length) {
      desktopMemory = open.map(function (win) { return win.id; });
      open.forEach(hideForMinimize);
      syncTaskbar();
      if (startButton) startButton.focus();
      announce("Desktop shown");
      return;
    }
    if (desktopMemory && desktopMemory.length) {
      const ids = desktopMemory.slice();
      desktopMemory = null;
      if (isNarrow()) {
        openWindow(document.getElementById(ids[ids.length - 1]));
      } else {
        ids.forEach(function (id) { openWindow(document.getElementById(id), { quiet: true, skipFocus: true }); });
        const last = document.getElementById(ids[0]);
        if (last) openWindow(last);
      }
    }
  }

  function logOff() {
    closeModals();
    windows().forEach(function (win) {
      win.classList.remove("is-open", "is-min", "is-max", "is-active");
      setMaxLabel(win, false);
    });
    syncTaskbar();
    desktopMemory = null;
    announce("Logged off");
    if (icons) {
      const first = icons.querySelector(".desk-icon");
      if (first) first.focus();
    }
  }

  function powerOff() {
    closeModals();
    const screen = document.getElementById("off-screen");
    if (!screen) return;
    screen.hidden = false;
    const back = document.getElementById("power-on");
    if (back) back.focus();
  }

  function powerOn() {
    const screen = document.getElementById("off-screen");
    if (screen) screen.hidden = true;
    logOff();
  }

  function visibleFocusable(root) {
    return Array.prototype.slice.call(root.querySelectorAll("a[href], button:not([disabled]), [tabindex]:not([tabindex='-1'])")).filter(function (el) {
      return el.getClientRects().length > 0;
    });
  }

  function bindDrag(win) {
    const bar = win.querySelector(".titlebar");
    if (!bar) return;
    bar.addEventListener("pointerdown", function (event) {
      if (event.button !== 0) return;
      if (event.target.closest("button")) return;
      activate(win);
      if (isNarrow() || win.classList.contains("is-max")) return;
      const bounds = desktop.getBoundingClientRect();
      const rect = win.getBoundingClientRect();
      const originX = event.clientX;
      const originY = event.clientY;
      const startLeft = rect.left - bounds.left;
      const startTop = rect.top - bounds.top;
      bar.setPointerCapture(event.pointerId);
      document.body.classList.add("is-dragging");

      function move(ev) {
        setBox(win, startLeft + ev.clientX - originX, startTop + ev.clientY - originY, rect.width, rect.height);
        clamp(win);
        win.dataset.placed = "1";
      }

      function up() {
        bar.removeEventListener("pointermove", move);
        bar.removeEventListener("pointerup", up);
        bar.removeEventListener("pointercancel", up);
        document.body.classList.remove("is-dragging");
      }

      bar.addEventListener("pointermove", move);
      bar.addEventListener("pointerup", up);
      bar.addEventListener("pointercancel", up);
    });

    bar.addEventListener("dblclick", function (event) {
      if (event.target.closest("button")) return;
      toggleMax(win);
    });
  }

  function bindResize(win) {
    const handle = win.querySelector(".resizer");
    if (!handle) return;
    handle.addEventListener("pointerdown", function (event) {
      if (event.button !== 0 || isNarrow() || win.classList.contains("is-max")) return;
      event.preventDefault();
      event.stopPropagation();
      const rect = win.getBoundingClientRect();
      const originX = event.clientX;
      const originY = event.clientY;
      handle.setPointerCapture(event.pointerId);
      document.body.classList.add("is-dragging");

      function move(ev) {
        const bounds = desktop.getBoundingClientRect();
        const w = Math.max(280, Math.min(bounds.width - 8, rect.width + ev.clientX - originX));
        const h = Math.max(180, Math.min(bounds.height - 8, rect.height + ev.clientY - originY));
        win.style.width = Math.round(w) + "px";
        win.style.height = Math.round(h) + "px";
        win.dataset.placed = "1";
      }

      function up() {
        handle.removeEventListener("pointermove", move);
        handle.removeEventListener("pointerup", up);
        handle.removeEventListener("pointercancel", up);
        document.body.classList.remove("is-dragging");
      }

      handle.addEventListener("pointermove", move);
      handle.addEventListener("pointerup", up);
      handle.addEventListener("pointercancel", up);
    });

    handle.addEventListener("keydown", function (event) {
      if (isNarrow() || win.classList.contains("is-max")) return;
      const step = event.shiftKey ? 48 : 16;
      const rect = win.getBoundingClientRect();
      if (event.key === "ArrowRight") win.style.width = Math.round(rect.width + step) + "px";
      else if (event.key === "ArrowLeft") win.style.width = Math.round(Math.max(280, rect.width - step)) + "px";
      else if (event.key === "ArrowDown") win.style.height = Math.round(rect.height + step) + "px";
      else if (event.key === "ArrowUp") win.style.height = Math.round(Math.max(180, rect.height - step)) + "px";
      else return;
      event.preventDefault();
      win.dataset.placed = "1";
    });
  }

  function bindWindow(win) {
    const min = win.querySelector(".win-min");
    const max = win.querySelector(".win-max");
    const close = win.querySelector(".win-close");
    if (min) min.addEventListener("click", function () { minimize(win); });
    if (max) max.addEventListener("click", function () { toggleMax(win); });
    if (close) close.addEventListener("click", function () { closeWindow(win); });
    win.addEventListener("pointerdown", function () { activate(win); });
    bindDrag(win);
    bindResize(win);
  }

  function iconColumns(items) {
    if (items.length < 2) return 1;
    const y = items[0].getBoundingClientRect().top;
    let cols = 1;
    for (let i = 1; i < items.length; i += 1) {
      if (Math.abs(items[i].getBoundingClientRect().top - y) > 12) break;
      cols += 1;
    }
    return cols;
  }

  function tick() {
    const now = new Date();
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const suffix = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    const label = hours + ":" + minutes + " " + suffix;
    if (clockTime) {
      clockTime.textContent = label;
      clockTime.dateTime = now.toISOString();
    }
    const longDate = now.toLocaleDateString(undefined, {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
    if (clockDate) clockDate.textContent = longDate;
    if (clockButton) clockButton.setAttribute("aria-label", label + ", " + longDate);
  }

  windows().forEach(bindWindow);

  if (tasks) {
    tasks.addEventListener("click", function (event) {
      const btn = event.target.closest(".task-btn");
      if (!btn) return;
      const win = document.getElementById(btn.getAttribute("data-task"));
      if (!win) return;
      if (win.classList.contains("is-open") && win.classList.contains("is-active")) minimize(win);
      else openWindow(win);
    });
  }

  if (startButton) startButton.addEventListener("click", toggleStart);
  if (clockButton) clockButton.addEventListener("click", toggleClock);

  const showDesktopButton = document.getElementById("show-desktop");
  if (showDesktopButton) showDesktopButton.addEventListener("click", showDesktop);

  const logoffButton = document.getElementById("logoff-button");
  const shutdownButton = document.getElementById("shutdown-button");
  if (logoffButton) logoffButton.addEventListener("click", function () { openModal("logoff-scrim", "logoff-cancel"); });
  if (shutdownButton) shutdownButton.addEventListener("click", function () { openModal("shutdown-scrim", "shutdown-cancel"); });

  function wireClose(buttonId, action) {
    const button = document.getElementById(buttonId);
    if (button) button.addEventListener("click", action);
  }

  wireClose("logoff-close", function () { closeModals(); restoreFocus(); });
  wireClose("logoff-cancel", function () { closeModals(); restoreFocus(); });
  wireClose("logoff-confirm", logOff);
  wireClose("shutdown-close", function () { closeModals(); restoreFocus(); });
  wireClose("shutdown-cancel", function () { closeModals(); restoreFocus(); });
  wireClose("power-on", powerOn);

  document.querySelectorAll("[data-power]").forEach(function (button) {
    button.addEventListener("click", function () {
      const action = button.getAttribute("data-power");
      if (action === "standby") {
        closeModals();
        showDesktop();
      } else if (action === "off") {
        powerOff();
      } else if (action === "restart") {
        window.location.reload();
      }
    });
  });

  document.addEventListener("click", function (event) {
    const link = event.target.closest("a");
    if (!link) return;
    const href = link.getAttribute("href") || "";
    if (link.closest("#start-menu") && href.charAt(0) !== "#") closeStart({ skipFocus: true });
    if (href.charAt(0) !== "#") return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    const hash = decodeURIComponent(href.slice(1));
    if (!hash) return;
    const el = document.getElementById(hash);
    const win = windowOf(el);
    if (!win) return;
    event.preventDefault();
    selectIcon(link.classList.contains("desk-icon") ? link : null);
    if (link.closest("#start-menu")) closeStart({ skipFocus: true });
    if ((location.hash || "") !== "#" + hash) {
      history.pushState({ xp: hash }, "", "#" + hash);
    }
    const opts = {};
    if (el !== win) opts.target = el;
    openWindow(win, opts);
  });

  window.addEventListener("popstate", function () {
    const hash = decodeURIComponent((location.hash || "").replace(/^#/, ""));
    if (!hash || !applyHash(hash, { exclusive: true })) openDefaults();
  });

  if (icons) {
    icons.addEventListener("focusin", function (event) {
      const icon = event.target.closest(".desk-icon");
      if (icon) selectIcon(icon);
    });
    icons.addEventListener("keydown", function (event) {
      const items = Array.prototype.slice.call(icons.querySelectorAll(".desk-icon"));
      const index = items.indexOf(document.activeElement);
      if (index < 0) return;
      const cols = iconColumns(items);
      let next = null;
      if (event.key === "ArrowRight") next = items[index + 1];
      else if (event.key === "ArrowLeft") next = items[index - 1];
      else if (event.key === "ArrowDown") next = items[index + cols];
      else if (event.key === "ArrowUp") next = items[index - cols];
      else if (event.key === "Home") next = items[0];
      else if (event.key === "End") next = items[items.length - 1];
      else return;
      if (!next) return;
      event.preventDefault();
      next.focus();
    });
  }

  desktop.addEventListener("pointerdown", function (event) {
    if (event.target.closest(".window, .desk-icon")) return;
    selectIcon(null);
    closeStart({ skipFocus: true });
    closeClock();
  });

  document.addEventListener("pointerdown", function (event) {
    if (startMenu && !startMenu.hidden && !event.target.closest("#start-menu, #start-button")) {
      closeStart({ skipFocus: true });
    }
    if (clockPop && !clockPop.hidden && !event.target.closest("#clock-pop, #clock")) closeClock();
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      const off = document.getElementById("off-screen");
      if (off && !off.hidden) {
        powerOn();
        return;
      }
      if (document.querySelector(".scrim:not([hidden])")) {
        closeModals();
        restoreFocus();
        return;
      }
      if (startMenu && !startMenu.hidden) {
        closeStart();
        return;
      }
      if (clockPop && !clockPop.hidden) {
        closeClock();
        if (clockButton) clockButton.focus();
      }
      return;
    }

    if (event.key !== "Tab") return;
    const trap = document.querySelector(".scrim:not([hidden]) .dialog, #start-menu:not([hidden]), #off-screen:not([hidden])");
    if (!trap) return;
    const items = visibleFocusable(trap);
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      last.focus();
      event.preventDefault();
    } else if (!event.shiftKey && document.activeElement === last) {
      first.focus();
      event.preventDefault();
    }
  });

  window.addEventListener("resize", function () {
    const narrow = isNarrow();
    if (narrow && !wasNarrow) {
      const active = document.querySelector(".windows > .window.is-active.is-open") || document.querySelector(".windows > .window.is-open");
      windows().forEach(function (win) {
        if (win !== active && win.classList.contains("is-open")) hideForMinimize(win);
      });
      syncTaskbar();
    }
    if (!narrow && wasNarrow) {
      const top = document.getElementById("top");
      if (top && top.dataset.placed !== "1") layoutPair();
    }
    if (!narrow) {
      windows().forEach(function (win) {
        if (win.classList.contains("is-open")) ensurePlaced(win);
      });
    }
    wasNarrow = narrow;
  });

  tick();
  window.setInterval(tick, 1000);

  const hash = decodeURIComponent((location.hash || "").replace(/^#/, ""));
  if (!(hash && applyHash(hash, { quiet: true, skipFocus: true, exclusive: true }))) {
    openDefaults({ quiet: true, skipFocus: true });
  }
})();

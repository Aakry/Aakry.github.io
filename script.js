(function () {
  var root = document.documentElement;
  var toggle = document.getElementById("theme-toggle");
  var yearEl = document.getElementById("year");
  var desktop = document.getElementById("desktop");
  var topZ = 10;

  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ----- Theme ----- */
  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
  }

  var saved = null;
  try { saved = localStorage.getItem("theme"); } catch (e) {}

  if (saved === "light" || saved === "dark") {
    applyTheme(saved);
  } else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
    applyTheme("dark");
  } else {
    applyTheme("light");
  }

  if (toggle) {
    toggle.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      applyTheme(next);
      try { localStorage.setItem("theme", next); } catch (e) {}
    });
  }

  /* ----- Windows ----- */
  function getWindow(id) {
    return document.querySelector('.window[data-id="' + id + '"]');
  }

  function bringToFront(win) {
    topZ += 1;
    win.style.zIndex = topZ;
  }

  function openWindow(id) {
    var win = getWindow(id);
    if (!win) return;
    win.hidden = false;
    bringToFront(win);
    var focusTarget = win.querySelector(".close-btn");
    if (focusTarget) focusTarget.focus({ preventScroll: true });
  }

  function closeWindow(win) {
    win.hidden = true;
  }

  // Icon and button clicks open windows
  document.querySelectorAll("[data-open]").forEach(function (el) {
    el.addEventListener("click", function () {
      openWindow(el.getAttribute("data-open"));
    });
  });

  // Close buttons
  document.querySelectorAll(".window .close-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      closeWindow(btn.closest(".window"));
    });
  });

  // Clicking anywhere in a window brings it forward
  document.querySelectorAll(".window").forEach(function (win) {
    win.addEventListener("pointerdown", function () {
      bringToFront(win);
    });
  });

  /* ----- Dragging (desktop only; phones stack windows) ----- */
  var isSmall = window.matchMedia("(max-width: 720px)");
  var drag = null;

  document.querySelectorAll(".window").forEach(function (win) {
    var bar = win.querySelector(".window-bar");

    bar.addEventListener("pointerdown", function (e) {
      if (isSmall.matches) return;
      if (e.target.closest(".close-btn")) return;

      var rect = win.getBoundingClientRect();
      var parentRect = desktop.getBoundingClientRect();

      drag = {
        win: win,
        offsetX: e.clientX - rect.left,
        offsetY: e.clientY - rect.top,
        parentLeft: parentRect.left,
        parentTop: parentRect.top
      };

      win.classList.add("is-dragging");
      bar.setPointerCapture(e.pointerId);
      e.preventDefault();
    });

    bar.addEventListener("pointermove", function (e) {
      if (!drag || drag.win !== win) return;

      var parentRect = desktop.getBoundingClientRect();
      var newLeft = e.clientX - drag.offsetX - parentRect.left;
      var newTop = e.clientY - drag.offsetY - parentRect.top;

      // Keep the title bar on screen
      var maxLeft = desktop.clientWidth - 60;
      var maxTop = desktop.clientHeight - 40;
      newLeft = Math.max(-win.offsetWidth + 80, Math.min(newLeft, maxLeft));
      newTop = Math.max(0, Math.min(newTop, maxTop));

      win.style.left = newLeft + "px";
      win.style.top = newTop + "px";
    });

    function endDrag(e) {
      if (!drag || drag.win !== win) return;
      win.classList.remove("is-dragging");
      try { bar.releasePointerCapture(e.pointerId); } catch (err) {}
      drag = null;
    }

    bar.addEventListener("pointerup", endDrag);
    bar.addEventListener("pointercancel", endDrag);
  });
})();

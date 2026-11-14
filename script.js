(function () {
  var root = document.documentElement;
  var desktop = document.getElementById("desktop");
  var themeToggle = document.getElementById("theme-toggle");
  var langToggle = document.getElementById("lang-toggle");
  var yearEl = document.getElementById("year");
  var notice = document.getElementById("notice");
  var noticeOk = document.getElementById("notice-ok");
  var topZ = 10;

  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ===== Theme (light / dark) ===== */
  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
  }

  var savedTheme = null;
  try { savedTheme = localStorage.getItem("theme"); } catch (e) {}

  if (savedTheme === "light" || savedTheme === "dark") {
    applyTheme(savedTheme);
  } else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
    applyTheme("dark");
  } else {
    applyTheme("light");
  }

  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      applyTheme(next);
      try { localStorage.setItem("theme", next); } catch (e) {}
    });
  }

  /* ===== Language (English / Turkish) ===== */
  function setLanguage(lang) {
    root.setAttribute("lang", lang);

    // Text content
    document.querySelectorAll("[data-" + lang + "]").forEach(function (el) {
      if (el.hasAttribute("data-en") || el.hasAttribute("data-tr")) {
        el.textContent = el.getAttribute("data-" + lang);
      }
    });

    // Accessibility labels
    document.querySelectorAll("[data-" + lang + "-label]").forEach(function (el) {
      el.setAttribute("aria-label", el.getAttribute("data-" + lang + "-label"));
    });

    // Placeholder text
    document.querySelectorAll("[data-" + lang + "-placeholder]").forEach(function (el) {
      el.setAttribute("placeholder", el.getAttribute("data-" + lang + "-placeholder"));
    });

    // Button that shows the language you can switch TO
    if (langToggle) {
      langToggle.textContent = lang === "tr" ? "EN" : "TR";
    }

    try { localStorage.setItem("lang", lang); } catch (e) {}
  }

  var savedLang = null;
  try { savedLang = localStorage.getItem("lang"); } catch (e) {}
  var startLang = savedLang || (navigator.language && navigator.language.toLowerCase().indexOf("tr") === 0 ? "tr" : "en");
  setLanguage(startLang);

  if (langToggle) {
    langToggle.addEventListener("click", function () {
      setLanguage(root.getAttribute("lang") === "tr" ? "en" : "tr");
    });
  }

  /* ===== Windows ===== */
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
  }

  // Icons and buttons that open a window
  document.querySelectorAll("[data-open]").forEach(function (el) {
    el.addEventListener("click", function () {
      openWindow(el.getAttribute("data-open"));
    });
  });

  // Close buttons on normal windows
  document.querySelectorAll(".window:not([data-locked]) .close-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      btn.closest(".window").hidden = true;
    });
  });

  // Home window: closing shows the notice instead of closing
  var homeClose = document.querySelector('.window[data-locked="true"] .close-btn');
  if (homeClose) {
    homeClose.addEventListener("click", function () {
      notice.hidden = false;
      if (noticeOk) noticeOk.focus();
    });
  }

  if (noticeOk) {
    noticeOk.addEventListener("click", function () {
      notice.hidden = true;
    });
  }

  // Clicking anywhere in a window brings it to the front
  document.querySelectorAll(".window").forEach(function (win) {
    win.addEventListener("pointerdown", function () {
      bringToFront(win);
    });
  });

  /* ===== Dragging (desktop only; phones stack the windows) ===== */
  var smallScreen = window.matchMedia("(max-width: 720px)");

  document.querySelectorAll(".window").forEach(function (win) {
    var bar = win.querySelector(".window-bar");
    var drag = null;

    bar.addEventListener("pointerdown", function (e) {
      if (smallScreen.matches) return;
      if (e.target.closest(".close-btn")) return;

      // Switch from centered (transform) to plain pixel positioning before moving
      var rect = win.getBoundingClientRect();
      var isFixed = window.getComputedStyle(win).position === "fixed";
      var parentRect = isFixed ? null : desktop.getBoundingClientRect();
      win.style.transform = "none";
      win.style.left = (rect.left - (parentRect ? parentRect.left : 0)) + "px";
      win.style.top = (rect.top - (parentRect ? parentRect.top : 0)) + "px";

      drag = {
        offsetX: e.clientX - rect.left,
        offsetY: e.clientY - rect.top,
        fixed: isFixed
      };

      win.classList.add("is-dragging");
      bar.setPointerCapture(e.pointerId);
      bringToFront(win);
      e.preventDefault();
    });

    bar.addEventListener("pointermove", function (e) {
      if (!drag) return;

      var parentRect = drag.fixed ? null : desktop.getBoundingClientRect();
      var newLeft = e.clientX - drag.offsetX - (parentRect ? parentRect.left : 0);
      var newTop = e.clientY - drag.offsetY - (parentRect ? parentRect.top : 0);

      // Keep the title bar inside the desktop area
      var maxLeft = drag.fixed ? window.innerWidth - 60 : desktop.clientWidth - 60;
      var maxTop = drag.fixed ? window.innerHeight - 40 : desktop.clientHeight - 40;
      newLeft = Math.max(-win.offsetWidth + 80, Math.min(newLeft, maxLeft));
      newTop = Math.max(0, Math.min(newTop, maxTop));

      win.style.left = newLeft + "px";
      win.style.top = newTop + "px";
    });

    function endDrag(e) {
      if (!drag) return;
      win.classList.remove("is-dragging");
      try { bar.releasePointerCapture(e.pointerId); } catch (err) {}
      drag = null;
    }

    bar.addEventListener("pointerup", endDrag);
    bar.addEventListener("pointercancel", endDrag);
  });
})();

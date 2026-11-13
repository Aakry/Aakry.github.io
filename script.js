(function () {
  var root = document.documentElement;
  var toggle = document.getElementById("theme-toggle");
  var yearEl = document.getElementById("year");

  // Footer year
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // Theme: use saved choice, otherwise follow the system setting
  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
  }

  var saved = null;
  try {
    saved = localStorage.getItem("theme");
  } catch (e) {
    // Storage can be blocked; fall back to system setting
  }

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
      try {
        localStorage.setItem("theme", next);
      } catch (e) {
        // Ignore if storage is unavailable
      }
    });
  }
})();

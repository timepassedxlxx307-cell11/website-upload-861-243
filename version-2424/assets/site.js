(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
      return;
    }
    document.addEventListener("DOMContentLoaded", callback);
  }

  function setupNavigation() {
    var toggle = document.querySelector("[data-nav-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var root = document.querySelector("[data-hero]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
    var next = root.querySelector("[data-hero-next]");
    var prev = root.querySelector("[data-hero-prev]");
    var current = 0;
    var timer;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        restart();
      });
    }
    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        restart();
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        restart();
      });
    });
    show(0);
    restart();
  }

  function setupFiltering() {
    var input = document.querySelector("[data-page-filter]");
    if (!input) {
      return;
    }
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
    input.addEventListener("input", function () {
      var value = input.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var haystack = (card.getAttribute("data-search") || "").toLowerCase();
        var title = (card.getAttribute("data-title") || "").toLowerCase();
        var matched = !value || haystack.indexOf(value) !== -1 || title.indexOf(value) !== -1;
        card.style.display = matched ? "" : "none";
      });
    });
  }

  function setupSorting() {
    var list = document.querySelector("[data-sortable-list]");
    if (!list) {
      return;
    }
    var buttons = Array.prototype.slice.call(document.querySelectorAll("[data-sort]"));
    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        var key = button.getAttribute("data-sort");
        var items = Array.prototype.slice.call(list.querySelectorAll("[data-movie-card]"));
        items.sort(function (a, b) {
          if (key === "rating") {
            return Number(b.getAttribute("data-rating")) - Number(a.getAttribute("data-rating"));
          }
          if (key === "views") {
            return Number(b.getAttribute("data-views")) - Number(a.getAttribute("data-views"));
          }
          if (key === "year") {
            return Number(b.getAttribute("data-year")) - Number(a.getAttribute("data-year"));
          }
          return String(a.getAttribute("data-title")).localeCompare(String(b.getAttribute("data-title")), "zh-CN");
        });
        items.forEach(function (item) {
          list.appendChild(item);
        });
      });
    });
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function searchCard(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");
    return [
      "<article class=\"movie-card\">",
      "<a href=\"" + escapeHtml(movie.url) + "\" class=\"movie-card-link\">",
      "<div class=\"poster\"><img src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\"><span class=\"poster-chip\">" + escapeHtml(movie.region) + "</span></div>",
      "<div class=\"movie-card-body\">",
      "<div class=\"movie-card-meta\"><span>★ " + escapeHtml(movie.rating) + "</span><span>" + escapeHtml(movie.year) + "</span><span>" + escapeHtml(movie.duration) + "</span></div>",
      "<h3>" + escapeHtml(movie.title) + "</h3>",
      "<p>" + escapeHtml(movie.oneLine) + "</p>",
      "<div class=\"tag-row\">" + tags + "</div>",
      "</div>",
      "</a>",
      "</article>"
    ].join("");
  }

  function setupSearchPage() {
    var page = document.querySelector("[data-search-page]");
    if (!page || !window.SEARCH_MOVIES) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = (params.get("q") || "").trim();
    var input = document.querySelector("[data-search-input]");
    var results = document.querySelector("[data-search-results]");
    var empty = document.querySelector("[data-search-empty]");
    var title = document.querySelector("[data-search-title]");
    if (input) {
      input.value = query;
    }
    if (!results || !empty) {
      return;
    }
    if (!query) {
      results.innerHTML = "";
      empty.classList.remove("is-hidden");
      return;
    }
    var terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    var matched = window.SEARCH_MOVIES.filter(function (movie) {
      var haystack = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.oneLine].concat(movie.tags || []).join(" ").toLowerCase();
      return terms.every(function (term) {
        return haystack.indexOf(term) !== -1;
      });
    });
    if (title) {
      title.textContent = "搜索结果";
    }
    if (!matched.length) {
      results.innerHTML = "";
      empty.classList.remove("is-hidden");
      return;
    }
    empty.classList.add("is-hidden");
    results.innerHTML = matched.map(searchCard).join("");
  }

  ready(function () {
    setupNavigation();
    setupHero();
    setupFiltering();
    setupSorting();
    setupSearchPage();
  });
}());

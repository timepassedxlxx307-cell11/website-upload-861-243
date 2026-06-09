(function () {
  function qs(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function qsa(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  var navToggle = qs('[data-nav-toggle]');
  var nav = qs('[data-site-nav]');

  if (navToggle && nav) {
    navToggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  var hero = qs('[data-hero]');

  if (hero) {
    var slides = qsa('[data-hero-slide]', hero);
    var dots = qsa('[data-hero-dot]', hero);
    var activeIndex = 0;

    function showSlide(index) {
      activeIndex = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === activeIndex);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === activeIndex);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(activeIndex + 1);
      }, 5200);
    }
  }

  qsa('[data-filter-root]').forEach(function (root) {
    var cards = qsa('[data-movie-card]', root);
    var searchInput = qs('[data-filter-search]', root);
    var categoryInput = qs('[data-filter-category]', root);
    var typeInput = qs('[data-filter-type]', root);
    var yearInput = qs('[data-filter-year]', root);
    var countNode = qs('[data-filter-count]', root);
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';

    if (searchInput && query) {
      searchInput.value = query;
    }

    function normalized(value) {
      return String(value || '').trim().toLowerCase();
    }

    function applyFilters() {
      var keyword = normalized(searchInput ? searchInput.value : '');
      var category = normalized(categoryInput ? categoryInput.value : '');
      var type = normalized(typeInput ? typeInput.value : '');
      var year = normalized(yearInput ? yearInput.value : '');
      var visible = 0;

      cards.forEach(function (card) {
        var cardText = normalized(card.getAttribute('data-search'));
        var cardCategory = normalized(card.getAttribute('data-category'));
        var cardType = normalized(card.getAttribute('data-type'));
        var cardYear = normalized(card.getAttribute('data-year'));
        var matched = true;

        if (keyword && cardText.indexOf(keyword) === -1) {
          matched = false;
        }

        if (category && cardCategory !== category) {
          matched = false;
        }

        if (type && cardType !== type) {
          matched = false;
        }

        if (year && cardYear !== year) {
          matched = false;
        }

        card.classList.toggle('is-hidden', !matched);

        if (matched) {
          visible += 1;
        }
      });

      if (countNode) {
        countNode.textContent = '当前显示 ' + visible + ' 部影片';
      }
    }

    [searchInput, categoryInput, typeInput, yearInput].forEach(function (input) {
      if (!input) {
        return;
      }

      input.addEventListener('input', applyFilters);
      input.addEventListener('change', applyFilters);
    });

    applyFilters();
  });
})();

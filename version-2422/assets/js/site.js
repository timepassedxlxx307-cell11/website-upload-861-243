(function () {
    var navButton = document.querySelector('[data-nav-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (navButton && mobileNav) {
        navButton.addEventListener('click', function () {
            var open = mobileNav.classList.toggle('is-open');
            navButton.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var current = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function startTimer() {
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5600);
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                if (timer) {
                    window.clearInterval(timer);
                }

                showSlide(index);
                startTimer();
            });
        });

        startTimer();
    }

    var filterScope = document.querySelector('[data-filter-scope]');

    if (filterScope) {
        var queryInput = filterScope.querySelector('[data-filter-query]');
        var categorySelect = filterScope.querySelector('[data-filter-category]');
        var regionSelect = filterScope.querySelector('[data-filter-region]');
        var yearSelect = filterScope.querySelector('[data-filter-year]');
        var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
        var empty = document.querySelector('[data-empty-state]');
        var presetCategory = filterScope.getAttribute('data-preset-category') || '';

        function valueOf(element) {
            return element ? element.value.trim().toLowerCase() : '';
        }

        function applyFilters() {
            var query = valueOf(queryInput);
            var category = categorySelect ? valueOf(categorySelect) : presetCategory.toLowerCase();
            var region = valueOf(regionSelect);
            var year = valueOf(yearSelect);
            var visible = 0;

            cards.forEach(function (card) {
                var text = (card.getAttribute('data-search') || '').toLowerCase();
                var cardCategory = (card.getAttribute('data-category') || '').toLowerCase();
                var cardRegion = (card.getAttribute('data-region') || '').toLowerCase();
                var cardYear = (card.getAttribute('data-year') || '').toLowerCase();
                var matched = true;

                if (query && text.indexOf(query) === -1) {
                    matched = false;
                }

                if (category && cardCategory !== category) {
                    matched = false;
                }

                if (region && cardRegion !== region) {
                    matched = false;
                }

                if (year && cardYear !== year) {
                    matched = false;
                }

                card.hidden = !matched;

                if (matched) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.hidden = visible !== 0;
            }
        }

        [queryInput, categorySelect, regionSelect, yearSelect].forEach(function (element) {
            if (element) {
                element.addEventListener('input', applyFilters);
                element.addEventListener('change', applyFilters);
            }
        });

        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q');

        if (initialQuery && queryInput) {
            queryInput.value = initialQuery;
        }

        applyFilters();
    }
})();

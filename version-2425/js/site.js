(function () {
    var header = document.querySelector('[data-header]');
    var menuButton = document.querySelector('[data-menu-button]');
    var mobilePanel = document.querySelector('[data-mobile-panel]');

    function updateHeader() {
        if (!header) {
            return;
        }
        header.classList.toggle('is-scrolled', window.scrollY > 18);
    }

    updateHeader();
    window.addEventListener('scroll', updateHeader, { passive: true });

    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function () {
            mobilePanel.classList.toggle('is-open');
        });
    }

    document.addEventListener('error', function (event) {
        var target = event.target;
        if (!target || target.tagName !== 'IMG') {
            return;
        }
        var holder = target.closest('.poster-frame, .horizontal-cover, .hero-media, .search-result-cover');
        if (holder) {
            holder.classList.add('is-empty');
        }
        target.style.opacity = '0';
    }, true);

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var activeSlide = 0;

    function setSlide(index) {
        if (!slides.length) {
            return;
        }
        activeSlide = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('is-active', slideIndex === activeSlide);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('is-active', dotIndex === activeSlide);
        });
    }

    if (slides.length) {
        setSlide(0);
        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                setSlide(index);
            });
        });
        window.setInterval(function () {
            setSlide(activeSlide + 1);
        }, 5000);
    }

    var searchInput = document.querySelector('[data-site-search]');
    var searchResults = document.querySelector('[data-search-results]');
    var movies = window.MOVIES || [];

    function normalize(value) {
        return String(value || '').toLowerCase();
    }

    function renderResults(query) {
        if (!searchResults) {
            return;
        }
        var keyword = normalize(query).trim();
        if (!keyword) {
            searchResults.classList.remove('is-visible');
            searchResults.innerHTML = '';
            return;
        }
        var results = movies.filter(function (movie) {
            return normalize(movie.title).indexOf(keyword) !== -1 ||
                normalize(movie.category).indexOf(keyword) !== -1 ||
                normalize(movie.tags).indexOf(keyword) !== -1 ||
                normalize(movie.year).indexOf(keyword) !== -1;
        }).slice(0, 8);
        if (!results.length) {
            searchResults.innerHTML = '<div class="search-result"><div></div><div><strong>未找到相关视频</strong><span>换个关键词试试</span></div></div>';
            searchResults.classList.add('is-visible');
            return;
        }
        searchResults.innerHTML = results.map(function (movie) {
            return '<a class="search-result" href="' + movie.url + '">' +
                '<span class="search-result-cover"><img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '"></span>' +
                '<span><strong>' + escapeHtml(movie.title) + '</strong><span>' + escapeHtml(movie.category) + ' · ' + escapeHtml(movie.year) + '</span></span>' +
                '</a>';
        }).join('');
        searchResults.classList.add('is-visible');
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    if (searchInput) {
        searchInput.addEventListener('input', function () {
            renderResults(searchInput.value);
        });
        searchInput.addEventListener('focus', function () {
            renderResults(searchInput.value);
        });
        document.addEventListener('click', function (event) {
            if (!event.target.closest('.search-box') && searchResults) {
                searchResults.classList.remove('is-visible');
            }
        });
    }

    var sortSelect = document.querySelector('[data-sort-select]');
    var sortableGrid = document.querySelector('[data-sortable-grid]');

    if (sortSelect && sortableGrid) {
        sortSelect.addEventListener('change', function () {
            var cards = Array.prototype.slice.call(sortableGrid.children);
            var mode = sortSelect.value;
            cards.sort(function (a, b) {
                if (mode === 'popular') {
                    return Number(b.dataset.views || 0) - Number(a.dataset.views || 0);
                }
                if (mode === 'rating') {
                    return Number(b.dataset.rating || 0) - Number(a.dataset.rating || 0);
                }
                if (mode === 'title') {
                    return String(a.dataset.title || '').localeCompare(String(b.dataset.title || ''), 'zh-Hans-CN');
                }
                return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
            });
            cards.forEach(function (card) {
                sortableGrid.appendChild(card);
            });
        });
    }
})();

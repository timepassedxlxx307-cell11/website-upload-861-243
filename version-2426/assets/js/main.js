(function () {
    'use strict';

    function rootPrefix() {
        var path = window.location.pathname;
        if (path.indexOf('/detail/') !== -1 || path.indexOf('/category/') !== -1) {
            return '../';
        }
        return '';
    }

    function normalizeText(value) {
        return String(value || '').toLowerCase().trim();
    }

    function getSearchText(movie) {
        return normalizeText([
            movie.title,
            movie.category,
            movie.region,
            movie.year,
            movie.genre,
            Array.isArray(movie.tags) ? movie.tags.join(' ') : '',
            movie.oneLine
        ].join(' '));
    }

    function setupHeader() {
        var header = document.querySelector('[data-site-header]');
        var toggle = document.querySelector('[data-menu-toggle]');

        function syncHeader() {
            if (!header) {
                return;
            }
            header.classList.toggle('is-scrolled', window.scrollY > 20);
        }

        syncHeader();
        window.addEventListener('scroll', syncHeader, { passive: true });

        if (toggle && header) {
            toggle.addEventListener('click', function () {
                header.classList.toggle('is-open');
            });
        }
    }

    function setupImageFallbacks() {
        document.querySelectorAll('img[data-fallback-title]').forEach(function (image) {
            image.addEventListener('error', function () {
                var frame = image.closest('[data-poster-frame]') || image.parentElement;
                if (frame) {
                    frame.classList.add('is-fallback');
                }
            }, { once: true });
        });
    }

    function setupHero() {
        var carousel = document.querySelector('[data-hero-carousel]');
        if (!carousel) {
            return;
        }

        var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
        var next = carousel.querySelector('[data-hero-next]');
        var prev = carousel.querySelector('[data-hero-prev]');
        var index = 0;
        var timer = null;

        function show(target) {
            if (!slides.length) {
                return;
            }
            index = (target + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                show(dotIndex);
                start();
            });
        });

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                start();
            });
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                start();
            });
        }

        carousel.addEventListener('mouseenter', stop);
        carousel.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function renderSuggestion(movie, prefix) {
        return [
            '<a href="' + prefix + movie.url + '">',
            '  <span class="poster-frame" data-poster-frame>',
            '    <img src="' + prefix + movie.cover + '" alt="' + escapeHtml(movie.title) + '" data-fallback-title="' + escapeHtml(movie.title) + '">',
            '    <span class="poster-fallback-title">' + escapeHtml(movie.title) + '</span>',
            '  </span>',
            '  <span>',
            '    <strong>' + escapeHtml(movie.title) + '</strong>',
            '    <small>' + escapeHtml(movie.category) + ' · ' + escapeHtml(movie.year) + ' · ★ ' + escapeHtml(movie.rating) + '</small>',
            '  </span>',
            '</a>'
        ].join('');
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function setupHeaderSearch() {
        var data = window.MOVIE_SEARCH_DATA || [];
        var prefix = rootPrefix();
        document.querySelectorAll('[data-search-form]').forEach(function (form) {
            var input = form.querySelector('[data-search-input]');
            var results = form.querySelector('[data-search-results]');
            if (!input || !results) {
                return;
            }

            function update() {
                var query = normalizeText(input.value);
                if (!query) {
                    results.classList.remove('is-visible');
                    results.innerHTML = '';
                    return;
                }
                var terms = query.split(/\s+/).filter(Boolean);
                var matches = data.filter(function (movie) {
                    var haystack = getSearchText(movie);
                    return terms.every(function (term) {
                        return haystack.indexOf(term) !== -1;
                    });
                }).slice(0, 8);

                if (matches.length) {
                    results.innerHTML = matches.map(function (movie) {
                        return renderSuggestion(movie, prefix);
                    }).join('');
                    setupImageFallbacks();
                } else {
                    results.innerHTML = '<div class="search-empty">未找到相关视频</div>';
                }
                results.classList.add('is-visible');
            }

            input.addEventListener('input', update);
            input.addEventListener('focus', update);
            document.addEventListener('click', function (event) {
                if (!form.contains(event.target)) {
                    results.classList.remove('is-visible');
                }
            });
            form.addEventListener('submit', function (event) {
                if (!input.value.trim()) {
                    event.preventDefault();
                    input.focus();
                }
            });
        });
    }

    function setupCardFilters() {
        document.querySelectorAll('[data-filter-page]').forEach(function (page) {
            var input = page.querySelector('[data-card-filter-input]');
            var category = page.querySelector('[data-card-filter-category]');
            var region = page.querySelector('[data-card-filter-region]');
            var year = page.querySelector('[data-card-filter-year]');
            var count = page.querySelector('[data-filter-count]');
            var cards = Array.prototype.slice.call(page.querySelectorAll('[data-movie-card]'));

            function apply() {
                var query = normalizeText(input && input.value);
                var categoryValue = category ? category.value : '';
                var regionValue = region ? region.value : '';
                var yearValue = year ? year.value : '';
                var visible = 0;

                cards.forEach(function (card) {
                    var matchesQuery = !query || normalizeText(card.getAttribute('data-search')).indexOf(query) !== -1;
                    var matchesCategory = !categoryValue || card.getAttribute('data-category') === categoryValue;
                    var matchesRegion = !regionValue || card.getAttribute('data-region') === regionValue;
                    var matchesYear = !yearValue || card.getAttribute('data-year') === yearValue;
                    var shouldShow = matchesQuery && matchesCategory && matchesRegion && matchesYear;
                    card.classList.toggle('is-hidden-by-filter', !shouldShow);
                    if (shouldShow) {
                        visible += 1;
                    }
                });

                if (count) {
                    count.textContent = String(visible);
                }
            }

            [input, category, region, year].forEach(function (control) {
                if (control) {
                    control.addEventListener('input', apply);
                    control.addEventListener('change', apply);
                }
            });
            apply();
        });
    }

    function setupSearchPage() {
        var input = document.querySelector('[data-search-page-input]');
        var title = document.querySelector('[data-search-page-title]');
        var summary = document.querySelector('[data-search-page-summary]');
        var results = document.querySelector('[data-search-page-results]');
        var data = window.MOVIE_SEARCH_DATA || [];
        if (!input || !title || !summary || !results) {
            return;
        }

        var params = new URLSearchParams(window.location.search);
        var query = params.get('q') || '';
        input.value = query;

        function render() {
            var value = normalizeText(input.value);
            if (!value) {
                title.textContent = '推荐浏览';
                summary.textContent = '可以使用上方搜索框查找全部影片。';
                return;
            }
            var terms = value.split(/\s+/).filter(Boolean);
            var matches = data.filter(function (movie) {
                var haystack = getSearchText(movie);
                return terms.every(function (term) {
                    return haystack.indexOf(term) !== -1;
                });
            }).slice(0, 120);

            title.textContent = '“' + input.value + '”的搜索结果';
            summary.textContent = '共找到 ' + matches.length + ' 条匹配，最多展示前 120 条。';
            if (!matches.length) {
                results.innerHTML = '<div class="text-card"><h2>暂无结果</h2><p>可以尝试更换片名、地区、年份或题材关键词。</p></div>';
                return;
            }

            results.innerHTML = matches.map(function (movie) {
                var tags = Array.isArray(movie.tags) ? movie.tags.slice(0, 3).map(function (tag) {
                    return '<span class="tag">' + escapeHtml(tag) + '</span>';
                }).join('') : '';
                return [
                    '<article class="movie-card">',
                    '  <a class="movie-poster-link" href="' + movie.url + '">',
                    '    <span class="poster-frame movie-poster" data-poster-frame>',
                    '      <img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy" data-fallback-title="' + escapeHtml(movie.title) + '">',
                    '      <span class="poster-fallback-title">' + escapeHtml(movie.title) + '</span>',
                    '    </span>',
                    '    <span class="poster-play">▶</span>',
                    '    <span class="poster-rating">★ ' + escapeHtml(movie.rating) + '</span>',
                    '  </a>',
                    '  <div class="movie-card-body">',
                    '    <div class="movie-card-meta"><span class="pill-link">' + escapeHtml(movie.category) + '</span><span>' + escapeHtml(movie.year) + '</span></div>',
                    '    <h3><a href="' + movie.url + '">' + escapeHtml(movie.title) + '</a></h3>',
                    '    <p>' + escapeHtml(movie.oneLine) + '</p>',
                    '    <div class="tag-row">' + tags + '</div>',
                    '  </div>',
                    '</article>'
                ].join('');
            }).join('');
            setupImageFallbacks();
        }

        input.addEventListener('input', render);
        render();
    }

    document.addEventListener('DOMContentLoaded', function () {
        setupHeader();
        setupImageFallbacks();
        setupHero();
        setupHeaderSearch();
        setupCardFilters();
        setupSearchPage();
    });
}());

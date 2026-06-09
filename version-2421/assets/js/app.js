(function () {
    function ready(fn) {
        if (document.readyState !== 'loading') {
            fn();
        } else {
            document.addEventListener('DOMContentLoaded', fn);
        }
    }

    ready(function () {
        var toggle = document.querySelector('[data-menu-toggle]');
        var mobileNav = document.querySelector('[data-mobile-nav]');
        if (toggle && mobileNav) {
            toggle.addEventListener('click', function () {
                mobileNav.classList.toggle('is-open');
            });
        }

        initHero();
        initPageFilter();
        initSearch();
        initPlayers();
    });

    function initHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        if (!slides.length) {
            return;
        }
        var index = 0;
        var timer;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === index);
            });
        }

        function start() {
            stop();
            timer = setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                clearInterval(timer);
            }
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                start();
            });
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                show(i);
                start();
            });
        });
        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function initPageFilter() {
        var input = document.querySelector('[data-filter-input]');
        var list = document.querySelector('[data-filter-list]');
        if (!input || !list) {
            return;
        }
        var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));
        input.addEventListener('input', function () {
            var value = input.value.trim().toLowerCase();
            cards.forEach(function (card) {
                var text = ((card.getAttribute('data-title') || '') + ' ' + (card.getAttribute('data-meta') || '')).toLowerCase();
                card.style.display = text.indexOf(value) === -1 ? 'none' : '';
            });
        });
    }

    function initSearch() {
        var form = document.querySelector('[data-search-form]');
        var results = document.querySelector('[data-search-results]');
        if (!form || !results || typeof SEARCH_INDEX === 'undefined') {
            return;
        }
        var input = form.querySelector('[data-search-input]');
        var region = form.querySelector('[data-region-select]');
        var params = new URLSearchParams(window.location.search);
        var initial = params.get('q') || '';
        if (input && initial) {
            input.value = initial;
        }

        function card(item) {
            var tags = (item.tags || []).slice(0, 3).map(function (tag) {
                return '<span>' + escapeHtml(tag) + '</span>';
            }).join('');
            return '<article class="movie-card">' +
                '<a class="card-media" href="' + escapeAttr(item.url) + '">' +
                    '<img src="' + escapeAttr(item.image) + '" alt="' + escapeAttr(item.title) + '" loading="lazy" onerror="this.style.opacity=\'0\'">' +
                    '<span class="card-badge">' + escapeHtml(item.region) + '</span>' +
                '</a>' +
                '<div class="card-body">' +
                    '<a class="card-title" href="' + escapeAttr(item.url) + '">' + escapeHtml(item.title) + '</a>' +
                    '<p>' + escapeHtml(item.line || '') + '</p>' +
                    '<div class="card-meta"><span>' + escapeHtml(item.year) + '</span><span>' + escapeHtml(item.type) + '</span></div>' +
                    '<div class="tag-row">' + tags + '</div>' +
                '</div>' +
            '</article>';
        }

        function render() {
            var q = input ? input.value.trim().toLowerCase() : '';
            var r = region ? region.value : '';
            var matched = SEARCH_INDEX.filter(function (item) {
                var text = [item.title, item.region, item.type, item.year, item.genre, item.line, (item.tags || []).join(' ')].join(' ').toLowerCase();
                var okText = !q || text.indexOf(q) !== -1;
                var okRegion = !r || item.region.indexOf(r) !== -1;
                return okText && okRegion;
            }).slice(0, 96);
            results.innerHTML = matched.map(card).join('') || '<p class="empty-result">没有找到匹配影片</p>';
        }

        form.addEventListener('submit', function (event) {
            event.preventDefault();
            render();
        });
        if (input) {
            input.addEventListener('input', render);
        }
        if (region) {
            region.addEventListener('change', render);
        }
        if (initial) {
            render();
        }
    }

    function initPlayers() {
        var boxes = Array.prototype.slice.call(document.querySelectorAll('[data-stream]'));
        boxes.forEach(function (box) {
            var video = box.querySelector('[data-stream-video]');
            var button = box.querySelector('[data-play-button]');
            var stream = box.getAttribute('data-stream');
            var attached = false;

            function attach() {
                if (attached || !video || !stream) {
                    return;
                }
                attached = true;
                if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(stream);
                    hls.attachMedia(video);
                } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = stream;
                } else {
                    video.src = stream;
                }
            }

            function play() {
                attach();
                if (video) {
                    var request = video.play();
                    if (request && typeof request.catch === 'function') {
                        request.catch(function () {});
                    }
                }
            }

            if (button) {
                button.addEventListener('click', play);
            }
            if (video) {
                video.addEventListener('click', function () {
                    if (video.paused) {
                        play();
                    }
                });
                video.addEventListener('play', function () {
                    box.classList.add('is-playing');
                });
                video.addEventListener('pause', function () {
                    box.classList.remove('is-playing');
                });
                video.addEventListener('loadedmetadata', function () {
                    box.classList.add('is-ready');
                });
                attach();
            }
        });
    }

    function escapeHtml(value) {
        return String(value).replace(/[&<>"]/g, function (char) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;'
            }[char];
        });
    }

    function escapeAttr(value) {
        return escapeHtml(value).replace(/'/g, '&#39;');
    }
})();

(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupMenu() {
        var button = document.querySelector(".menu-toggle");
        var nav = document.querySelector(".mobile-nav");
        if (!button || !nav) {
            return;
        }
        button.addEventListener("click", function () {
            nav.classList.toggle("open");
        });
    }

    function setupHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
        if (slides.length < 2) {
            return;
        }
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("active", i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("active", i === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                show(index);
                start();
            });
        });

        var carousel = document.querySelector(".hero-carousel");
        if (carousel) {
            carousel.addEventListener("mouseenter", stop);
            carousel.addEventListener("mouseleave", start);
        }
        show(0);
        start();
    }

    function setupFilters() {
        var zones = Array.prototype.slice.call(document.querySelectorAll(".movie-filter-zone"));
        zones.forEach(function (zone) {
            var input = zone.querySelector(".movie-search");
            var selects = Array.prototype.slice.call(zone.querySelectorAll(".filter-select"));
            var cards = Array.prototype.slice.call(zone.querySelectorAll(".movie-card"));
            if (!input && selects.length === 0) {
                return;
            }

            function apply() {
                var q = input ? input.value.trim().toLowerCase() : "";
                var categorySelect = selects.find(function (select) {
                    return !select.classList.contains("year-filter");
                });
                var yearSelect = selects.find(function (select) {
                    return select.classList.contains("year-filter");
                });
                var category = categorySelect ? categorySelect.value : "";
                var year = yearSelect ? yearSelect.value : "";

                cards.forEach(function (card) {
                    var haystack = [
                        card.dataset.title,
                        card.dataset.region,
                        card.dataset.type,
                        card.dataset.genre,
                        card.dataset.tags
                    ].join(" ").toLowerCase();
                    var cardYear = card.querySelector(".card-meta span:nth-child(2)");
                    var cardCategory = card.querySelector(".card-meta span:nth-child(3)");
                    var passQuery = !q || haystack.indexOf(q) !== -1;
                    var passCategory = !category || (cardCategory && cardCategory.textContent === category);
                    var passYear = !year || (cardYear && cardYear.textContent === year);
                    card.classList.toggle("hidden", !(passQuery && passCategory && passYear));
                });
            }

            if (input) {
                input.addEventListener("input", apply);
            }
            selects.forEach(function (select) {
                select.addEventListener("change", apply);
            });
        });
    }

    window.initDetailPlayer = function (url) {
        ready(function () {
            var video = document.getElementById("moviePlayer");
            var mask = document.querySelector(".player-mask");
            var started = false;
            var hls = null;
            if (!video || !url) {
                return;
            }

            function bind() {
                if (started) {
                    return;
                }
                started = true;
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = url;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(url);
                    hls.attachMedia(video);
                } else {
                    video.src = url;
                }
            }

            function play() {
                bind();
                if (mask) {
                    mask.classList.add("hide");
                }
                var promise = video.play();
                if (promise && typeof promise.catch === "function") {
                    promise.catch(function () {});
                }
            }

            if (mask) {
                mask.addEventListener("click", play);
            }
            video.addEventListener("click", function () {
                if (video.paused) {
                    play();
                }
            });
            video.addEventListener("play", function () {
                if (mask) {
                    mask.classList.add("hide");
                }
            });
            window.addEventListener("beforeunload", function () {
                if (hls && typeof hls.destroy === "function") {
                    hls.destroy();
                }
            });
        });
    };

    ready(function () {
        setupMenu();
        setupHero();
        setupFilters();
    });
})();

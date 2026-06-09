(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
            return;
        }
        document.addEventListener("DOMContentLoaded", fn);
    }

    ready(function () {
        initMenu();
        initHero();
        initFilters();
        initPlayer();
    });

    function initMenu() {
        var toggle = document.querySelector(".mobile-menu-toggle");
        var nav = document.querySelector(".mobile-nav");
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener("click", function () {
            var open = nav.classList.toggle("is-open");
            toggle.setAttribute("aria-expanded", open ? "true" : "false");
            toggle.textContent = open ? "×" : "☰";
        });
    }

    function initHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
        if (!slides.length) {
            return;
        }
        var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
        var prev = document.querySelector("[data-hero-prev]");
        var next = document.querySelector("[data-hero-next]");
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                show(index);
                start();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                show(current - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(current + 1);
                start();
            });
        }

        show(0);
        start();
    }

    function initFilters() {
        var grid = document.querySelector("[data-filter-grid]");
        if (!grid) {
            return;
        }
        var input = document.querySelector(".js-filter-input");
        var region = document.querySelector(".js-region-filter");
        var type = document.querySelector(".js-type-filter");
        var params = new URLSearchParams(window.location.search);
        var query = params.get("q") || "";
        if (input && query) {
            input.value = query;
        }

        function value(element) {
            return element ? element.value.trim().toLowerCase() : "";
        }

        function apply() {
            var q = value(input);
            var selectedRegion = value(region);
            var selectedType = value(type);
            var cards = Array.prototype.slice.call(grid.children);
            cards.forEach(function (card) {
                var haystack = [
                    card.getAttribute("data-title"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-type"),
                    card.getAttribute("data-year"),
                    card.getAttribute("data-genre"),
                    card.getAttribute("data-tags"),
                    card.textContent
                ].join(" ").toLowerCase();
                var ok = true;
                if (q && haystack.indexOf(q) === -1) {
                    ok = false;
                }
                if (selectedRegion && String(card.getAttribute("data-region") || "").toLowerCase() !== selectedRegion) {
                    ok = false;
                }
                if (selectedType && String(card.getAttribute("data-type") || "").toLowerCase() !== selectedType) {
                    ok = false;
                }
                card.classList.toggle("is-hidden-card", !ok);
            });
        }

        [input, region, type].forEach(function (element) {
            if (element) {
                element.addEventListener("input", apply);
                element.addEventListener("change", apply);
            }
        });
        apply();
    }

    function initPlayer() {
        var shell = document.querySelector("[data-player]");
        if (!shell) {
            return;
        }
        var video = shell.querySelector("video");
        var overlay = shell.querySelector(".player-overlay");
        var trigger = shell.querySelector(".play-trigger");
        var stream = shell.getAttribute("data-stream");
        var attached = false;
        var hls = null;

        function attach() {
            if (attached || !video || !stream) {
                return;
            }
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = stream;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                hls.loadSource(stream);
                hls.attachMedia(video);
            } else {
                video.src = stream;
            }
            attached = true;
        }

        function play() {
            attach();
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
            var action = video.play();
            if (action && typeof action.catch === "function") {
                action.catch(function () {
                    if (overlay) {
                        overlay.classList.remove("is-hidden");
                    }
                });
            }
        }

        attach();
        if (trigger) {
            trigger.addEventListener("click", play);
        }
        if (overlay) {
            overlay.addEventListener("click", play);
        }
        video.addEventListener("play", function () {
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
        });
        window.addEventListener("pagehide", function () {
            if (hls && typeof hls.destroy === "function") {
                hls.destroy();
            }
        });
    }
})();

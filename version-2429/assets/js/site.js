(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    function normalize(value) {
        return String(value || "").toLowerCase().replace(/\s+/g, "");
    }

    ready(function () {
        var toggle = document.querySelector(".mobile-toggle");
        var menu = document.querySelector(".mobile-menu");
        if (toggle && menu) {
            toggle.addEventListener("click", function () {
                var open = !menu.classList.contains("is-open");
                menu.classList.toggle("is-open", open);
                document.body.classList.toggle("menu-open", open);
                toggle.setAttribute("aria-expanded", String(open));
            });
        }

        document.querySelectorAll("img").forEach(function (image) {
            image.addEventListener("error", function () {
                image.classList.add("image-hidden");
            });
        });

        document.querySelectorAll(".hero-carousel").forEach(function (carousel) {
            var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
            var dots = Array.prototype.slice.call(carousel.querySelectorAll(".hero-dots button"));
            var prev = carousel.querySelector(".hero-prev");
            var next = carousel.querySelector(".hero-next");
            var index = 0;
            var timer = null;

            function show(nextIndex) {
                if (!slides.length) {
                    return;
                }
                index = (nextIndex + slides.length) % slides.length;
                slides.forEach(function (slide, position) {
                    slide.classList.toggle("active", position === index);
                });
                dots.forEach(function (dot, position) {
                    dot.classList.toggle("active", position === index);
                    dot.setAttribute("aria-current", position === index ? "true" : "false");
                });
            }

            function start() {
                if (slides.length < 2) {
                    return;
                }
                timer = window.setInterval(function () {
                    show(index + 1);
                }, 5000);
            }

            function restart() {
                if (timer) {
                    window.clearInterval(timer);
                }
                start();
            }

            if (prev) {
                prev.addEventListener("click", function () {
                    show(index - 1);
                    restart();
                });
            }

            if (next) {
                next.addEventListener("click", function () {
                    show(index + 1);
                    restart();
                });
            }

            dots.forEach(function (dot, position) {
                dot.addEventListener("click", function () {
                    show(position);
                    restart();
                });
            });

            show(0);
            start();
        });

        document.querySelectorAll("[data-filter-scope]").forEach(function (scope) {
            var input = scope.querySelector("[data-filter-input]");
            var typeSelect = scope.querySelector('[data-filter-select="type"]');
            var regionSelect = scope.querySelector('[data-filter-select="region"]');
            var items = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
            var empty = scope.querySelector(".no-results");

            function apply() {
                var query = normalize(input ? input.value : "");
                var type = typeSelect ? typeSelect.value : "";
                var region = regionSelect ? regionSelect.value : "";
                var visible = 0;

                items.forEach(function (item) {
                    var text = normalize(item.getAttribute("data-search"));
                    var typeOk = !type || item.getAttribute("data-type") === type;
                    var regionOk = !region || item.getAttribute("data-region") === region;
                    var queryOk = !query || text.indexOf(query) !== -1;
                    var show = typeOk && regionOk && queryOk;
                    item.style.display = show ? "" : "none";
                    if (show) {
                        visible += 1;
                    }
                });

                if (empty) {
                    empty.classList.toggle("is-visible", visible === 0);
                }
            }

            [input, typeSelect, regionSelect].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", apply);
                    control.addEventListener("change", apply);
                }
            });
        });
    });
})();

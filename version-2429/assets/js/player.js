(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    function init(wrapper) {
        var video = wrapper.querySelector("video");
        var layer = wrapper.querySelector(".play-layer");
        if (!video) {
            return;
        }

        function attach() {
            var src = video.getAttribute("data-stream");
            if (!src) {
                return;
            }
            if (video.getAttribute("data-ready") !== "1") {
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = src;
                } else if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls({ enableWorker: true });
                    hls.loadSource(src);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.ERROR, function (event, data) {
                        if (!data || !data.fatal) {
                            return;
                        }
                        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                            hls.startLoad();
                        } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                            hls.recoverMediaError();
                        } else {
                            hls.destroy();
                        }
                    });
                    video.hlsPlayer = hls;
                } else {
                    video.src = src;
                }
                video.setAttribute("data-ready", "1");
            }
        }

        function play() {
            attach();
            if (layer) {
                layer.classList.add("is-hidden");
            }
            var attempt = video.play();
            if (attempt && attempt.catch) {
                attempt.catch(function () {});
            }
        }

        if (layer) {
            layer.addEventListener("click", play);
        }

        video.addEventListener("click", function () {
            if (video.paused) {
                play();
            }
        });

        video.addEventListener("play", function () {
            if (layer) {
                layer.classList.add("is-hidden");
            }
        });
    }

    ready(function () {
        document.querySelectorAll(".stream-player").forEach(init);
    });
})();

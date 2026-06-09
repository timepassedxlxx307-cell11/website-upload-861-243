(function () {
    var video = document.querySelector('[data-player]');
    var trigger = document.querySelector('[data-play-trigger]');
    var shell = document.querySelector('[data-player-shell]');

    if (!video || !trigger || !shell) {
        return;
    }

    var started = false;
    var hlsInstance = null;

    function playVideo() {
        var promise = video.play();

        if (promise && typeof promise.catch === 'function') {
            promise.catch(function () {});
        }
    }

    function startPlayer() {
        var stream = video.getAttribute('data-stream');

        if (!stream) {
            return;
        }

        shell.classList.add('is-playing');

        if (started) {
            playVideo();
            return;
        }

        started = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = stream;
            playVideo();
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });

            hlsInstance.loadSource(stream);
            hlsInstance.attachMedia(video);
            hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                playVideo();
            });
            hlsInstance.on(window.Hls.Events.ERROR, function (eventName, data) {
                if (data && data.fatal && hlsInstance) {
                    hlsInstance.destroy();
                    hlsInstance = null;
                    video.src = stream;
                }
            });
            return;
        }

        video.src = stream;
        playVideo();
    }

    trigger.addEventListener('click', startPlayer);
    video.addEventListener('click', function () {
        if (video.paused) {
            startPlayer();
        }
    });
})();

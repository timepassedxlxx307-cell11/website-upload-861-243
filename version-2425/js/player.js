(function () {
    function attachPlayer(shell) {
        var video = shell.querySelector('video');
        var button = shell.querySelector('[data-play-button]');
        var source = video ? video.dataset.source : '';
        var attached = false;
        var hls = null;

        function attachSource() {
            if (attached || !video || !source) {
                return;
            }
            attached = true;
            if (source.indexOf('.m3u8') !== -1 && window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                hls.loadSource(source);
                hls.attachMedia(video);
            } else {
                video.src = source;
            }
        }

        function playVideo() {
            if (!video) {
                return;
            }
            attachSource();
            video.controls = true;
            var promise = video.play();
            if (promise && typeof promise.then === 'function') {
                promise.then(function () {
                    shell.classList.add('is-playing');
                }).catch(function () {
                    shell.classList.remove('is-playing');
                });
            } else {
                shell.classList.add('is-playing');
            }
        }

        if (button) {
            button.addEventListener('click', function (event) {
                event.preventDefault();
                event.stopPropagation();
                playVideo();
            });
        }

        shell.addEventListener('click', function (event) {
            if (event.target.closest('button') || event.target === video) {
                return;
            }
            playVideo();
        });

        if (video) {
            video.addEventListener('play', function () {
                shell.classList.add('is-playing');
            });
            video.addEventListener('pause', function () {
                if (!video.ended) {
                    shell.classList.remove('is-playing');
                }
            });
            video.addEventListener('ended', function () {
                shell.classList.remove('is-playing');
            });
        }

        window.addEventListener('beforeunload', function () {
            if (hls && typeof hls.destroy === 'function') {
                hls.destroy();
            }
        });
    }

    document.querySelectorAll('[data-player]').forEach(attachPlayer);
})();

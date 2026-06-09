import { H as Hls } from './player-dru42stk.js';

function setStatus(player, message, visible) {
    const status = player.querySelector('[data-player-status]');
    if (!status) {
        return;
    }
    status.textContent = message || '';
    status.classList.toggle('is-visible', Boolean(visible && message));
}

function attachHls(video, source) {
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        return Promise.resolve();
    }

    if (Hls && Hls.isSupported()) {
        const hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        video._movieSiteHls = hls;
        return Promise.resolve();
    }

    return Promise.reject(new Error('当前浏览器不支持 HLS 播放。'));
}

function setupVideoPlayer(player) {
    const video = player.querySelector('video[data-src]');
    const button = player.querySelector('[data-play-button]');
    if (!video || !button) {
        return;
    }

    let initialized = false;

    async function startPlayback() {
        const source = video.getAttribute('data-src');
        if (!source) {
            setStatus(player, '未找到播放源。', true);
            return;
        }

        try {
            if (!initialized) {
                setStatus(player, '正在初始化 HLS 播放源...', true);
                await attachHls(video, source);
                initialized = true;
            }
            await video.play();
            player.classList.add('is-playing');
            setStatus(player, '', false);
        } catch (error) {
            setStatus(player, error && error.message ? error.message : '播放启动失败，请稍后重试。', true);
        }
    }

    button.addEventListener('click', startPlayback);
    video.addEventListener('play', function () {
        player.classList.add('is-playing');
    });
    video.addEventListener('pause', function () {
        if (!video.ended) {
            player.classList.remove('is-playing');
        }
    });
    video.addEventListener('error', function () {
        setStatus(player, '播放源加载失败，请检查网络或 m3u8 地址。', true);
    });
}

document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('[data-video-player]').forEach(setupVideoPlayer);
});

import { H as Hls } from './hls-player.js';

document.querySelectorAll('[data-hls-player]').forEach(function (shell) {
  var video = shell.querySelector('video');
  var button = shell.querySelector('.player-start');
  var statusNode = shell.querySelector('.player-status');
  var source = video ? video.getAttribute('data-src') : '';
  var hls = null;
  var initialized = false;
  var ready = false;
  var requestedPlay = false;

  function setStatus(message) {
    if (statusNode) {
      statusNode.textContent = message || '';
    }
  }

  function playVideo() {
    if (!video) {
      return;
    }

    var playPromise = video.play();

    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {
        setStatus('点击播放按钮开始播放');
      });
    }
  }

  function initialize() {
    if (!video || !source || initialized) {
      return;
    }

    initialized = true;
    setStatus('正在加载播放源');

    if (Hls && Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });

      hls.loadSource(source);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, function () {
        ready = true;
        setStatus('');

        if (requestedPlay) {
          playVideo();
        }
      });

      hls.on(Hls.Events.ERROR, function (event, data) {
        if (!data || !data.fatal) {
          return;
        }

        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
          setStatus('网络波动，正在重新加载');
          hls.startLoad();
          return;
        }

        if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
          setStatus('媒体解码异常，正在恢复');
          hls.recoverMediaError();
          return;
        }

        setStatus('当前播放源暂时无法播放');
        hls.destroy();
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      ready = true;
      setStatus('');
    } else {
      setStatus('当前浏览器不支持 HLS 播放');
    }
  }

  function requestPlay() {
    requestedPlay = true;
    initialize();

    if (ready || video.src) {
      playVideo();
    }
  }

  if (button) {
    button.addEventListener('click', requestPlay);
  }

  if (video) {
    video.controls = true;
    video.addEventListener('play', function () {
      shell.classList.add('is-playing');
    });

    video.addEventListener('pause', function () {
      if (video.currentTime === 0 || video.ended) {
        shell.classList.remove('is-playing');
      }
    });

    video.addEventListener('click', function () {
      if (!initialized) {
        requestPlay();
      }
    });
  }
});

(function () {
  var players = {};

  function attachStream(video, streamUrl, onReady) {
    if (video.getAttribute("data-ready") === "1") {
      onReady();
      return;
    }
    video.setAttribute("data-ready", "1");
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
      video.addEventListener("loadedmetadata", onReady, { once: true });
      video.load();
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      players[video.id] = hls;
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, onReady);
      hls.on(window.Hls.Events.ERROR, function (_, data) {
        if (data && data.fatal) {
          video.setAttribute("data-ready", "0");
        }
      });
      return;
    }
    video.src = streamUrl;
    video.addEventListener("loadedmetadata", onReady, { once: true });
    video.load();
  }

  function safePlay(video) {
    var promise = video.play();
    if (promise && typeof promise.catch === "function") {
      promise.catch(function () {
        video.setAttribute("controls", "controls");
      });
    }
  }

  window.initMoviePlayer = function (videoId, streamUrl, buttonSelector) {
    var video = document.getElementById(videoId);
    var button = document.querySelector(buttonSelector);
    if (!video) {
      return;
    }

    function start() {
      if (button) {
        button.classList.add("is-hidden");
      }
      attachStream(video, streamUrl, function () {
        safePlay(video);
      });
      if (video.getAttribute("data-ready") === "1") {
        safePlay(video);
      }
    }

    if (button) {
      button.addEventListener("click", function (event) {
        event.preventDefault();
        start();
      });
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      } else {
        video.pause();
      }
    });

    video.addEventListener("play", function () {
      if (button) {
        button.classList.add("is-hidden");
      }
    });

    video.addEventListener("pause", function () {
      if (button && video.currentTime === 0) {
        button.classList.remove("is-hidden");
      }
    });
  };
}());

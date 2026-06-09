(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupImageFallbacks();
    setupSearch();
    setupPlayers();
  });

  function setupMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-mobile-nav]');

    if (!toggle || !nav) {
      return;
    }

    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var prev = document.querySelector('[data-hero-prev]');
    var next = document.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    if (!slides.length) {
      return;
    }

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        restart();
      });
    }

    restart();
  }

  function setupFilters() {
    var panel = document.querySelector('[data-filter-panel]');

    if (!panel) {
      return;
    }

    var keyword = panel.querySelector('[data-filter-keyword]');
    var region = panel.querySelector('[data-filter-region]');
    var type = panel.querySelector('[data-filter-type]');
    var year = panel.querySelector('[data-filter-year]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card-list] .movie-card'));
    var empty = document.querySelector('[data-empty-state]');

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function apply() {
      var key = normalize(keyword && keyword.value);
      var regionValue = normalize(region && region.value);
      var typeValue = normalize(type && type.value);
      var yearValue = normalize(year && year.value);
      var visibleCount = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.dataset.title,
          card.dataset.region,
          card.dataset.type,
          card.dataset.year,
          card.dataset.tags
        ].join(' '));
        var matched = true;

        if (key && haystack.indexOf(key) === -1) {
          matched = false;
        }

        if (regionValue && normalize(card.dataset.region) !== regionValue) {
          matched = false;
        }

        if (typeValue && normalize(card.dataset.type) !== typeValue) {
          matched = false;
        }

        if (yearValue && normalize(card.dataset.year) !== yearValue) {
          matched = false;
        }

        card.hidden = !matched;
        if (matched) {
          visibleCount += 1;
        }
      });

      if (empty) {
        empty.hidden = visibleCount !== 0;
      }
    }

    [keyword, region, type, year].forEach(function (control) {
      if (!control) {
        return;
      }
      control.addEventListener('input', apply);
      control.addEventListener('change', apply);
    });
  }

  function setupImageFallbacks() {
    var images = Array.prototype.slice.call(document.querySelectorAll('img'));

    images.forEach(function (image) {
      image.addEventListener('error', function () {
        var parent = image.closest('.movie-cover, .detail-poster');
        if (parent) {
          parent.classList.add('is-missing');
          parent.setAttribute('data-title', image.getAttribute('alt') || '影片封面');
        }
        image.style.opacity = '0';
      }, { once: true });
    });
  }

  function setupSearch() {
    var data = window.MOVIE_DATA;
    var input = document.querySelector('[data-search-input]');
    var form = document.querySelector('[data-search-form]');
    var results = document.querySelector('[data-search-results]');
    var count = document.querySelector('[data-search-count]');

    if (!data || !input || !results) {
      return;
    }

    function getInitialQuery() {
      var params = new URLSearchParams(window.location.search);
      return params.get('q') || params.get('region') || '';
    }

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function movieCard(movie) {
      var tags = movie.tags.slice(0, 3).map(function (tag) {
        return '<span>' + escapeHtml(tag) + '</span>';
      }).join('');

      return '' +
        '<article class="movie-card">' +
          '<a class="movie-card-link" href="' + escapeHtml(movie.url) + '">' +
            '<span class="movie-cover">' +
              '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
              '<span class="movie-score">' + escapeHtml(movie.score) + '</span>' +
              '<span class="play-corner">▶</span>' +
            '</span>' +
            '<span class="movie-info">' +
              '<strong>' + escapeHtml(movie.title) + '</strong>' +
              '<small>' + escapeHtml(movie.year) + ' · ' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.type) + '</small>' +
              '<span class="movie-tags">' + tags + '</span>' +
            '</span>' +
          '</a>' +
        '</article>';
    }

    function render() {
      var query = normalize(input.value);
      var matched = data.filter(function (movie) {
        if (!query) {
          return true;
        }
        return normalize([
          movie.title,
          movie.region,
          movie.type,
          movie.year,
          movie.genre,
          movie.tags.join(' '),
          movie.oneLine
        ].join(' ')).indexOf(query) !== -1;
      }).slice(0, 120);

      results.innerHTML = matched.map(movieCard).join('');
      if (count) {
        count.textContent = query
          ? '共找到 ' + matched.length + ' 条匹配结果，最多显示前 120 条'
          : '默认显示前 120 部影片，可输入关键词缩小范围';
      }
      setupImageFallbacks();
    }

    if (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        render();
      });
    }

    document.querySelectorAll('[data-search-chip]').forEach(function (button) {
      button.addEventListener('click', function () {
        input.value = button.getAttribute('data-search-chip') || '';
        render();
      });
    });

    input.addEventListener('input', render);
    input.value = getInitialQuery();
    render();
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

    players.forEach(function (player) {
      var start = player.querySelector('[data-player-start]');
      var status = player.querySelector('[data-player-status]');
      var video = player.querySelector('video');
      var src = player.getAttribute('data-src');
      var hlsInstance = null;

      function setStatus(message) {
        if (status) {
          status.textContent = message;
        }
      }

      function play() {
        if (!video || !src) {
          setStatus('未找到可用播放源。');
          return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = src;
          video.play().catch(function () {
            setStatus('浏览器阻止了自动播放，请再次点击视频播放。');
          });
          player.classList.add('is-playing');
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          if (!hlsInstance) {
            hlsInstance = new window.Hls({
              enableWorker: true,
              lowLatencyMode: true
            });
            hlsInstance.loadSource(src);
            hlsInstance.attachMedia(video);
            hlsInstance.on(window.Hls.Events.ERROR, function (_, data) {
              if (data && data.fatal) {
                setStatus('播放加载失败，请刷新页面或更换网络后重试。');
              }
            });
          }
          video.play().catch(function () {
            setStatus('播放器已就绪，请再次点击播放按钮。');
          });
          player.classList.add('is-playing');
          return;
        }

        video.src = src;
        video.play().catch(function () {
          setStatus('当前浏览器不支持 HLS 播放，请使用 Safari、Chrome 或 Edge 最新版本。');
        });
        player.classList.add('is-playing');
      }

      if (start) {
        start.addEventListener('click', play);
      }

      if (video) {
        video.addEventListener('click', function () {
          if (video.paused) {
            play();
          }
        });
      }
    });
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
})();

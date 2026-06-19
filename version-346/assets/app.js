(function () {
  var heroTimer = null;

  function all(selector, parent) {
    return Array.prototype.slice.call((parent || document).querySelectorAll(selector));
  }

  function initNavigation() {
    var searchToggle = document.querySelector('.nav-search-toggle');
    var searchPanel = document.querySelector('.nav-search-panel');
    var mobileToggle = document.querySelector('.mobile-menu-toggle');
    var mobilePanel = document.querySelector('.mobile-nav-panel');

    if (searchToggle && searchPanel) {
      searchToggle.addEventListener('click', function () {
        searchPanel.hidden = !searchPanel.hidden;
        if (!searchPanel.hidden) {
          var input = searchPanel.querySelector('input');
          if (input) {
            input.focus();
          }
        }
      });
    }

    if (mobileToggle && mobilePanel) {
      mobileToggle.addEventListener('click', function () {
        mobilePanel.hidden = !mobilePanel.hidden;
        mobileToggle.textContent = mobilePanel.hidden ? '☰' : '×';
      });
    }
  }

  function initHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }

    var slides = all('[data-hero-slide]', hero);
    var dots = all('[data-hero-dot]', hero);
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    function restart() {
      if (heroTimer) {
        window.clearInterval(heroTimer);
      }
      heroTimer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot') || 0));
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

    show(0);
    restart();
  }

  function initHorizontalLists() {
    all('.scroll-shell').forEach(function (shell) {
      var list = shell.querySelector('[data-horizontal-list]');
      var left = shell.querySelector('.scroll-left');
      var right = shell.querySelector('.scroll-right');
      if (!list) {
        return;
      }
      if (left) {
        left.addEventListener('click', function () {
          list.scrollBy({ left: -420, behavior: 'smooth' });
        });
      }
      if (right) {
        right.addEventListener('click', function () {
          list.scrollBy({ left: 420, behavior: 'smooth' });
        });
      }
    });
  }

  function initPlayer() {
    var video = document.querySelector('#movie-player');
    var button = document.querySelector('[data-play-button]');
    var message = document.querySelector('[data-player-message]');
    if (!video) {
      return;
    }

    var streamUrl = video.getAttribute('data-stream');
    var started = false;
    var hlsInstance = null;

    function setMessage(text) {
      if (message) {
        message.textContent = text || '';
      }
    }

    function hideButton() {
      if (button) {
        button.classList.add('is-hidden');
      }
    }

    function startPlayback() {
      if (!streamUrl) {
        setMessage('当前播放源暂不可用');
        return;
      }

      hideButton();

      if (!started) {
        started = true;
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: false,
            backBufferLength: 90
          });
          hlsInstance.loadSource(streamUrl);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            setMessage('');
            video.play().catch(function () {
              setMessage('请点击视频区域继续播放');
            });
          });
          hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              setMessage('视频加载失败，请稍后重试');
              if (hlsInstance) {
                hlsInstance.destroy();
              }
              hlsInstance = null;
              started = false;
            }
          });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = streamUrl;
          video.addEventListener('loadedmetadata', function () {
            setMessage('');
            video.play().catch(function () {
              setMessage('请点击视频区域继续播放');
            });
          }, { once: true });
        } else {
          video.src = streamUrl;
          video.play().catch(function () {
            setMessage('当前浏览器可能需要 HLS 支持');
          });
        }
      } else {
        video.play().catch(function () {
          setMessage('请点击视频区域继续播放');
        });
      }
    }

    if (button) {
      button.addEventListener('click', startPlayback);
    }

    video.addEventListener('click', function () {
      if (!started || video.paused) {
        startPlayback();
      }
    });

    video.addEventListener('play', hideButton);
    video.addEventListener('playing', function () {
      setMessage('');
    });
  }

  function initSearchPage() {
    var page = document.querySelector('[data-search-page]');
    var input = document.querySelector('[data-page-search-input]');
    var results = document.querySelector('[data-search-results]');
    var empty = document.querySelector('[data-empty-state]');
    if (!page || !input || !results) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    input.value = query;

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function filterCards() {
      var term = normalize(input.value);
      var visible = false;
      all('[data-search]', results).forEach(function (card) {
        var haystack = normalize(card.getAttribute('data-search'));
        var match = !term || haystack.indexOf(term) !== -1;
        card.hidden = !match;
        if (match) {
          visible = true;
        }
      });
      if (empty) {
        empty.hidden = visible;
      }
    }

    input.addEventListener('input', filterCards);
    filterCards();
  }

  document.addEventListener('DOMContentLoaded', function () {
    initNavigation();
    initHero();
    initHorizontalLists();
    initPlayer();
    initSearchPage();
  });
})();

(function () {
  'use strict';

  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $$(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function initMobileNavigation() {
    var toggle = $('[data-mobile-toggle]');
    var panel = $('[data-mobile-panel]');

    if (!toggle || !panel) {
      return;
    }

    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function initHeaderSearch() {
    $$('[data-site-search-form]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        var input = form.querySelector('input[name="q"]');
        var query = input ? input.value.trim() : '';

        if (!query) {
          event.preventDefault();
          return;
        }
      });
    });
  }

  function initHeroSlider() {
    var slider = $('[data-hero-slider]');

    if (!slider) {
      return;
    }

    var slides = $$('[data-hero-slide]', slider);
    var dots = $$('[data-hero-dot]', slider);
    var prev = $('[data-hero-prev]', slider);
    var next = $('[data-hero-next]', slider);
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        restart();
      });
    }

    show(0);
    restart();
  }

  function initImageFallbacks() {
    document.addEventListener(
      'error',
      function (event) {
        var target = event.target;

        if (!target || !target.matches || !target.matches('img')) {
          return;
        }

        var shell = target.closest('.poster-shell, .hero-poster, .detail-poster, .ranking-poster');

        if (shell) {
          shell.classList.add('poster-missing');
          target.remove();
        }
      },
      true
    );
  }

  function initLocalFilters() {
    var filterRoot = $('[data-local-filter]');
    var grid = $('[data-filter-grid]');

    if (!filterRoot || !grid) {
      return;
    }

    var cards = $$('.movie-card', grid);

    filterRoot.addEventListener('click', function (event) {
      var button = event.target.closest('button[data-filter-value]');

      if (!button) {
        return;
      }

      var value = button.getAttribute('data-filter-value');
      $$('button', filterRoot).forEach(function (item) {
        item.classList.toggle('is-active', item === button);
      });

      cards.forEach(function (card) {
        var text = normalize(card.textContent);
        var visible = value === 'all' || text.indexOf(normalize(value)) !== -1;
        card.hidden = !visible;
      });
    });
  }

  function initSearchPage() {
    var root = $('[data-search-page]');

    if (!root || !window.MOVIE_INDEX) {
      return;
    }

    var movies = window.MOVIE_INDEX || [];
    var categories = window.CATEGORY_INDEX || [];
    var input = $('[data-search-input]', root);
    var results = $('[data-search-results]', root);
    var summary = $('[data-search-summary]', root);
    var loadMore = $('[data-load-more]', root);
    var categorySelect = $('[data-filter="category"]', root);
    var typeSelect = $('[data-filter="type"]', root);
    var yearSelect = $('[data-filter="year"]', root);
    var rendered = 0;
    var currentMatches = [];
    var pageSize = 72;

    function addOptions(select, values) {
      if (!select) {
        return;
      }

      values.forEach(function (value) {
        var option = document.createElement('option');
        option.value = value.value || value;
        option.textContent = value.label || value;
        select.appendChild(option);
      });
    }

    addOptions(categorySelect, categories.map(function (category) {
      return {
        value: category.slug,
        label: category.name
      };
    }));

    addOptions(typeSelect, Array.from(new Set(movies.map(function (movie) {
      return movie.type;
    }).filter(Boolean))).sort());

    addOptions(yearSelect, Array.from(new Set(movies.map(function (movie) {
      return movie.year;
    }).filter(Boolean))).sort().reverse());

    function getQueryFromUrl() {
      var params = new URLSearchParams(window.location.search);
      return params.get('q') || '';
    }

    function movieMatches(movie, keyword, category, type, year) {
      var haystack = normalize([
        movie.title,
        movie.region,
        movie.type,
        movie.year,
        movie.genre,
        movie.oneLine,
        (movie.tags || []).join(' ')
      ].join(' '));

      if (keyword && haystack.indexOf(keyword) === -1) {
        return false;
      }

      if (category && movie.category !== category) {
        return false;
      }

      if (type && movie.type !== type) {
        return false;
      }

      if (year && movie.year !== year) {
        return false;
      }

      return true;
    }

    function renderCard(movie) {
      var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
        return '<span>' + escapeHtml(tag) + '</span>';
      }).join('');

      return [
        '<article class="movie-card">',
        '  <a class="poster-shell" href="' + escapeHtml(movie.url) + '" data-title="' + escapeHtml(movie.title) + '">',
        '    <img class="poster-img" src="' + escapeHtml(movie.poster) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
        '    <span class="poster-badge">' + escapeHtml(movie.year) + '</span>',
        '    <span class="poster-type">' + escapeHtml(movie.type) + '</span>',
        '  </a>',
        '  <div class="movie-card-body">',
        '    <div class="movie-meta-line"><a href="' + escapeHtml(movie.categoryUrl) + '">' + escapeHtml(movie.categoryName) + '</a><span>' + escapeHtml(movie.region) + '</span></div>',
        '    <h3><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>',
        '    <p>' + escapeHtml(movie.oneLine) + '</p>',
        '    <div class="tag-row">' + tags + '</div>',
        '  </div>',
        '</article>'
      ].join('');
    }

    function renderMore(reset) {
      if (reset) {
        rendered = 0;
        results.innerHTML = '';
      }

      var next = currentMatches.slice(rendered, rendered + pageSize);
      results.insertAdjacentHTML('beforeend', next.map(renderCard).join(''));
      rendered += next.length;

      if (loadMore) {
        loadMore.hidden = rendered >= currentMatches.length;
      }
    }

    function runSearch() {
      var keyword = normalize(input.value);
      var category = categorySelect ? categorySelect.value : '';
      var type = typeSelect ? typeSelect.value : '';
      var year = yearSelect ? yearSelect.value : '';

      currentMatches = movies.filter(function (movie) {
        return movieMatches(movie, keyword, category, type, year);
      });

      if (summary) {
        summary.textContent = '共找到 ' + currentMatches.length + ' 部影片';
      }

      renderMore(true);
    }

    input.value = getQueryFromUrl();
    [input, categorySelect, typeSelect, yearSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', runSearch);
        control.addEventListener('change', runSearch);
      }
    });

    if (loadMore) {
      loadMore.addEventListener('click', function () {
        renderMore(false);
      });
    }

    runSearch();
  }

  function initVideoPlayers() {
    $$('[data-video-player]').forEach(function (player) {
      var video = $('video', player);
      var button = $('[data-play-button]', player);
      var status = $('[data-player-status]', player);
      var source = player.getAttribute('data-m3u8');
      var hlsInstance = null;
      var initialized = false;

      function setStatus(message) {
        if (status) {
          status.textContent = message;
        }
      }

      function playWhenReady() {
        var playPromise = video.play();

        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {
            setStatus('已绑定片源，请手动点击播放');
          });
        }
      }

      function initPlayer() {
        if (!video || !source) {
          setStatus('未找到播放源');
          return;
        }

        player.classList.add('is-playing');

        if (initialized) {
          playWhenReady();
          return;
        }

        initialized = true;
        setStatus('正在初始化 HLS 片源');

        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: false
          });

          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            setStatus('高清线路已就绪');
            playWhenReady();
          });
          hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              setStatus('播放源连接异常，可刷新后重试');
            }
          });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          video.addEventListener('loadedmetadata', function () {
            setStatus('原生 HLS 已就绪');
            playWhenReady();
          }, { once: true });
        } else {
          video.src = source;
          setStatus('当前浏览器不支持 HLS.js 或原生 HLS');
        }
      }

      if (button) {
        button.addEventListener('click', initPlayer);
      }

      video.addEventListener('play', function () {
        player.classList.add('is-playing');
      });

      window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMobileNavigation();
    initHeaderSearch();
    initHeroSlider();
    initImageFallbacks();
    initLocalFilters();
    initSearchPage();
    initVideoPlayers();
  });
})();

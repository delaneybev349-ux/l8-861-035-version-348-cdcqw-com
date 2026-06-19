(function () {
  const toggle = document.querySelector('[data-menu-toggle]');
  const menu = document.querySelector('[data-mobile-menu]');

  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('[data-search-form]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      const input = form.querySelector('input[name="q"]');
      const action = form.getAttribute('data-search-action') || 'search.html';
      const query = input ? input.value.trim() : '';
      const suffix = query ? '?q=' + encodeURIComponent(query) : '';
      window.location.href = action + suffix;
    });
  });

  const slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  const dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  let current = 0;
  let timer = null;

  function showHero(index) {
    if (!slides.length) {
      return;
    }
    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle('is-active', i === current);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle('is-active', i === current);
    });
  }

  function startHero() {
    if (timer) {
      window.clearInterval(timer);
    }
    timer = window.setInterval(function () {
      showHero(current + 1);
    }, 5200);
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      const index = Number(dot.getAttribute('data-hero-dot')) || 0;
      showHero(index);
      startHero();
    });
  });

  if (slides.length > 1) {
    startHero();
  }

  const filterInput = document.querySelector('[data-local-filter]');
  const localList = document.querySelector('[data-local-list]');

  if (filterInput && localList) {
    const localCards = Array.prototype.slice.call(localList.querySelectorAll('[data-search-text]'));
    filterInput.addEventListener('input', function () {
      const value = filterInput.value.trim().toLowerCase();
      localCards.forEach(function (card) {
        const text = card.getAttribute('data-search-text') || '';
        card.setAttribute('data-local-hidden', value && !text.includes(value) ? 'true' : 'false');
      });
    });
  }

  const results = document.getElementById('search-results');
  const searchForm = document.querySelector('[data-search-page-form]');
  const searchTitle = document.querySelector('[data-search-title]');
  const searchSummary = document.querySelector('[data-search-summary]');

  function getQuery() {
    const params = new URLSearchParams(window.location.search);
    return (params.get('q') || '').trim();
  }

  function cardTemplate(movie) {
    const tags = (movie.tags || []).slice(0, 2).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');
    return '<a class="movie-card small" href="' + movie.href + '" data-search-text="' + escapeHtml(movie.searchText || '') + '">' +
      '<span class="poster-wrap">' +
      '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
      '<span class="poster-shade"></span>' +
      '<span class="type-badge">' + escapeHtml(movie.type) + '</span>' +
      '<span class="year-badge">' + escapeHtml(movie.year) + '</span>' +
      '<span class="play-bubble">▶</span>' +
      '</span>' +
      '<span class="movie-info">' +
      '<span class="movie-tags">' + tags + '</span>' +
      '<strong>' + escapeHtml(movie.title) + '</strong>' +
      '<small>' + escapeHtml(movie.oneLine) + '</small>' +
      '<span class="movie-meta"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.genre) + '</span><span>' + escapeHtml(movie.rating) + '</span></span>' +
      '</span>' +
      '</a>';
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[char];
    });
  }

  function renderSearch(query) {
    if (!results || !window.SITE_MOVIES) {
      return;
    }
    const normalized = query.toLowerCase();
    const source = window.SITE_MOVIES;
    const matched = normalized
      ? source.filter(function (movie) {
        return (movie.searchText || '').includes(normalized);
      })
      : source.slice(0, 36);
    const limited = matched.slice(0, 120);
    results.innerHTML = limited.map(cardTemplate).join('');
    if (searchTitle) {
      searchTitle.textContent = normalized ? '搜索结果' : '推荐内容';
    }
    if (searchSummary) {
      searchSummary.textContent = normalized ? '找到 ' + matched.length + ' 部相关作品。' : '展示部分热门推荐，输入关键词可继续筛选。';
    }
    if (!limited.length) {
      results.innerHTML = '<div class="content-card movie-article"><h2>暂无匹配内容</h2><p>可以尝试更换片名、地区、年份或题材关键词。</p></div>';
    }
  }

  if (searchForm) {
    const input = searchForm.querySelector('input[name="q"]');
    const query = getQuery();
    if (input) {
      input.value = query;
    }
    searchForm.addEventListener('submit', function (event) {
      event.preventDefault();
      const value = input ? input.value.trim() : '';
      const suffix = value ? '?q=' + encodeURIComponent(value) : '';
      window.history.replaceState(null, '', window.location.pathname + suffix);
      renderSearch(value);
    });
    renderSearch(query);
  }
})();

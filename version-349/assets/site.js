
(function () {
  const toggle = document.querySelector('[data-menu-toggle]');
  const mobileNav = document.querySelector('[data-mobile-nav]');

  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  const hero = document.querySelector('[data-hero]');

  if (hero) {
    const slides = Array.from(hero.querySelectorAll('.hero-slide'));
    const prev = hero.querySelector('[data-hero-prev]');
    const next = hero.querySelector('[data-hero-next]');
    let active = 0;
    let timer = null;

    const show = function (index) {
      if (!slides.length) {
        return;
      }

      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === active);
      });
    };

    const start = function () {
      timer = window.setInterval(function () {
        show(active + 1);
      }, 5200);
    };

    const restart = function () {
      if (timer) {
        window.clearInterval(timer);
      }
      start();
    };

    if (prev) {
      prev.addEventListener('click', function () {
        show(active - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(active + 1);
        restart();
      });
    }

    show(0);
    start();
  }

  const localFilter = document.querySelector('[data-local-filter]');

  if (localFilter) {
    const cards = Array.from(document.querySelectorAll('[data-card-list] .movie-card'));

    localFilter.addEventListener('input', function () {
      const keyword = localFilter.value.trim().toLowerCase();

      cards.forEach(function (card) {
        const haystack = [
          card.dataset.title,
          card.dataset.genre,
          card.dataset.region,
          card.dataset.year,
          card.dataset.type
        ].join(' ').toLowerCase();

        card.classList.toggle('is-hidden', keyword && !haystack.includes(keyword));
      });
    });
  }

  const searchForm = document.querySelector('[data-search-form]');

  if (searchForm) {
    const input = searchForm.querySelector('[data-search-input]');
    const year = searchForm.querySelector('[data-filter-year]');
    const region = searchForm.querySelector('[data-filter-region]');
    const genre = searchForm.querySelector('[data-filter-genre]');
    const cards = Array.from(document.querySelectorAll('[data-search-results] .movie-card'));

    const apply = function () {
      const keyword = input.value.trim().toLowerCase();
      const selectedYear = year.value;
      const selectedRegion = region.value;
      const selectedGenre = genre.value;

      cards.forEach(function (card) {
        const text = [
          card.dataset.title,
          card.dataset.genre,
          card.dataset.region,
          card.dataset.year,
          card.dataset.type
        ].join(' ').toLowerCase();
        const matchesKeyword = !keyword || text.includes(keyword);
        const matchesYear = !selectedYear || card.dataset.year === selectedYear;
        const matchesRegion = !selectedRegion || card.dataset.region === selectedRegion;
        const matchesGenre = !selectedGenre || (card.dataset.genre || '').includes(selectedGenre);

        card.classList.toggle('is-hidden', !(matchesKeyword && matchesYear && matchesRegion && matchesGenre));
      });
    };

    searchForm.addEventListener('input', apply);
    searchForm.addEventListener('change', apply);
    searchForm.addEventListener('submit', function (event) {
      event.preventDefault();
      apply();
    });
  }
}());

(function () {
  const navButton = document.querySelector('[data-nav-toggle]');
  const nav = document.querySelector('[data-site-nav]');
  if (navButton && nav) {
    navButton.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  const slides = Array.from(document.querySelectorAll('.hero-slide'));
  const dots = Array.from(document.querySelectorAll('.hero-dot'));
  if (slides.length > 1) {
    let index = 0;
    const show = function (next) {
      index = next;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    };
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
      });
    });
    setInterval(function () {
      show((index + 1) % slides.length);
    }, 5200);
  }

  const searchInput = document.querySelector('[data-search-input]');
  const genreSelect = document.querySelector('[data-genre-select]');
  const cards = Array.from(document.querySelectorAll('[data-title][data-genre]'));
  const filterCards = function () {
    const keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';
    const genre = genreSelect ? genreSelect.value : '';
    cards.forEach(function (card) {
      const title = (card.getAttribute('data-title') || '').toLowerCase();
      const cardGenre = card.getAttribute('data-genre') || '';
      const visible = (!keyword || title.indexOf(keyword) !== -1) && (!genre || cardGenre === genre);
      card.style.display = visible ? '' : 'none';
    });
  };
  if (searchInput) {
    searchInput.addEventListener('input', filterCards);
  }
  if (genreSelect) {
    genreSelect.addEventListener('change', filterCards);
  }
}());

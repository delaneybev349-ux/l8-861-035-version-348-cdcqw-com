
(function () {
    var body = document.body;
    var base = body ? body.getAttribute('data-base') || '' : '';

    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function initMenu() {
        var toggle = qs('[data-menu-toggle]');
        var panel = qs('[data-mobile-panel]');
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener('click', function () {
            panel.classList.toggle('is-open');
        });
    }

    function initHero() {
        var hero = qs('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = qsa('[data-hero-slide]', hero);
        var dots = qsa('[data-hero-dot]', hero);
        var prev = qs('[data-hero-prev]', hero);
        var next = qs('[data-hero-next]', hero);
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === index);
            });
        }

        function restart() {
            if (timer) {
                clearInterval(timer);
            }
            timer = setInterval(function () {
                show(index + 1);
            }, 5000);
        }

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
        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                show(i);
                restart();
            });
        });
        show(0);
        restart();
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function initFilters() {
        var listing = qs('[data-listing]');
        var keywordInput = qs('[data-filter-keyword]');
        var typeSelect = qs('[data-filter-type]');
        var yearInput = qs('[data-filter-year]');
        var reset = qs('[data-filter-reset]');
        var count = qs('[data-result-count]');
        if (!listing) {
            return;
        }
        var cards = qsa('[data-card]', listing);
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q');
        if (query && keywordInput) {
            keywordInput.value = query;
        }

        function apply() {
            var keyword = normalize(keywordInput ? keywordInput.value : '');
            var type = normalize(typeSelect ? typeSelect.value : '');
            var year = normalize(yearInput ? yearInput.value : '');
            var visible = 0;
            cards.forEach(function (card) {
                var text = normalize(card.getAttribute('data-search'));
                var cardType = normalize(card.getAttribute('data-type'));
                var cardYear = normalize(card.getAttribute('data-year'));
                var matched = true;
                if (keyword && text.indexOf(keyword) === -1) {
                    matched = false;
                }
                if (type && cardType !== type) {
                    matched = false;
                }
                if (year && cardYear.indexOf(year) === -1) {
                    matched = false;
                }
                card.classList.toggle('is-hidden', !matched);
                if (matched) {
                    visible += 1;
                }
            });
            if (count) {
                count.textContent = visible;
            }
        }

        [keywordInput, typeSelect, yearInput].forEach(function (item) {
            if (item) {
                item.addEventListener('input', apply);
                item.addEventListener('change', apply);
            }
        });
        if (reset) {
            reset.addEventListener('click', function () {
                if (keywordInput) {
                    keywordInput.value = '';
                }
                if (typeSelect) {
                    typeSelect.value = '';
                }
                if (yearInput) {
                    yearInput.value = '';
                }
                apply();
            });
        }
        apply();
    }

    function initGlobalSearch() {
        qsa('[data-global-search]').forEach(function (form) {
            form.addEventListener('submit', function (event) {
                var input = qs('input[name="q"]', form);
                var value = input ? input.value.trim() : '';
                if (!value) {
                    event.preventDefault();
                    return;
                }
                var pageFilter = qs('[data-filter-keyword]');
                var listing = qs('[data-listing]');
                if (listing && pageFilter) {
                    event.preventDefault();
                    pageFilter.value = value;
                    pageFilter.dispatchEvent(new Event('input', { bubbles: true }));
                    window.history.replaceState(null, '', window.location.pathname + '?q=' + encodeURIComponent(value));
                } else {
                    event.preventDefault();
                    window.location.href = base + 'all-movies.html?q=' + encodeURIComponent(value);
                }
            });
        });
    }

    function initPlayers() {
        qsa('[data-player]').forEach(function (box) {
            var video = qs('video', box);
            var cover = qs('[data-player-cover]', box);
            var button = qs('[data-play]', box);
            var url = box.getAttribute('data-video-url');
            var started = false;
            var hls = null;

            if (!video || !url) {
                return;
            }

            function start() {
                if (cover) {
                    cover.classList.add('is-hidden');
                }
                video.setAttribute('controls', 'controls');
                if (!started) {
                    if (video.canPlayType('application/vnd.apple.mpegurl')) {
                        video.src = url;
                        video.play().catch(function () {
                            if (cover) {
                                cover.classList.remove('is-hidden');
                            }
                        });
                    } else if (window.Hls && window.Hls.isSupported()) {
                        hls = new window.Hls();
                        hls.loadSource(url);
                        hls.attachMedia(video);
                        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                            video.play().catch(function () {
                                if (cover) {
                                    cover.classList.remove('is-hidden');
                                }
                            });
                        });
                    } else {
                        video.src = url;
                        video.play().catch(function () {
                            if (cover) {
                                cover.classList.remove('is-hidden');
                            }
                        });
                    }
                    started = true;
                } else {
                    video.play().catch(function () {
                        if (cover) {
                            cover.classList.remove('is-hidden');
                        }
                    });
                }
            }

            if (button) {
                button.addEventListener('click', function (event) {
                    event.preventDefault();
                    event.stopPropagation();
                    start();
                });
            }
            if (cover) {
                cover.addEventListener('click', start);
            }
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        initMenu();
        initHero();
        initFilters();
        initGlobalSearch();
        initPlayers();
    });
}());

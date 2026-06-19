(function () {
  function one(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function all(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  function setupMenu() {
    var button = one(".menu-toggle");
    var panel = one(".mobile-panel");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      var open = panel.classList.toggle("is-open");
      button.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function setupHero() {
    var hero = one(".js-hero");
    if (!hero) {
      return;
    }
    var slides = all(".hero-slide", hero);
    var dots = all(".hero-dot", hero);
    var prev = one(".hero-prev", hero);
    var next = one(".hero-next", hero);
    if (slides.length < 2) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }
    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        start();
      });
    });
    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    start();
  }

  function setupFilters() {
    var panels = all(".js-filter-panel");
    panels.forEach(function (panel) {
      var input = one(".js-filter-input", panel);
      var select = one(".js-category-select", panel);
      var targetSelector = panel.getAttribute("data-target") || ".js-filter-card";
      var cards = all(targetSelector);
      var empty = one(".empty-state");
      var params = new URLSearchParams(window.location.search);
      var query = params.get("q") || "";
      if (input && query) {
        input.value = query;
      }

      function apply() {
        var keyword = normalize(input ? input.value : "");
        var category = select ? select.value : "";
        var visible = 0;
        cards.forEach(function (card) {
          var text = normalize(card.getAttribute("data-keywords") + " " + card.getAttribute("data-title"));
          var cardCategory = card.getAttribute("data-category") || "";
          var matchedKeyword = !keyword || text.indexOf(keyword) !== -1;
          var matchedCategory = !category || cardCategory === category;
          var showCard = matchedKeyword && matchedCategory;
          card.style.display = showCard ? "" : "none";
          if (showCard) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }

      if (input) {
        input.addEventListener("input", apply);
      }
      if (select) {
        select.addEventListener("change", apply);
      }
      panel.addEventListener("submit", function (event) {
        event.preventDefault();
        apply();
      });
      apply();
    });
  }

  function setupPlayer() {
    var video = one("#main-player");
    if (!video) {
      return;
    }
    var source = one("source", video);
    var src = source ? source.getAttribute("src") : video.getAttribute("src");
    var overlay = one(".player-overlay");
    var message = one(".player-message");
    var hls = null;

    function showMessage(text) {
      if (message) {
        message.textContent = text;
        message.classList.add("is-visible");
      }
    }

    if (src && window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal) {
          showMessage("视频暂时无法播放");
        }
      });
    } else if (src && video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
    } else if (!src) {
      showMessage("视频暂时无法播放");
    }

    function playNow() {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {
          if (overlay) {
            overlay.classList.remove("is-hidden");
          }
        });
      }
    }

    if (overlay) {
      overlay.addEventListener("click", playNow);
    }
    video.addEventListener("click", function () {
      if (video.paused) {
        playNow();
      }
    });
    video.addEventListener("play", function () {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    });
    video.addEventListener("pause", function () {
      if (overlay && video.currentTime === 0) {
        overlay.classList.remove("is-hidden");
      }
    });
    window.addEventListener("pagehide", function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupPlayer();
  });
})();

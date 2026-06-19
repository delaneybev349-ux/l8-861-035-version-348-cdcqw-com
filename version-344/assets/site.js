document.addEventListener("DOMContentLoaded", function () {
    var menuButton = document.querySelector("[data-menu-button]");
    var mobilePanel = document.querySelector("[data-mobile-panel]");

    if (menuButton && mobilePanel) {
        menuButton.addEventListener("click", function () {
            var isOpen = mobilePanel.classList.toggle("is-open");
            menuButton.classList.toggle("is-open", isOpen);
            menuButton.setAttribute("aria-expanded", String(isOpen));
        });
    }

    var hero = document.querySelector("[data-hero]");

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var currentIndex = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }

            currentIndex = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === currentIndex);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === currentIndex);
            });
        }

        function startTimer() {
            stopTimer();
            timer = window.setInterval(function () {
                showSlide(currentIndex + 1);
            }, 5200);
        }

        function stopTimer() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                showSlide(index);
                startTimer();
            });
        });

        hero.addEventListener("mouseenter", stopTimer);
        hero.addEventListener("mouseleave", startTimer);
        startTimer();
    }

    var searchInput = document.querySelector("[data-search-input]");
    var searchItems = Array.prototype.slice.call(document.querySelectorAll("[data-search-item]"));
    var searchTitle = document.querySelector("[data-search-title]");
    var emptyState = document.querySelector("[data-empty-state]");

    if (searchInput && searchItems.length) {
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get("q") || "";

        searchInput.value = initialQuery;
        filterItems(initialQuery);

        searchInput.addEventListener("input", function () {
            filterItems(searchInput.value);
        });
    }

    function filterItems(query) {
        var value = String(query || "").trim().toLowerCase();
        var hasVisible = false;

        searchItems.forEach(function (item) {
            var text = item.getAttribute("data-search") || "";
            var visible = !value || text.indexOf(value) !== -1;
            item.hidden = !visible;
            if (visible) {
                hasVisible = true;
            }
        });

        if (searchTitle) {
            searchTitle.textContent = value ? "搜索结果" : "全部作品";
        }

        if (emptyState) {
            emptyState.hidden = hasVisible;
        }
    }
});

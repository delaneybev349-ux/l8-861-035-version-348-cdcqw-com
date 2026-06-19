document.addEventListener("DOMContentLoaded", function () {
    var toggle = document.querySelector(".menu-toggle");
    var mobileNav = document.querySelector(".mobile-nav");

    if (toggle && mobileNav) {
        toggle.addEventListener("click", function () {
            var open = mobileNav.classList.toggle("open");
            toggle.setAttribute("aria-expanded", open ? "true" : "false");
        });
    }

    var hero = document.querySelector("[data-hero]");
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("active", i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("active", i === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5600);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-slide")) || 0);
                start();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                show(current - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(current + 1);
                start();
            });
        }

        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        start();
    }

    var filterInput = document.querySelector("[data-card-filter]");
    var yearSelect = document.querySelector("[data-year-filter]");
    var list = document.querySelector("[data-card-list]");

    if (list && (filterInput || yearSelect)) {
        var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));

        function applyFilter() {
            var keyword = filterInput ? filterInput.value.trim().toLowerCase() : "";
            var year = yearSelect ? yearSelect.value : "";

            cards.forEach(function (card) {
                var text = [
                    card.getAttribute("data-title"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-year"),
                    card.getAttribute("data-genre")
                ].join(" ").toLowerCase();
                var okKeyword = !keyword || text.indexOf(keyword) !== -1;
                var okYear = !year || (card.getAttribute("data-year") || "").indexOf(year) !== -1;
                card.style.display = okKeyword && okYear ? "" : "none";
            });
        }

        if (filterInput) {
            filterInput.addEventListener("input", applyFilter);
        }
        if (yearSelect) {
            yearSelect.addEventListener("change", applyFilter);
        }
    }
});

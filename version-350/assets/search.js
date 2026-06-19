document.addEventListener("DOMContentLoaded", function () {
    var input = document.getElementById("search-input");
    var select = document.getElementById("search-category");
    var button = document.getElementById("search-button");
    var results = document.getElementById("search-results");
    var params = new URLSearchParams(window.location.search);

    if (!input || !select || !button || !results || !window.MOVIE_INDEX) {
        return;
    }

    input.value = params.get("q") || "";

    function card(movie) {
        var tags = movie.tags.slice(0, 3).map(function (tag) {
            return "<span class=\"tag\">" + escapeHtml(tag) + "</span>";
        }).join("");

        return "<article class=\"movie-card\">" +
            "<a class=\"poster-wrap\" href=\"" + movie.url + "\" aria-label=\"" + escapeHtml(movie.title) + "\">" +
            "<img src=\"" + movie.cover + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">" +
            "<span class=\"poster-badge\">" + escapeHtml(movie.type) + "</span>" +
            "</a>" +
            "<div class=\"movie-card-body\">" +
            "<div class=\"meta-line\"><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.year) + "</span></div>" +
            "<h2><a href=\"" + movie.url + "\">" + escapeHtml(movie.title) + "</a></h2>" +
            "<p>" + escapeHtml(movie.oneLine) + "</p>" +
            "<div class=\"card-tags\">" + tags + "</div>" +
            "<a class=\"card-link\" href=\"" + movie.url + "\">立即观看</a>" +
            "</div>" +
            "</article>";
    }

    function escapeHtml(value) {
        return String(value || "").replace(/[&<>\"']/g, function (char) {
            return {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                "\"": "&quot;",
                "'": "&#39;"
            }[char];
        });
    }

    function run() {
        var keyword = input.value.trim().toLowerCase();
        var category = select.value;
        var items = window.MOVIE_INDEX.filter(function (movie) {
            var text = [movie.title, movie.region, movie.year, movie.genre, movie.type, movie.tags.join(" ")].join(" ").toLowerCase();
            var okKeyword = !keyword || text.indexOf(keyword) !== -1;
            var okCategory = !category || movie.category === category;
            return okKeyword && okCategory;
        }).slice(0, 160);

        if (!items.length) {
            results.innerHTML = "<div class=\"empty-state\">没有找到匹配的影片</div>";
            return;
        }

        results.innerHTML = items.map(card).join("");
    }

    input.addEventListener("input", run);
    select.addEventListener("change", run);
    button.addEventListener("click", run);
    run();
});

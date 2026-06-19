function mountMoviePlayer(videoId, buttonId, source) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);
    var started = false;
    var hls = null;

    if (!video || !button || !source) {
        return;
    }

    function attach() {
        if (started) {
            return;
        }
        started = true;
        button.classList.add("hidden");

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
            video.play().catch(function () {});
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                video.play().catch(function () {});
            });
            return;
        }

        video.src = source;
        video.play().catch(function () {});
    }

    button.addEventListener("click", attach);
    video.addEventListener("click", function () {
        if (!started) {
            attach();
        }
    });
    video.addEventListener("play", function () {
        button.classList.add("hidden");
    });

    window.addEventListener("beforeunload", function () {
        if (hls) {
            hls.destroy();
        }
    });
}

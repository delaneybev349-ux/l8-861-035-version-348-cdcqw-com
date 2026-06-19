document.addEventListener("DOMContentLoaded", function () {
    var video = document.getElementById("movie-player");
    var trigger = document.querySelector("[data-player-trigger]");
    var attached = false;
    var hlsInstance = null;

    if (!video || !trigger || typeof pageVideoUrl !== "string" || !pageVideoUrl) {
        return;
    }

    function attachVideo() {
        if (attached) {
            return;
        }

        attached = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = pageVideoUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsInstance.loadSource(pageVideoUrl);
            hlsInstance.attachMedia(video);
        } else {
            video.src = pageVideoUrl;
        }
    }

    function startPlayback() {
        attachVideo();
        trigger.classList.add("is-hidden");

        var playPromise = video.play();

        if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(function () {
                trigger.classList.remove("is-hidden");
            });
        }
    }

    trigger.addEventListener("click", startPlayback);

    video.addEventListener("click", function () {
        if (video.paused) {
            startPlayback();
        }
    });

    video.addEventListener("play", function () {
        trigger.classList.add("is-hidden");
    });

    video.addEventListener("pause", function () {
        if (!video.ended) {
            trigger.classList.remove("is-hidden");
        }
    });

    window.addEventListener("pagehide", function () {
        if (hlsInstance) {
            hlsInstance.destroy();
            hlsInstance = null;
        }
    });
});

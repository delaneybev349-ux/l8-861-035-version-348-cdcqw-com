import { H as Hls } from './hls-core.js';

const video = document.getElementById('movie-player');
const overlay = document.getElementById('player-overlay');
let hlsInstance = null;
let prepared = false;

function preparePlayer() {
  if (!video || prepared) {
    return;
  }
  const stream = video.getAttribute('data-stream') || '';
  if (!stream) {
    return;
  }
  if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = stream;
  } else if (Hls && Hls.isSupported()) {
    hlsInstance = new Hls({
      enableWorker: true,
      lowLatencyMode: true,
      backBufferLength: 90
    });
    hlsInstance.loadSource(stream);
    hlsInstance.attachMedia(video);
    hlsInstance.on(Hls.Events.ERROR, function (event, data) {
      if (!data || !data.fatal) {
        return;
      }
      if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
        hlsInstance.startLoad();
      } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
        hlsInstance.recoverMediaError();
      } else {
        hlsInstance.destroy();
        hlsInstance = null;
      }
    });
  }
  prepared = true;
}

function playMovie() {
  if (!video) {
    return;
  }
  preparePlayer();
  if (overlay) {
    overlay.classList.add('is-hidden');
  }
  const start = video.play();
  if (start && typeof start.catch === 'function') {
    start.catch(function () {
      if (overlay) {
        overlay.classList.remove('is-hidden');
      }
    });
  }
}

if (overlay) {
  overlay.addEventListener('click', playMovie);
}

if (video) {
  video.addEventListener('click', function () {
    if (video.paused) {
      playMovie();
    } else {
      video.pause();
    }
  });
  video.addEventListener('play', function () {
    if (overlay) {
      overlay.classList.add('is-hidden');
    }
  });
}

window.addEventListener('pagehide', function () {
  if (hlsInstance) {
    hlsInstance.destroy();
    hlsInstance = null;
  }
});

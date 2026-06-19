
import { H as Hls } from './hls-vendor-dru42stk.js';

const players = document.querySelectorAll('[data-stream]');

players.forEach(function (box) {
  const video = box.querySelector('video');
  const mask = box.querySelector('.player-mask');
  const stream = box.getAttribute('data-stream');
  let hls = null;

  const load = function () {
    if (!video || !stream || video.dataset.ready === '1') {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
    } else if (Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hls.loadSource(stream);
      hls.attachMedia(video);
    } else {
      video.src = stream;
    }

    video.controls = true;
    video.dataset.ready = '1';
  };

  const start = function () {
    load();

    if (mask) {
      mask.classList.add('is-hidden');
    }

    const playRequest = video.play();

    if (playRequest && typeof playRequest.catch === 'function') {
      playRequest.catch(function () {
        video.controls = true;
      });
    }
  };

  if (mask) {
    mask.addEventListener('click', start);
  }

  if (video) {
    video.addEventListener('click', function () {
      if (video.paused) {
        start();
      }
    });

    window.addEventListener('pagehide', function () {
      if (hls) {
        hls.destroy();
        hls = null;
      }
    });
  }
});

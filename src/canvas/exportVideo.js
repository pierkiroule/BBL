export function exportVideo({ canvas, duration, fps = 30 }) {
  if (!canvas) return Promise.resolve(null);

  return new Promise((resolve, reject) => {
    try {
      const stream = canvas.captureStream(fps);
      if (!stream) return resolve(null);

      const recorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp8',
        videoBitsPerSecond: 6_000_000,
      });

      const chunks = [];

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onerror = (e) => reject(e.error);

      recorder.onstop = () => {
        if (!chunks.length) return resolve(null);
        resolve(new Blob(chunks, { type: 'video/webm' }));
      };

      /* =========================
         PRÉ-ROLL (anti flash noir)
         on attend 2 frames réelles
      ========================= */
      let frameCount = 0;
      const warmup = () => {
        frameCount++;
        if (frameCount < 2) {
          requestAnimationFrame(warmup);
        } else {
          recorder.start();
          setTimeout(() => {
            if (recorder.state !== 'inactive') recorder.stop();
          }, duration);
        }
      };

      requestAnimationFrame(warmup);

    } catch (e) {
      reject(e);
    }
  });
}
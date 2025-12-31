export function exportVideo({ canvas, duration, fps = 30 }) {
  if (!canvas) return Promise.resolve(null);

  return new Promise((resolve, reject) => {
    try {
      const stream = canvas.captureStream ? canvas.captureStream(fps) : null;
      if (!stream) {
        resolve(null);
        return;
      }

      const recorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9' });
      const chunks = [];
      recorder.ondataavailable = (e) => {
        if (e.data?.size) chunks.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        resolve(blob);
      };
      recorder.onerror = (e) => reject(e.error);

      recorder.start();
      setTimeout(() => recorder.state !== 'inactive' && recorder.stop(), duration);
    } catch (e) {
      reject(e);
    }
  });
}

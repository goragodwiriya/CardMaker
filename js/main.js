/**
 * Boot the application once DOM is ready.
 */
(function() {
  const start = () => {
    try {
      const app = new Application();
      window.__app = app;
      app.boot();
    } catch (err) {
      console.error('[Card Maker] boot failed', err);
      document.body.innerHTML = `<div style="padding:40px;font-family:sans-serif">
        <h2>เกิดข้อผิดพลาดในการเริ่มต้นแอป</h2>
        <pre style="background:#fee;padding:16px;border-radius:8px;overflow:auto">${err.stack || err.message}</pre>
      </div>`;
    }
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();

// Keep upgrades explicit: never reload a child's active puzzle automatically.
export function createAppInstall(onChange) {
  let promptEvent, registration, ready = false, failed = false;
  let applyingUpdate = false;
  const standalone = () => window.matchMedia('(display-mode: standalone)').matches || navigator.standalone;
  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault(); promptEvent = event; onChange();
  });
  window.addEventListener('appinstalled', () => { promptEvent = null; onChange(); });
  if (import.meta.env.PROD && 'serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (applyingUpdate) location.reload();
    });
    window.addEventListener('load', async () => {
      try {
        registration = await navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`, {updateViaCache: 'none'});
        const track = worker => worker?.addEventListener('statechange', () => {
          if (worker.state === 'activated') ready = true;
          onChange();
        });
        track(registration.installing);
        registration.addEventListener('updatefound', () => track(registration.installing));
        if (registration.active) ready = true;
        onChange();
      } catch { failed = true; onChange(); }
    });
  }
  return {
    get ready() { return ready; },
    get failed() { return failed; },
    get installed() { return standalone(); },
    get canInstall() { return !!promptEvent && !standalone(); },
    get updateAvailable() { return !!registration?.waiting; },
    async install() {
      if (!promptEvent) return;
      const event = promptEvent; promptEvent = null;
      try { await event.prompt(); await event.userChoice; } catch { /* browser dismissed the prompt */ }
      onChange();
    },
    update() {
      if (!registration?.waiting) return;
      applyingUpdate = true;
      registration.waiting.postMessage({type: 'ACTIVATE_UPDATE'});
    },
  };
}

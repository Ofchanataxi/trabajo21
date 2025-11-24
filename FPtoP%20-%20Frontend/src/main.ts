import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}
console.info('[DBG] Installing global error listeners');

window.addEventListener('error', e => {
  console.error('[DBG] GlobalError listener HIT →', e.error || e.message, e);
  console.trace('[DBG] GlobalError trace');
});

window.addEventListener('unhandledrejection', (e: PromiseRejectionEvent) => {
  console.error('[DBG] UnhandledRejection listener HIT →', e.reason);
  console.trace('[DBG] UnhandledRejection trace');
});

// Fallback clásico por si alguna lib evita el eventListener
window.onerror = function (msg, url, line, col, err) {
  console.error('[DBG] window.onerror HIT →', msg, url, line, col, err);
  return false;
};

console.info('[DBG] Global listeners INSTALLED');

// (tu bootstrap normal)
platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch(err => console.error('[DBG] bootstrap catch →', err));

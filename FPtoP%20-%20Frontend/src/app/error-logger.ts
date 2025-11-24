import { ErrorHandler, Injectable } from '@angular/core';

function safeDump(obj: any) {
  try {
    return JSON.stringify(obj, null, 2);
  } catch {
    return String(obj);
  }
}

@Injectable({ providedIn: 'root' })
export class ErrorLogger implements ErrorHandler {
  handleError(err: any): void {
    const original = (err && (err.ngOriginalError || err.originalError || err.rejection)) || err;

    console.group('%c[DBG] NG ErrorHandler HIT', 'color:#c00;font-weight:bold');
    console.error('Message:', original?.message || err?.message || original || err);
    console.error('Stack:', original?.stack || err?.stack);
    console.error('As object:', original || err);
    console.error('Dump:', safeDump(original || err));
    console.groupEnd();
  }
}

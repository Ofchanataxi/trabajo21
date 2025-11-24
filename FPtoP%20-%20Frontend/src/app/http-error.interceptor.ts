import { Injectable } from '@angular/core';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((err: HttpErrorResponse) => {
        console.group('%c[HTTP ERROR]', 'color:#c00;font-weight:bold');
        console.error('URL:', req.url);
        console.error('Method:', req.method);
        console.error('Status:', err.status, err.statusText);
        console.error('Message:', err.message);
        console.error('Body:', err.error);
        console.groupEnd();
        return throwError(() => err);
      })
    );
  }
}

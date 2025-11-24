import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { LoadingService } from './loading.service';

@Injectable()
export class LoadingInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Puedes saltarte el loader con un header opcional
    if (req.headers.get('X-Skip-Loader') === 'true') {
      return next.handle(req);
    }

    this.loading.start(req);

    return next.handle(req).pipe(
      finalize(() => this.loading.stop(req)) // <-- APAGA SIEMPRE
    );
  }

  constructor(private loading: LoadingService) {}
}

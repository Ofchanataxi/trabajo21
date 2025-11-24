import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
} from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from '../../features/auth/auth.service';

@Injectable()
export class RequestInterceptorsInterceptor implements HttpInterceptor {
  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const token = this.authService.getToken();

    const modifiedRequest = request.clone({
      withCredentials: true,
      headers: request.headers.set('Authorization', `Bearer ${token}`),
    });
    return next.handle(modifiedRequest).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          this.router.navigate(['/auth/login'], {
            queryParams: { returnUrl: this.router.url },
          });
        }
        return throwError(() => error);
      })
    );
  }
}

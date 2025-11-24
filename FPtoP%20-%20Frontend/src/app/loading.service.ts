import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpRequest } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  private active = 0;
  private _isLoading = new BehaviorSubject<boolean>(false);
  private _currentReq: HttpRequest<any> | null = null;

  // expón como observable
  readonly isLoading = this._isLoading.asObservable();

  start(req: HttpRequest<any>) {
    this.active++;
    this._currentReq = req;
    if (this.active === 1) this._isLoading.next(true);
  }

  stop(req?: HttpRequest<any>) {
    this.active = Math.max(0, this.active - 1);
    if (this.active === 0) {
      this._currentReq = null;
      this._isLoading.next(false);
    }
  }

  getCurrentRequest(): HttpRequest<any> | null {
    return this._currentReq;
  }
}

import { TestBed } from '@angular/core/testing';

import { RequestInterceptorsInterceptor } from './request-interceptors.interceptor';

describe('RequestInterceptorsInterceptor', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      RequestInterceptorsInterceptor
      ]
  }));

  it('should be created', () => {
    const interceptor: RequestInterceptorsInterceptor = TestBed.inject(RequestInterceptorsInterceptor);
    expect(interceptor).toBeTruthy();
  });
});

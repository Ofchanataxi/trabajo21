import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { wellAccessGuard } from './well-access.guard';

describe('wellAccessGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => wellAccessGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});

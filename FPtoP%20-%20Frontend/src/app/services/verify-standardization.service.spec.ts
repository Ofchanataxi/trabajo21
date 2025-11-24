import { TestBed } from '@angular/core/testing';

import { VerifyStandardizationService } from './verify-standardization.service';

describe('VerifyStandardizationService', () => {
  let service: VerifyStandardizationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VerifyStandardizationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

import { TestBed } from '@angular/core/testing';

import { BusinessLineService } from './business-line.service';

describe('BusinessLineService', () => {
  let service: BusinessLineService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BusinessLineService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

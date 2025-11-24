import { TestBed } from '@angular/core/testing';

import { RolesBusinessLineService } from './roles-business-line.service';

describe('RolesBusinessLineService', () => {
  let service: RolesBusinessLineService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RolesBusinessLineService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

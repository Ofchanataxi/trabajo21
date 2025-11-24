import { TestBed } from '@angular/core/testing';

import { ObtainSheetsService } from './obtain-sheets.service';

describe('ObtainSheetsService', () => {
  let service: ObtainSheetsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ObtainSheetsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

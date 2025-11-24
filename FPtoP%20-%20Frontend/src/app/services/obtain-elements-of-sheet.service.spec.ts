import { TestBed } from '@angular/core/testing';

import { ObtainElementsOfSheetService } from './obtain-elements-of-sheet.service';

describe('ObtainElementsOfSheetService', () => {
  let service: ObtainElementsOfSheetService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ObtainElementsOfSheetService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

import { TestBed } from '@angular/core/testing';

import { GetDocumentsOfElementService } from './get-documents-of-element.service';

describe('GetDocumentsOfElementService', () => {
  let service: GetDocumentsOfElementService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GetDocumentsOfElementService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

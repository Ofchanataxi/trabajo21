import { TestBed } from '@angular/core/testing';

import { ObtainElementsOfReleaseService } from './obtain-elements-of-release.service';

describe('ObtainElementsOfReleaseService', () => {
  let service: ObtainElementsOfReleaseService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ObtainElementsOfReleaseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

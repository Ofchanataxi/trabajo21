import { TestBed } from '@angular/core/testing';

import { CreateReleaseWithOilfieldDataService } from './create-release-with-oilfield-data.service';

describe('CreateReleaseWithOilfieldDataService', () => {
  let service: CreateReleaseWithOilfieldDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CreateReleaseWithOilfieldDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

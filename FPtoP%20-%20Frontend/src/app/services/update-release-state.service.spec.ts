import { TestBed } from '@angular/core/testing';

import { UpdateReleaseStateService } from './update-release-state.service';

describe('UpdateReleaseStateService', () => {
  let service: UpdateReleaseStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UpdateReleaseStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

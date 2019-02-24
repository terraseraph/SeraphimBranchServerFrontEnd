import { TestBed } from '@angular/core/testing';

import { RootServerService } from './root-server.service';

describe('RootServerService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: RootServerService = TestBed.get(RootServerService);
    expect(service).toBeTruthy();
  });
});

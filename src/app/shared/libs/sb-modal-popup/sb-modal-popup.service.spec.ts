/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { SbModalPopupService } from './sb-modal-popup.service';

describe('Service: SbModalPopup', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SbModalPopupService]
    });
  });

  it('should ...', inject([SbModalPopupService], (service: SbModalPopupService) => {
    expect(service).toBeTruthy();
  }));
});
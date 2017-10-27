import { NgModule, ModuleWithProviders, Optional, SkipSelf, ANALYZE_FOR_ENTRY_COMPONENTS } from '@angular/core';
import { SbModalPopupService } from './sb-modal-popup.service';
import { SbModalWrapperComponent } from './sb-modal-wrapper/sb-modal-wrapper.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  imports: [
    NgbModule.forRoot()
  ],
  declarations: [SbModalWrapperComponent],
  exports: [SbModalWrapperComponent],
  providers: [SbModalPopupService]
})
export class SbModalPopupModule {

  constructor( @Optional() @SkipSelf() parentModule: SbModalPopupModule) {
    if (parentModule) {
      throw new Error(
        'SbModalPopupModule is already loaded. Import it in the AppModule only');
    }
  }

  static forRoot(components: any[]): ModuleWithProviders {
    return {
      ngModule: SbModalPopupModule,
      providers: [
        SbModalPopupService,
        { provide: ANALYZE_FOR_ENTRY_COMPONENTS, useValue: components, multi: true }
      ]
    };
  }
}

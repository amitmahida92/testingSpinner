import { NgModule, ModuleWithProviders } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import {
  SbModalPopupModule,
  SbModalWrapperComponent,
} from './libs/index';

export { SbModalPopupModule } from './libs/index';

import {
  ALL_SERVICES
} from './services/index';

@NgModule({
  imports: [
    NgbModule.forRoot(),
    FormsModule
  ],
  declarations: [

  ],
  providers: [ALL_SERVICES],
  exports: [
    SbModalPopupModule,
    NgbModule,
    FormsModule
  ]
})
export class SharedModule {

  static forRoot(): ModuleWithProviders {
    return {
      ngModule: SharedModule,
      providers: ALL_SERVICES
    };
  }

}

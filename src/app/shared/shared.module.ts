import { NgModule, ModuleWithProviders } from '@angular/core';
import {
  SbModalPopupModule,
  SbModalWrapperComponent,
} from './libs/index';

export { SbModalPopupModule } from './libs/index';

import {
  ALL_SERVICES
} from './services/index';

@NgModule({
  imports: [],
  declarations: [

  ],
  providers: [ALL_SERVICES],
  exports: [

    SbModalPopupModule,

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

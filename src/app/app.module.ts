import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { AppService } from './app.service';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
// Services
import {
  SharedModule,
  SbModalPopupModule
} from './shared/shared.module';
import { InterceptorService } from './shared/services/interceptor.service';
import { FiltersComponent } from './filters/filters.component';
import { ChartComponent } from './chart/chart.component';

@NgModule({
  declarations: [
    AppComponent,
    FiltersComponent,
    ChartComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    SharedModule,
    SharedModule.forRoot()
  ],
  providers: [
    AppService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: InterceptorService,
      multi: true,
    }],
  bootstrap: [AppComponent]
})
export class AppModule { }

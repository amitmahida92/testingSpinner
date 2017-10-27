import { Component, OnInit } from '@angular/core';

import { AppService } from './app.service';

import { DataShareService } from './shared/services/index';
import { GLOBAL } from './app.globals';

import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  private userBundle: any = {};
  private frontEndVersion: string;
  private systemData: Object;
  private showFilter = true;

  constructor(
    private appService: AppService,
    private dataShareService: DataShareService
  ) {
    this.frontEndVersion = GLOBAL.frontEndVersion;

  }

  ngOnInit() {
    this.getInitialConfig();
  }

  getInitialConfig() {
    this.appService.getInitialConfig().subscribe((response: any) => {
      if (response.status === 'OK') {
        this.dataShareService.setInitialConfig(response.data);
        this.userBundle = this.dataShareService.getInitialConfigByKey('userBundle');
        this.systemData = this.dataShareService.getInitialConfigByKey('systemData');
      }
    }, (error: Error) => {
      console.log(error);
    });
  }
}

import { Injectable } from '@angular/core';

import { Subject } from 'rxjs/Subject';
import * as moment from 'moment';
import { GLOBAL } from '../../app.globals';

@Injectable()
export class DataShareService {
  constructor() { }

  /**
   * It contains initial config data.
   */
  private initialConfig: any;

  /**
  * It contains serviceCalls of config.
  */
  private serviceCalls: any;




  /**
   * Set the configuraton to initial config.
   * @param config Configuration data
   */
  setInitialConfig(config): void {
    this.initialConfig = config;
    this.serviceCalls = config.serviceCalls;
  }




  getInitialConfigByKey(key): any {
    if (key instanceof Array) {
      const arrInitialConfig: any[] = [];
      key.forEach(obj => {
        if (typeof obj === 'string') {
          const data = this.initialConfig[obj];
          arrInitialConfig.push(data);
        }
      });
      return arrInitialConfig;
    } else {
      return this.initialConfig[key];
    }
  }

  /**
   * Set service call key the object.
   */
  getServiceCallUrlByKey(key): any {
    let baseURL = '';
    if (typeof this.serviceCalls !== 'undefined') {
      if (typeof GLOBAL.SERVICE_BASE_URL !== 'undefined') {
        baseURL = GLOBAL.SERVICE_BASE_URL;
      }
      return baseURL + this.serviceCalls[key];
    }
    return null;
  }



}



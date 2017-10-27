import { Injectable } from '@angular/core';

import { SharedService } from './shared/services/index';
import { GLOBAL } from './app.globals';

@Injectable()
export class AppService {

    constructor(
        private sharedService: SharedService
    ) { }

    getInitialConfig() {
        const param = {
            action: 'getConfig'
        };
        return this.sharedService.makeServerCall(param, GLOBAL.CONFIG_URL);
    }

}

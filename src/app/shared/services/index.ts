import { SharedService } from './shared.service';
import { DataShareService } from './data-share.service';
import { WindowRefService } from './window-ref.service';
import { InterceptorService } from './interceptor.service';
export { SharedService } from './shared.service';
export { DataShareService } from './data-share.service';
export { WindowRefService } from './window-ref.service';
export { InterceptorService } from './interceptor.service';

export const ALL_SERVICES = [
    SharedService,
    DataShareService,
    WindowRefService
];

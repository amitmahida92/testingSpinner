import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { GLOBAL } from '../../app.globals';
import 'rxjs/add/operator/do';

@Injectable()
export class InterceptorService {

    constructor() { }

    /**
     *
     * @param {HttpRequest<any>} req
     * @param {HttpHandler} next
     * @returns {Observable<HttpEvent<any>>}
     * @memberof InterceptorService
     */
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        // this.loaderService.show();
        // Clone the request to add the new header.
        const authReq: any = req.clone();
        if (req.url.toLowerCase().indexOf('service') !== -1) {
            const SESSIONID = String(GLOBAL['BOS_SESSION_ID']);
            authReq.headers = authReq.headers.set('Bos-SessionId', SESSIONID);
        }
        return next
            .handle(authReq)
            .do(event => {
                if (event instanceof HttpResponse) {
                    // this.loaderService.hide();
                    this.requestSuccess(event);
                }
            }, (err: HttpErrorResponse) => {
                if (err.status !== 200) {
                    // this.loaderService.hide();
                    this.openSessionTimeoutModal(true);
                }
            });
    }

    /**
     *
     * @private
     * @param {HttpResponse<any>} res
     * @returns res
     * @memberof InterceptorService
     */
    private requestSuccess(res: HttpResponse<any>) {
        const BOS_SESSION_ID = res.headers.get('Bos-SessionId');
        if (BOS_SESSION_ID != null) {
            GLOBAL['BOS_SESSION_ID'] = parseInt(BOS_SESSION_ID, 10);
        }

        if (res.body.messageCode === -100) {
            this.openSessionTimeoutModal(false);
        } else if (res.body.messageCode === -101) {
            window.location.reload();
        }
        return res;
    }

    /**
     *
     * @private
     * @param {boolean} isServerError
     * @memberof InterceptorService
     */
    private openSessionTimeoutModal(isServerError: boolean) {
        // let ngbModalOptions: NgbModalOptions = {
        //     backdrop: 'static',
        //     keyboard: false,
        //     size: 'sm'
        // };
        // const modalRef = this.modalService.open(SessionTimeoutComponent, ngbModalOptions);
        // modalRef.componentInstance.isServerError = isServerError;
    }

}

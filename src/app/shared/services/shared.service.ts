import { Injectable } from '@angular/core';
import { GLOBAL } from '../../app.globals';
// import { RequestParams } from '../../models/index';
import { DataShareService } from './data-share.service';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/map';
import * as $ from 'jquery';

@Injectable()
export class SharedService {


  constructor(
    private http: HttpClient,
    private dataShareService: DataShareService
  ) { }

  extractData(res: Response) {
    return res;
  }

  handleError(error: Response | any) {
    let errMsg: string;
    if (error instanceof Response) {
      const body = error.json() || '';
      const err = body['error'] || JSON.stringify(body);
      errMsg = `${error.status} - ${error.statusText || ''} ${err}`;
    } else {
      errMsg = error.message ? error.message : error.toString();
    }
    return Observable.throw(errMsg);
  }

  makeServerCall(param: any, serviceURL: string): Observable<any> {
    const params: any = param;
    if (params.data) {
      params.data = JSON.stringify(param.data);
    }

    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded'
    });
    const requestOptions = {
      body: $.param(params),
      headers
    };
    return this.http.request(
      GLOBAL.HTTP_METHOD,
      serviceURL,
      requestOptions
    )
      .map(this.extractData)
      .catch(this.handleError);
  }

}

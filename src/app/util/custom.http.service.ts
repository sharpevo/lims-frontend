import {Injectable} from '@angular/core'
import {
  Http,
  ConnectionBackend,
  XHRBackend,
  RequestOptions,
  RequestOptionsArgs,
  Response,
  Headers,
  Request
} from '@angular/http'
import {Observable} from 'rxjs/Observable'
//import 'rxjs/Rx'
import {environment} from '../../environments/environment'
import {SpinnerService} from "./spinner.service"
import {MdSnackBar} from '@angular/material'

@Injectable()
export class CustomHttpService extends Http {

  constructor(
    backend: ConnectionBackend,
    defaultOptions: RequestOptions,
    private snackBar: MdSnackBar,
    private spinnerService: SpinnerService
  ) {
    super(backend, defaultOptions)
  }

  get(url: string, options?: RequestOptionsArgs): Observable<any> {
    this.beforeRequest()
    return super.get(this.getFullUrl(url), this.requestOptions(options))
    .catch(this.onCatch)
    .do((res: Response) => {
      this.onSuccess(res)
    }, (error: any) => {
      this.onError(error)
    })
    .finally(() => {
      this.onFinally()
    })
  }

  post(url: string, data: any, options?: RequestOptionsArgs): Observable<any> {
    this.beforeRequest()
    return super.post(this.getFullUrl(url), data, this.requestOptions(options))
    .catch(this.onCatch)
    .do((res: Response) => {
      this.onSuccess(res)
    }, (error: any) => {
      this.onError(error)
    })
    .finally(() => {
      this.onFinally()
    })
  }

  put(url: string, data: any, options?: RequestOptionsArgs): Observable<any> {
    this.beforeRequest()
    return super.put(this.getFullUrl(url), data, this.requestOptions(options))
    .catch(this.onCatch)
    .do((res: Response) => {
      this.onSuccess(res)
    }, (error: any) => {
      this.onError(error)
    })
    .finally(() => {
      this.onFinally()
    })
  }

  private getFullUrl(url: string): string {
    return environment.apiUrl + url
  }

  private beforeRequest(): void {
    this.spinnerService.start()
  }

  private afterRequest(): void {
    this.spinnerService.stop()
  }

  private onCatch(error: any, caught: Observable<any>): Observable<any> {
    console.log("ERROR", error)
    if (error.statusText == "") {
      this.spinnerService.start()
      this.snackBar.open("Redirect to UIC in 3 seconds...", "OK", {duration: 3000})
      .afterDismissed().subscribe(() => {
        this.spinnerService.stop()
        window.location.href = environment.uicUrl +
          "/login?return_to=" +
          environment.limsUrl.replace(/^https?:\/\//,'')
      })
    }
    return Observable.throw(error)
  }

  private onSuccess(res: Response): void {
  }

  private onError(error: any): void {
  }

  private onFinally(): void {
    this.afterRequest()
  }

  private requestOptions(options?: RequestOptionsArgs): RequestOptionsArgs {
    if (options == null) {
      options = new RequestOptions()
    }
    if (options.headers == null) {
      options.headers = new Headers({
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        //'Authorization': `Basic ${environment.basic_auth_token}`,
        //'X-Auth-Token': localStorage.getItem('access_token')
      })
    }
    options.withCredentials = true
    return options
  }
}

export function customHttpFactory(backend: XHRBackend, defaultOptions: RequestOptions, snackBar: MdSnackBar, spinnerService: SpinnerService) {
  return new CustomHttpService(backend, defaultOptions, snackBar, spinnerService)
}

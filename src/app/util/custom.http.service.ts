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

@Injectable()
export class CustomHttpService extends Http {

  constructor(
    backend: ConnectionBackend,
    defaultOptions: RequestOptions,
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
    return options
  }
}

export function customHttpFactory(backend: XHRBackend, defaultOptions: RequestOptions, spinnerService: SpinnerService) {
  return new CustomHttpService(backend, defaultOptions, spinnerService)
}

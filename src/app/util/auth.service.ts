import {Injectable} from '@angular/core'
//import {Subject} from 'rxjs/Subject'
import {Observable} from 'rxjs/Observable'
import 'rxjs/add/observable/of'
import 'rxjs/add/operator/share'
import 'rxjs/add/operator/map'
import {SpinnerService} from './spinner.service'
import {MatSnackBar} from '@angular/material'
import {environment} from '../../environments/environment'
import { 
  Router,
  CanActivate,
  ActivatedRouteSnapshot
} from '@angular/router'
import {UserInfoService} from './user.info.service'
import {CustomHttpService} from './custom.http.service'
import {LogService} from '../log/log.service'

@Injectable()
export class AuthService {
  userInfo: any
  observable: Observable<any>
  environment = environment
  constructor(
    private spinnerService: SpinnerService,
    private userInfoService: UserInfoService,
    private http: CustomHttpService,
    public snackBar: MatSnackBar,
    public router: Router,
        public logger: LogService,
  ){
    this.userInfo = this.userInfoService.getUserInfo()
    this.initInterval()
  }

  initInterval(){
    setInterval(() => {
      this.checkAvailability()
      .subscribe(data => {
                    this.logger.info("SessionChecking", "success")
      },
      error => {
                        this.logger.error("SessionChecking", "fail")
        this.authFail()
      })
    },1000 * 60)
  }

  checkAvailability() {
    return this.http.get("/userinfo")
    .map(res => res.json())
  }

  authFail(){
    this.spinnerService.start()
    this.snackBar.open("Redirect to UIC in 1 seconds...", "OK", {duration: 1000})
    .afterDismissed().subscribe(() => {
      this.spinnerService.stop()
      window.location.href = environment.uicUrl +
        "/profile?return_to=" +
        environment.limsUrl.replace(/^https?:\/\//,'')
    })
  }

  permFail() {
        this.logger.warn("AuthChecking", "fail")
    this.spinnerService.start()
    this.snackBar.open("Invalid permission", "OK", {duration: 3000})
    .afterDismissed().subscribe(() => {
      this.spinnerService.stop()
      this.router.navigate(['apps'])

      window.location.href = environment.uicUrl +
        "/profile?return_to=" +
        environment.limsUrl.replace(/^https?:\/\//,'')
        return false
    })
  }
}

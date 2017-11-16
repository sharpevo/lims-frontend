import {Injectable} from '@angular/core'
//import {Subject} from 'rxjs/Subject'
import {Observable} from 'rxjs/Observable'
import 'rxjs/add/observable/of'
import 'rxjs/add/operator/share'
import 'rxjs/add/operator/map'
import {UtilService} from './service'
import {EntityService} from '../entity/service'
import {SpinnerService} from './spinner.service'
import {MdSnackBar} from '@angular/material'
import {environment} from '../../environments/environment'

@Injectable()
export class UserService {
  userInfo: any
  observable: Observable<any>
  environment = environment
  constructor(
    private spinnerService: SpinnerService,
    private utilService: UtilService,
    private entityService: EntityService,
    public snackBar: MdSnackBar,
  ){}

  canActivate() {
    console.log("Can activate", this.userInfo)

    return this.getUserInfo()
    .map(data => {
      this.userInfo = data
      if (this.userInfo) {
        console.log("Can activate: true")
        return true
      } else {
        console.log("Can activate: false")
        this.authFail()
        return false
      }
    }, error => {
      console.log("error in canActivate")
      this.authFail()
    }).first()
  }

  // never process auth fail in it
  getUserInfo(){
    console.log("get user info")
    if (this.userInfo) {
      return Observable.of(this.userInfo)
    } else if (this.observable) {
      console.log("this observable")
      return this.observable
    } else {
      console.log("retrieve")
      return this.utilService.getUserInfo()
      .catch(error => {
        console.log("invalid user login")
        return Observable.of(false) // avid the empty error for `take(1)`
      })
      .mergeMap(userInfo => {
        console.log("user info raw", userInfo)
        this.userInfo = userInfo
        this.userInfo['role'] = JSON.parse(userInfo['role'])
        return this.entityService.retrieveBy({
          "SYS_USER_EMAIL": userInfo.email
        })
        .map(data => {
          this.observable = null
          if (data.length > 0){
            this.userInfo['limsid'] = data[0]['id']
          }
          console.log("user info updated", this.userInfo)
          return this.userInfo
        })
      })
      .share()
      .catch(error => {
        console.log("illegal user")
        return Observable.of(false)
      })
    }
  }

  authFail(){
    this.spinnerService.start()
    this.snackBar.open("Redirect to UIC in 3 seconds...", "OK", {duration: 3000})
    .afterDismissed().subscribe(() => {
      this.spinnerService.stop()
      window.location.href = environment.uicUrl +
        "/login?return_to=" +
        environment.limsUrl.replace(/^https?:\/\//,'')
    })
  }
}

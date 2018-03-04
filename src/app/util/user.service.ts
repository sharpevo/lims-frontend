import {Injectable} from '@angular/core'
//import {Subject} from 'rxjs/Subject'
import {Observable} from 'rxjs/Observable'
import 'rxjs/add/observable/of'
import 'rxjs/add/operator/share'
import 'rxjs/add/operator/map'
import {SpinnerService} from './spinner.service'
import {MdSnackBar} from '@angular/material'
import {environment} from '../../environments/environment'
import { 
  //Router,
  CanActivate,
  ActivatedRouteSnapshot
} from '@angular/router'

@Injectable()
export class UserService {
  userInfo: any
  observable: Observable<any>
  environment = environment
  constructor(
    private spinnerService: SpinnerService,
    public snackBar: MdSnackBar,
    //public router: Router,
  ){}

  canActivate(route: ActivatedRouteSnapshot) {
    const expectedRole = route.data.expectedRole
    console.log("expectedRole", expectedRole)
    if (!this.userInfo) {
      console.log("auth failed")
      this.authFail()
      return false
    } else if (!expectedRole) {
      console.log("undefined permission")
      return true
    } else if (expectedRole == "lims-workcenter-") {
      console.log("transfer the perm checking to the dashboard")
      return true
    } else if (!this.hasRole(expectedRole)) {
      console.log("denied", expectedRole)
      this.permFail()
      return false
    }
    console.log("auth successfully")
    return true
  }

  setUserInfo(userInfo: any) {
    this.userInfo = userInfo
  }

  getUserInfo() {
    console.log("get userinfo", this.userInfo)
    return this.userInfo
  }

  hasRole(role: string): boolean{
    if (!this.userInfo) {
      return false
    }
    if (this.userInfo.email == "quwubin@gmail.com") {
      console.log("Check role: super admin")
      return true
    }
    return this.userInfo.role[role]
  }

  authFail(){
    this.spinnerService.start()
    this.snackBar.open("Redirect to UIC in 1 seconds...", "OK", {duration: 1000})
    .afterDismissed().subscribe(() => {
      this.spinnerService.stop()
      //window.location.href = environment.uicUrl +
      //"/profile?return_to=" +
      //environment.limsUrl.replace(/^https?:\/\//,'')
    })
  }

  permFail() {
    this.spinnerService.start()
    this.snackBar.open("Invalid permission", "OK", {duration: 3000})
    .afterDismissed().subscribe(() => {
      this.spinnerService.stop()
      //this.router.navigate(['apps'])

      window.location.href = environment.uicUrl +
        "/profile?return_to=" +
        environment.limsUrl.replace(/^https?:\/\//,'')
        return false
    })
  }
}

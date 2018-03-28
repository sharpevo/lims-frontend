import {Injectable} from '@angular/core'
import {environment} from '../../environments/environment'
import { 
  CanActivate,
  ActivatedRouteSnapshot
} from '@angular/router'
import {UserInfoService} from './user.info.service'
import {AuthService} from './auth.service'

@Injectable()
export class GuardService {
  userInfo: any
  environment = environment
  constructor(
    private userInfoService: UserInfoService,
    private authService: AuthService,
  ){
    this.userInfo = this.userInfoService.getUserInfo()
  }

  canActivate(route: ActivatedRouteSnapshot) {
    const expectedRole = route.data.expectedRole
    console.log("expectedRole", expectedRole)
    if (!this.userInfo) {
      console.log("Gaurd: failed")
      this.authService.authFail()
      return false
    } else if (!expectedRole) {
      console.log("Guard: undefined permission")
      return true
    } else if (expectedRole == "lims-workcenter-") {
      console.log("Guard: transfer the perm checking to the dashboard")
      return true
    } else if (!this.userInfoService.hasRole(expectedRole)) {
      console.log("Guard: denied", expectedRole)
      this.authService.permFail()
      return false
    }
    console.log("Guard: auth successfully")
    return true
  }
}

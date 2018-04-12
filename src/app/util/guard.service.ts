import {Injectable} from '@angular/core'
import {environment} from '../../environments/environment'
import { 
  CanActivate,
  ActivatedRouteSnapshot
} from '@angular/router'
import {UserInfoService} from './user.info.service'
import {AuthService} from './auth.service'
import {LogService} from '../log/log.service'

@Injectable()
export class GuardService {
  userInfo: any
  environment = environment
  constructor(
    private userInfoService: UserInfoService,
    private authService: AuthService,
        public logger: LogService,
  ){
    this.userInfo = this.userInfoService.getUserInfo()
  }

  canActivate(route: ActivatedRouteSnapshot) {
    const expectedRole = route.data.expectedRole
        this.logger.debug("canActive: expects role", expectedRole)
    if (!this.userInfo) {
            this.logger.warn("canActivate: failed to auth")
      this.authService.authFail()
      return false
    } else if (!expectedRole) {
            this.logger.warn("canActivate: not any roles specified")
      return true
    } else if (expectedRole == "lims-workcenter-") {
            this.logger.warn("canActivate: transfer the perm checking to dashboard")
      return true
    } else if (!this.userInfoService.hasRole(expectedRole)) {
            this.logger.warn("canActivate: reject")
      this.authService.permFail()
      return false
    }
        this.logger.info("canActivate: ok")
    return true
  }
}

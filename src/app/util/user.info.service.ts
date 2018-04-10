import {Injectable} from '@angular/core'
import {LogService} from '../log/log.service'

@Injectable()
export class UserInfoService {
    userInfo: any
    constructor (
        public logger: LogService
    ){}
    setUserInfo(userInfo: any) {
        this.userInfo = userInfo
    }

    getUserInfo() {
        this.logger.debug("UserInfo", this.userInfo)
        return this.userInfo
    }

    hasRole(role: string): boolean{
        this.logger.debug("CheckPerm", role)
        if (!this.userInfo) {
            return false
        }
        if (this.userInfo.email == "quwubin@gmail.com") {
            this.logger.debug("CheckPerm", "Super admin")
            return true
        }
        return this.userInfo.role[role]
    }


}

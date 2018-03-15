import {Injectable} from '@angular/core'

@Injectable()
export class UserInfoService {
  userInfo: any
  constructor (){}
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


}
